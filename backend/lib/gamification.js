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
const { DAY_START, TODAY } = require('./time');

const LESSON_XP = null; // resolved from modules.xp_reward
const CORRECT_XP = 3;
const REVIEW_XP = 4;
const REVIEW_DAILY_CAP = 30;

/* ── Achievement catalogue ─────────────────────────────────────────────────
   Display copy lives in the frontend (i18n); keys are the contract.
   Each predicate receives (userId, ctx, ctx, db), where `db` is the pool or the
   transaction client it must read through. */
const ACHIEVEMENTS = [
  { key: 'first_lesson',    test: async (u, _x, _ctx, db) => (await completed(u, db)) >= 1 },
  { key: 'five_lessons',    test: async (u, _x, _ctx, db) => (await completed(u, db)) >= 5 },
  { key: 'ten_lessons',     test: async (u, _x, _ctx, db) => (await completed(u, db)) >= 10 },
  { key: 'perfect_lesson',  test: async (u, _x, ctx) => Boolean(ctx.perfect) },
  { key: 'streak_7',        test: async (u, _x, _ctx, db) => (await streak(u, db)) >= 7 },
  { key: 'xp_500',          test: async (u, _x, _ctx, db) => (await totalXp(u, db)) >= 500 },
  { key: 'xp_2000',         test: async (u, _x, _ctx, db) => (await totalXp(u, db)) >= 2000 },
  { key: 'reviewer',        test: async (u, _x, ctx) => Boolean(ctx.reviewed) },
  { key: 'checkpoint',      test: async (u, _x, ctx) => Boolean(ctx.checkpoint) },
  { key: 'network_explorer', test: (u, _x, _ctx, db) => domainDone(u, 'networking', db) },
  { key: 'linux_penguin',   test: (u, _x, _ctx, db) => domainDone(u, 'linux', db) },
  { key: 'web_defender',    test: (u, _x, _ctx, db) => domainDone(u, 'web-security', db) },
];

const completed = (u, db = pool) => one(`SELECT COUNT(*)::int AS n FROM user_progress WHERE user_id = $1 AND is_completed`, [u], db);
const streak = (u, db = pool) => one(`SELECT current_streak AS n FROM users WHERE id = $1`, [u], db);
const totalXp = (u, db = pool) => one(`SELECT total_xp AS n FROM users WHERE id = $1`, [u], db);
const domainDone = async (u, domain, db = pool) => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE up.is_completed)::int AS done
       FROM modules m
       LEFT JOIN user_progress up ON up.module_id = m.id AND up.user_id = $1
      WHERE m.domain_id = (SELECT id FROM domains WHERE slug = $2) AND m.is_published`,
    [u, domain]
  );
  return rows[0].total > 0 && rows[0].total === rows[0].done;
};

async function one(sql, params, db = pool) {
  const { rows } = await db.query(sql, params);
  return rows[0]?.n ?? 0;
}

/* ── XP ─────────────────────────────────────────────────────────────────── */

/**
 * Insert an XP event. The DB trigger keeps users.total_xp in sync; we then
 * bump the streak (any earned XP counts as activity) and evaluate achievements.
 * Returns a fresh user snapshot + newly unlocked achievement keys.
 */
async function recordXp(userId, { amount, kind, moduleId = null, exerciseId = null, ctx = {} }, db = pool) {
  if (amount && amount > 0) {
    await db.query(
      `INSERT INTO xp_events (user_id, amount, kind, module_id, exercise_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, amount, kind, moduleId, exerciseId]
    );
    await bumpStreak(userId, db);
  }
  const new_achievements = await evaluateAchievements(userId, ctx, db);
  return { ...(await snapshot(userId, db)), new_achievements };
}

