const { test } = require('node:test');
const assert = require('node:assert/strict');
const { drawQuestions, scoreAttempt } = require('../lib/assessment');
const { ASSESSMENTS } = require('../curriculum/assessments');
const { TRACKS } = require('../curriculum/tracks');
const { seedData } = require('../curriculum');

// small deterministic rng
const seeded = seed => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

const pool = [
  ...['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'].map(e => ({ module_slug: 'big', exercise_id: e })),
  ...['b1', 'b2'].map(e => ({ module_slug: 'small', exercise_id: e })),
  ...['c1', 'c2'].map(e => ({ module_slug: 'other', exercise_id: e })),
];

test('draw: right size, no duplicates, spread across modules', () => {
  const refs = drawQuestions(pool, 6, seeded(7));
  assert.equal(refs.length, 6);
  assert.equal(new Set(refs.map(r => `${r.m}::${r.e}`)).size, 6);
  const per = refs.reduce((a, r) => ((a[r.m] = (a[r.m] ?? 0) + 1), a), {});
  assert.equal(per.big, 2); // round-robin: the large module cannot dominate
  assert.equal(per.small, 2);
  assert.equal(per.other, 2);
});

test('draw: never exceeds the pool, handles empty and tiny pools', () => {
  assert.equal(drawQuestions(pool, 99, seeded(1)).length, pool.length);
  assert.deepEqual(drawQuestions([], 5), []);
  assert.equal(drawQuestions(pool.slice(0, 1), 5).length, 1);
});

test('draw: different seeds give different papers', () => {
  const a = drawQuestions(pool, 5, seeded(1)).map(r => r.e).join();
  const b = drawQuestions(pool, 5, seeded(2)).map(r => r.e).join();
  assert.notEqual(a, b);
});

const ex = (id, answer) => ({ id, type: 'mc', answer, options: [{ id: 'a' }, { id: 'b' }] });
const exercises = new Map([
  ['m1::e1', ex('e1', 'a')],
  ['m1::e2', ex('e2', 'b')],
  ['m2::e1', ex('e1', 'a')],
  ['m2::e2', ex('e2', 'a')],
]);
const refs = [{ m: 'm1', e: 'e1' }, { m: 'm1', e: 'e2' }, { m: 'm2', e: 'e1' }, { m: 'm2', e: 'e2' }];

test('score: grades server-side, per question and per module', () => {
  const r = scoreAttempt(refs, exercises, [
    { n: 0, value: 'a' }, { n: 1, value: 'b' }, { n: 2, value: 'a' }, { n: 3, value: 'b' },
  ], 70);
  assert.equal(r.score, 3);
  assert.equal(r.percent, 75);
  assert.equal(r.passed, true);
  assert.deepEqual(r.per_module.m2, { correct: 1, total: 2 });
});

test('score: pass mark boundary is inclusive', () => {
  const answers = [{ n: 0, value: 'a' }, { n: 1, value: 'b' }, { n: 2, value: 'a' }];
  assert.equal(scoreAttempt(refs, exercises, answers, 75).passed, true); // 3/4 = 75
  assert.equal(scoreAttempt(refs, exercises, answers, 76).passed, false);
});

test('score: missing, duplicate and out-of-range answers cannot help', () => {
  const r = scoreAttempt(refs, exercises, [
    { n: 0, value: 'zzz' }, { n: 0, value: 'a' }, // first answer wins -> wrong
    { n: 9, value: 'a' }, { n: -1, value: 'a' }, { n: 1.5, value: 'b' }, null, 'x',
  ], 70);
  assert.equal(r.score, 0);
  assert.equal(r.results[0].correct, false);
  assert.equal(r.results.filter(x => x.answered).length, 1);
});

test('score: empty submission and empty paper never pass', () => {
  assert.equal(scoreAttempt(refs, exercises, [], 70).passed, false);
  assert.equal(scoreAttempt([], exercises, [], 0).passed, false);
  assert.equal(scoreAttempt(refs, exercises, 'nonsense', 70).percent, 0);
});

test('every track has an assessment with a large enough question pool', () => {
  const { modules } = seedData();
  assert.equal(ASSESSMENTS.length, TRACKS.length);
  for (const a of ASSESSMENTS) {
    const t = TRACKS.find(x => x.slug === a.track);
    const poolSize = t.modules.reduce((n, s) => n + modules.find(m => m.slug === s).exercises.length, 0);
    assert.ok(poolSize >= a.question_count, `${a.slug}: pool ${poolSize} < ${a.question_count}`);
    assert.ok(a.pass_mark > 0 && a.pass_mark <= 100 && a.time_limit_minutes > 0 && a.xp > 0);
  }
});
