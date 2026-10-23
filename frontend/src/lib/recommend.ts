/**
 * Review recommendations — every rule here runs over real stored performance
 * (graded answers from `exercise_attempts` / `mistakes`) and returns an empty
 * list when the data does not support a claim. The UI explains the rule it
 * used; nothing in this module can invent a weakness or a score.
 */

import type { AttemptRow } from './api';
import { accuracyOf, type DomainSkillStat } from './skills.ts';

/** "Ready for a harder challenge": demonstrated, not declared. */
export const HARDER_MIN_ATTEMPTS = 8;
export const HARDER_MIN_ACCURACY = 80;

export interface HarderCandidate extends DomainSkillStat {
  accuracy: number;
  attempts: number;
}

/**
 * Domains where the learner has enough graded answers and clears the accuracy
 * bar, strongest first. Empty when nothing qualifies — the caller shows the
 * rule instead of a fake suggestion.
 */
export function harderReady(
  rows: DomainSkillStat[],
  {
    minAttempts = HARDER_MIN_ATTEMPTS,
    minAccuracy = HARDER_MIN_ACCURACY,
  }: { minAttempts?: number; minAccuracy?: number } = {}
): HarderCandidate[] {
  return rows
    .map(s => ({
      ...s,
      accuracy: accuracyOf(s) ?? 0,
      attempts: s.correct + s.wrong,
    }))
    .filter(s => s.attempts >= minAttempts && s.accuracy >= minAccuracy)
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts)
    .slice(0, 3);
}

/**
 * Collapse a newest-first attempt history to the latest verdict per exercise:
 * a learner should be pointed at the question they got wrong *most recently*,
 * not at every historical miss of the same task.
 *
 * The API returns rows ordered `answered_at DESC`, so the first sighting wins.
 */
export function dedupeLatest<T extends { exercise_id: string; module_slug: string }>(
  rows: T[]
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const key = `${r.module_slug}::${r.exercise_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}
