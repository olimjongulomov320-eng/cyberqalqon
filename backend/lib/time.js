/**
 * Single source of truth for the application day/week boundary (AUD-08).
 *
 * Historically every day-scoped counter (daily goal, review cap, streak day,
 * weekly league) used `CURRENT_DATE` / `date_trunc('week', now())`, which follow
 * the PostgreSQL *session* TimeZone. Nothing pinned that timezone, so on Render
 * (default UTC) the "day" rolled over at 05:00 Asia/Tashkent and the client's
 * device-local hearts rolled over at 00:00 — the two disagreed.
 *
 * These fragments make the boundary explicit and independent of the session
 * TimeZone: `now() AT TIME ZONE 'Asia/Tashkent'` turns the instant into local
 * wall-clock time, and wrapping it back in `AT TIME ZONE` produces the matching
 * `timestamptz` for comparisons against timestamp columns. Uzbekistan has been
 * UTC+5 year-round since 1992 (no DST), so the boundary is deterministic.
 *
 * Use these instead of `CURRENT_DATE` / `date_trunc('week', now())` everywhere
 * a user-visible "today" or "this week" is computed.
 */

const APP_TZ = 'Asia/Tashkent';

/** Start of the current application day, as a timestamptz. */
const DAY_START = `(date_trunc('day', now() AT TIME ZONE '${APP_TZ}') AT TIME ZONE '${APP_TZ}')`;

/** Start of the current application week (ISO weeks: Monday 00:00), as a timestamptz. */
const WEEK_START = `(date_trunc('week', now() AT TIME ZONE '${APP_TZ}') AT TIME ZONE '${APP_TZ}')`;

/** The current application date (yyyy-mm-dd) used for streak bookkeeping. */
const TODAY = `((now() AT TIME ZONE '${APP_TZ}')::date)`;

module.exports = { APP_TZ, DAY_START, WEEK_START, TODAY };
