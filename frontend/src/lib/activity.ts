/**
 * Pure layout for the activity map: a grid of weeks (columns) by weekday (rows,
 * Monday first) ending today, with a 0-4 intensity per day.
 */
import type { ActivityDay } from './api';

export interface Cell {
  day: string; // YYYY-MM-DD
  answers: number;
  level: 0 | 1 | 2 | 3 | 4;
  /** Days after today inside the last week are padding, not real days. */
  future: boolean;
}

const iso = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

/** Intensity bands relative to the busiest day, so a light learner still sees a pattern. */
export function levelFor(answers: number, max: number): Cell['level'] {
  if (answers <= 0 || max <= 0) return 0;
  const r = answers / max;
  return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1;
}

/**
 * @param today  YYYY-MM-DD for "today" in the application timezone
 * @param weeks  number of week columns to draw
 */
export function buildGrid(activity: ActivityDay[], today: string, weeks = 12): Cell[][] {
  // Anything dated after today (clock skew, bad data) must not stretch the scale.
  const byDay = new Map(activity.filter(a => a.day <= today).map(a => [a.day, a.answers]));
  const max = Math.max(0, ...Array.from(byDay.values()));
  const end = new Date(`${today}T00:00:00Z`);
  const weekday = (end.getUTCDay() + 6) % 7; // Monday = 0
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - weekday - (weeks - 1) * 7);

  const cols: Cell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start);
      cur.setUTCDate(start.getUTCDate() + w * 7 + d);
      const key = iso(cur);
      const future = cur.getTime() > end.getTime();
      const answers = future ? 0 : byDay.get(key) ?? 0;
      col.push({ day: key, answers, level: levelFor(answers, max), future });
    }
    cols.push(col);
  }
  return cols;
}

/** Consecutive active days ending today (or yesterday, so an evening visit does not read as a broken streak). */
export function currentRun(activity: ActivityDay[], today: string): number {
  const active = new Set(activity.filter(a => a.answers > 0).map(a => a.day));
  const d = new Date(`${today}T00:00:00Z`);
  if (!active.has(iso(d))) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (active.has(iso(d))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}
