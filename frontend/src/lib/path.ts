/**
 * Pure helpers for the visual learning path (components/PathTrail.tsx).
 */

/**
 * Horizontal offset (px) of the n-th node on the winding path: a gentle sine
 * wave so the trail zig-zags like a road instead of a straight list. Kept small
 * so it never overflows a 320px column.
 */
export function trailOffset(index: number, amplitude = 36): number {
  return Math.round(Math.sin(index * (Math.PI / 2.5)) * amplitude);
}

/**
 * Did the learner finish something since they last looked at this domain?
 * `seen` is the completed count stored on the previous visit (null on the very
 * first visit, which must NOT celebrate: nothing was just unlocked).
 */
export function justUnlocked(seen: number | null, completed: number): boolean {
  return seen !== null && completed > seen;
}

export const SEEN_KEY = 'cq_path_seen';

export function readSeen(domainSlug: string): number | null {
  try {
    const all = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}') as Record<string, unknown>;
    const v = all[domainSlug];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeSeen(domainSlug: string, completed: number) {
  try {
    const all = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}') as Record<string, unknown>;
    localStorage.setItem(SEEN_KEY, JSON.stringify({ ...all, [domainSlug]: completed }));
  } catch {
    /* storage unavailable: the animation just won't replay */
  }
}
