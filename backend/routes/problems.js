const { Router } = require('express');
const pool = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { localizeExercise, TYPES } = require('../lib/grade');
const { DIFFICULTIES, difficultyForModule } = require('../lib/difficulty');
const { TRACKS, trackOfModule } = require('../curriculum/tracks');

const TRACK_OF = trackOfModule();

const router = Router();

const LANGS = ['uz', 'ru'];
const STATUSES = ['new', 'attempted', 'solved'];
const MAX_LIMIT = 60;
const DEFAULT_LIMIT = 24;
const MAX_QUERY = 80;

const pickLang = q => (LANGS.includes(q.lang) ? q.lang : 'uz');
const clampInt = (v, min, max, fallback) => {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const publicLocalized = localizeExercise;

/**
 * Load every published module with its domain, ordered the same way the
 * learning map orders them, then derive a 1-based position inside each domain.
 * Difficulty is derived from that position (see lib/difficulty.js).
 *
 * The Problems surface is a *view* over the existing curriculum — it does not
 * duplicate content, and it can never expose more than the lesson already does.
 */
async function loadCatalog(lang) {
  const { rows } = await pool.query(
    `SELECT m.id, m.slug, m.kind, m.order_index, m.exercises,
            m.title_${lang} AS module_title,
            d.slug  AS domain_slug,
            d.icon  AS domain_icon,
            d.title_${lang} AS domain_title,
            d.order_index  AS domain_order,
            p.slug  AS path_slug,
            p.order_index AS path_order,
            p.title_${lang} AS path_title
       FROM modules m
       JOIN domains d ON d.id = m.domain_id
       JOIN paths   p ON p.slug = d.path_slug
      WHERE m.is_published
      ORDER BY p.order_index, d.order_index, m.order_index, m.created_at`
  );

  const byDomain = new Map();
  for (const m of rows) {
    if (!byDomain.has(m.domain_slug)) byDomain.set(m.domain_slug, []);
    byDomain.get(m.domain_slug).push(m);
  }

  const modules = [];
  for (const list of byDomain.values()) {
    list.forEach((m, i) => {
      modules.push({
        ...m,
        position: i + 1,
        total: list.length,
        difficulty: difficultyForModule({ kind: m.kind, position: i + 1, total: list.length }),
      });
    });
  }
  return modules;
}

async function loadMistakes(userId) {
  const map = new Map();
  if (!userId) return map;
  const { rows } = await pool.query(
    `SELECT module_id, exercise_id, wrong_count, correct_count
       FROM mistakes WHERE user_id = $1`,
    [userId]
  );
  for (const r of rows) map.set(`${r.module_id}::${r.exercise_id}`, r);
  return map;
}

function statusOf(row) {
  if (!row) return 'new';
  if (Number(row.correct_count) > 0) return 'solved';
  if (Number(row.wrong_count) > 0) return 'attempted';
  return 'new';
}

function matchesQuery(problem, needle) {
  if (!needle) return true;
  const hay = `${problem.question} ${problem.module_title} ${problem.domain_title}`.toLowerCase();
  return hay.includes(needle);
}

/* ── GET /problems — the problem arena, filtered and paginated ─────────────
   Public (optionalAuth): the catalogue is readable signed out, but `status`
   reflects the signed-in learner's real attempt history. A status filter
   without a session is rejected rather than silently ignored, so the UI can
   never imply personalised filtering that did not happen. */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const domain = typeof req.query.domain === 'string' ? req.query.domain.slice(0, 60) : '';
    const track = TRACKS.some(t => t.slug === req.query.track) ? req.query.track : '';
    const type = TYPES.includes(req.query.type) ? req.query.type : '';
    const difficulty = DIFFICULTIES.includes(req.query.difficulty) ? req.query.difficulty : '';
    const status = STATUSES.includes(req.query.status) ? req.query.status : '';
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, MAX_QUERY).toLowerCase() : '';
    const limit = clampInt(req.query.limit, 1, MAX_LIMIT, DEFAULT_LIMIT);
    const offset = clampInt(req.query.offset, 0, 100000, 0);

    if (status && !req.user) {
      return res.status(401).json({
        error: { code: 'AUTH_REQUIRED', message: 'Sign in to filter by your progress.' },
      });
    }

    const [modules, mistakes] = await Promise.all([loadCatalog(lang), loadMistakes(req.user?.id)]);

    const all = [];
    for (const m of modules) {
      const exercises = Array.isArray(m.exercises) ? m.exercises : [];
      exercises.forEach((ex, i) => {
        if (!ex || typeof ex !== 'object' || typeof ex.id !== 'string') return;
        if (!TYPES.includes(ex.type) || !ex.q || !ex.q[lang]) return;
        const attempt = mistakes.get(`${m.id}::${ex.id}`);
        all.push({
          module_slug: m.slug,
          exercise_id: ex.id,
          type: ex.type,
          question: ex.q[lang],
          domain_slug: m.domain_slug,
          domain_title: m.domain_title,
          domain_icon: m.domain_icon,
          path_slug: m.path_slug,
          path_title: m.path_title,
          track_slug: TRACK_OF.get(m.slug) ?? null,
          module_title: m.module_title,
          module_kind: m.kind,
          difficulty: m.difficulty,
          order: i,
          status: statusOf(attempt),
        });
      });
    }

    // Facets come from the whole catalogue, not the filtered slice, so filter
    // counts stay stable while the learner narrows the list.
    const facetDomains = [];
    const domainSeen = new Map();
    const trackCounts = new Map();
    for (const p of all) if (p.track_slug) trackCounts.set(p.track_slug, (trackCounts.get(p.track_slug) ?? 0) + 1);
    const facetDifficulty = Object.fromEntries(DIFFICULTIES.map(d => [d, 0]));
    const facetType = Object.fromEntries(TYPES.map(t => [t, 0]));
    const facetStatus = Object.fromEntries(STATUSES.map(s => [s, 0]));
    for (const p of all) {
      if (!domainSeen.has(p.domain_slug)) {
        const entry = { slug: p.domain_slug, title: p.domain_title, icon: p.domain_icon, count: 0 };
        domainSeen.set(p.domain_slug, entry);
        facetDomains.push(entry);
      }
      domainSeen.get(p.domain_slug).count++;
      facetDifficulty[p.difficulty]++;
      facetType[p.type]++;
      facetStatus[p.status]++;
    }

    const filtered = all.filter(
      p =>
        (!domain || p.domain_slug === domain) &&
        (!track || p.track_slug === track) &&
        (!type || p.type === type) &&
        (!difficulty || p.difficulty === difficulty) &&
        (!status || p.status === status) &&
        matchesQuery(p, query)
    );

    // Stable ordering: path → domain → module → exercise order (already the
    // order `all` was built in), never random.
    const page = filtered.slice(offset, offset + limit).map(({ order: _order, ...rest }) => ({
      ...rest,
      solved: rest.status === 'solved',
      attempted: rest.status !== 'new',
    }));

    res.json({
      problems: page,
      total: filtered.length,
      limit,
      offset,
      has_more: offset + page.length < filtered.length,
      catalogue_total: all.length,
      solved_total: all.filter(p => p.status === 'solved').length,
      facets: {
        domains: facetDomains,
        tracks: TRACKS.filter(t => trackCounts.has(t.slug)).map(t => ({
          slug: t.slug, title: t.title[lang], icon: t.icon, count: trackCounts.get(t.slug),
        })),
        difficulties: DIFFICULTIES.map(key => ({ key, count: facetDifficulty[key] })),
        types: TYPES.map(key => ({ key, count: facetType[key] })),
        statuses: req.user ? STATUSES.map(key => ({ key, count: facetStatus[key] })) : [],
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ── GET /problems/:slug/:exerciseId — one public problem ─────────────────
   Returns the exercise exactly as the lesson would (answers stripped), plus
   the learner's own attempt state. Grading still happens through the existing
   /modules/:slug/check endpoint — this route never decides correctness. */
router.get('/:slug/:exerciseId', optionalAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const { slug, exerciseId } = req.params;

    const { rows } = await pool.query(
      `SELECT m.id, m.slug, m.kind, m.exercises,
              m.title_${lang} AS module_title,
              d.slug AS domain_slug, d.icon AS domain_icon,
              d.title_${lang} AS domain_title, d.order_index AS domain_order,
              p.slug AS path_slug, p.title_${lang} AS path_title
         FROM modules m
         JOIN domains d ON d.id = m.domain_id
         JOIN paths   p ON p.slug = d.path_slug
        WHERE m.slug = $1 AND m.is_published`,
      [slug]
    );
    const m = rows[0];
    if (!m) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }

    const exercises = Array.isArray(m.exercises) ? m.exercises : [];
    const index = exercises.findIndex(e => e && e.id === exerciseId);
    if (index === -1) {
      return res.status(404).json({ error: { code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found.' } });
    }
    const ex = exercises[index];

    // Position of this module inside its domain, using the same ordering as
    // /paths and the list route.
    const { rows: siblings } = await pool.query(
      `SELECT id, kind FROM modules
        WHERE domain_id = (SELECT id FROM domains WHERE slug = $1)
          AND is_published
        ORDER BY order_index, created_at`,
      [m.domain_slug]
    );
    const pos = Math.max(1, siblings.findIndex(s => s.id === m.id) + 1);
    const difficulty = difficultyForModule({ kind: m.kind, position: pos, total: siblings.length });

    let attempt = null;
    if (req.user) {
      const { rows: a } = await pool.query(
        `SELECT wrong_count, correct_count FROM mistakes
          WHERE user_id = $1 AND module_id = $2 AND exercise_id = $3`,
        [req.user.id, m.id, exerciseId]
      );
      attempt = a[0] ?? null;
    }

    res.json({
      problem: {
        module_slug: m.slug,
        exercise_id: ex.id,
        type: ex.type,
        difficulty,
        domain_slug: m.domain_slug,
        domain_title: m.domain_title,
        domain_icon: m.domain_icon,
        path_slug: m.path_slug,
        path_title: m.path_title,
        module_title: m.module_title,
        module_kind: m.kind,
        status: statusOf(attempt),
        solved: statusOf(attempt) === 'solved',
        attempted: statusOf(attempt) !== 'new',
        exercise: publicLocalized(ex, lang),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
