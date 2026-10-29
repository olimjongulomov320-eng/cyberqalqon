const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { TRACKS } = require('../curriculum/tracks');
const { ASSESSMENTS, bySlug } = require('../curriculum/assessments');
const { localizeExercise, answerReveal } = require('../lib/grade');
const { drawQuestions, scoreAttempt, SUBMIT_GRACE_SECONDS } = require('../lib/assessment');
const { bumpStreak, recordXp } = require('../lib/gamification');

const router = Router();
const pickLang = q => (q.lang === 'ru' ? 'ru' : 'uz');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const trackOf = slug => TRACKS.find(t => t.slug === slug);

const limiter = rateLimit({ windowMs: 60_000, max: 15, standardHeaders: true, legacyHeaders: false });
const err = (res, status, code, message, extra = {}) =>
  res.status(status).json({ error: { code, message, ...extra } });

/** Published modules of a track with their stored exercises. */
async function loadTrackModules(track, db = pool) {
  const { rows } = await db.query(
    `SELECT id, slug, kind, exercises FROM modules WHERE is_published AND slug = ANY($1::text[])`,
    [track.modules]
  );
  return rows;
}

function exerciseMap(moduleRows) {
  const map = new Map();
  for (const m of moduleRows) for (const ex of m.exercises ?? []) if (ex && ex.id) map.set(`${m.slug}::${ex.id}`, ex);
  return map;
}

/** Lessons (not checkpoints) the learner must finish before the assessment opens. */
async function eligibility(userId, track, moduleRows, db = pool) {
  const lessons = moduleRows.filter(m => m.kind === 'lesson').map(m => m.slug);
  const { rows } = await db.query(
    `SELECT m.slug FROM user_progress up JOIN modules m ON m.id = up.module_id
      WHERE up.user_id = $1 AND up.is_completed AND m.slug = ANY($2::text[])`,
    [userId, lessons]
  );
  const done = new Set(rows.map(r => r.slug));
  const missing = lessons.filter(s => !done.has(s));
  return { eligible: missing.length === 0, required: lessons.length, completed: lessons.length - missing.length, missing };
}

function questionPayload(refs, exMap, lang) {
  return refs.map((r, n) => ({ n, ...localizeExercise(exMap.get(`${r.m}::${r.e}`), lang) }));
}

function resultPayload(attempt, exMap, lang) {
  const refs = attempt.refs;
  const scored = scoreAttempt(refs, exMap, attempt.answers, attempt.pass_mark);
  const items = scored.results.map(r => {
    const ex = exMap.get(`${r.module_slug}::${r.exercise_id}`);
    return {
      n: r.n,
      module_slug: r.module_slug,
      question: ex?.q?.[lang] ?? '',
      answered: r.answered,
      correct: r.correct,
      explain: ex?.explain?.[lang] ?? '',
      reveal: ex ? answerReveal(ex) : {},
      exercise: ex ? { n: r.n, ...localizeExercise(ex, lang) } : null,
    };
  });
  return {
    attempt_id: attempt.id,
    assessment: attempt.assessment_slug,
    status: attempt.status,
    score: scored.score,
    total: scored.total,
    percent: scored.percent,
    pass_mark: attempt.pass_mark,
    passed: scored.passed,
    per_module: scored.per_module,
    submitted_at: attempt.submitted_at,
    items,
  };
}

