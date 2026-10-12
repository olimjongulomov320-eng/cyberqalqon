/**
 * AUD-08 regression: the day/week boundary must be explicit and pinned to
 * Asia/Tashkent, never the PostgreSQL session timezone.
 *
 * Pure — no database. The SQL fragments are validated against a JS mirror of
 * `now() AT TIME ZONE 'Asia/Tashkent'`; the SQL itself is exercised by
 * `review-idempotency.integration.test.js` when a test database is available.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { APP_TZ, DAY_START, WEEK_START, TODAY } = require('../lib/time');

test('application timezone is Asia/Tashkent', () => {
  assert.equal(APP_TZ, 'Asia/Tashkent');
});

test('boundaries are explicit and never use CURRENT_DATE', () => {
  for (const frag of [DAY_START, WEEK_START, TODAY]) {
    assert.match(frag, /Asia\/Tashkent/);
    assert.doesNotMatch(frag, /CURRENT_DATE/);
  }
  assert.match(WEEK_START, /date_trunc\('week'/);
});

test('Tashkent is UTC+5 year-round (no DST)', () => {
  const hourIn = iso => new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TZ,
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso)).find(p => p.type === 'hour').value;

  assert.equal(hourIn('2026-06-15T00:00:00Z'), '05'); // summer
  assert.equal(hourIn('2026-12-15T00:00:00Z'), '05'); // winter
});
