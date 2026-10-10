import type { Variants, Transition } from 'framer-motion';

/**
 * Motion system — single source of truth for animation durations, easing and
 * the reusable variants used across pages and components.
 *
 * Rules (kept deliberately simple):
 *   · transform/opacity only — never layout properties;
 *   · everything is gated by MotionConfig reducedMotion="user" (AppShell), so
 *     OS "reduce motion" skips transforms and keeps quick opacity fades;
 *   · entrances are short (≤ 300ms) so they never feel like the app is slow.
 */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DUR = {
  /** Button / microfeedback pops and shakes. */
  fast: 0.18,
  /** Card + page entrances, dialog openings. */
  base: 0.28,
  /** Progress fills and celebratory reveals. */
  slow: 0.45,
} as const;

export const EASE_IN_OUT: Transition['ease'] = 'easeOut';

/** Fade + slight rise — the page/route transition default. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE },
  },
};

/** Parent orchestration: staggers children by `delay = index * step`. */
export const staggerParent = (step = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step } },
});

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE },
  },
};

/** Card hover lift (transform + shadow-ish via border colour only). */
export const cardHover: Variants = {
  rest: { y: 0 },
  hover: { y: -2, transition: { duration: DUR.fast, ease: EASE } },
};

/** Correct-answer reveal: a quick confidence pop. */
export const answerCorrect: Variants = {
  initial: { scale: 1 },
  visible: { scale: [1, 1.035, 1], transition: { duration: DUR.fast + 0.1, ease: EASE } },
};

/** Wrong-answer reveal: a restrained shake. */
export const answerWrong: Variants = {
  initial: { x: 0 },
  visible: {
    x: [0, -4, 4, -2, 1, 0],
    transition: { duration: 0.35, ease: EASE_IN_OUT },
  },
};

/** Dialog / modal entrance plus overlay fade. */
export const dialogIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE },
  },
};

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.fast } },
};