/* ── GET /assessments — what exists, and where this learner stands ──────── */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    const userId = req.user?.id ?? null;

    const modsBySlug = new Map();
    const { rows: allMods } = await pool.query(
      `SELECT slug, kind, jsonb_array_length(exercises) AS n FROM modules WHERE is_published`
    );
    for (const m of allMods) modsBySlug.set(m.slug, m);

    let doneSet = new Set();
    let stats = new Map();
    let open = new Map();
    if (userId) {
      const [d, s, o] = await Promise.all([
        pool.query(
          `SELECT m.slug FROM user_progress up JOIN modules m ON m.id = up.module_id
            WHERE up.user_id = $1 AND up.is_completed`, [userId]),
        pool.query(
          `SELECT assessment_slug, COUNT(*)::int AS attempts, MAX(percent) AS best,
                  BOOL_OR(passed) AS passed, MAX(submitted_at) AS last_at
             FROM assessment_attempts WHERE user_id = $1 AND status = 'submitted'
            GROUP BY assessment_slug`, [userId]),
        pool.query(
          `SELECT id, assessment_slug, expires_at FROM assessment_attempts
            WHERE user_id = $1 AND status = 'in_progress' AND expires_at > now()`, [userId]),
      ]);
      doneSet = new Set(d.rows.map(r => r.slug));
      stats = new Map(s.rows.map(r => [r.assessment_slug, r]));
      open = new Map(o.rows.map(r => [r.assessment_slug, r]));
    }

    const assessments = ASSESSMENTS.map(a => {
      const t = trackOf(a.track);
      const lessons = t.modules.filter(s => modsBySlug.get(s)?.kind === 'lesson');
      const completed = lessons.filter(s => doneSet.has(s)).length;
      const st = stats.get(a.slug);
      const op = open.get(a.slug);
      return {
        slug: a.slug,
        track_slug: t.slug,
        icon: t.icon,
        title: t.title[lang],
        question_count: Math.min(
          a.question_count,
          t.modules.reduce((n, s) => n + (modsBySlug.get(s)?.n ?? 0), 0)
        ),
        pass_mark: a.pass_mark,
        time_limit_minutes: a.time_limit_minutes,
        xp: a.xp,
        needs_review: Boolean(t.needs_review),
        lessons_required: lessons.length,
        lessons_completed: completed,
        eligible: lessons.length > 0 && completed === lessons.length,
        in_progress: op ? { attempt_id: op.id, expires_at: op.expires_at } : null,
        attempts: st?.attempts ?? 0,
        best_percent: st?.best ?? null,
        passed: Boolean(st?.passed),
        last_at: st?.last_at ?? null,
      };
    });
    res.json({ assessments });
  } catch (e) {
    next(e);
  }
});

/* ── POST /assessments/:slug/start — server draws the paper ─────────────── */
router.post('/:slug/start', limiter, requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const lang = pickLang(req.query);
    const def = bySlug.get(req.params.slug);
    if (!def) return err(res, 404, 'ASSESSMENT_NOT_FOUND', 'Assessment not found.');
    const track = trackOf(def.track);

    const moduleRows = await loadTrackModules(track, client);
    const exMap = exerciseMap(moduleRows);

    await client.query('BEGIN');
    // Serialise starts for this (user, assessment) so two taps cannot open two papers.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`assess:${req.user.id}:${def.slug}`]);

    await client.query(
      `UPDATE assessment_attempts SET status = 'expired'
        WHERE user_id = $1 AND assessment_slug = $2 AND status = 'in_progress' AND expires_at <= now()`,
      [req.user.id, def.slug]
    );

    const { rows: active } = await client.query(
      `SELECT * FROM assessment_attempts
        WHERE user_id = $1 AND assessment_slug = $2 AND status = 'in_progress'`,
      [req.user.id, def.slug]
    );
    let attempt = active[0];

    if (!attempt) {
      const elig = await eligibility(req.user.id, track, moduleRows, client);
      if (!elig.eligible) {
        await client.query('ROLLBACK');
        return err(res, 403, 'NOT_ELIGIBLE', 'Finish all lessons of this track first.', {
          required: elig.required,
          completed: elig.completed,
        });
      }
      const pool_ = [...exMap.keys()].map(k => {
        const [module_slug, exercise_id] = k.split('::');
        return { module_slug, exercise_id };
      });
      const refs = drawQuestions(pool_, def.question_count);
      if (refs.length === 0) {
        await client.query('ROLLBACK');
        return err(res, 409, 'EMPTY_ASSESSMENT', 'This assessment has no questions yet.');
      }
      const { rows } = await client.query(
        `INSERT INTO assessment_attempts (user_id, assessment_slug, refs, pass_mark, total, expires_at)
         VALUES ($1, $2, $3::jsonb, $4, $5, now() + ($6 || ' minutes')::interval)
         RETURNING *`,
        [req.user.id, def.slug, JSON.stringify(refs), def.pass_mark, refs.length, String(def.time_limit_minutes)]
      );
      attempt = rows[0];
    }
    await client.query('COMMIT');

    res.status(201).json({
      attempt_id: attempt.id,
      assessment: def.slug,
      title: track.title[lang],
      expires_at: attempt.expires_at,
      pass_mark: attempt.pass_mark,
      questions: questionPayload(attempt.refs, exMap, lang),
    });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    next(e);
  } finally {
    client.release();
  }
});

