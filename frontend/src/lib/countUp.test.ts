import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNT_UP_MS, easeOutCubic, valueAt } from './countUp.ts';

test('starts at the old value and lands exactly on the new one', () => {
  assert.equal(valueAt(10, 50, 0), 10);
  assert.equal(valueAt(10, 50, COUNT_UP_MS), 50);
  assert.equal(valueAt(10, 50, COUNT_UP_MS * 3), 50);
});

test('rises monotonically, never overshoots, always whole numbers', () => {
  let prev = 10;
  for (let t = 0; t <= COUNT_UP_MS; t += 20) {
    const v = valueAt(10, 50, t);
    assert.ok(v >= prev && v <= 50);
    assert.equal(Number.isInteger(v), true);
    prev = v;
  }
});

test('works downward and for equal values', () => {
  assert.equal(valueAt(50, 10, COUNT_UP_MS / 2) < 50, true);
  assert.equal(valueAt(7, 7, 100), 7);
  assert.equal(valueAt(0, 5, 100, 0), 5);
});

test('easing is clamped', () => {
  assert.equal(easeOutCubic(-1), 0);
  assert.equal(easeOutCubic(2), 1);
});
