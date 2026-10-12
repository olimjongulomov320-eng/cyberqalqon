import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeNextPath } from './redirect.ts';

test('keeps safe same-origin root-relative paths', () => {
  assert.equal(safeNextPath('/'), '/');
  assert.equal(safeNextPath('/learn'), '/learn');
  assert.equal(safeNextPath('/modules/intro?x=1#y'), '/modules/intro?x=1#y');
});

test('falls back for empty, null and undefined', () => {
  assert.equal(safeNextPath(''), '/');
  assert.equal(safeNextPath(null), '/');
  assert.equal(safeNextPath(undefined), '/');
});

test('rejects absolute, protocol-relative and pseudo-scheme URLs', () => {
  const bad = [
    'https://evil.com',
    'http://evil.com/steal',
    '//evil.com',
    '///evil.com',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://evil.com',
  ];
  for (const value of bad) assert.equal(safeNextPath(value), '/', value);
});

test('rejects backslash-escaped and control-character values', () => {
  assert.equal(safeNextPath('/\\evil.com'), '/');
  assert.equal(safeNextPath('/\tevil'), '/');
  assert.equal(safeNextPath('/a\nb'), '/');
  assert.equal(safeNextPath('/a\u0000b'), '/');
});

test('rejects absurdly long values', () => {
  assert.equal(safeNextPath('/' + 'a'.repeat(2000)), '/');
});
