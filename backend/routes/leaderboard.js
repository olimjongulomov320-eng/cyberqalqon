const { Router } = require('express');
const pool = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

const WEEK_CTE = `
  WITH weekly AS (
    SELECT user_id, SUM(amount)::int AS total_xp
      FROM xp_events
     WHERE created_at >= date_trunc('week', now())
     GROUP BY user_id
  )`;

/**
 * GET /leaderboard?period=week|all — live rankings.
 *
 * `week` (default) sums this week's xp_events: a fresh league every Monday.
 * `all` ranks on users.total_xp. Both are computed live — the v1 matview
 * went stale the moment it was created, so it is no longer read here.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const period = req.query.period === 'all' ? 'all' : 'week';
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const rows = period === 'week'
      ? (await pool.query(
          `${WEEK_CTE}
           SELECT u.id AS user_id, u.display_name, u.avatar_emoji, w.total_xp,
                  (SELECT COUNT(*) FROM user_progress up
                    WHERE up.user_id = u.id AND up.is_completed)::int AS modules_completed,
                  ROW_NUMBER() OVER (ORDER BY w.total_xp DESC)::int AS rank
             FROM weekly w
             JOIN users u ON u.id = w.user_id
            ORDER BY rank
            LIMIT $1 OFFSET $2`,
          [limit, offset]
        )).rows
      : (await pool.query(
          `SELECT u.id AS user_id, u.display_name, u.avatar_emoji, u.total_xp,
                  (SELECT COUNT(*) FROM user_progress up
                    WHERE up.user_id = u.id AND up.is_completed)::int AS modules_completed,
                  ROW_NUMBER() OVER (ORDER BY u.total_xp DESC)::int AS rank
             FROM users u
            ORDER BY rank
            LIMIT $1 OFFSET $2`,
          [limit, offset]
        )).rows;

    let my_rank = null;
    if (req.user) {
      const sql = period === 'week'
        ? `${WEEK_CTE}
           SELECT COUNT(*)::int + 1 AS rank
             FROM weekly w
            WHERE w.total_xp > (SELECT COALESCE(total_xp, 0) FROM weekly WHERE user_id = $1)`
        : `SELECT COUNT(*)::int + 1 AS rank
             FROM users u
            WHERE u.total_xp > (SELECT COALESCE(total_xp, 0) FROM users WHERE id = $1)`;
      const { rows: me } = await pool.query(sql, [req.user.id]);
      // A user with zero XP this week is not in the league yet.
      if (period === 'all') {
        my_rank = me[0]?.rank ?? null;
      } else {
        const { rows: has } = await pool.query(
          `SELECT 1 FROM xp_events WHERE user_id = $1 AND created_at >= date_trunc('week', now()) LIMIT 1`,
          [req.user.id]
        );
        my_rank = has.length ? me[0]?.rank ?? null : null;
      }
    }

    res.json({ leaderboard: rows, my_rank, period });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
