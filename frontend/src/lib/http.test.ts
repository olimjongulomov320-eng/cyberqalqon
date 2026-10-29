import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performFetch, isAbortError } from './http.ts';

// Rejects with an AbortError when its signal aborts - including when the signal
// was already aborted before the call (retroactive listeners never fire).
const hangingFetch = ((_url: string, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal;
    const onAbort = () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      reject(err);
    };
    if (signal?.aborted) onAbort();
    else signal?.addEventListener('abort', onAbort, { once: true });
  })) as unknown as typeof fetch;

const okFetch = (async () =>
  new Response('{"ok":true}', { status: 200 })) as unknown as typeof fetch;

test('isAbortError recognises abort failures only', () => {
  const aborted = new Error('x');
  aborted.name = 'AbortError';
  assert.equal(isAbortError(aborted), true);
  assert.equal(isAbortError(new Error('x')), false);
  assert.equal(isAbortError(null), false);
  assert.equal(isAbortError('AbortError'), false);
  assert.equal(isAbortError(undefined), false);
});

test('performFetch aborts a hanging request once the deadline passes', async () => {
  const started = Date.now();
  let aborted = false;
  try {
    await performFetch(hangingFetch, 'http://example.test/x', {}, 20);
    assert.fail('expected the request to be aborted');
  } catch (err) {
    aborted = isAbortError(err);
  }
  assert.equal(aborted, true);
  assert.ok(Date.now() - started >= 15, 'should abort near the deadline, not immediately');
});

test('performFetch returns a response that arrives before the deadline', async () => {
  const res = await performFetch(okFetch, 'http://example.test/x', {}, 1000);
  assert.equal(res.status, 200);
});

test('performFetch honours an already-aborted caller signal', async () => {
  const controller = new AbortController();
  controller.abort();
  let aborted = false;
  try {
    await performFetch(hangingFetch, 'http://example.test/x', { signal: controller.signal }, 5000);
    assert.fail('expected rejection');
  } catch (err) {
    aborted = isAbortError(err);
  }
  assert.equal(aborted, true);
});
