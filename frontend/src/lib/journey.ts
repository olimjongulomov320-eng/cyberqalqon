/**
 * The six-stage learning journey — pure, so the strip on every learning route
 * is driven by one tested definition instead of five hand-rolled navs.
 *
 *   01 discover → the skill directory
 *   02 learn    → the next lesson that is actually open
 *   03 practice → the Problem Arena
 *   04 apply    → the next unlocked checkpoint (assessment), else advanced tasks
 *   05 review   → the review hub
 *   06 master   → the skill matrix on the profile
 *
 * Destinations are never invented: `continueSlug` and `checkpointSlug` come
 * from `GET /v1/paths` (the learner's real position), and when they are absent
 * the stage falls back to a route that always exists.
 */

export type StageKey = 'discover' | 'learn' | 'practice' | 'apply' | 'review' | 'master';

export interface JourneySources {
  /** Real `continue` target from /paths, or null when everything is done. */
  continueSlug?: string | null;
  /** Next checkpoint (kind === 'checkpoint') that is not locked, if any. */
  checkpointSlug?: string | null;
}

export interface Stage {
  key: StageKey;
  index: number;
  labelKey: string;
  href: string;
}

export function journeyStages({ continueSlug, checkpointSlug }: JourneySources = {}): Stage[] {
  return [
    { key: 'discover', index: 1, labelKey: 'stageDiscover', href: '/learn' },
    {
      key: 'learn',
      index: 2,
      labelKey: 'stageLearn',
      href: continueSlug ? `/modules/${continueSlug}` : '/learn',
    },
    { key: 'practice', index: 3, labelKey: 'stagePractice', href: '/problems' },
    {
      key: 'apply',
      index: 4,
      labelKey: 'stageApply',
      href: checkpointSlug ? `/modules/${checkpointSlug}` : '/problems?difficulty=advanced',
    },
    { key: 'review', index: 5, labelKey: 'stageReview', href: '/practice' },
    { key: 'master', index: 6, labelKey: 'stageMaster', href: '/profile' },
  ];
}

/**
 * Which stage the current route represents. A checkpoint lesson counts as
 * "apply" — that is what an end-of-domain assessment is — while a regular
 * lesson counts as "learn". Unknown routes return null and the strip renders
 * with nothing marked rather than guessing.
 */
export function stageForPath(pathname: string, isCheckpoint = false): StageKey | null {
  if (pathname.startsWith('/modules')) return isCheckpoint ? 'apply' : 'learn';
  if (pathname.startsWith('/problems')) return 'practice';
  if (pathname.startsWith('/practice')) return 'review';
  if (pathname.startsWith('/profile')) return 'master';
  if (pathname.startsWith('/learn')) return 'discover';
  return null;
}
