/**
 * Server-enforced idempotency for mutating endpoints.
 *
 * A client sends a per-operation `idempotency_key` and reuses it on every retry
 * of the same logical submission. Effects and the idempotency record commit in a
 * single transaction, so a retry after a timeout, or two concurrent duplicates,
 * apply the side effects at most once per (user, scope, key).
 *
 * What this guarantees: at-most-once application of the wrapped effects for as
 * long as the record is retained. It is NOT end-to-end exactly-once — a client
 * that discards its key and retries with a new one can still double-apply, so the
 * frontend must reuse its key across retries.
 */

const crypto = require('crypto');

/** Bounded, URL-safe key. Accepts UUIDs and simple prefixed ids. */
const KEY_RE = /^[A-Za-z0-9._:-]{16,128}$/;

function isValidKey(key) {
  return typeof key === 'string' && KEY_RE.test(key);
}

/** Stable, order-independent representation of an answers payload. */
function canonicalAnswers(answers) {
  return (Array.isArray(answers) ? answers : [])
    .map(a => ({
      id: a && typeof a.id === 'string' ? a.id : '',
      value: a ? a.value ?? null : null,
    }))
    .sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

/** sha256 over the canonical payload, used to bind a key to its request body. */
function requestHash(moduleSlug, answers) {
  const canonical = JSON.stringify({
    module_slug: String(moduleSlug ?? ''),
    answers: canonicalAnswers(answers),
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/** Thrown when a key is replayed with a different payload. */
class IdempotencyConflictError extends Error {
  constructor() {
    super('idempotency key reused with a different payload');
    this.name = 'IdempotencyConflictError';
    this.code = 'IDEMPOTENCY_KEY_REUSED';
  }
}

/**
 * Run `apply(client)` at most once per (userId, scope, key).
 *
 * `apply` receives the transaction client and must perform every side effect and
 * every read that should be consistent with those effects through it. It returns
 * the JSON-serialisable response payload, which is stored and replayed verbatim.
 *
 * Returns { replayed, status, response }.
 * Throws IdempotencyConflictError when the key exists with a different hash.
 */
async function runIdempotent(pool, { userId, scope, key, requestHash: hash }, apply) {
  const client = await pool.connect();
  let txOpen = false;
  try {
    await client.query('BEGIN');
    txOpen = true;

    // Serialise same-key work; the lock releases automatically on COMMIT/ROLLBACK,
    // so a concurrent duplicate waits here instead of racing the effects.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      `${userId}:${scope}:${key}`,
    ]);

    const { rows } = await client.query(
      `SELECT request_hash, status, response
         FROM idempotency_keys
        WHERE user_id = $1 AND scope = $2 AND key = $3`,
      [userId, scope, key]
    );

    if (rows.length) {
      if (rows[0].request_hash !== hash) throw new IdempotencyConflictError();
      await client.query('COMMIT');
      txOpen = false;
      return { replayed: true, status: rows[0].status, response: rows[0].response };
    }

    const response = await apply(client);

    await client.query(
      `INSERT INTO idempotency_keys (user_id, scope, key, request_hash, status, response)
       VALUES ($1, $2, $3, $4, 200, $5::jsonb)`,
      [userId, scope, key, hash, JSON.stringify(response)]
    );

    await client.query('COMMIT');
    txOpen = false;
    return { replayed: false, status: 200, response };
  } catch (err) {
    if (txOpen) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* the connection may already be gone; the pool will discard it */
      }
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  KEY_RE,
  isValidKey,
  canonicalAnswers,
  requestHash,
  IdempotencyConflictError,
  runIdempotent,
};
