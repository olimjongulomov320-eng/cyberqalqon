/**
 * Coding challenges — content lives in curriculum/challenges.js, not in the DB
 * or in components. This module shapes it for the API.
 *
 * Trust model (read this before relying on a result): challenges run in the
 * LEARNER'S BROWSER (Pyodide in a Web Worker), because this project does not
 * execute user code on its servers. The server therefore cannot verify a
 * "solved" claim, and hidden-test data has to be sent to the client for the
 * runner to use. Results are recorded as self-reported progress; challenge
 * points are shown on the profile but are deliberately NOT added to XP or the
 * leaderboard. A server-side judge (Judge0 or similar) would change that.
 */
const CHALLENGES = require('../curriculum/challenges');

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MAX_CODE_BYTES = 20_000;

const bySlug = new Map(CHALLENGES.map(c => [c.slug, c]));

const pickLang = q => (q === 'ru' ? 'ru' : 'uz');

/** Row for the challenge list: no tests, no solution. */
function summary(c, lang) {
  return {
    slug: c.slug,
    title: c.title[lang],
    difficulty: c.difficulty,
    points: c.points,
    tags: c.tags,
    language: c.language,
    module: c.module,
    needs_review: Boolean(c.needs_review),
    tests_total: c.tests.length,
  };
}

/** Full challenge for the solve page. The reference solution is never included. */
function detail(c, lang) {
  return {
    ...summary(c, lang),
    statement: c.statement[lang],
    constraints: c.constraints[lang],
    starter: c.starter,
    entry: c.entry,
    examples: c.examples,
    // The browser runner needs every case. `hidden` only controls what the UI
    // shows; see the trust model above.
    tests: c.tests.map(t => ({ args: t.args, expected: t.expected, hidden: t.hidden })),
  };
}

/**
 * Validate a self-reported result. Counts must be sane relative to the
 * challenge; `solved` is derived from them, never taken on trust as a flag.
 */
function validateReport(c, body) {
  const { passed, total, code } = body ?? {};
  if (!Number.isInteger(passed) || !Number.isInteger(total)) return { ok: false, message: 'passed and total must be integers' };
  if (total !== c.tests.length) return { ok: false, message: 'total must equal the number of tests' };
  if (passed < 0 || passed > total) return { ok: false, message: 'passed out of range' };
  if (typeof code !== 'string' || !code.trim()) return { ok: false, message: 'code is required' };
  if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) return { ok: false, message: 'code is too long' };
  return { ok: true, solved: passed === total };
}

module.exports = { CHALLENGES, DIFFICULTIES, MAX_CODE_BYTES, bySlug, pickLang, summary, detail, validateReport };
