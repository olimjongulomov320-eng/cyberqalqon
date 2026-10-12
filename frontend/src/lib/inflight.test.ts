import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInFlight } from './inflight.ts';

test('coalesces concurrent calls that share a key', async () => {
  const run = createInFlight();
  let calls = 0;
  const task = () => {
    calls++;
    return new Promise<number>(resolve => setTimeout(() => resolve(42), 10));
  };
  const [a, b] = await Promise.all([run('k', task), run('k', task)]);
  assert.equal(calls, 1);
  assert.equal(a, 42);
  assert.equal(b, 42);
});

test('runs different keys independently', async () => {
  const run = createInFlight();
  let calls = 0;
  const task = () => {
    calls++;
    return Promise.resolve(calls);
  };
  await Promise.all([run('a', task), run('b', task)]);
  assert.equal(calls, 2);
});

test('a settled key allows an explicit retry', async () => {
  const run = createInFlight();
  let calls = 0;
  const task = () => {
    calls++;
    return Promise.resolve(calls);
  };
  assert.equal(await run('k', task), 1);
  assert.equal(await run('k', task), 2);
});

test('a rejected key is released so a retry is possible', async () => {
  const run = createInFlight();
  let calls = 0;
  const task = () => {
    calls++;
    return Promise.reject(new Error('boom'));
  };
  await assert.rejects(() => run('k', task));
  await assert.rejects(() => run('k', task));
  assert.equal(calls, 2);
});
