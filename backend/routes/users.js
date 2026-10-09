const { Router } = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();
const LANGS = ['uz', 'ru', 'en'];

// Every /me route is private. Registered once here rather than per-handler.
router.use(requireAuth);

const PROFILE_COLUMNS =
  'id, display_name, avatar_emoji, total_xp, lang, low_bandwidth_mode, created_at, ' +
  'current_streak, longest_streak, daily_goal_xp, email';

async function loadProfile(userId) {
  const { rows } = await pool.query(
    `SELECT ${PROFILE_COLUMNS},
            (SELECT COUNT(*) FROM user_progress
              WHERE user_id = $1 AND is_completed) AS modules_completed
       FROM users
      WHERE id = $1`,
    [userId]
  );
  return rows[0] ?? null;
}

// GET /users/me
router.get('/me', async (req, res, next) => {
  try {
    const user = await loadProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User no longer exists.' } });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /users/me — preferences only. Credentials are deliberately not editable here.
router.patch('/me', async (req, res, next) => {
  try {
    const { lang, low_bandwidth_mode: lowBandwidth, display_name: displayName } = req.body ?? {};

    const sets = [];
    const params = [req.user.id];

    if (lang !== undefined) {
      if (!LANGS.includes(lang)) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `lang must be one of ${LANGS.join(', ')}` } });
      }
      params.push(lang);
      sets.push(`lang = $${params.length}`);
    }

    if (lowBandwidth !== undefined) {
      if (typeof lowBandwidth !== 'boolean') {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'low_bandwidth_mode must be a boolean' } });
      }
      params.push(lowBandwidth);
      sets.push(`low_bandwidth_mode = $${params.length}`);
    }

    if (displayName !== undefined) {
      const name = String(displayName).trim();
      if (name.length < 1 || name.length > 40) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'display_name must be 1-40 characters' } });
      }
      params.push(name);
      sets.push(`display_name = $${params.length}`);
    }

    if (req.body.avatar_emoji !== undefined) {
      const emoji = String(req.body.avatar_emoji).trim();
      if (emoji.length < 1 || emoji.length > 16) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'avatar_emoji must be 1-16 characters' } });
      }
      params.push(emoji);
      sets.push(`avatar_emoji = $${params.length}`);
    }

    if (req.body.daily_goal_xp !== undefined) {
      const goal = Number(req.body.daily_goal_xp);
      if (![10, 20, 30, 50].includes(goal)) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'daily_goal_xp must be one of 10, 20, 30, 50' } });
      }
      params.push(goal);
      sets.push(`daily_goal_xp = $${params.length}`);
    }

    if (!sets.length) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Nothing to update.' } });
    }

    const { rowCount } = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $1`, params);
    if (!rowCount) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User no longer exists.' } });
    }

    res.json(await loadProfile(req.user.id));
  } catch (err) {
    next(err);
  }
});

// GET /users/me/stats — everything the dashboard/profile screens need in one call.
router.get('/me/stats', async (req, res, next) => {
  try {
    const lang = ['uz', 'ru'].includes(req.query.lang) ? req.query.lang : 'uz';
    const userId = req.user.id;

    const [profile, xp, attempts, achievements, domains, recent] = await Promise.all([
      loadProfile(userId),
      pool.query(
        `SELECT COALESCE(SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE), 0)::int AS daily_xp,
                COALESCE(SUM(amount) FILTER (WHERE created_at >= date_trunc('week', now())), 0)::int AS week_xp
           FROM xp_events WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COALESCE(SUM(correct_count), 0)::int AS correct,
                COALESCE(SUM(wrong_count), 0)::int AS wrong
           FROM mistakes WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT key, unlocked_at FROM user_achievements
          WHERE user_id = $1 ORDER BY unlocked_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT d.slug, d.icon, d.title_${lang} AS title,
                SUM(m.correct_count)::int AS correct,
                SUM(m.wrong_count)::int AS wrong
           FROM mistakes m
           JOIN modules mod ON mod.id = m.module_id
           JOIN domains d ON d.id = mod.domain_id
          WHERE m.user_id = $1
          GROUP BY d.slug, d.icon, d.title_uz, d.title_ru`,
        [userId]
      ),
      pool.query(
        `SELECT x.kind, x.amount, x.created_at, mod.title_${lang} AS module_title
           FROM xp_events x
           LEFT JOIN modules mod ON mod.id = x.module_id
          WHERE x.user_id = $1
          ORDER BY x.created_at DESC
          LIMIT 6`,
        [userId]
      ),
    ]);
    if (!profile) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User no longer exists.' } });
    }

    const { correct, wrong } = attempts.rows[0];
    const acc = correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : null;

    const topics = domains.rows
      .map(d => ({
        slug: d.slug,
        icon: d.icon,
        title: d.title,
        correct: d.correct,
        wrong: d.wrong,
        accuracy: d.correct + d.wrong ? Math.round((d.correct / (d.correct + d.wrong)) * 100) : 0,
      }))
      .sort((a, b) => b.accuracy - a.accuracy);

    res.json({
      profile,
      daily_xp: xp.rows[0].daily_xp,
      week_xp: xp.rows[0].week_xp,
      accuracy: acc,
      answers_correct: correct,
      answers_wrong: wrong,
      achievements: achievements.rows,
      strong_topics: topics.filter(t => t.correct > 0).slice(0, 3),
      weak_topics: topics.filter(t => t.wrong > 0).reverse().slice(0, 3),
      recent: recent.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /users/me/progress
router.get('/me/progress', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.slug AS module_slug,
              m.category,
              m.order_index,
              up.is_completed,
              up.xp_earned,
              up.attempts,
              up.completed_at
         FROM user_progress up
         JOIN modules m ON m.id = up.module_id
        WHERE up.user_id = $1
        ORDER BY m.category, m.order_index`,
      [req.user.id]
    );
    res.json({ progress: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
