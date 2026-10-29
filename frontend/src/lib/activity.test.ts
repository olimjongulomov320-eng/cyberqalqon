import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGrid, currentRun, levelFor } from './activity.ts';

const A = (day: string, answers: number) => ({ day, answers, correct: answers });

test('grid is weeks x 7, Monday first, ending in the current week', () => {
  const g = buildGrid([], '2026-10-29', 12); // a Thursday
  assert.equal(g.length, 12);
  assert.ok(g.every(c => c.length === 7));
  assert.equal(g[11][0].day, '2026-10-26'); // Monday of this week
  assert.equal(g[11][3].day, '2026-10-29');
  assert.equal(g[11][4].future, true); // Friday has not happened
  assert.equal(g[11][3].future, false);
});

test('days map onto cells and future cells never carry data', () => {
  const g = buildGrid([A('2026-10-29', 10), A('2026-10-30', 99)], '2026-10-29', 4);
  const today = g[3][3];
  assert.equal(today.answers, 10);
  assert.equal(today.level, 4);
  assert.equal(g[3][4].answers, 0); // 30th is the future
});

test('intensity is relative to the busiest day and 0 only for no activity', () => {
  assert.equal(levelFor(0, 10), 0);
  assert.equal(levelFor(1, 10), 1);
  assert.equal(levelFor(5, 10), 2);
  assert.equal(levelFor(7, 10), 3);
  assert.equal(levelFor(10, 10), 4);
  assert.equal(levelFor(3, 0), 0);
});

test('run of active days: counts today, tolerates "not yet today", breaks on a gap', () => {
  const days = [A('2026-10-27', 2), A('2026-10-28', 3), A('2026-10-29', 1)];
  assert.equal(currentRun(days, '2026-10-29'), 3);
  assert.equal(currentRun(days.slice(0, 2), '2026-10-29'), 2); // nothing yet today
  assert.equal(currentRun([A('2026-10-25', 4), A('2026-10-29', 1)], '2026-10-29'), 1);
  assert.equal(currentRun([], '2026-10-29'), 0);
  assert.equal(currentRun([A('2026-10-20', 5)], '2026-10-29'), 0);
});
