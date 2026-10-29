const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const {
  grade,
  localizeExercise,
  answerReveal,
  recordXp,
  recordAttempt,
  perfectRun,
  bumpStreak,
  CORRECT_XP,
} = require('../lib/gamification');
const { lockedByAssessment, LOCK_RESPONSE } = require('../lib/assessmentLock');

const router = Router();

/** Failed attempts on one task before "Show solution" is offered. */
const SOLUTION_AFTER_WRONG = 2;

// Lesson flow fires many small requests (one per exercise), so the old
// 10/min submit cap would strangle a normal lesson. 30/min still stops abuse.
const lessonLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true });

/* ── helpers ───────────────────────────────────────────────────────────── */

const pickLang = q => (['uz', 'ru'].includes(q.lang) ? q.lang : 'uz');

const publicLocalized = localizeExercise;

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

/**
 * Sequential unlock, enforced server-side (the learning map only displayed it).
 * A module is open when it is first in its domain, already completed by this
 * learner, or its immediate predecessor in the domain is completed.
 * Returns null when open, or the predecessor's slug when locked.
 */
async function lockedBy(userId, m) {
  const { rows } = await pool.query(
    `SELECT prev.slug,
            EXISTS (SELECT 1 FROM user_progress up
                     WHERE up.user_id = $1 AND up.module_id = prev.id AND up.is_completed) AS prev_done,
            EXISTS (SELECT 1 FROM user_progress up
                     WHERE up.user_id = $1 AND up.module_id = $2 AND up.is_completed) AS self_done
       FROM modules prev
      WHERE prev.domain_id = $3 AND prev.is_published AND prev.order_index < $4
      ORDER BY prev.order_index DESC
      LIMIT 1`,
    [userId, m.id, m.domain_id, m.order_index]
  );
  if (!rows.length) return null; // first in its domain
  const r = rows[0];
  return r.prev_done || r.self_done ? null : r.slug;
}

const LOCKED = slug => ({
  error: { code: 'MODULE_LOCKED', message: 'Finish the previous lesson first.', prerequisite: slug },
});

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
      const { rows: solved } = await pool.query(
        `SELECT exercise_id FROM mistakes
          WHERE user_id = $1 AND module_id = $2 AND correct_count > 0`,
        [req.user.id, m.id]
      );
      progress = { ...progress, solved: solved.map(r => r.exercise_id) };
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
    {
      const blocker = await lockedBy(req.user.id, m);
      if (blocker) return res.status(403).json(LOCKED(blocker));
    }
    const ex = (m.exercises ?? []).find(e => e.id === exercise_id);
    if (!ex) {
      return res.status(404).json({ error: { code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found.' } });
    }

    if (await lockedByAssessment(req.user.id, m.slug, ex.id)) return res.status(423).json(LOCK_RESPONSE);

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

    // The answer and the explanation are part of the reward for solving the
    // task. A wrong attempt gets a verdict only; after SOLUTION_AFTER_WRONG
    // failed attempts the learner may ask for the solution explicitly.
    res.json({
      correct,
      xp_earned,
      wrong_attempts: attempt.wrongCount,
      can_reveal: correct || attempt.wrongCount >= SOLUTION_AFTER_WRONG,
      ...(correct ? { explain: ex.explain[lang], reveal: answerReveal(ex) } : {}),
      ...snap,
      new_achievements,
    });
  } catch (err) {
    next(err);
  }
});

/* ── POST /modules/:slug/solution — reveal a task's solution ─────────────
   Allowed once the learner has solved the task, or failed it twice. Records
   nothing and awards nothing: viewing a solution is not solving. */
