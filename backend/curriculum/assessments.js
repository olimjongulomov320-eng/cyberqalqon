/**
 * Scored assessments — one per learning track.
 *
 * Questions are drawn at start time from the exercises of the track's own
 * modules (see lib/assessment.js), so an assessment always evaluates material
 * the learner was actually taught. The server picks the questions, enforces the
 * time limit and does all grading; the client only sends answers.
 *
 * Honest limitation: lesson feedback reveals answers, so this is a retention
 * self-check, not a proctored certification. It is never labelled as one.
 *
 * Eligibility: every non-checkpoint lesson of the track must be completed.
 */
const { TRACKS } = require('./tracks');

const DEFAULTS = {
  question_count: 10,
  pass_mark: 70, // percent
  time_limit_minutes: 20,
  xp: 40,
};

const ASSESSMENTS = TRACKS.map(t => ({
  slug: t.slug, // one assessment per track; same slug
  track: t.slug,
  ...DEFAULTS,
}));

const bySlug = new Map(ASSESSMENTS.map(a => [a.slug, a]));

module.exports = { ASSESSMENTS, bySlug, DEFAULTS };
