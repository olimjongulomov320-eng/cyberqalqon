const { test } = require('node:test');
const assert = require('node:assert/strict');
const { windowAccuracy, trendFromCounts, MIN_ANSWERS } = require('../lib/stats');

test('windowAccuracy rounds and reports real windows', () => {
  assert.equal(windowAccuracy(10, 7), 70);
  assert.equal(windowAccuracy(6, 5), 83);
  assert.equal(windowAccuracy(0, 0), null);
});

test('windowAccuracy refuses thin windows instead of guessing', () => {
  assert.equal(windowAccuracy(MIN_ANSWERS - 1, MIN_ANSWERS - 1), null);
  assert.equal(windowAccuracy(undefined, 3), null);
  assert.equal(windowAccuracy(null, null), null);
});

test('trend needs both windows before it claims anything', () => {
  assert.equal(trendFromCounts({ total: 10, correct: 9 }, { total: 2, correct: 1 }), null);
  assert.equal(trendFromCounts({ total: 2, correct: 1 }, { total: 10, correct: 5 }), null);
  assert.equal(trendFromCounts(null, { total: 10, correct: 5 }), null);
});

test('trend reports accuracy and signed delta for real windows', () => {
  const t = trendFromCounts({ total: 20, correct: 18 }, { total: 12, correct: 6 });
  assert.deepEqual(t, {
    recent_accuracy: 90,
    previous_accuracy: 50,
    recent_total: 20,
    previous_total: 12,
    delta: 40,
  });
  const down = trendFromCounts({ total: 10, correct: 5 }, { total: 10, correct: 9 });
  assert.equal(down.delta, -40);
});
