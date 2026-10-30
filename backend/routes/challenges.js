const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { isUnder13 } = require('../curriculum/ageGroups');
const { CHALLENGES, DIFFICULTIES, bySlug, pickLang, summary, detail, validateReport } = require('../lib/challenges');

const router = Router();
const submitLimiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false });

async function progressFor(userId) {
  const map = new Map();
  if (!userId) return map;
  const { rows } = await pool.query(
    `SELECT challenge_slug, solved, best_passed, attempts FROM challenge_progress WHERE user_id = $1`,
    [userId]
  );
  for (const r of rows) map.set(r.challenge_slug, r);
  return map;
}

const status = p => (!p ? 'new' : p.solved ? 'solved' : 'attempted');

/* ── GET /challenges — filterable list + the learner's totals ───────────── */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query.lang);
    const difficulty = DIFFICULTIES.includes(req.query.difficulty) ? req.query.difficulty : '';
    const tag = typeof req.query.tag === 'string' ? req.query.tag.slice(0, 40) : '';
    const wanted = ['new', 'attempted', 'solved'].includes(req.query.status) ? req.query.status : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase().slice(0, 80) : '';

    if (wanted && !req.user) {
      return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to filter by your progress.' } });
    }
    const progress = await progressFor(req.user?.id);

    const all = CHALLENGES.map(c => ({ ...summary(c, lang), status: status(progress.get(c.slug)) }));
    const tags = [...new Set(CHALLENGES.flatMap(c => c.tags))].sort();

    const challenges = all.filter(
      c =>
        (!difficulty || c.difficulty === difficulty) &&
        (!tag || c.tags.includes(tag)) &&
        (!wanted || c.status === wanted) &&
        (!q || `${c.title} ${c.tags.join(' ')}`.toLowerCase().includes(q))
    );

    const solved = all.filter(c => c.status === 'solved');
    res.json({
      challenges,
      total: challenges.length,
      facets: {
        difficulties: DIFFICULTIES.map(key => ({ key, count: all.filter(c => c.difficulty === key).length })),
        tags,
      },
      // Self-reported (browser-run) — see lib/challenges.js. Not part of XP.
      summary: req.user
        ? { solved: solved.length, total: all.length, points: solved.reduce((n, c) => n + c.points, 0), verified: false }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

/* ── GET /challenges/:slug ──────────────────────────────────────────────── */
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const c = bySlug.get(req.params.slug);
    if (!c) return res.status(404).json({ error: { code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found.' } });
    const p = (await progressFor(req.user?.id)).get(c.slug);
    res.json({
      challenge: detail(c, pickLang(req.query.lang)),
      progress: req.user ? { status: status(p), best_passed: p?.best_passed ?? 0, attempts: p?.attempts ?? 0 } : null,
    });
  } catch (err) {
    next(err);
  }
});

/* ── POST /challenges/:slug/submit — record a browser-run result ────────── */
router.post('/:slug/submit', submitLimiter, requireAuth, async (req, res, next) => {
  try {
    const c = bySlug.get(req.params.slug);
    if (!c) return res.status(404).json({ error: { code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found.' } });
    const { rows: who } = await pool.query('SELECT age_group FROM users WHERE id = $1', [req.user.id]);
    if (isUnder13(who[0]?.age_group)) {
      return res.status(403).json({ error: { code: 'AGE_RESTRICTED', message: 'Code challenges are not available for this age group.' } });
    }
    const v = validateReport(c, req.body);
    if (!v.ok) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: v.message } });

    const { passed } = req.body;
    await pool.query(
      `INSERT INTO challenge_submissions (user_id, challenge_slug, passed, total, solved, code)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, c.slug, passed, c.tests.length, v.solved, req.body.code]
    );
    // first_solved_at is set once (COALESCE), so repeats never re-award points.
    const { rows } = await pool.query(
      `INSERT INTO challenge_progress (user_id, challenge_slug, solved, best_passed, attempts, first_solved_at)
       VALUES ($1, $2, $3, $4, 1, CASE WHEN $3 THEN now() END)
       ON CONFLICT (user_id, challenge_slug) DO UPDATE SET
         attempts = challenge_progress.attempts + 1,
         best_passed = GREATEST(challenge_progress.best_passed, EXCLUDED.best_passed),
         solved = challenge_progress.solved OR EXCLUDED.solved,
         first_solved_at = COALESCE(challenge_progress.first_solved_at, EXCLUDED.first_solved_at)
       RETURNING solved, best_passed, attempts`,
      [req.user.id, c.slug, v.solved, passed]
    );
    const r = rows[0];
    res.json({
      solved: r.solved,
      best_passed: r.best_passed,
      attempts: r.attempts,
      total: c.tests.length,
      points: r.solved ? c.points : 0,
      verified: false,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
