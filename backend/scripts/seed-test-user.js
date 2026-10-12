#!/usr/bin/env node
/**
 * DEV-ONLY: create/refresh a known local test account so the app can be
 * exercised end-to-end (login → lesson → review submit → retry).
 *
 * Guardrails:
 *   - refuses to run when NODE_ENV=production
 *   - refuses a non-local DATABASE_URL host unless SEED_ALLOW_REMOTE=1
 * Never point this at a shared or production database.
 *
 * Usage:
 *   cd backend && node scripts/seed-test-user.js
 *   TEST_USERNAME=alice TEST_PASSWORD='S3cretPass!' node scripts/seed-test-user.js
 *
 * Defaults: testbot / testbot@cyberqalqon.local / TestPass123
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');
const setup = require('../setup');

const BCRYPT_ROUNDS = 12;

const USERNAME = (process.env.TEST_USERNAME || 'testbot').toLowerCase();
const EMAIL = (process.env.TEST_EMAIL || 'testbot@cyberqalqon.local').toLowerCase();
const PASSWORD = process.env.TEST_PASSWORD || 'TestPass123';
const DISPLAY_NAME = process.env.TEST_DISPLAY_NAME || 'Test Bot';

function hostOf(urlStr) {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return null;
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed a test user in production (NODE_ENV=production).');
  }
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is not set (copy .env.example to .env).');

  const host = hostOf(dbUrl);
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== '1') {
    throw new Error(
      `Refusing to seed non-local database host "${host}". ` +
        'Set SEED_ALLOW_REMOTE=1 only if you are certain it is disposable.'
    );
  }

  // Idempotent: ensures tables (incl. the new idempotency_keys) + curriculum.
  await setup();

  const hash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password_hash, display_name, lang)
     VALUES ($1, $2, $3, $4, 'uz')
     ON CONFLICT (username) DO UPDATE
        SET email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            display_name = EXCLUDED.display_name
     RETURNING id, username, email, display_name`,
    [USERNAME, EMAIL, hash, DISPLAY_NAME]
  );

  const u = rows[0];
  console.log('\nTest account ready (local only):');
  console.log(`  identifier: ${u.email}   (or username: ${u.username})`);
  console.log(`  password:   ${PASSWORD}`);
  console.log(`  user id:    ${u.id}\n`);
}

main()
  .then(() => pool.end())
  .catch(err => {
    console.error('seed-test-user failed:', err.message);
    pool.end(() => process.exit(1));
  });
