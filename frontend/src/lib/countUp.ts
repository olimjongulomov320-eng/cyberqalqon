/** Pure maths for the animated XP counter. */

export const COUNT_UP_MS = 400;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Value shown `elapsedMs` into an animation from `from` to `to`. Always an integer; exact at the end. */
export function valueAt(from: number, to: number, elapsedMs: number, durationMs = COUNT_UP_MS): number {
  if (durationMs <= 0 || elapsedMs >= durationMs || from === to) return to;
  return Math.round(from + (to - from) * easeOutCubic(elapsedMs / durationMs));
}
