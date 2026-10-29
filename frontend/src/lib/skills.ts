/**
 * Skill proficiency - derived ONLY from what the learner demonstrated.
 *
 * XP, streaks and time spent never enter this calculation: a domain counts as
 * mastered only when every module is completed AND the graded answers in it
 * clear the accuracy bar. The four labels and their rules are shown in the UI
 * (see `skillsRule*` strings) so nothing about the badge is a mystery.
 */

export interface DomainSkillStat {
  slug: string;
  icon: string;
  title: string;
  correct: number;
  wrong: number;
  modules_total: number;
  modules_completed: number;
}

export interface SkillTrend {
  recent_accuracy: number;
  previous_accuracy: number;
  recent_total: number;
  previous_total: number;
  delta: number;
}

export type Proficiency = 'notStarted' | 'learning' | 'needsPractice' | 'mastered';

export const MASTERY_ACCURACY = 80;

/** Accuracy of a domain's graded answers, or null when there are none. */
export function accuracyOf(s: Pick<DomainSkillStat, 'correct' | 'wrong'>): number | null {
  const total = s.correct + s.wrong;
  if (total <= 0) return null;
  return Math.round((s.correct / total) * 100);
}

/**
 * The published rule:
 *   notStarted   - nothing completed and no graded answers yet
 *   learning     - started, but not every module is completed
 *   needsPractice- every module completed, yet accuracy below the bar (or no
 *                  graded answers to prove it)
 *   mastered     - every module completed AND accuracy ≥ MASTERY_ACCURACY
 */
export function proficiency(s: DomainSkillStat): Proficiency {
  const attempts = s.correct + s.wrong;
  const complete = s.modules_total > 0 && s.modules_completed >= s.modules_total;
  if (s.modules_completed === 0 && attempts === 0) return 'notStarted';
  if (!complete) return 'learning';
  const acc = accuracyOf(s);
  if (acc !== null && acc >= MASTERY_ACCURACY) return 'mastered';
  return 'needsPractice';
}

/** Sort for the matrix: strongest first, unstarted last, ties by curriculum order. */
export function sortForMatrix(rows: DomainSkillStat[]): DomainSkillStat[] {
  const rank: Record<Proficiency, number> = {
    mastered: 0,
    needsPractice: 1,
    learning: 2,
    notStarted: 3,
  };
  return [...rows].sort((a, b) => {
    const diff = rank[proficiency(a)] - rank[proficiency(b)];
    if (diff !== 0) return diff;
    const accA = accuracyOf(a) ?? -1;
    const accB = accuracyOf(b) ?? -1;
    return accB - accA;
  });
}
