/**
 * Demonstrated mastery — a defined calculation, kept apart from completion.
 *
 * Completing a lesson says "you went through it". Mastery says "you answered
 * the questions correctly without help from retries".
 *
 * Rule (Stage 1):
 *   - Only DISTINCT exercises count. Each exercise contributes exactly ONE
 *     verdict: the result of the learner's FIRST recorded attempt on it.
 *   - Retries, reviews and repeated submissions never change that verdict, so
 *     they cannot inflate (or erase) mastery.
 *   - accuracy = correct first attempts / distinct exercises attempted.
 *   - state:
 *       not_started  no exercise attempted
 *       practising   some attempted, but fewer than MIN_EXERCISES or below MIN_ACCURACY
 *       mastered     >= MIN_EXERCISES distinct exercises AND accuracy >= MIN_ACCURACY
 *
 * Spaced practice can be added later without a schema change: every attempt
 * keeps its timestamp (exercise_attempts.answered_at), so a future rule can
 * require first verdicts, or later re-checks, to fall on different days.
 */

const MIN_EXERCISES = 5;
const MIN_ACCURACY = 0.8;

/**
 * @param {{correct: boolean}[]} firstVerdicts one entry per distinct exercise
 */
function computeMastery(firstVerdicts) {
  const list = Array.isArray(firstVerdicts) ? firstVerdicts : [];
  const distinct = list.length;
  const correct = list.filter(v => v && v.correct === true).length;
  const accuracy = distinct ? correct / distinct : null;

  let state = 'not_started';
  if (distinct > 0) {
    state = distinct >= MIN_EXERCISES && accuracy >= MIN_ACCURACY ? 'mastered' : 'practising';
  }
  return {
    state,
    distinct,
    correct,
    accuracy: accuracy === null ? null : Math.round(accuracy * 100),
    needed: Math.max(0, MIN_EXERCISES - distinct),
  };
}

module.exports = { MIN_EXERCISES, MIN_ACCURACY, computeMastery };
