import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeStorage } from './safeStorage.ts';

test('falls back to memory when localStorage is missing or throws', () => {
  // Node has no localStorage: every access throws a ReferenceError.
  safeStorage.set('k', 'v');
  assert.equal(safeStorage.get('k'), 'v');
  safeStorage.remove('k');
  assert.equal(safeStorage.get('k'), null);
});

test('survives a localStorage that throws on every call', () => {
  const boom = () => { throw new Error('blocked'); };
  (globalThis as any).localStorage = { getItem: boom, setItem: boom, removeItem: boom };
  try {
    safeStorage.set('t', '1');
    assert.equal(safeStorage.get('t'), '1');
    safeStorage.remove('t');
    assert.equal(safeStorage.get('t'), null);
  } finally {
    delete (globalThis as any).localStorage;
  }
});
