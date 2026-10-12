/**
 * Integration test for the /review/submit idempotency mechanism and the AUD-08
 * day boundary.
 *
 * Requires a DISPOSABLE Postgres database and is skipped unless TEST_DATABASE_URL
 * is set, so `npm test` stays green without one and can never touch the app DB.
 *
 *   TEST_DATABASE_URL=postgres://user:pass@localhost:5432/cq_test \
 *     cd backend && npm test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { runIdempotent, requestHash, IdempotencyConflictError } = require('../lib/idempotency');
const { DAY_START, TODAY } = require('../lib/time');

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'set TEST_DATABASE_URL to a disposable database to run';

test('review/submit idempotency: at most once per (user, key)', { skip }, async () => {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        display_name TEXT NOT NULL DEFAULT 'test',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS xp_events (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount     INTEGER NOT NULL CHECK (amount > 0),
        kind       TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    // Mirrors the DDL in setup.js.
    await client.query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scope        TEXT NOT NULL,
        key          TEXT NOT NULL,
        request_hash TEXT NOT NULL,
        status       SMALLINT NOT NULL DEFAULT 200,
        response     JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, scope, key)
      )`);

    const { rows } = await client.query(
      `INSERT INTO users (display_name) VALUES ('idem-test') RETURNING id`
    );
    const userId = rows[0].id;
    const scope = 'review.submit';

    // 1. First call applies and stores the response.
    const key = 'test-key-0000-1111-2222';
    const hash = requestHash('demo', [{ id: 'e1', value: 'a' }]);
    const first = await runIdempotent(pool, { userId, scope, key, requestHash: hash }, async c => {
      await c.query(`INSERT INTO xp_events (user_id, amount, kind) VALUES ($1, 4, 'review')`, [userId]);
      return { xp_earned: 4 };
    });
    assert.equal(first.replayed, false);
    assert.deepEqual(first.response, { xp_earned: 4 });

    // 2. Replay returns the stored response and must not re-run the effects.
    const replay = await runIdempotent(pool, { userId, scope, key, requestHash: hash }, async () => {
      throw new Error('apply() must not run on replay');
    });
    assert.equal(replay.replayed, true);
    assert.deepEqual(replay.response, { xp_earned: 4 });

    // 3. Same key, different payload → conflict, nothing applied.
    await assert.rejects(
      runIdempotent(
        pool,
        { userId, scope, key, requestHash: requestHash('demo', [{ id: 'e1', value: 'b' }]) },
        async () => ({ xp_earned: 4 })
      ),
      IdempotencyConflictError
    );

    // 4. Concurrent duplicates apply exactly once.
    const key2 = 'test-key-3333-4444-5555';
    const hash2 = requestHash('demo', [{ id: 'e2', value: 'x' }]);
    const attempt = () =>
      runIdempotent(pool, { userId, scope, key: key2, requestHash: hash2 }, async c => {
        await c.query(`INSERT INTO xp_events (user_id, amount, kind) VALUES ($1, 4, 'review')`, [userId]);
        return { xp_earned: 4 };
      });
    const both = await Promise.all([attempt(), attempt()]);
    assert.equal(both.filter(r => r.replayed).length, 1);

    // Exactly one effect per key, never more.
    const { rows: xp } = await client.query(
      `SELECT COUNT(*)::int AS n FROM xp_events WHERE user_id = $1`,
      [userId]
    );
    assert.equal(xp[0].n, 2);

    // 5. AUD-08: the boundary is Tashkent midnight and `now()` falls inside it.
    const { rows: t } = await client.query(
      `SELECT ${TODAY}::text AS today,
              now() >= ${DAY_START} AND now() < ${DAY_START} + interval '1 day' AS in_day`
    );
    assert.match(t[0].today, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(t[0].in_day, true);

    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
  } finally {
    client.release();
    await pool.end();
  }
});
