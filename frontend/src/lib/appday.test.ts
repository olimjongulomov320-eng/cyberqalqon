import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appDayKey, APP_TZ } from './appday.ts';

test('uses the application timezone', () => {
  assert.equal(APP_TZ, 'Asia/Tashkent');
});

test('rolls over at Tashkent midnight, not UTC midnight', () => {
  // 18:00 UTC = 23:00 Tashkent → still the same calendar day.
  assert.equal(appDayKey(new Date('2026-06-10T18:00:00Z')), '2026-06-10');
  // 19:00 UTC = 00:00 Tashkent the next day → new day.
  assert.equal(appDayKey(new Date('2026-06-10T19:00:00Z')), '2026-06-11');
});

test('is ISO-shaped yyyy-mm-dd', () => {
  assert.match(appDayKey(new Date('2026-01-02T00:00:00Z')), /^\d{4}-\d{2}-\d{2}$/);
});
