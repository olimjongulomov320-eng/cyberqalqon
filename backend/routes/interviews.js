const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { isUnder13 } = require('../curriculum/ageGroups');
const iv = require('../lib/interview');

const router = Router();
const startLimiter = rateLimit({ windowMs: 10 * 60_000, max: 12, standardHeaders: true, legacyHeaders: false });
const finishLimiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false });

const notFound = (res, what = 'Interview') =>
  res.status(404).json({ error: { code: 'INTERVIEW_NOT_FOUND', message: `${what} not found.` } });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function ageRestricted(userId) {
  const { rows } = await pool.query('SELECT age_group FROM users WHERE id = $1', [userId]);
  return isUnder13(rows[0]?.age_group);
}

/* ── GET /interviews - roles, the learner's best per role, recent sessions ─ */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const lang = iv.pickLang(req.query.lang);
    let best = new Map();
    let history = [];
    if (req.user) {
      const { rows } = await pool.query(
        `SELECT role_slug, MAX(score) AS best, COUNT(*)::int AS attempts
           FROM interview_sessions WHERE user_id = $1 AND finished_at IS NOT NULL GROUP BY role_slug`,
        [req.user.id]
      );
      best = new Map(rows.map(r => [r.role_slug, { best: r.best, attempts: r.attempts }]));
      const { rows: recent } = await pool.query(
        `SELECT id, role_slug, score, dims, finished_at FROM interview_sessions
          WHERE user_id = $1 AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 10`,
        [req.user.id]
      );
      history = recent
        .filter(r => iv.bySlug.has(r.role_slug))
        .map(r => ({
          id: r.id,
          role: r.role_slug,
          title: iv.bySlug.get(r.role_slug).title[lang],
          score: r.score,
          verdict: iv.verdictOf(r.score),
          dims: r.dims,
          finished_at: r.finished_at,
        }));
    }
    res.json({
      roles: iv.ROLES.map(r => ({ ...iv.roleSummary(r, lang), mine: best.get(r.slug) ?? null })),
      history,
    });
  } catch (err) {
    next(err);
  }
});

/* ── GET /interviews/roles/:slug - prep page ───────────────────────────── */
router.get('/roles/:slug', (req, res) => {
  const role = iv.bySlug.get(req.params.slug);
  if (!role) return notFound(res, 'Role');
  res.json({ role: iv.roleDetail(role, iv.pickLang(req.query.lang)) });
});

/* ── POST /interviews/roles/:slug/start - a fresh paper ────────────────── */
router.post('/roles/:slug/start', startLimiter, requireAuth, async (req, res, next) => {
  try {
    const role = iv.bySlug.get(req.params.slug);
    if (!role) return notFound(res, 'Role');
    if (await ageRestricted(req.user.id)) {
      return res.status(403).json({ error: { code: 'AGE_RESTRICTED', message: 'Mock interviews are not available for this age group.' } });
    }
    const plan = iv.makePlan(role);
    const { rows } = await pool.query(
      `INSERT INTO interview_sessions (user_id, role_slug, plan, deadline_at)
       VALUES ($1, $2, $3, now() + make_interval(secs => $4))
       RETURNING id, started_at, deadline_at`,
      [req.user.id, role.slug, plan, iv.TOTAL_S + iv.GRACE_S]
    );
    const s = rows[0];
    res.status(201).json({
      session: { id: s.id, started_at: s.started_at, deadline_at: s.deadline_at, ...iv.paper(role, plan, iv.pickLang(req.query.lang)) },
    });
  } catch (err) {
    next(err);
  }
});

async function ownSession(id, userId) {
  if (!UUID_RE.test(id)) return null;
  const { rows } = await pool.query(
    `SELECT id, user_id, role_slug, plan, answers, score, dims, started_at, deadline_at, finished_at,
            (finished_at > deadline_at) AS late
       FROM interview_sessions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] && iv.bySlug.has(rows[0].role_slug) ? rows[0] : null;
}

/* ── GET /interviews/sessions/:id - scorecard, or the paper to resume ──── */
router.get('/sessions/:id', requireAuth, async (req, res, next) => {
  try {
    const lang = iv.pickLang(req.query.lang);
    const row = await ownSession(req.params.id, req.user.id);
    if (!row) return notFound(res, 'Session');
    if (row.finished_at) return res.json({ report: iv.report(row, lang) });
    const role = iv.bySlug.get(row.role_slug);
    res.json({
      session: { id: row.id, started_at: row.started_at, deadline_at: row.deadline_at, ...iv.paper(role, row.plan, lang) },
    });
  } catch (err) {
    next(err);
  }
});

/* ── POST /interviews/sessions/:id/finish - grade once, return scorecard ─ */
router.post('/sessions/:id/finish', finishLimiter, requireAuth, async (req, res, next) => {
  try {
    const lang = iv.pickLang(req.query.lang);
    const row = await ownSession(req.params.id, req.user.id);
    if (!row) return notFound(res, 'Session');
    // Finishing twice (double click, retry after a timeout) returns the same result.
    if (row.finished_at) return res.json({ report: iv.report(row, lang) });

    const role = iv.bySlug.get(row.role_slug);
    const problem = iv.validateAnswers(role, row.plan, req.body);
    if (problem) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: problem } });

    const answers = {
      concepts: req.body.concepts,
      scenario: req.body.scenario,
      coding: req.body.coding ? { passed: req.body.coding.passed, total: req.body.coding.total, code: req.body.coding.code } : null,
      round_seconds: req.body.round_seconds,
    };
    const { overall, dims } = iv.score(role, row.plan, answers);
    const { rows } = await pool.query(
      `UPDATE interview_sessions
          SET answers = $3, score = $4, dims = $5, finished_at = now()
        WHERE id = $1 AND user_id = $2 AND finished_at IS NULL
        RETURNING id, role_slug, plan, answers, score, dims, started_at, deadline_at, finished_at,
                  (finished_at > deadline_at) AS late`,
      [row.id, req.user.id, answers, overall, dims]
    );
    // Lost a race with a concurrent finish: report what was stored.
    const saved = rows[0] ?? (await ownSession(row.id, req.user.id));
    res.json({ report: iv.report(saved, lang) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