router.post('/:slug/solution', lessonLimiter, requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const { exercise_id } = req.body ?? {};
    if (typeof exercise_id !== 'string' || !exercise_id) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'exercise_id is required.' } });
    }
    const m = await loadModule(req.params.slug);
    if (!m) return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    const ex = (m.exercises ?? []).find(e => e.id === exercise_id);
    if (!ex) return res.status(404).json({ error: { code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found.' } });
    if (await lockedByAssessment(req.user.id, m.slug, ex.id)) return res.status(423).json(LOCK_RESPONSE);

    const { rows } = await pool.query(
      `SELECT correct_count, wrong_count FROM mistakes WHERE user_id = $1 AND module_id = $2 AND exercise_id = $3`,
      [req.user.id, m.id, ex.id]
    );
    const r = rows[0];
    if (!r || (r.correct_count === 0 && r.wrong_count < SOLUTION_AFTER_WRONG)) {
      return res.status(403).json({
        error: {
          code: 'SOLUTION_LOCKED',
          message: 'Try the task first.',
          remaining: Math.max(0, SOLUTION_AFTER_WRONG - (r?.wrong_count ?? 0)),
        },
      });
    }
    res.json({ explain: ex.explain[lang], reveal: answerReveal(ex) });
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
    {
      const blocker = await lockedBy(req.user.id, m);
      if (blocker) return res.status(403).json(LOCKED(blocker));
    }
    const ex = (m.exercises ?? []).find(e => e.id === exercise_id);
    if (!ex) {
      return res.status(404).json({ error: { code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found.' } });
    }

    if (await lockedByAssessment(req.user.id, m.slug, ex.id)) return res.status(423).json(LOCK_RESPONSE);

    // Practice only re-asks questions the learner has already met in /check, so
    // it can never be used to read answers for exercises they have not seen.
    const { rows: seen } = await pool.query(
      `SELECT 1 FROM mistakes WHERE user_id = $1 AND module_id = $2 AND exercise_id = $3`,
      [req.user.id, m.id, ex.id]
    );
    if (!seen.length) {
      return res.status(403).json({
        error: { code: 'NOT_ATTEMPTED', message: 'Answer this question in the lesson first.' },
      });
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
    const m = await loadModule(req.params.slug);
    if (!m) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }
    {
      const blocker = await lockedBy(req.user.id, m);
      if (blocker) return res.status(403).json(LOCKED(blocker));
    }

    // A lesson is complete when every task in it has been SOLVED (answered
    // correctly at least once), not merely attempted. Solved state is read from
    // the server's own attempt records; the request carries no answers, so there
    // is nothing for a client to fake.
    const { rows: attemptRows } = await pool.query(
      `SELECT exercise_id, correct_count, wrong_count FROM mistakes WHERE user_id = $1 AND module_id = $2`,
      [req.user.id, m.id]
    );
    const byId = new Map(attemptRows.map(r => [r.exercise_id, r]));
    const exercises = m.exercises ?? [];
    const unsolved = exercises.filter(e => !(byId.get(e.id)?.correct_count > 0));
    if (unsolved.length > 0) {
      return res.status(422).json({
        error: {
          code: 'NOT_SOLVED',
          message: 'Solve every task in the lesson first.',
          remaining: unsolved.length,
          total: exercises.length,
        },
      });
    }

    const results = exercises.map(ex => ({
      id: ex.id,
      correct: true,
      explain: ex.explain[lang],
      ...answerReveal(ex),
    }));
    const answered = results.length;
    // Clean = solved without a single failed attempt, ever.
    const correctCount = exercises.filter(e => (byId.get(e.id)?.wrong_count ?? 0) === 0).length;
    const accuracy = answered ? Math.round((correctCount / answered) * 100) : 0;

    // One transaction: XP, progress, streak and achievements commit together or
    // not at all. Lesson XP is once per (user, module), enforced by a partial
    // unique index, so two parallel completions cannot both award it.
    const client = await pool.connect();
    let xp_earned = 0;
    let first_time = false;
    let perfect = false;
    let snap;
    let new_achievements;
    try {
      await client.query('BEGIN');
      const { rows: xpRow } = await client.query(
        `INSERT INTO xp_events (user_id, module_id, amount, kind, created_at)
         VALUES ($1, $2, $3, 'lesson', now())
         ON CONFLICT (user_id, module_id) WHERE kind = 'lesson' DO NOTHING
         RETURNING id`,
        [req.user.id, m.id, m.xp_reward]
      );
      first_time = xpRow.length > 0;
      xp_earned = first_time ? m.xp_reward : 0;

      await client.query(
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

      await bumpStreak(req.user.id, client);
      perfect = (await perfectRun(req.user.id, m.id, client)) && correctCount === answered;
      ({ new_achievements, ...snap } = await recordXp(
        req.user.id,
        {
          amount: 0, // XP already inserted above; this evaluates achievements + snapshot
          kind: 'lesson',
          moduleId: m.id,
          ctx: { perfect, checkpoint: m.kind === 'checkpoint' },
        },
        client
      ));
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }

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