/** Everything the lesson UI shows live: XP, streak, daily-goal progress. */
async function snapshot(userId, db = pool) {
  const { rows } = await db.query(
    `SELECT u.total_xp, u.current_streak, u.longest_streak, u.daily_goal_xp,
            COALESCE((SELECT SUM(amount) FROM xp_events x
                       WHERE x.user_id = u.id AND x.created_at >= ${DAY_START}), 0)::int AS daily_xp
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

async function bumpStreak(userId, db = pool) {
  await db.query(
    `UPDATE users
        SET current_streak = CASE
              WHEN last_streak_date = ${TODAY} THEN current_streak
              WHEN last_streak_date = ${TODAY} - 1 THEN current_streak + 1
              ELSE 1
            END,
            longest_streak = GREATEST(longest_streak, CASE
              WHEN last_streak_date = ${TODAY} THEN current_streak
              WHEN last_streak_date = ${TODAY} - 1 THEN current_streak + 1
              ELSE 1
            END),
            last_streak_date = ${TODAY},
            last_active_at = now()
      WHERE id = $1`,
    [userId]
  );
}

/* ── Achievements ───────────────────────────────────────────────────────── */

/** Returns only the keys unlocked by THIS call (for celebration toasts). */
async function evaluateAchievements(userId, ctx = {}, db = pool) {
  const { rows: owned } = await db.query(
    `SELECT key FROM user_achievements WHERE user_id = $1`,
    [userId]
  );
  const have = new Set(owned.map(r => r.key));
  const fresh = [];

  for (const a of ACHIEVEMENTS) {
    if (have.has(a.key)) continue;
    let won = false;
    try {
      won = await a.test(userId, ctx, ctx, db);
    } catch {
      won = false; // never let a stat query block a lesson
    }
    if (!won) continue;
    await db.query(
      `INSERT INTO user_achievements (user_id, key) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, a.key]
    );
    fresh.push(a.key);
  }
  return fresh;
}

/* ── Daily goal & review XP cap ─────────────────────────────────────────── */

async function xpToday(userId, kind = null, db = pool) {
  const { rows } = await db.query(
    `SELECT COALESCE(SUM(amount), 0)::int AS n
       FROM xp_events
      WHERE user_id = $1
        AND created_at >= ${DAY_START}
        ${kind ? 'AND kind = $2' : ''}`,
    kind ? [userId, kind] : [userId]
  );
  return rows[0].n;
}

/** Returns null when the cap is spent (caller should award 0). */
async function reviewXpAmount(userId, db = pool) {
  const spent = await xpToday(userId, 'review', db);
  if (spent >= REVIEW_DAILY_CAP) return null;
  return Math.min(REVIEW_XP, REVIEW_DAILY_CAP - spent);
}

/* ── Exercise attempt recording ─────────────────────────────────────────── */

/**
 * Record one graded attempt on one exercise. Returns:
 *   firstCorrect — this was ever the first correct answer (drives +XP once)
 *   wrong        — whether this attempt was wrong (drives hearts/weak topics)
 *
 * Also appends a row to `exercise_attempts` — the learner-visible timeline read
 * by GET /users/me/attempts. Both writes share the caller's connection, so a
 * transaction that rolls back leaves no history behind.
 *
 * `seq` orders the rows of one multi-answer submission, which share a timestamp.
 */
async function recordAttempt(userId, moduleId, exerciseId, correct, db = pool, seq = 0) {
  const { rows } = await db.query(
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

  // History row on the SAME connection — inside whatever transaction the caller
  // opened — so the timeline and the counters commit or roll back together.
  // Deliberately not best-effort: a failure here fails the request loudly,
  // exactly as a `mistakes` failure already would, rather than quietly dropping
  // an attempt out of the learner's record.
  //
  // `seq` breaks order ties within one multi-answer submission: every row in a
  // single request shares one `now()`, so without it the timeline's order would
  // depend on the page size the client happened to ask for.
  await db.query(
    `INSERT INTO exercise_attempts (user_id, module_id, exercise_id, correct, seq)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, moduleId, exerciseId, correct, seq]
  );

  return { firstCorrect: rows[0].first_correct, wrong: !correct, wrongCount: rows[0].wrong_count };
}

/** Was every exercise in this module answered correctly on the first try? */
async function perfectRun(userId, moduleId, db = pool) {
  const { rows } = await db.query(
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
