import { test } from 'node:test';
import assert from 'node:assert/strict';
import { justUnlocked, trailOffset } from './path.ts';

test('trail offsets zig-zag, stay within the amplitude and are deterministic', () => {
  const xs = Array.from({ length: 12 }, (_, i) => trailOffset(i));
  assert.equal(xs[0], 0);
  assert.ok(xs.every(x => Math.abs(x) <= 36));
  assert.ok(xs.some(x => x > 0) && xs.some(x => x < 0), 'swings both ways');
  assert.deepEqual(xs, Array.from({ length: 12 }, (_, i) => trailOffset(i)));
  assert.ok(Math.abs(trailOffset(1, 10)) <= 10);
});

test('first visit never celebrates; only new completions do', () => {
  assert.equal(justUnlocked(null, 5), false);
  assert.equal(justUnlocked(3, 4), true);
  assert.equal(justUnlocked(4, 4), false);
  assert.equal(justUnlocked(5, 4), false); // progress can't go backwards into a celebration
  assert.equal(justUnlocked(0, 1), true);
});
