const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { hintLevel2 } = require('../lib/hints');
const { lockedByAssessment, LOCK_RESPONSE } = require('../lib/assessmentLock');

const router = Router();

// Hint requests sit in the same "many small requests per lesson" class as
// /check, so they share the same budget: 30/min is generous for a human and
// useless for harvesting (and level 2 never contains the answer anyway).
const hintLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true });

/**
 * POST /modules/:slug/hint — graduated support for one exercise.
 *
 * Level 1 never reaches the server: the client renders a per-type strategy
 * line from its own dictionary. This endpoint serves level 2 only, deriving a
 * narrowing from the stored answer (see lib/hints.js) that is deliberately
 * partial. It records no attempt, awards no XP and changes no grading rule —
 * a hint is a learning aid, not an outcome.
 */
router.post('/:slug/hint', hintLimiter, requireAuth, async (req, res, next) => {
  try {
    const { exercise_id } = req.body ?? {};
    if (!exercise_id || typeof exercise_id !== 'string') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'exercise_id is required.' },
      });
    }

    const { rows } = await pool.query(
      `SELECT exercises FROM modules WHERE slug = $1 AND is_published`,
      [req.params.slug]
    );
    if (!rows.length) {
      return res.status(404).json({ error: { code: 'MODULE_NOT_FOUND', message: 'Module not found.' } });
    }
    const ex = (rows[0].exercises ?? []).find(e => e && e.id === exercise_id);
    if (!ex) {
      return res.status(404).json({ error: { code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found.' } });
    }

    if (await lockedByAssessment(req.user.id, req.params.slug, ex.id)) return res.status(423).json(LOCK_RESPONSE);

    res.json(hintLevel2(ex));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
