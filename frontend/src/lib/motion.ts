import type { Variants, Transition } from 'framer-motion';

/**
 * Motion system — single source of truth for animation durations and easing.
 *
 * Scope, after the mentor review: motion exists for *interaction feedback* only.
 * Container entrances were removed entirely — no page fade-up, no per-child
 * stagger, no question rise, no scroll reveals — so ordinary content is painted
 * fully visible the moment it renders and can never shift after paint.
 *
 * What remains is deliberately short and purposeful:
 *   · answerCorrect / answerWrong — the exercise reply;
 *   · dialogIn / overlayFade / scaleIn — modal + overlay state changes;
 *   · tapScale — press feedback on tactile surfaces.
 *
 * Rules:
 *   · transform/opacity only — never layout properties;
 *   · gated by MotionConfig reducedMotion="user" (AppShell), so OS "reduce
 *     motion" skips transforms and keeps quick opacity fades.
 */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DUR = {
  /** Button / microfeedback pops and shakes. */
  fast: 0.18,
  /** Dialog + answer-reveal beats. */
  base: 0.28,
  /** Progress fills and celebratory reveals. */
  slow: 0.45,
} as const;

export const EASE_IN_OUT: Transition['ease'] = 'easeOut';

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

/** Opacity-only fade — the reduced-motion-safe default for inline reveals. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.base, ease: EASE } },
};

/** Scale-up entrance for celebratory tiles and dialogs. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE } },
};

/** Shared press feedback for pressable surfaces (framer-motion `whileTap`). */
export const tapScale = { scale: 0.985 };