/* ── GET /assessments/attempts/:id — resume a paper, or read a result ───── */
router.get('/attempts/:id', requireAuth, async (req, res, next) => {
  try {
    const lang = pickLang(req.query);
    if (!UUID_RE.test(req.params.id)) return err(res, 404, 'ATTEMPT_NOT_FOUND', 'Attempt not found.');
    const { rows } = await pool.query(
      `SELECT *, (expires_at <= now()) AS timed_out FROM assessment_attempts WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    const attempt = rows[0];
    if (!attempt) return err(res, 404, 'ATTEMPT_NOT_FOUND', 'Attempt not found.');

    const track = trackOf(bySlug.get(attempt.assessment_slug).track);
    const exMap = exerciseMap(await loadTrackModules(track));

    if (attempt.status === 'submitted') return res.json(resultPayload(attempt, exMap, lang));
    if (attempt.status === 'expired' || attempt.timed_out) {
      return err(res, 410, 'ATTEMPT_EXPIRED', 'This attempt has expired.');
    }
    res.json({
      attempt_id: attempt.id,
      assessment: attempt.assessment_slug,
      title: track.title[lang],
      expires_at: attempt.expires_at,
      pass_mark: attempt.pass_mark,
      questions: questionPayload(attempt.refs, exMap, lang),
    });
  } catch (e) {
    next(e);
  }
});

/* ── POST /assessments/attempts/:id/submit — grade once, award once ─────── */
router.post('/attempts/:id/submit', limiter, requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const lang = pickLang(req.query);
    if (!UUID_RE.test(req.params.id)) return err(res, 404, 'ATTEMPT_NOT_FOUND', 'Attempt not found.');
    const answers = req.body?.answers;
    if (!Array.isArray(answers) || answers.length > 100) {
      return err(res, 400, 'VALIDATION_ERROR', 'answers[] is required.');
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT *, (now() > expires_at + ($3 || ' seconds')::interval) AS too_late
         FROM assessment_attempts WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [req.params.id, req.user.id, String(SUBMIT_GRACE_SECONDS)]
    );
    const attempt = rows[0];
    if (!attempt) {
      await client.query('ROLLBACK');
      return err(res, 404, 'ATTEMPT_NOT_FOUND', 'Attempt not found.');
    }

    const track = trackOf(bySlug.get(attempt.assessment_slug).track);
    const exMap = exerciseMap(await loadTrackModules(track, client));

    // A repeated submit (retry after a timeout) returns the stored result.
    if (attempt.status === 'submitted') {
      await client.query('COMMIT');
      return res.json({ ...resultPayload(attempt, exMap, lang), replayed: true, xp_earned: 0 });
    }
    if (attempt.status === 'expired' || attempt.too_late) {
      await client.query(`UPDATE assessment_attempts SET status = 'expired' WHERE id = $1`, [attempt.id]);
      await client.query('COMMIT');
      return err(res, 410, 'ATTEMPT_EXPIRED', 'Time is up: this attempt was not graded.');
    }

    const scored = scoreAttempt(attempt.refs, exMap, answers, attempt.pass_mark);
    const kept = answers
      .filter(a => a && Number.isInteger(a.n))
      .map(a => ({ n: a.n, value: a.value }));
    const { rows: upd } = await client.query(
      `UPDATE assessment_attempts
          SET status = 'submitted', submitted_at = now(), answers = $2::jsonb,
              score = $3, total = $4, percent = $5, passed = $6
        WHERE id = $1 RETURNING *`,
      [attempt.id, JSON.stringify(kept), scored.score, scored.total, scored.percent, scored.passed]
    );

    // XP: once per (user, assessment), on the first pass only — a unique index
    // enforces it, so concurrent or repeated passes cannot double-award.
    let xp_earned = 0;
    if (scored.passed) {
      const def = bySlug.get(attempt.assessment_slug);
      const { rows: xp } = await client.query(
        `INSERT INTO xp_events (user_id, amount, kind, exercise_id)
         VALUES ($1, $2, 'assessment', $3)
         ON CONFLICT (user_id, exercise_id) WHERE kind = 'assessment' DO NOTHING
         RETURNING id`,
        [req.user.id, def.xp, def.slug]
      );
      if (xp.length) xp_earned = def.xp;
    }
    await bumpStreak(req.user.id, client);
    const { new_achievements, ...snap } = await recordXp(
      req.user.id,
      { amount: 0, kind: 'assessment', ctx: { assessmentPassed: scored.passed } },
      client
    );
    await client.query('COMMIT');

    res.json({ ...resultPayload(upd[0], exMap, lang), xp_earned, ...snap, new_achievements });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    next(e);
  } finally {
    client.release();
  }
});

module.exports = router;
