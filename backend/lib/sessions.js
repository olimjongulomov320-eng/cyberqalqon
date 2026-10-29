const pool = require('../db');

// Tokens carry the user's token_version (`v`). A password reset bumps it, which
// invalidates every token issued before. The version is cached briefly so an
// authenticated request does not always cost a query; bumping clears the entry.
const TTL_MS = 15_000;
const MAX_ENTRIES = 5_000;
const cache = new Map(); // id -> { v, exp }

async function currentVersion(userId) {
  const hit = cache.get(userId);
  if (hit && hit.exp > Date.now()) return hit.v;
  const { rows } = await pool.query('SELECT token_version FROM users WHERE id = $1', [userId]);
  if (!rows.length) return null; // account deleted
  if (cache.size >= MAX_ENTRIES) cache.clear();
  cache.set(userId, { v: rows[0].token_version, exp: Date.now() + TTL_MS });
  return rows[0].token_version;
}

// Tokens issued before versioning have no `v`; they count as version 0.
async function isCurrent(claims) {
  const v = await currentVersion(claims.id);
  return v !== null && (claims.v ?? 0) === v;
}

function forget(userId) {
  cache.delete(userId);
}

module.exports = { isCurrent, forget };
