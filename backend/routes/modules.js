const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const {
  grade,
  publicExercise,
  answerReveal,
  recordXp,
  recordAttempt,
  perfectRun,
  bumpStreak,
  CORRECT_XP,
} = require('../lib/gamification');

const router = Router();

// Lesson flow fires many small requests (one per exercise), so the old
// 10/min submit cap would strangle a normal lesson. 30/min still stops abuse.
const lessonLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true });

/* ── helpers ───────────────────────────────────────────────────────────── */

const pickLang = q => (['uz', 'ru'].includes(q.lang) ? q.lang : 'uz');

/** Localise an exercise and strip every answer-leaking field.
 *  `explain` is withheld too — it arrives only with the graded /check result. */
function publicLocalized(ex, lang) {
  const pub = publicExercise(ex);
  pub.q = ex.q[lang];
  if (pub.options) pub.options = pub.options.map(o => ({ id: o.id, text: o[lang] }));
  if (pub.pairs) pub.pairs = pub.pairs.map(p => ({ id: p.id, left: p.left[lang], right: p.right[lang] }));
  if (pub.items) pub.items = pub.items.map(i => ({ id: i.id, text: i[lang] }));
  return pub;
}

async function loadModule(slug) {
  const { rows } = await pool.query(
    `SELECT m.id, m.slug, m.kind, m.xp_reward, m.order_index, m.exercises, m.domain_id,
            d.slug AS domain_slug, d.icon AS domain_icon, d.title_uz AS domain_title_uz,
            d.title_ru AS domain_title_ru
       FROM modules m
       LEFT JOIN domains d ON d.id = m.domain_id
      WHERE m.slug = $1 AND m.is_published`,
    [slug]
  );
  return rows[0] ?? null;
}

/* ── GET /modules — published module list (legacy ?category= + ?domain=) ── */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const filter = req.query.domain || req.query.category;

    const params = [];
    let clause = '';
    if (filter) {
      params.push(filter);
      clause = `AND (d.slug = $${params.length} OR m.category = $${params.length})`;
    }

    const { rows: modules } = await pool.query(
      `SELECT m.id, m.slug, m.order_index, m.xp_reward, m.kind, m.category,
              m.title_${lang} AS title,
              d.slug AS domain_slug, d.icon AS domain_icon,
              CASE WHEN up.is_completed IS TRUE THEN true ELSE false END AS completed
         FROM modules m
         LEFT JOIN domains d ON d.id = m.domain_id
         LEFT JOIN user_progress up ON up.module_id = m.id AND up.user_id = $1::uuid
        WHERE m.is_published ${clause}
        ORDER BY COALESCE(d.order_index, 99), m.order_index`,
      [req.user?.id ?? null, ...params]
    );
    res.json({ modules });
  } catch (err) {
    next(err);
  }
});

/* ── GET /modules/:slug — content + public exercises ───────────────────── */
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const m = await loadModule(req.params.slug);
    if (!m) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }

    const { rows } = await pool.query(
      `SELECT title_${lang} AS title, content_${lang} AS content
         FROM modules WHERE id = $1`,
      [m.id]
    );

    let progress = null;
    if (req.user) {
      const { rows: p } = await pool.query(
        `SELECT is_completed, attempts FROM user_progress
          WHERE user_id = $1 AND module_id = $2`,
        [req.user.id, m.id]
      );
      progress = p[0] ?? { is_completed: false, attempts: 0 };
    }

    res.json({
      module: {
        slug: m.slug,
        kind: m.kind,
        xp_reward: m.xp_reward,
        title: rows[0].title,
        content: rows[0].content,
        domain_slug: m.domain_slug,
        domain_icon: m.domain_icon,
        domain_title: m[`domain_title_${lang}`],
      },
      exercises: (m.exercises ?? []).map(ex => publicLocalized(ex, lang)),
      progress,
    });
  } catch (err) {
    next(err);
  }
});

/* ── POST /modules/:slug/check — grade one exercise, instant feedback ──── */
router.post('/:slug/check', lessonLimiter, requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const { exercise_id, value } = req.body ?? {};
    if (!exercise_id || value === undefined || value === null) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'exercise_id and value are required.' },
      });
    }

    const m = await loadModule(req.params.slug);
    if (!m) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }
    const ex = (m.exercises ?? []).find(e => e.id === exercise_id);
    if (!ex) {
      return res.status(404).json({ error: { code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found.' } });
    }

    const correct = grade(ex, value);
    const attempt = await recordAttempt(req.user.id, m.id, ex.id, correct);

    // +XP only on the first correct answer ever — no farming.
    let xp_earned = 0;
    if (correct && attempt.firstCorrect) xp_earned = CORRECT_XP;

    const { new_achievements, ...snap } = await recordXp(req.user.id, {
      amount: xp_earned,
      kind: 'correct',
      moduleId: m.id,
      exerciseId: ex.id,
      ctx: {},
    });

    res.json({
      correct,
      xp_earned,
      explain: ex.explain[lang],
      reveal: answerReveal(ex),
      ...snap,
      new_achievements,
    });
  } catch (err) {
    next(err);
  }
});

