/**
 * Graduated hint derivation (level 2) — pure, unit-tested, no I/O.
 *
 * Level 1 is a per-exercise-type *strategy* line shipped from the frontend
 * dictionary; it needs no server round-trip and leaks nothing.
 *
 * Level 2 is this module's job: it narrows the answer using the stored
 * curriculum answer, without ever returning that answer. Only the server ever
 * holds answers (exercises are stripped by `publicExercise` before they reach
 * the client), so a hint endpoint is the only place a narrowing can be derived
 * honestly — and it must never collapse into a reveal.
 *
 * Contract: `hintLevel2(ex)` returns either
 *   { available: false }                       → no honest narrowing exists
 *   { available: true, kind, ...narrowing }    → partial help, never the answer
 *
 * Per type:
 *   mc      → eliminate one incorrect option      (useless with 2 options,
 *                                                   where elimination = answer)
 *   multi   → how many options must be selected   (meaningless when all are)
 *   order   → the correct FIRST item              (one anchor, not the sequence)
 *   match   → one correct left→right pair         (one of N pairs)
 *   input   → the shape of the answer             (word count + length bucket)
 *   tf      → never available                     (2 options: any narrowing
 *                                                   IS the answer)
 */

const TYPES = ['mc', 'tf', 'multi', 'match', 'order', 'input'];

function lengthBucket(chars) {
  if (chars <= 8) return 'short';
  if (chars <= 16) return 'medium';
  return 'long';
}

function hintLevel2(ex) {
  if (!ex || !TYPES.includes(ex.type)) return { available: false };

  switch (ex.type) {
    case 'tf':
      // Two options: saying "it's not true" would be the answer.
      return { available: false };

    case 'mc': {
      const options = Array.isArray(ex.options) ? ex.options : [];
      if (!ex.answer || options.length < 3) return { available: false };
      const wrong = options.filter(o => o && o.id !== ex.answer);
      if (wrong.length < 1) return { available: false };
      // Exactly one distractor: with 2 options there is nothing to eliminate
      // without handing over the answer.
      return { available: true, kind: 'eliminate', ids: [wrong[0].id] };
    }

    case 'multi': {
      const answers = Array.isArray(ex.answers) ? ex.answers : [];
      const options = Array.isArray(ex.options) ? ex.options : [];
      if (answers.length < 2 || options.length === 0) return { available: false };
      if (answers.length >= options.length) return { available: false };
      return { available: true, kind: 'count', count: answers.length };
    }

    case 'order': {
      const order = Array.isArray(ex.order) ? ex.order : [];
      if (order.length < 3) return { available: false };
      return { available: true, kind: 'first', id: order[0] };
    }

    case 'match': {
      const pairs = Array.isArray(ex.pairs) ? ex.pairs : [];
      const answer = ex.match_answer && typeof ex.match_answer === 'object' ? ex.match_answer : null;
      if (!answer || pairs.length < 2) return { available: false };
      const first = pairs[0];
      const rightId = first && answer[first.id];
      if (!first || !rightId) return { available: false };
      return { available: true, kind: 'pair', left_id: first.id, right_id: rightId };
    }

    case 'input': {
      const raw = typeof ex.answer === 'string' ? ex.answer.trim() : '';
      if (!raw) return { available: false };
      const words = raw.split(/\s+/).filter(Boolean).length;
      return { available: true, kind: 'shape', words, length: lengthBucket(raw.length) };
    }

    default:
      return { available: false };
  }
}

module.exports = { hintLevel2, TYPES };
