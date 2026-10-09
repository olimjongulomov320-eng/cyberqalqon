const { Router } = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const {
  grade,
  publicExercise,
  answerReveal,
  recordXp,
  recordAttempt,
  reviewXpAmount,
  bumpStreak,
} = require('../lib/gamification');

const router = Router();
const pickLang = q => (['uz', 'ru'].includes(q.lang) ? q.lang : 'uz');

function localize(ex, lang) {
  const pub = publicExercise(ex);
  pub.q = ex.q[lang];
  if (pub.options) pub.options = pub.options.map(o => ({ id: o.id, text: o[lang] }));
  if (pub.pairs) pub.pairs = pub.pairs.map(p => ({ id: p.id, left: p.left[lang], right: p.right[lang] }));
  if (pub.items) pub.items = pub.items.map(i => ({ id: i.id, text: i[lang] }));
  return pub;
}

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
 */
router.post('/submit', requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const { module_slug, answers } = req.body ?? {};
    if (!module_slug || !Array.isArray(answers)) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'module_slug and answers[] are required.' },
      });
    }

    const { rows } = await pool.query(
      `SELECT id, exercises FROM modules WHERE slug = $1 AND is_published`,
      [module_slug]
    );
    if (!rows.length) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }
    const mod = rows[0];

    const results = [];
    let xp_earned = 0;

    for (const a of answers) {
      const ex = (mod.exercises ?? []).find(e => e.id === a.id);
      if (!ex) continue;
      const correct = grade(ex, a.value);
      results.push({ id: ex.id, correct, explain: ex.explain[lang], ...answerReveal(ex) });

      await recordAttempt(req.user.id, mod.id, ex.id, correct);

      if (correct) {
        // Insert immediately so reviewXpAmount sees this answer's spend and
        // the daily cap holds across the whole session.
        const amount = await reviewXpAmount(req.user.id); // null = daily cap spent
        if (amount !== null && amount > 0) {
          xp_earned += amount;
          await pool.query(
            `INSERT INTO xp_events (user_id, amount, kind, module_id, created_at)
             VALUES ($1, $2, 'review', $3, now())`,
            [req.user.id, amount, mod.id]
          );
        }
      }
    }

    await bumpStreak(req.user.id);
    // XP rows are already in; this evaluates achievements + returns snapshot.
    const { new_achievements, ...snap } = await recordXp(req.user.id, {
      amount: 0,
      kind: 'review',
      moduleId: mod.id,
      ctx: { reviewed: results.length > 0 },
    });

    res.json({ results, xp_earned, ...snap, new_achievements });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
