const { Router } = require('express');
const pool = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { TRACKS } = require('../curriculum/tracks');
const { computeMastery, MIN_EXERCISES, MIN_ACCURACY } = require('../lib/mastery');
const { loadModules } = require('../curriculum');

const router = Router();

const NEEDS_REVIEW = new Set(loadModules().filter(m => m.needs_review).map(m => m.slug));

/**
 * GET /tracks — the learning tracks, with the signed-in learner's progress.
 *
 * Two deliberately separate measures per track:
 *   completion — how many of the track's lessons are completed (activity)
 *   mastery    — demonstrated correctness, from FIRST attempts on distinct
 *                exercises (see lib/mastery.js for the exact rule)
 * Signed out, both are empty; the structure (objectives, modules) is public.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const lang = req.query.lang === 'ru' ? 'ru' : 'uz';
    const userId = req.user?.id ?? null;

    const [mods, done, firsts] = await Promise.all([
      pool.query(
        `SELECT slug, kind, xp_reward, title_${lang} AS title,
                jsonb_array_length(exercises) AS exercise_count
           FROM modules WHERE is_published`
      ),
      userId
        ? pool.query(
            `SELECT m.slug FROM user_progress up JOIN modules m ON m.id = up.module_id
              WHERE up.user_id = $1 AND up.is_completed`,
            [userId]
          )
        : { rows: [] },
      userId
        ? pool.query(
            // One row per distinct exercise: the verdict of its first attempt.
            `SELECT DISTINCT ON (ea.module_id, ea.exercise_id)
                    m.slug AS module_slug, ea.correct
               FROM exercise_attempts ea JOIN modules m ON m.id = ea.module_id
              WHERE ea.user_id = $1
              ORDER BY ea.module_id, ea.exercise_id, ea.answered_at, ea.seq, ea.id`,
            [userId]
          )
        : { rows: [] },
    ]);

    const bySlug = new Map(mods.rows.map(m => [m.slug, m]));
    const doneSet = new Set(done.rows.map(r => r.slug));

    const tracks = TRACKS.map(t => {
      const list = t.modules.filter(s => bySlug.has(s)).map(s => {
        const m = bySlug.get(s);
        return {
          slug: s,
          title: m.title,
          kind: m.kind,
          xp_reward: m.xp_reward,
          exercise_count: m.exercise_count,
          completed: doneSet.has(s),
          needs_review: NEEDS_REVIEW.has(s),
        };
      });
      const inTrack = new Set(list.map(m => m.slug));
      const completed = list.filter(m => m.completed).length;
      const next = list.find(m => !m.completed) ?? null;
      const verdicts = firsts.rows.filter(r => inTrack.has(r.module_slug));

      return {
        slug: t.slug,
        icon: t.icon,
        order: t.order,
        level: t.level ?? null,
        title: t.title[lang],
        description: t.description[lang],
        objectives: t.objectives[lang],
        prerequisites: t.prerequisites,
        prerequisites_type: 'recommended',
        needs_review: Boolean(t.needs_review) || list.some(m => m.needs_review),
        completion: {
          rule: 'all_modules',
          completed,
          total: list.length,
          done: list.length > 0 && completed === list.length,
        },
        exercise_total: list.reduce((n, m) => n + m.exercise_count, 0),
        mastery: userId ? computeMastery(verdicts) : null,
        next: next ? { slug: next.slug, title: next.title, kind: next.kind } : null,
        modules: list,
      };
    });

    res.json({
      tracks,
      mastery_rule: { min_exercises: MIN_EXERCISES, min_accuracy: Math.round(MIN_ACCURACY * 100), basis: 'first_attempt_per_exercise' },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
