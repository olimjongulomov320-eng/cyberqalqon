const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateToken, hashToken, passwordProblem } = require('../lib/passwordReset');

test('tokens are unique, long and URL-safe', () => {
  const a = generateToken();
  const b = generateToken();
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]{43}$/);
});

test('only a hash is derived from the token, deterministically', () => {
  const t = generateToken();
  assert.equal(hashToken(t), hashToken(t));
  assert.notEqual(hashToken(t), t);
  assert.match(hashToken(t), /^[0-9a-f]{64}$/);
});

test('password rules match registration', () => {
  assert.equal(passwordProblem('Abcdefg1'), null);
  assert.ok(passwordProblem('short1A'));
  assert.ok(passwordProblem('alllowercase1'));
  assert.ok(passwordProblem('NoDigitsHere'));
  assert.ok(passwordProblem('A1' + 'a'.repeat(200)));
  assert.ok(passwordProblem(12345678));
});
