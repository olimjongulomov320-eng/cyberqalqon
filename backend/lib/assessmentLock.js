const pool = require('../db');

/**
 * While a learner has an unexpired assessment attempt open, the lesson
 * endpoints (/check, /practice, /hint) refuse to touch the exercises on that
 * paper — otherwise they would be an answer oracle for the assessment.
 */
async function lockedByAssessment(userId, moduleSlug, exerciseId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM assessment_attempts
      WHERE user_id = $1 AND status = 'in_progress' AND expires_at > now()
        AND refs @> jsonb_build_array(jsonb_build_object('m', $2::text, 'e', $3::text))
      LIMIT 1`,
    [userId, moduleSlug, exerciseId]
  );
  return rows.length > 0;
}

/** Same guard for a batch of exercise ids in one module (review submit). */
async function anyLockedByAssessment(userId, moduleSlug, exerciseIds) {
  if (!exerciseIds.length) return false;
  const { rows } = await pool.query(
    `SELECT 1 FROM assessment_attempts a, jsonb_array_elements(a.refs) r
      WHERE a.user_id = $1 AND a.status = 'in_progress' AND a.expires_at > now()
        AND r->>'m' = $2 AND r->>'e' = ANY($3::text[])
      LIMIT 1`,
    [userId, moduleSlug, exerciseIds]
  );
  return rows.length > 0;
}

const LOCK_RESPONSE = {
  error: {
    code: 'ASSESSMENT_IN_PROGRESS',
    message: 'This question is part of an assessment you have open. Finish it first.',
  },
};

module.exports = { lockedByAssessment, anyLockedByAssessment, LOCK_RESPONSE };
