/**
 * Gamification engine: XP events, streaks, achievements, daily goal.
 *
 * XP always flows through xp_events (the single source of truth for
 * users.total_xp — a DB trigger sums it). Kinds:
 *   lesson  — first completion of a module          (modules.xp_reward)
 *   correct — first correct answer on an exercise   (+3)
 *   review  — correct answer in a review session    (+4, capped per day)
 */

const pool = require('../db');
const { grade, publicExercise, answerReveal } = require('./grade');

const LESSON_XP = null; // resolved from modules.xp_reward
const CORRECT_XP = 3;
const REVIEW_XP = 4;
const REVIEW_DAILY_CAP = 30;

/* ── Achievement catalogue ─────────────────────────────────────────────────
   Display copy lives in the frontend (i18n); keys are the contract.
   Each predicate receives (client-ish helpers, userId, ctx). */
const ACHIEVEMENTS = [
  { key: 'first_lesson',    test: async (u) => (await completed(u)) >= 1 },
  { key: 'five_lessons',    test: async (u) => (await completed(u)) >= 5 },
  { key: 'ten_lessons',     test: async (u) => (await completed(u)) >= 10 },
  { key: 'perfect_lesson',  test: async (u, _x, ctx) => Boolean(ctx.perfect) },
  { key: 'streak_7',        test: async (u) => (await streak(u)) >= 7 },
  { key: 'xp_500',          test: async (u) => (await totalXp(u)) >= 500 },
  { key: 'xp_2000',         test: async (u) => (await totalXp(u)) >= 2000 },
  { key: 'reviewer',        test: async (u, _x, ctx) => Boolean(ctx.reviewed) },
  { key: 'checkpoint',      test: async (u, _x, ctx) => Boolean(ctx.checkpoint) },
  { key: 'network_explorer', test: (u) => domainDone(u, 'networking') },
  { key: 'linux_penguin',   test: (u) => domainDone(u, 'linux') },
  { key: 'web_defender',    test: (u) => domainDone(u, 'web-security') },
];

const completed = u => one(`SELECT COUNT(*)::int AS n FROM user_progress WHERE user_id = $1 AND is_completed`, [u]);
const streak = u => one(`SELECT current_streak AS n FROM users WHERE id = $1`, [u]);
const totalXp = u => one(`SELECT total_xp AS n FROM users WHERE id = $1`, [u]);
const domainDone = async (u, domain) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE up.is_completed)::int AS done
       FROM modules m
       LEFT JOIN user_progress up ON up.module_id = m.id AND up.user_id = $1
      WHERE m.domain_id = (SELECT id FROM domains WHERE slug = $2) AND m.is_published`,
    [u, domain]
  );
  return rows[0].total > 0 && rows[0].total === rows[0].done;
};

async function one(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows[0]?.n ?? 0;
}

/* ── XP ─────────────────────────────────────────────────────────────────── */

/**
 * Insert an XP event. The DB trigger keeps users.total_xp in sync; we then
 * bump the streak (any earned XP counts as activity) and evaluate achievements.
 * Returns a fresh user snapshot + newly unlocked achievement keys.
 */
async function recordXp(userId, { amount, kind, moduleId = null, exerciseId = null, ctx = {} }) {
  if (amount && amount > 0) {
    await pool.query(
      `INSERT INTO xp_events (user_id, amount, kind, module_id, exercise_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, amount, kind, moduleId, exerciseId]
    );
    await bumpStreak(userId);
  }
  const new_achievements = await evaluateAchievements(userId, ctx);
  return { ...(await snapshot(userId)), new_achievements };
}

/** Everything the lesson UI shows live: XP, streak, daily-goal progress. */
async function snapshot(userId) {
  const { rows } = await pool.query(
    `SELECT u.total_xp, u.current_streak, u.longest_streak, u.daily_goal_xp,
            COALESCE((SELECT SUM(amount) FROM xp_events x
                       WHERE x.user_id = u.id AND x.created_at >= CURRENT_DATE), 0)::int AS daily_xp
       FROM users u WHERE u.id = $1`,
    [userId]
  );
  const r = rows[0];
  return r
    ? { total_xp: r.total_xp, streak: r.current_streak, longest_streak: r.longest_streak,
        daily_xp: r.daily_xp, daily_goal: r.daily_goal_xp }
    : { total_xp: 0, streak: 0, longest_streak: 0, daily_xp: 0, daily_goal: 20 };
}

