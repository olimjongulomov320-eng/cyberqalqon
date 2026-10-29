import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, formatCall, jsonEqual, sampleIndexes } from './runner.ts';
import type { TestCase } from './runner.ts';

const tests: TestCase[] = [
  { args: [1, 2], expected: 3, hidden: false },
  { args: [2, 2], expected: 4, hidden: false },
  { args: [5, 5], expected: 10, hidden: true },
  { args: [0, 0], expected: 0, hidden: true },
];

test('jsonEqual compares structure, not identity', () => {
  assert.equal(jsonEqual({ a: [1, 2] }, { a: [1, 2] }), true);
  assert.equal(jsonEqual([1, 2], [2, 1]), false);
  assert.equal(jsonEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
  assert.equal(jsonEqual(1, '1'), false);
  assert.equal(jsonEqual(null, 0), false);
  assert.equal(jsonEqual([], {}), false);
  assert.equal(jsonEqual(true, 1), false);
});

test('all passing -> allPassed, counts add up', () => {
  const ev = evaluate(tests, { ok: true, results: [3, 4, 10, 0].map(value => ({ ok: true as const, value })) });
  assert.equal(ev.allPassed, true);
  assert.equal(ev.passed, 4);
  assert.equal(ev.total, 4);
});

test('a wrong value fails only that case', () => {
  const ev = evaluate(tests, { ok: true, results: [3, 4, 11, 0].map(value => ({ ok: true as const, value })) });
  assert.equal(ev.passed, 3);
  assert.equal(ev.allPassed, false);
  assert.equal(ev.outcomes[2].passed, false);
});

test('hidden cases never reveal arguments, expected values or output', () => {
  const ev = evaluate(tests, { ok: true, results: [3, 4, 999, 0].map(value => ({ ok: true as const, value })) });
  for (const o of ev.outcomes.filter(o => o.hidden)) {
    assert.equal(o.args, undefined);
    assert.equal(o.expected, undefined);
    assert.equal(o.got, undefined);
    assert.equal(o.error, undefined);
  }
  assert.deepEqual(ev.outcomes[0].args, [1, 2]); // visible ones do show them
});

test('hidden runtime errors are reported as failures without leaking the message', () => {
  const ev = evaluate(tests, {
    ok: true,
    results: [{ ok: true, value: 3 }, { ok: true, value: 4 }, { ok: false, error: 'ZeroDivisionError: x' }, { ok: true, value: 0 }],
  });
  assert.equal(ev.outcomes[2].passed, false);
  assert.equal(ev.outcomes[2].error, undefined);
});

test('visible runtime errors keep their message for debugging', () => {
  const ev = evaluate(tests, { ok: true, results: [{ ok: false, error: 'NameError: y' }] }, [0]);
  assert.equal(ev.outcomes[0].error, 'NameError: y');
});

test('Run (samples only) grades just the visible tests', () => {
  const only = sampleIndexes(tests);
  assert.deepEqual(only, [0, 1]);
  const ev = evaluate(tests, { ok: true, results: [3, 4].map(value => ({ ok: true as const, value })) }, only);
  assert.equal(ev.total, 2);
  assert.equal(ev.allPassed, true);
});

test('compile errors and runner failures never count as passes', () => {
  assert.equal(evaluate(tests, { ok: true, compile_error: 'SyntaxError', results: [] }).passed, 0);
  assert.equal(evaluate(tests, { ok: true, compile_error: 'SyntaxError', results: [] }).compileError, 'SyntaxError');
  assert.equal(evaluate(tests, { ok: false, error: 'timeout' }).runnerError, 'timeout');
  assert.equal(evaluate(tests, { ok: false, error: 'timeout' }).allPassed, false);
});

test('missing results (worker returned too few) fail the cases instead of passing them', () => {
  const ev = evaluate(tests, { ok: true, results: [{ ok: true, value: 3 }] });
  assert.equal(ev.passed, 1);
  assert.equal(ev.allPassed, false);
});

test('an empty test list can never be "all passed"', () => {
  assert.equal(evaluate([], { ok: true, results: [] }).allPassed, false);
});

test('formatCall renders arguments as JSON', () => {
  assert.equal(formatCall('solve', ['a', [1, 2]]), 'solve("a", [1,2])');
});
