const { Router } = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const {
  grade,
  localizeExercise,
  answerReveal,
  recordXp,
  recordAttempt,
  reviewXpAmount,
  bumpStreak,
} = require('../lib/gamification');
const {
  isValidKey,
  requestHash,
  runIdempotent,
  IdempotencyConflictError,
} = require('../lib/idempotency');

const rateLimit = require('express-rate-limit');
const { anyLockedByAssessment, LOCK_RESPONSE } = require('../lib/assessmentLock');

const router = Router();
const reviewLimiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true });
const pickLang = q => (['uz', 'ru'].includes(q.lang) ? q.lang : 'uz');

const localize = localizeExercise;

/**
 * GET /review — weak-topic report + a ready-made 5-minute session.
 *
 * Topics are domains ranked by mistakes made. The session pulls the most
 * mistake-prone exercises from the user's weakest module, so review targets
 * exactly what went wrong. Returns session: null when there is nothing to
 * review yet (the UI shows its empty state).
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const userId = req.user.id;

    const [topicsRes, weakestRes] = await Promise.all([
      pool.query(
        `SELECT d.slug, d.icon, d.title_${lang} AS title,
                SUM(m.wrong_count)::int AS wrong,
                SUM(m.correct_count)::int AS correct
           FROM mistakes m
           JOIN modules mod ON mod.id = m.module_id
           JOIN domains d ON d.id = mod.domain_id
          WHERE m.user_id = $1
          GROUP BY d.slug, d.icon, d.title_uz, d.title_ru
          HAVING SUM(m.wrong_count) > 0
          ORDER BY SUM(m.wrong_count) DESC
          LIMIT 5`,
        [userId]
      ),
      pool.query(
        `SELECT mod.id, mod.slug, mod.title_${lang} AS title,
                SUM(m.wrong_count) AS weight
           FROM mistakes m
           JOIN modules mod ON mod.id = m.module_id
          WHERE m.wrong_count > 0 AND mod.is_published AND m.user_id = $1
          GROUP BY mod.id
          ORDER BY weight DESC, MAX(m.last_wrong_at) DESC NULLS LAST
          LIMIT 1`,
        [userId]
      ),
    ]);

    const topics = topicsRes.rows.map(t => ({
      slug: t.slug,
      icon: t.icon,
      title: t.title,
      wrong: t.wrong,
      accuracy: t.wrong + t.correct
        ? Math.round((t.correct / (t.wrong + t.correct)) * 100)
        : 0,
    }));

    let session = null;
    const weakest = weakestRes.rows[0];
    if (weakest) {
      const [idRows, modRows] = await Promise.all([
        pool.query(
          `SELECT exercise_id FROM mistakes
            WHERE user_id = $1 AND module_id = $2 AND wrong_count > 0
            ORDER BY wrong_count DESC, last_attempt_at DESC NULLS LAST
            LIMIT 5`,
          [userId, weakest.id]
        ),
        pool.query(`SELECT exercises FROM modules WHERE id = $1`, [weakest.id]),
      ]);
      const all = modRows.rows[0]?.exercises ?? [];
      const picked = idRows.rows
        .map(r => all.find(e => e && e.id === r.exercise_id))
        .filter(Boolean);
      if (picked.length) {
        session = {
          module_slug: weakest.slug,
          module_title: weakest.title,
          exercises: picked.map(ex => localize(ex, lang)),
        };
      }
    }

    res.json({ topics, session });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /review/submit — grade a review session.
 * Correct answers restore standing in the weak-topic stats and earn review
 * XP, capped per day so review stays honest but is always worth doing.
 *
 * Idempotency: the client sends a per-attempt `idempotency_key`, reused on every
 * retry of the same submission. All side effects (mistake counters, review XP,
 * streak, achievements) and the idempotency record commit in one transaction, so
 * a retry after a timeout — or a concurrent duplicate — applies them at most
 * once per (user, key). Clients that predate the field fall back to a payload
 * hash: a timeout retry of the same payload is deduped, while a byte-identical
 * redo is treated as the same submission.
 */
const REVIEW_SCOPE = 'review.submit';

router.post('/submit', reviewLimiter, requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const { module_slug, answers: rawAnswers, idempotency_key } = req.body ?? {};
    if (typeof module_slug !== 'string' || !module_slug || !Array.isArray(rawAnswers) || rawAnswers.length > 50) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'module_slug and answers[] are required.' },
      });
    }
    if (idempotency_key !== undefined && !isValidKey(idempotency_key)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'idempotency_key must be 16-128 url-safe characters.',
        },
      });
    }

    // One graded answer per exercise: drops malformed entries and repeats so a
    // payload cannot farm review XP by listing the same question many times.
    const seenIds = new Set();
    const answers = rawAnswers.filter(a => {
      if (!a || typeof a !== 'object' || typeof a.id !== 'string' || seenIds.has(a.id)) return false;
      seenIds.add(a.id);
      return true;
    });

    if (await anyLockedByAssessment(req.user.id, module_slug, answers.map(a => a.id))) {
      return res.status(423).json(LOCK_RESPONSE);
    }

    const { rows } = await pool.query(
      `SELECT id, exercises FROM modules WHERE slug = $1 AND is_published`,
      [module_slug]
    );
    if (!rows.length) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }
    const mod = rows[0];

    const hash = requestHash(module_slug, answers);
    const key = idempotency_key ?? `auto:${hash}`;

    const outcome = await runIdempotent(
      pool,
      { userId: req.user.id, scope: REVIEW_SCOPE, key, requestHash: hash },
      async client => {
        const results = [];
        let xp_earned = 0;

        // Position inside this submission — orders the history rows, all of
        // which share one `now()` inside the transaction.
        let seq = 0;
        for (const a of answers) {
          const ex = (mod.exercises ?? []).find(e => e.id === a.id);
          if (!ex) continue;
          const correct = grade(ex, a.value);
          results.push({ id: ex.id, correct, explain: ex.explain[lang], ...answerReveal(ex) });

          await recordAttempt(req.user.id, mod.id, ex.id, correct, client, seq++);

          if (correct) {
            // Checked per answer inside the transaction so the daily cap holds
            // across the whole session and across concurrent submissions.
            const amount = await reviewXpAmount(req.user.id, client); // null = daily cap spent
            if (amount !== null && amount > 0) {
              xp_earned += amount;
              await client.query(
                `INSERT INTO xp_events (user_id, amount, kind, module_id, created_at)
                 VALUES ($1, $2, 'review', $3, now())`,
                [req.user.id, amount, mod.id]
              );
            }
          }
        }

        await bumpStreak(req.user.id, client);
        // XP rows are already in; this evaluates achievements + returns snapshot.
        const { new_achievements, ...snap } = await recordXp(
          req.user.id,
          { amount: 0, kind: 'review', moduleId: mod.id, ctx: { reviewed: results.length > 0 } },
          client
        );

        return { results, xp_earned, ...snap, new_achievements };
      }
    );

    res.status(outcome.status).json(outcome.response);
  } catch (err) {
    if (err instanceof IdempotencyConflictError) {
      return res.status(409).json({
        error: {
          code: 'IDEMPOTENCY_KEY_REUSED',
          message: 'This idempotency key was already used with a different payload.',
        },
      });
    }
    next(err);
  }
});

module.exports = router;
