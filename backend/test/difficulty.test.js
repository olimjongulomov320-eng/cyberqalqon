/**
 * Difficulty derivation is a pure function over curriculum position, so it can
 * be tested without a database. These tests pin the exact banding rules and
 * then assert the real curriculum produces all three levels (i.e. the labels
 * are not degenerate).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DIFFICULTIES, difficultyForModule, isDifficulty } = require('../lib/difficulty');
const { seedData } = require('../curriculum');

const band = (n, pos, kind = 'lesson') =>
  difficultyForModule({ kind, position: pos, total: n });

test('a single-module domain is beginner', () => {
  assert.equal(band(1, 1), 'beginner');
});

test('a two-module domain is beginner then intermediate', () => {
  assert.deepEqual([band(2, 1), band(2, 2)], ['beginner', 'intermediate']);
});

test('three modules split into one of each level', () => {
  assert.deepEqual([band(3, 1), band(3, 2), band(3, 3)], [
    'beginner',
    'intermediate',
    'advanced',
  ]);
});

test('an eight-module domain is 3 / 3 / 2', () => {
  const levels = Array.from({ length: 8 }, (_, i) => band(8, i + 1));
  assert.deepEqual(levels, [
    'beginner',
    'beginner',
    'beginner',
    'intermediate',
    'intermediate',
    'intermediate',
    'advanced',
    'advanced',
  ]);
});

test('a thirteen-module domain is 5 / 5 / 3', () => {
  const levels = Array.from({ length: 13 }, (_, i) => band(13, i + 1));
  assert.equal(levels.filter(l => l === 'beginner').length, 5);
  assert.equal(levels.filter(l => l === 'intermediate').length, 5);
  assert.equal(levels.filter(l => l === 'advanced').length, 3);
  // monotonic: difficulty never decreases as the learner advances
  const rank = l => DIFFICULTIES.indexOf(l);
  for (let i = 1; i < levels.length; i++) {
    assert.ok(rank(levels[i]) >= rank(levels[i - 1]), `level dropped at position ${i + 1}`);
  }
});

test('checkpoints are bumped one level, capped at advanced', () => {
  assert.equal(band(8, 1, 'checkpoint'), 'intermediate');
  assert.equal(band(8, 5, 'checkpoint'), 'advanced');
  assert.equal(band(8, 8, 'checkpoint'), 'advanced');
  assert.equal(band(1, 1, 'checkpoint'), 'intermediate');
});

test('out-of-range or missing positions are clamped, never throw', () => {
  assert.equal(band(8, 0), 'beginner');
  assert.equal(band(8, 99), 'advanced');
  assert.equal(difficultyForModule({ position: 1, total: 0 }), 'beginner');
  assert.equal(difficultyForModule(), 'beginner');
  assert.equal(difficultyForModule({ kind: 'lesson', position: 'x', total: 'y' }), 'beginner');
});

test('only the three documented labels are ever returned', () => {
  for (let n = 1; n <= 40; n++) {
    for (let pos = 1; pos <= n; pos++) {
      for (const kind of ['lesson', 'checkpoint']) {
        const level = difficultyForModule({ kind, position: pos, total: n });
        assert.ok(isDifficulty(level), `${level} is not a documented difficulty`);
      }
    }
  }
});

test('the real curriculum produces all three levels', () => {
  const { modules } = seedData();
  const byDomain = new Map();
  for (const m of modules) {
    if (!byDomain.has(m.domain)) byDomain.set(m.domain, []);
    byDomain.get(m.domain).push(m);
  }

  const seen = new Set();
  for (const list of byDomain.values()) {
    list.forEach((m, i) => {
      const level = difficultyForModule({
        kind: m.kind,
        position: i + 1,
        total: list.length,
      });
      seen.add(level);
      assert.ok(isDifficulty(level), `${m.slug} has an undocumented difficulty`);
    });
  }

  assert.deepEqual([...seen].sort(), [...DIFFICULTIES].sort());
});