/* ── Streak ─────────────────────────────────────────────────────────────── */

async function bumpStreak(userId) {
  await pool.query(
    `UPDATE users
        SET current_streak = CASE
              WHEN last_streak_date = CURRENT_DATE THEN current_streak
              WHEN last_streak_date = CURRENT_DATE - 1 THEN current_streak + 1
              ELSE 1
            END,
            longest_streak = GREATEST(longest_streak, CASE
              WHEN last_streak_date = CURRENT_DATE THEN current_streak
              WHEN last_streak_date = CURRENT_DATE - 1 THEN current_streak + 1
              ELSE 1
            END),
            last_streak_date = CURRENT_DATE,
            last_active_at = now()
      WHERE id = $1`,
    [userId]
  );
}

/* ── Achievements ───────────────────────────────────────────────────────── */

/** Returns only the keys unlocked by THIS call (for celebration toasts). */
async function evaluateAchievements(userId, ctx = {}) {
  const { rows: owned } = await pool.query(
    `SELECT key FROM user_achievements WHERE user_id = $1`,
    [userId]
  );
  const have = new Set(owned.map(r => r.key));
  const fresh = [];

  for (const a of ACHIEVEMENTS) {
    if (have.has(a.key)) continue;
    let won = false;
    try {
      won = await a.test(userId, ctx, ctx);
    } catch {
      won = false; // never let a stat query block a lesson
    }
    if (!won) continue;
    await pool.query(
      `INSERT INTO user_achievements (user_id, key) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, a.key]
    );
    fresh.push(a.key);
  }
  return fresh;
}

/* ── Daily goal & review XP cap ─────────────────────────────────────────── */

async function xpToday(userId, kind = null) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::int AS n
       FROM xp_events
      WHERE user_id = $1
        AND created_at >= CURRENT_DATE
        ${kind ? 'AND kind = $2' : ''}`,
    kind ? [userId, kind] : [userId]
  );
  return rows[0].n;
}

/** Returns null when the cap is spent (caller should award 0). */
async function reviewXpAmount(userId) {
  const spent = await xpToday(userId, 'review');
  if (spent >= REVIEW_DAILY_CAP) return null;
  return Math.min(REVIEW_XP, REVIEW_DAILY_CAP - spent);
}

/* ── Exercise attempt recording ─────────────────────────────────────────── */

/**
 * Record one graded attempt on one exercise. Returns:
 *   firstCorrect — this was ever the first correct answer (drives +XP once)
 *   wrong        — whether this attempt was wrong (drives hearts/weak topics)
 */
async function recordAttempt(userId, moduleId, exerciseId, correct) {
  const { rows } = await pool.query(
    correct
      ? `INSERT INTO mistakes (user_id, module_id, exercise_id, correct_count, last_attempt_at)
         VALUES ($1, $2, $3, 1, now())
         ON CONFLICT (user_id, module_id, exercise_id)
         DO UPDATE SET correct_count = mistakes.correct_count + 1, last_attempt_at = now()
         RETURNING (mistakes.correct_count = 1 AND mistakes.wrong_count = 0) AS first_correct,
                   mistakes.wrong_count`
      : `INSERT INTO mistakes (user_id, module_id, exercise_id, wrong_count, last_attempt_at)
         VALUES ($1, $2, $3, 1, now())
         ON CONFLICT (user_id, module_id, exercise_id)
         DO UPDATE SET wrong_count = mistakes.wrong_count + 1,
                       last_wrong_at = now(),
                       last_attempt_at = now()
         RETURNING false AS first_correct, mistakes.wrong_count`,
    [userId, moduleId, exerciseId]
  );
  return { firstCorrect: rows[0].first_correct, wrong: !correct, wrongCount: rows[0].wrong_count };
}

/** Was every exercise in this module answered correctly on the first try? */
async function perfectRun(userId, moduleId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n
       FROM mistakes
      WHERE user_id = $1 AND module_id = $2 AND wrong_count > 0`,
    [userId, moduleId]
  );
  return rows[0].n === 0;
}

module.exports = {
  recordXp,
  bumpStreak,
  snapshot,
  evaluateAchievements,
  xpToday,
  reviewXpAmount,
  recordAttempt,
  perfectRun,
  ACHIEVEMENTS,
  CORRECT_XP,
  REVIEW_XP,
  grade, // re-export so routes grade through one module
  publicExercise,
  answerReveal,
};
