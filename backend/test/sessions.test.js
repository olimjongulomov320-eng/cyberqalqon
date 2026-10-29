const { test } = require('node:test');
const assert = require('node:assert/strict');

// Stub the pool before the module under test loads it.
let version = 0;
let exists = true;
let queries = 0;
require.cache[require.resolve('../db')] = {
  exports: {
    query: async () => {
      queries += 1;
      return { rows: exists ? [{ token_version: version }] : [] };
    },
  },
};
const { isCurrent, forget } = require('../lib/sessions');

test('a token with the current version is accepted, an old one is not', async () => {
  version = 1;
  forget(7);
  assert.equal(await isCurrent({ id: 7, v: 1 }), true);
  assert.equal(await isCurrent({ id: 7, v: 0 }), false);
});

test('tokens without a version count as version 0', async () => {
  version = 0;
  forget(8);
  assert.equal(await isCurrent({ id: 8 }), true);
  version = 1;
  forget(8);
  assert.equal(await isCurrent({ id: 8 }), false);
});

test('a bump is seen immediately once the cache entry is forgotten', async () => {
  version = 0;
  forget(9);
  assert.equal(await isCurrent({ id: 9, v: 0 }), true);
  version = 1; // password reset
  forget(9);
  assert.equal(await isCurrent({ id: 9, v: 0 }), false);
});

test('lookups are cached between requests', async () => {
  version = 0;
  forget(10);
  queries = 0;
  await isCurrent({ id: 10, v: 0 });
  await isCurrent({ id: 10, v: 0 });
  assert.equal(queries, 1);
});

test('a deleted account has no valid session', async () => {
  exists = false;
  forget(11);
  assert.equal(await isCurrent({ id: 11, v: 0 }), false);
  exists = true;
});
