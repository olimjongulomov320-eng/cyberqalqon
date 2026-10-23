import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HARDER_MIN_ACCURACY,
  HARDER_MIN_ATTEMPTS,
  dedupeLatest,
  harderReady,
} from './recommend.ts';
import { MASTERY_ACCURACY, accuracyOf, proficiency, sortForMatrix } from './skills.ts';
import type { DomainSkillStat } from './skills.ts';
import type { AttemptRow } from './api.ts';

const stat = (over: Partial<DomainSkillStat>): DomainSkillStat => ({
  slug: 'networking',
  icon: '🌐',
  title: 'Tarmoqlar',
  correct: 0,
  wrong: 0,
  modules_total: 5,
  modules_completed: 0,
  ...over,
});

/* ── proficiency ─────────────────────────────────────────────────────────── */

test('proficiency follows the published rule', () => {
  assert.equal(proficiency(stat({ modules_total: 5 })), 'notStarted');
  assert.equal(proficiency(stat({ modules_completed: 2, correct: 6, wrong: 2 })), 'learning');
  assert.equal(
    proficiency(stat({ modules_completed: 5, modules_total: 5, correct: 4, wrong: 6 })),
    'needsPractice'
  );
  assert.equal(
    proficiency(stat({ modules_completed: 5, modules_total: 5, correct: 0, wrong: 0 })),
    'needsPractice' // completed but nothing graded → never called mastered
  );
  assert.equal(
    proficiency(stat({ modules_completed: 5, modules_total: 5, correct: 9, wrong: 1 })),
    'mastered'
  );
});

test('the mastery boundary is exact, not rounded in', () => {
  const atBar = stat({ modules_completed: 4, modules_total: 4, correct: 8, wrong: 2 });
  assert.equal(accuracyOf(atBar), MASTERY_ACCURACY);
  assert.equal(proficiency(atBar), 'mastered');
  const justBelow = stat({ modules_completed: 4, modules_total: 4, correct: 79, wrong: 21 });
  assert.equal(accuracyOf(justBelow), 79);
  assert.equal(proficiency(justBelow), 'needsPractice');
});

test('accuracy is null when nothing was graded', () => {
  assert.equal(accuracyOf({ correct: 0, wrong: 0 }), null);
  assert.equal(accuracyOf({ correct: 3, wrong: 1 }), 75);
});

test('matrix sorting puts strongest first and unstarted last', () => {
  const rows = [
    stat({ slug: 'a', modules_completed: 0 }),
    stat({ slug: 'b', modules_completed: 5, correct: 10, wrong: 0 }),
    stat({ slug: 'c', modules_completed: 2, correct: 3, wrong: 1 }),
    stat({ slug: 'd', modules_completed: 5, correct: 5, wrong: 5 }),
  ];
  assert.deepEqual(sortForMatrix(rows).map(r => r.slug), ['b', 'd', 'c', 'a']);
});

/* ── harder-challenge rule ──────────────────────────────────────────────── */

test('harderReady needs both enough answers and the accuracy bar', () => {
  const rows = [
    stat({ slug: 'strong', correct: 18, wrong: 2 }), // 90% · 20 → yes
    stat({ slug: 'thin', correct: 7, wrong: 0 }), // 100% but 7 answers → no
    stat({ slug: 'shaky', correct: 10, wrong: 10 }), // 20 answers but 50% → no
    stat({ slug: 'edge', correct: 16, wrong: 4 }), // 80% · 20 → yes
  ];
  const out = harderReady(rows);
  assert.deepEqual(out.map(r => r.slug), ['strong', 'edge']);
  assert.equal(out[0].accuracy, 90);
  assert.equal(out[0].attempts, 20);
  assert.equal(HARDER_MIN_ACCURACY, 80);
  assert.equal(HARDER_MIN_ATTEMPTS, 8);
});

test('harderReady returns nothing when the data does not support a claim', () => {
  assert.deepEqual(harderReady([]), []);
  assert.deepEqual(harderReady([stat({ slug: 'fresh' })]), []);
  assert.deepEqual(
    harderReady([stat({ slug: 'x', correct: 4, wrong: 0 }), stat({ slug: 'y', correct: 0, wrong: 0 })]),
    []
  );
});

test('harderReady honours custom thresholds and caps the list', () => {
  const rows = [
    stat({ slug: 'a', correct: 10, wrong: 0 }),
    stat({ slug: 'b', correct: 9, wrong: 1 }),
    stat({ slug: 'c', correct: 8, wrong: 2 }),
    stat({ slug: 'd', correct: 7, wrong: 3 }),
  ];
  const out = harderReady(rows, { minAttempts: 5, minAccuracy: 70 });
  assert.equal(out.length, 3); // top 3 only
  assert.deepEqual(out.map(r => r.slug), ['a', 'b', 'c']);
});

/* ── missed-question list ───────────────────────────────────────────────── */

test('dedupeLatest keeps the newest verdict per exercise', () => {
  const rows = [
    { exercise_id: 'e1', module_slug: 'm1', id: 3, answered_at: '2026-10-23T10:00:00Z' },
    { exercise_id: 'e2', module_slug: 'm1', id: 2, answered_at: '2026-10-22T10:00:00Z' },
    { exercise_id: 'e1', module_slug: 'm1', id: 1, answered_at: '2026-10-21T10:00:00Z' },
  ] as AttemptRow[];
  const out = dedupeLatest(rows);
  assert.equal(out.length, 2);
  assert.deepEqual(out.map(r => r.id), [3, 2]);
});

test('dedupeLatest distinguishes the same exercise id in another module', () => {
  const rows = [
    { exercise_id: 'e1', module_slug: 'm1', id: 1 },
    { exercise_id: 'e1', module_slug: 'm2', id: 2 },
  ] as AttemptRow[];
  assert.equal(dedupeLatest(rows).length, 2);
});
