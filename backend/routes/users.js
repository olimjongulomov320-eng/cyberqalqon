const { Router } = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { DAY_START, WEEK_START } = require('../lib/time');
const { trendFromCounts } = require('../lib/stats');

const router = Router();
// The frontend ships uz/ru dictionaries only (lib/i18n.ts). Accepting more
// here would let a client persist a locale the UI cannot render.
const LANGS = ['uz', 'ru'];

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

    const [profile, xp, attempts, achievements, domains, recent, skillDomains, trend] = await Promise.all([
      loadProfile(userId),
      pool.query(
        `SELECT COALESCE(SUM(amount) FILTER (WHERE created_at >= ${DAY_START}), 0)::int AS daily_xp,
                COALESCE(SUM(amount) FILTER (WHERE created_at >= ${WEEK_START}), 0)::int AS week_xp
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
      // Skill matrix (Master view): EVERY published domain with this learner's
      // real graded accuracy and real module completion. Left joins, so a domain
      // with no attempts still appears — as an honest "not started" row — rather
      // than silently vanishing from the matrix.
      pool.query(
        `SELECT d.slug, d.icon, d.title_${lang} AS title,
                p.order_index AS path_order, d.order_index,
                COALESCE(SUM(m.correct_count), 0)::int AS correct,
                COALESCE(SUM(m.wrong_count), 0)::int AS wrong,
                (SELECT COUNT(*) FROM modules mm
                  WHERE mm.domain_id = d.id AND mm.is_published)::int AS modules_total,
                (SELECT COUNT(*) FROM user_progress up
                   JOIN modules mm ON mm.id = up.module_id
                  WHERE up.user_id = $1 AND mm.domain_id = d.id AND up.is_completed)::int AS modules_completed
           FROM domains d
           JOIN paths p ON p.slug = d.path_slug
           LEFT JOIN modules mod ON mod.domain_id = d.id AND mod.is_published
           LEFT JOIN mistakes m ON m.module_id = mod.id AND m.user_id = $1
          GROUP BY d.id, p.order_index
          ORDER BY p.order_index, d.order_index`,
        [userId]
      ),
      // Improvement over time: last 7 days vs the 7 before that, from the
      // graded-attempt timeline. `lib/stats` decides whether the windows are
      // thick enough to compare; when they are not, `trend` is null and the UI
      // says so instead of showing a number built on two answers.
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE answered_at >= now() - interval '7 days')::int AS r_total,
           COUNT(*) FILTER (WHERE answered_at >= now() - interval '7 days' AND correct)::int AS r_correct,
           COUNT(*) FILTER (WHERE answered_at >= now() - interval '14 days'
                             AND answered_at <  now() - interval '7 days')::int AS p_total,
           COUNT(*) FILTER (WHERE answered_at >= now() - interval '14 days'
                             AND answered_at <  now() - interval '7 days' AND correct)::int AS p_correct
         FROM exercise_attempts
        WHERE user_id = $1`,
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

    const tr = trend.rows[0];
    const trendPayload = trendFromCounts(
      { total: tr.r_total, correct: tr.r_correct },
      { total: tr.p_total, correct: tr.p_correct }
    );

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
      domains: skillDomains.rows,
      trend: trendPayload,
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

// GET /users/me/attempts — the graded-attempt timeline, newest first.
//
// Scoped to the session's own user by construction (there is no user_id
// parameter), so a learner can only ever read their own history. `offset` is a
// cursor into `ORDER BY answered_at DESC`, which is stable enough for a
// personal log: new attempts land at the top and never shift an existing page
// into a duplicate (they only push rows down, and the caller pages downward).
// `total` and `has_more` follow `result`; `correct_total`/`wrong_total` are
// always the whole-history split, so the profile's balance never hides behind
// an active filter.
router.get('/me/attempts', async (req, res, next) => {
  try {
    const lang = LANGS.includes(req.query.lang) ? req.query.lang : 'uz';
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);
    const result = ['correct', 'wrong'].includes(req.query.result) ? req.query.result : null;

    const params = [req.user.id, lang, limit, offset];
    const where = ['ea.user_id = $1'];
    if (result) {
      params.push(result === 'correct');
      where.push(`ea.correct = $${params.length}`);
    }

    const [rows, summary, filtered] = await Promise.all([
      pool.query(
        `SELECT ea.id, ea.exercise_id, ea.correct, ea.answered_at,
                m.slug AS module_slug, m.title_${lang} AS module_title,
                d.slug AS domain_slug, d.icon AS domain_icon,
                ex.question
           FROM exercise_attempts ea
           JOIN modules m ON m.id = ea.module_id
           LEFT JOIN domains d ON d.id = m.domain_id
           LEFT JOIN LATERAL (
             SELECT elem -> 'q' ->> $2 AS question
               FROM jsonb_array_elements(m.exercises) elem
              WHERE elem ->> 'id' = ea.exercise_id
           ) ex ON true
          WHERE ${where.join(' AND ')}
          ORDER BY ea.answered_at DESC, ea.seq DESC, ea.id DESC
          LIMIT $3 OFFSET $4`,
        params
      ),
      // Whole-history split. Deliberately ignores `result`: the profile shows
      // "N correct / M wrong" as a standing balance, which stays meaningful
      // even while the list below is filtered to one verdict.
      pool.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE correct)::int AS correct_total,
                COUNT(*) FILTER (WHERE NOT correct)::int AS wrong_total
           FROM exercise_attempts
          WHERE user_id = $1`,
        [req.user.id]
      ),
      // Row count matching the REQUESTED filter — `total` and `has_more` follow
      // this, otherwise paging under a filter would run off the end.
      result
        ? pool.query(
            `SELECT COUNT(*)::int AS total
               FROM exercise_attempts
              WHERE user_id = $1 AND correct = $2`,
            [req.user.id, result === 'correct']
          )
        : null,
    ]);

    const { total: allTotal, correct_total: correctTotal, wrong_total: wrongTotal } =
      summary.rows[0];
    const total = filtered ? filtered.rows[0].total : allTotal;

    res.json({
      attempts: rows.rows.map(r => ({
        // BIGSERIAL comes back from node-postgres as a string.
        id: Number(r.id),
        exercise_id: r.exercise_id,
        correct: r.correct,
        answered_at: r.answered_at,
        // '' rather than null: the UI renders a fallback line, never `null`.
        question: r.question ?? '',
        module_slug: r.module_slug,
        module_title: r.module_title,
        domain_slug: r.domain_slug ?? null,
        domain_icon: r.domain_icon ?? null,
      })),
      total,
      correct_total: correctTotal,
      wrong_total: wrongTotal,
      limit,
      offset,
      has_more: offset + rows.rowCount < total,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
