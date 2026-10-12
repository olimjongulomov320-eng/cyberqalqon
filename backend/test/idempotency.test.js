/**
 * Idempotency helper regression tests (pure — no database).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isValidKey, canonicalAnswers, requestHash } = require('../lib/idempotency');

test('accepts UUIDs and simple prefixed keys; rejects junk', () => {
  assert.equal(isValidKey('3f2b7c9e-1a4d-4e6f-8a2b-9c0d1e2f3a4b'), true);
  assert.equal(isValidKey('review-abc123456789'), true);
  assert.equal(isValidKey('short'), false);
  assert.equal(isValidKey(''), false);
  assert.equal(isValidKey('has space here 1234'), false);
  assert.equal(isValidKey(null), false);
  assert.equal(isValidKey(1234567890), false);
});

test('request hash is independent of answer order', () => {
  const a = requestHash('m', [{ id: 'e1', value: 'a' }, { id: 'e2', value: ['x', 'y'] }]);
  const b = requestHash('m', [{ id: 'e2', value: ['x', 'y'] }, { id: 'e1', value: 'a' }]);
  assert.equal(a, b);
});

test('request hash changes with the payload or the module', () => {
  const base = requestHash('m', [{ id: 'e1', value: 'a' }]);
  assert.notEqual(base, requestHash('m', [{ id: 'e1', value: 'b' }]));
  assert.notEqual(base, requestHash('m', [{ id: 'e2', value: 'a' }]));
  assert.notEqual(base, requestHash('other', [{ id: 'e1', value: 'a' }]));
});

test('canonical answers normalise missing fields', () => {
  const ids = canonicalAnswers([null, { id: 'e1' }]).map(a => a.id).sort();
  assert.deepEqual(ids, ['', 'e1']);
});
