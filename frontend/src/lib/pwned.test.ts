import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPwned, countInRange, sha1Hex } from './pwned.ts';

test('sha1Hex matches the published SHA-1 of "password"', async () => {
  assert.equal(await sha1Hex('password'), '5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8');
});

test('countInRange finds the suffix, ignores padding and other lines', () => {
  const body = '0018A45C4D1DEF81644B54AB7F969B88D65:3\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:10434004\r\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:0\r\n';
  assert.equal(countInRange(body, '1E4C9B93F3F0682250B6CF8331B7EE68FD8'), 10434004);
  assert.equal(countInRange(body, '00D4F6E8FA6EECAD2A3AA415EEC418D38EC'), 0); // padding entry
  assert.equal(countInRange(body, 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'), 0);
  assert.equal(countInRange('', 'ABC'), 0);
});

test('only the 5-character prefix is sent, never the password or full hash', async () => {
  let url = '';
  const fake = (async (u: string) => {
    url = u;
    return new Response('1E4C9B93F3F0682250B6CF8331B7EE68FD8:42\r\n', { status: 200 });
  }) as unknown as typeof fetch;
  const r = await checkPwned('password', fake);
  assert.equal(url, 'https://api.pwnedpasswords.com/range/5BAA6');
  assert.deepEqual(r, { status: 'pwned', count: 42 });
  assert.equal(new URL(url).pathname.includes('password'), false);
  assert.equal(url.includes('1E4C9B93F3F0682250B6CF8331B7EE68FD8'), false);
});

test('a hash not in the list is safe', async () => {
  const fake = (async () => new Response('0018A45C4D1DEF81644B54AB7F969B88D65:3\r\n', { status: 200 })) as unknown as typeof fetch;
  assert.deepEqual(await checkPwned('a-very-unusual-passphrase-9137', fake), { status: 'safe' });
});

test('outages fail open: unknown, never an exception or a block', async () => {
  const boom = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
  assert.deepEqual(await checkPwned('x', boom), { status: 'unknown' });
  const bad = (async () => new Response('nope', { status: 503 })) as unknown as typeof fetch;
  assert.deepEqual(await checkPwned('x', bad), { status: 'unknown' });
  assert.deepEqual(await checkPwned('', bad), { status: 'unknown' });
});

test('a hanging request is aborted by the timeout', async () => {
  const hang = ((_u: string, init: RequestInit) =>
    new Promise((_res, rej) => init.signal?.addEventListener('abort', () => rej(new Error('aborted'))))) as unknown as typeof fetch;
  assert.deepEqual(await checkPwned('x', hang, 30), { status: 'unknown' });
});
