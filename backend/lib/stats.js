/**
 * Accuracy windows for the mastery trend — pure helpers, unit-tested.
 *
 * A trend claim ("you improved this week") only exists when both windows carry
 * enough graded answers to mean anything. Below `MIN_ANSWERS` the window
 * returns null and the UI shows an honest "not enough data" line instead of a
 * number that would swing wildly on one question.
 */

const MIN_ANSWERS = 5;

/** Rounded accuracy for a window, or null when the window is too thin. */
function windowAccuracy(total, correct) {
  if (!Number.isFinite(total) || !Number.isFinite(correct)) return null;
  if (total < MIN_ANSWERS) return null;
  return Math.round((correct / total) * 100);
}

/**
 * Turn the two raw windows (last 7 days, previous 7 days) into the payload the
 * profile renders. Returns null unless BOTH windows are reportable — a
 * comparison needs two real numbers.
 */
function trendFromCounts(recent, previous) {
  const recentAccuracy = windowAccuracy(recent?.total, recent?.correct);
  const previousAccuracy = windowAccuracy(previous?.total, previous?.correct);
  if (recentAccuracy === null || previousAccuracy === null) return null;
  return {
    recent_accuracy: recentAccuracy,
    previous_accuracy: previousAccuracy,
    recent_total: recent.total,
    previous_total: previous.total,
    delta: recentAccuracy - previousAccuracy,
  };
}

module.exports = { windowAccuracy, trendFromCounts, MIN_ANSWERS };
