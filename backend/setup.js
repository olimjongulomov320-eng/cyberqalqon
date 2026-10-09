const pool = require('./db');
const { seedData, DOMAINS, PATHS } = require('./curriculum');
const { validateExercise } = require('./lib/grade');

/**
 * Boot-time migration + curriculum seed. Idempotent: safe to run on every
 * start, against both an empty database and an existing v1 database.
 *
 * Schema story:
 *   v1  users / modules (category TEXT) / user_progress / leaderboard matview
 *   v2  paths + domains + modules.domain_id, modules.exercises[] (replaces the
 *       single `challenge`), xp_events (replaces total_xp bookkeeping),
 *       mistakes, user_achievements, streak/goal columns on users.
 *   Legacy `category` is kept in sync with domain slug as a rollback alias.
 */
async function setup() {
  console.log('Setting up database...');
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  /* ── 1. Base tables (v1) ─────────────────────────────────────────────── */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      telegram_id        BIGINT UNIQUE,
      telegram_username  TEXT,
      username           TEXT UNIQUE,
      email              TEXT UNIQUE,
      password_hash      TEXT,
      display_name       TEXT NOT NULL,
      avatar_emoji       TEXT DEFAULT '🛡️',
      lang               TEXT NOT NULL DEFAULT 'uz',
      low_bandwidth_mode BOOLEAN NOT NULL DEFAULT false,
      total_xp           INTEGER NOT NULL DEFAULT 0,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_active_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS modules (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug         TEXT UNIQUE NOT NULL,
      title_uz     TEXT NOT NULL,
      title_ru     TEXT NOT NULL,
      content_uz   TEXT NOT NULL,
      content_ru   TEXT NOT NULL,
      category     TEXT NOT NULL,
      order_index  INTEGER NOT NULL DEFAULT 0,
      xp_reward    INTEGER NOT NULL DEFAULT 10,
      challenge    JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_published BOOLEAN NOT NULL DEFAULT false,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id       UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      is_completed    BOOLEAN NOT NULL DEFAULT false,
      completed_at    TIMESTAMPTZ,
      xp_earned       INTEGER NOT NULL DEFAULT 0,
      attempts        INTEGER NOT NULL DEFAULT 0,
      last_attempt_at TIMESTAMPTZ,
      UNIQUE(user_id, module_id)
    )`);

  /* ── 2. v2 tables ────────────────────────────────────────────────────── */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS paths (
      slug           TEXT PRIMARY KEY,
      icon           TEXT NOT NULL DEFAULT '🛡️',
      order_index    INTEGER NOT NULL DEFAULT 0,
      title_uz       TEXT NOT NULL,
      title_ru       TEXT NOT NULL,
      description_uz TEXT NOT NULL DEFAULT '',
      description_ru TEXT NOT NULL DEFAULT '',
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS domains (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug           TEXT UNIQUE NOT NULL,
      path_slug      TEXT NOT NULL REFERENCES paths(slug) ON DELETE CASCADE,
      icon           TEXT NOT NULL DEFAULT '📘',
      order_index    INTEGER NOT NULL DEFAULT 0,
      title_uz       TEXT NOT NULL,
      title_ru       TEXT NOT NULL,
      description_uz TEXT NOT NULL DEFAULT '',
      description_ru TEXT NOT NULL DEFAULT '',
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS xp_events (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount      INTEGER NOT NULL CHECK (amount > 0),
      kind        TEXT NOT NULL,               -- lesson | correct | review
      module_id   UUID REFERENCES modules(id) ON DELETE SET NULL,
      exercise_id TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events (user_id, created_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_xp_events_time ON xp_events (created_at DESC)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mistakes (
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id       UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      exercise_id     TEXT NOT NULL,
      wrong_count     INTEGER NOT NULL DEFAULT 0,
      correct_count   INTEGER NOT NULL DEFAULT 0,
      last_wrong_at   TIMESTAMPTZ,
      last_attempt_at TIMESTAMPTZ,
      PRIMARY KEY (user_id, module_id, exercise_id)
    )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistakes (user_id)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key         TEXT NOT NULL,
      unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, key)
    )`);

  /* ── 3. v2 columns ───────────────────────────────────────────────────── */
  for (const sql of [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email              TEXT UNIQUE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak  INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak  INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_streak_date DATE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_goal_xp   INTEGER NOT NULL DEFAULT 20`,
    `ALTER TABLE modules ADD COLUMN IF NOT EXISTS exercises JSONB`,
    `ALTER TABLE modules ALTER COLUMN challenge SET DEFAULT '{}'::jsonb`,
    `ALTER TABLE modules ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'lesson'`,
    `ALTER TABLE modules ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE SET NULL`,
  ]) await pool.query(sql);

  /* ── 4. Leaderboard matview (v1, kept; routes now also serve live week
         queries from xp_events) ─────────────────────────────────────────── */
  const { rows: viewExists } = await pool.query(
    `SELECT 1 FROM pg_matviews WHERE matviewname = 'leaderboard'`
  );
  if (viewExists.length === 0) {
    await pool.query(`
      CREATE MATERIALIZED VIEW leaderboard AS
      SELECT u.id AS user_id, u.display_name, u.avatar_emoji, u.total_xp,
             RANK() OVER (ORDER BY u.total_xp DESC) AS rank,
             COUNT(up.module_id) FILTER (WHERE up.is_completed) AS modules_completed
        FROM users u
        LEFT JOIN user_progress up ON up.user_id = u.id
       GROUP BY u.id, u.display_name, u.avatar_emoji, u.total_xp
       ORDER BY u.total_xp DESC`);
    await pool.query(`CREATE UNIQUE INDEX idx_leaderboard_user_id ON leaderboard (user_id)`);
    await pool.query(`CREATE INDEX idx_leaderboard_rank ON leaderboard (rank)`);
  }

  /* ── 5. Curriculum seed (always upsert — content lives in code) ──────── */
  const { paths, domains, modules } = seedData();

  for (const p of paths) {
    await pool.query(
      `INSERT INTO paths (slug, icon, order_index, title_uz, title_ru, description_uz, description_ru)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (slug) DO UPDATE SET
         icon = EXCLUDED.icon, order_index = EXCLUDED.order_index,
         title_uz = EXCLUDED.title_uz, title_ru = EXCLUDED.title_ru,
         description_uz = EXCLUDED.description_uz, description_ru = EXCLUDED.description_ru`,
      [p.slug, p.icon, p.order_index, p.title.uz, p.title.ru, p.description.uz, p.description.ru]
    );
  }
  for (const d of domains) {
    await pool.query(
      `INSERT INTO domains (slug, path_slug, icon, order_index, title_uz, title_ru, description_uz, description_ru)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET
         path_slug = EXCLUDED.path_slug, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index,
         title_uz = EXCLUDED.title_uz, title_ru = EXCLUDED.title_ru,
         description_uz = EXCLUDED.description_uz, description_ru = EXCLUDED.description_ru`,
      [d.slug, d.path, d.icon, d.order_index, d.title.uz, d.title.ru, d.description.uz, d.description.ru]
    );
  }

  let seeded = 0;
  for (const m of modules) {
    const errs = [];
    m.exercises.forEach((ex, i) => errs.push(...validateExercise(ex, `${m.slug}/e#${i + 1}`)));
    if (errs.length) {
      errs.forEach(e => console.error(`  ✗ ${e}`));
      throw new Error(`curriculum module "${m.slug}" failed validation`);
    }

    await pool.query(
      `INSERT INTO modules
         (slug, title_uz, title_ru, content_uz, content_ru, category, order_index,
          xp_reward, exercises, kind, domain_id, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
               (SELECT id FROM domains WHERE slug = $6), true)
       ON CONFLICT (slug) DO UPDATE SET
         title_uz = EXCLUDED.title_uz,   title_ru = EXCLUDED.title_ru,
         content_uz = EXCLUDED.content_uz, content_ru = EXCLUDED.content_ru,
         category = EXCLUDED.category,   order_index = EXCLUDED.order_index,
         xp_reward = EXCLUDED.xp_reward, exercises = EXCLUDED.exercises,
         kind = EXCLUDED.kind,           domain_id = EXCLUDED.domain_id,
         is_published = true`,
      [m.slug, m.title.uz, m.title.ru, m.content.uz, m.content.ru,
       m.domain, m.order_index, m.xp_reward, JSON.stringify(m.exercises), m.kind]
    );
    seeded++;
  }

  /* ── 6. Legacy backfill ──────────────────────────────────────────────── */
  // Modules never covered by the curriculum: give them a domain from their
  // old free-text category so nothing orphans.
  await pool.query(`
    INSERT INTO domains (slug, path_slug, icon, order_index, title_uz, title_ru)
    SELECT DISTINCT lower(replace(m.category, '_', '-')), 'cybersecurity', '📘', 99,
           m.category, m.category
      FROM modules m
     WHERE m.domain_id IS NULL
       AND NOT EXISTS (SELECT 1 FROM domains d WHERE d.slug = lower(replace(m.category, '_', '-')))
  `);
  await pool.query(`
    UPDATE modules m SET domain_id = d.id
      FROM domains d
     WHERE m.domain_id IS NULL
       AND d.slug = lower(replace(m.category, '_', '-'))
  `);
  // Modules with no exercises yet (hand-inserted): convert v1 challenge JSON.
  await pool.query(`
    UPDATE modules SET exercises = jsonb_build_array(jsonb_build_object(
      'id', 'e1',
      'type', CASE challenge->>'type'
                WHEN 'multiple_choice' THEN 'mc'
                WHEN 'true_false' THEN 'tf'
                ELSE 'input' END,
      'q', jsonb_build_object('uz', challenge->>'question_uz', 'ru', challenge->>'question_ru'),
      'options', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
                       'id', chr(97 + ord::int), 'uz', val, 'ru', val)), '[]'::jsonb)
                    FROM jsonb_array_elements_text(challenge->'options') WITH ORDINALITY t(val, ord)),
      'answer', challenge->>'correct_answer',
      'explain', jsonb_build_object('uz', challenge->>'explanation_uz', 'ru', challenge->>'explanation_ru')
    ))
    WHERE exercises IS NULL AND challenge ? 'question_uz'
  `);

  /* ── 7. XP trigger migration: xp_events is now the source of truth ───── */
  await pool.query(`DROP TRIGGER IF EXISTS trg_sync_user_xp ON user_progress`);
  await pool.query(`DROP TRIGGER IF EXISTS trg_sync_user_xp ON xp_events`);
  await pool.query(`
    CREATE OR REPLACE FUNCTION sync_user_xp() RETURNS TRIGGER LANGUAGE plpgsql AS $$
    BEGIN
      UPDATE users
         SET total_xp = (SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = NEW.user_id),
             last_active_at = now()
       WHERE id = NEW.user_id;
      RETURN NEW;
    END;
    $$`);
  await pool.query(`
    CREATE TRIGGER trg_sync_user_xp
    AFTER INSERT ON xp_events
    FOR EACH ROW EXECUTE FUNCTION sync_user_xp()`);

  // One-time: import XP already earned under v1 rules, then recompute totals.
  await pool.query(`
    INSERT INTO xp_events (user_id, module_id, amount, kind, created_at)
    SELECT up.user_id, up.module_id, up.xp_earned, 'lesson', COALESCE(up.completed_at, now())
      FROM user_progress up
     WHERE up.xp_earned > 0
       AND NOT EXISTS (
         SELECT 1 FROM xp_events x
          WHERE x.user_id = up.user_id AND x.module_id = up.module_id AND x.kind = 'lesson')
    ON CONFLICT DO NOTHING`);
  await pool.query(`
    UPDATE users u
       SET total_xp = COALESCE((SELECT SUM(x.amount) FROM xp_events x WHERE x.user_id = u.id), 0)`);

  console.log(`Database ready. Curriculum: ${seeded} modules, ${domains.length} domains, ${paths.length} paths.`);
}

module.exports = setup;