/* ── POST /modules/:slug/practice — grade one exercise, no recording ─────
   Hearts don't punish: when a learner runs out, they solve one practice
   question to restore a heart. This grades it, explains it, but records
   NO attempt, NO XP, NO mistake — practice never pollutes stats. */
router.post('/:slug/practice', lessonLimiter, requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const { exercise_id, value } = req.body ?? {};
    if (!exercise_id || value === undefined || value === null) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'exercise_id and value are required.' },
      });
    }

    const m = await loadModule(req.params.slug);
    if (!m) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }
    const ex = (m.exercises ?? []).find(e => e.id === exercise_id);
    if (!ex) {
      return res.status(404).json({ error: { code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found.' } });
    }

    const correct = grade(ex, value);
    res.json({
      correct,
      explain: ex.explain[lang],
      reveal: answerReveal(ex),
    });
  } catch (err) {
    next(err);
  }
});

/* ── POST /modules/:slug/complete — finish the lesson, award XP once ───── */
router.post('/:slug/complete', lessonLimiter, requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const body = req.body ?? {};
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (answers.length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'answers[] must not be empty.' },
      });
    }

    const m = await loadModule(req.params.slug);
    if (!m) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }

    // Server re-grades everything — the client's opinion never decides XP.
    const results = [];
    for (const a of answers) {
      const ex = (m.exercises ?? []).find(e => e.id === a.id);
      if (!ex) continue;
      const correct = grade(ex, a.value);
      results.push({ id: ex.id, correct, explain: ex.explain[lang], ...answerReveal(ex) });
      // Backfill ONLY if /check never recorded this exercise (flaky network).
      // Rows created by /check are left untouched so counts never double.
      await pool.query(
        correct
          ? `INSERT INTO mistakes (user_id, module_id, exercise_id, correct_count, last_attempt_at)
             VALUES ($1, $2, $3, 1, now()) ON CONFLICT DO NOTHING`
          : `INSERT INTO mistakes (user_id, module_id, exercise_id, wrong_count, last_attempt_at)
             VALUES ($1, $2, $3, 1, now()) ON CONFLICT DO NOTHING`,
        [req.user.id, m.id, ex.id]
      );
    }

    const answered = results.length;
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = answered ? Math.round((correctCount / answered) * 100) : 0;

    // Lesson XP: once per module, enforced by the xp_events insert itself.
    const { rows: xpRow } = await pool.query(
      `INSERT INTO xp_events (user_id, module_id, amount, kind, created_at)
       SELECT $1, $2, $3, 'lesson', now()
        WHERE NOT EXISTS (
          SELECT 1 FROM xp_events
           WHERE user_id = $1 AND module_id = $2 AND kind = 'lesson')
       RETURNING id`,
      [req.user.id, m.id, m.xp_reward]
    );
    const xp_earned = xpRow.length ? m.xp_reward : 0;
    const first_time = xpRow.length > 0;

    await pool.query(
      `INSERT INTO user_progress (user_id, module_id, is_completed, completed_at, xp_earned, attempts)
       VALUES ($1, $2, true, now(), $3, 1)
       ON CONFLICT (user_id, module_id) DO UPDATE SET
         attempts = user_progress.attempts + 1,
         last_attempt_at = now(),
         is_completed = true,
         completed_at = COALESCE(user_progress.completed_at, now()),
         xp_earned = GREATEST(user_progress.xp_earned, EXCLUDED.xp_earned)`,
      [req.user.id, m.id, m.xp_reward]
    );

    await bumpStreak(req.user.id);
    const perfect = (await perfectRun(req.user.id, m.id)) && correctCount === answered;
    const { new_achievements, ...snap } = await recordXp(req.user.id, {
      amount: 0, // XP already inserted above; this evaluates achievements + snapshot
      kind: 'lesson',
      moduleId: m.id,
      ctx: { perfect, checkpoint: m.kind === 'checkpoint' },
    });

    const { rows: nextRows } = await pool.query(
      `SELECT slug, title_${lang} AS title FROM modules
        WHERE domain_id = $1 AND order_index > $2 AND is_published
        ORDER BY order_index LIMIT 1`,
      [m.domain_id, m.order_index]
    );

    res.json({
      results,
      accuracy,
      xp_earned,
      ...snap,
      new_achievements,
      is_checkpoint: m.kind === 'checkpoint',
      perfect,
      first_time,
      next_module_slug: nextRows[0]?.slug ?? null,
      next_module_title: nextRows[0]?.title ?? null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
