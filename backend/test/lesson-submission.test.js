/**
 * Regression tests for the /complete integrity gate (AUD-01).
 *
 * These exercise the pure validator only — no database and no network — so they
 * run anywhere with the built-in Node test runner:
 *
 *   cd backend && npm test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateLessonSubmission } = require('../lib/grade');

// A stand-in for one module's authoritative exercises.
const MODULE = [
  { id: 'e1', type: 'mc', answer: 'a' },
  { id: 'e2', type: 'tf', answer: 'true' },
  { id: 'e3', type: 'input', answer: 'ls' },
];

const full = () => [
  { id: 'e1', value: 'a' },
  { id: 'e2', value: 'true' },
  { id: 'e3', value: 'ls' },
];

test('accepts a complete submission covering every exercise once', () => {
  const r = validateLessonSubmission(MODULE, full());
  assert.equal(r.ok, true);
  assert.equal(r.count, 3);
});

test('rejects an empty answers array', () => {
  const r = validateLessonSubmission(MODULE, []);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'VALIDATION_ERROR');
});

test('rejects a non-array answers value', () => {
  for (const bad of [null, undefined, 'e1', {}, 42]) {
    const r = validateLessonSubmission(MODULE, bad);
    assert.equal(r.ok, false, `expected reject for ${JSON.stringify(bad)}`);
    assert.equal(r.code, 'VALIDATION_ERROR');
  }
});

test('rejects a submission that omits exercises', () => {
  const r = validateLessonSubmission(MODULE, [{ id: 'e1', value: 'a' }]);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'INCOMPLETE_SUBMISSION');
  assert.deepEqual(r.missing, ['e2', 'e3']);
});

test('rejects duplicate exercise ids', () => {
  const r = validateLessonSubmission(MODULE, [...full(), { id: 'e1', value: 'b' }]);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'DUPLICATE_EXERCISE');
});

test('rejects unknown exercise ids', () => {
  const r = validateLessonSubmission(MODULE, [
    full()[0],
    full()[1],
    { id: 'not-in-this-module', value: 'x' },
    full()[2],
  ]);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'UNKNOWN_EXERCISE');
});

test('rejects malformed answer entries', () => {
  const bad = [null, 'e1', {}, { id: 5 }, { id: '' }, [1, 2], 7];
  for (const entry of bad) {
    const r = validateLessonSubmission(MODULE, [full()[0], full()[1], entry]);
    assert.equal(r.ok, false, `expected reject for ${JSON.stringify(entry)}`);
    assert.equal(r.code, 'VALIDATION_ERROR');
  }
});

test('rejects any non-empty submission when the module has no exercises', () => {
  const r = validateLessonSubmission([], full());
  assert.equal(r.ok, false);
  assert.equal(r.code, 'UNKNOWN_EXERCISE');
});

test('tolerates a module with a duplicate id in its own curriculum (set semantics)', () => {
  const withDup = [...MODULE, { id: 'e2', type: 'tf', answer: 'false' }];
  assert.equal(validateLessonSubmission(withDup, full()).ok, true);
});

test('the same complete submission can be retried (idempotent completion)', () => {
  const first = validateLessonSubmission(MODULE, full());
  const retry = validateLessonSubmission(MODULE, full());
  assert.equal(first.ok, true);
  assert.equal(retry.ok, true);
});
