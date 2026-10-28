/**
 * Grading engine for every exercise type.
 *
 * An exercise (stored in modules.exercises JSONB) looks like:
 *   {
 *     id: 'e1',                       // unique within the module
 *     type: 'mc' | 'tf' | 'multi' | 'match' | 'order' | 'input',
 *     q:    { uz: '...', ru: '...' },
 *     code: 'chmod 600 id_rsa',       // optional monospace block shown above choices
 *
 *     // mc / multi — bilingual choice lists; answers reference option ids
 *     options: [{ id: 'a', uz: '...', ru: '...' }, ...],
 *     answer: 'b',                    // mc only
 *     answers: ['a', 'c'],            // multi only
 *
 *     // tf — no options needed
 *     //   answer: 'true' | 'false'
 *
 *     // match — left items fixed, right items shuffled in the UI
 *     pairs: [{ id: 'p1', left: {uz,ru}, right: {uz,ru} }, ...],
 *     match_answer: { p1: 'r1', p2: 'r2' },   // pair id -> right item id
 *
 *     // order — items shuffled in the UI, user arranges them
 *     items: [{ id: 'i1', uz: '...', ru: '...' }, ...],
 *     order: ['i2', 'i1', 'i3'],      // correct sequence of item ids
 *
 *     // input — free text, normalised comparison + optional aliases
 *     answer: 'ip address',
 *     accepted: ['ip', 'ip adr'],     // optional extra accepted strings
 *
 *     explain: { uz: '...', ru: '...' }  // revealed after grading, always
 *   }
 */

const crypto = require('crypto');

const TYPES = ['mc', 'tf', 'multi', 'match', 'order', 'input'];

/** Stable pseudo-random key for (exercise, item): a deterministic shuffle that
 *  survives reloads and needs no per-request state. */
const sortKey = (exId, itemId) =>
  crypto.createHash('sha1').update(`${exId}:${itemId}`).digest('hex');

function shuffledBy(exId, list) {
  return [...list].sort((a, b) => {
    const ka = sortKey(exId, a.id);
    const kb = sortKey(exId, b.id);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/**
 * Match exercises: the authored data pairs every left with its own right, so
 * shipping `{left, right}` objects would hand the answer to anyone reading the
 * response. The client instead receives each right text under a *different*
 * pair's id, rotated by a fixed per-exercise offset. Grading and reveal map
 * client ids back through the same offset, so the UI needs no changes.
 */
function matchShift(ex) {
  const n = Array.isArray(ex.pairs) ? ex.pairs.length : 0;
  if (n < 2) return 0;
  const h = parseInt(sortKey(ex.id, 'shift').slice(0, 8), 16);
  return 1 + (h % (n - 1));
}

/** Pair id the client sees for the right text that really belongs to `pairId`. */
function viewIdForRight(ex, pairId) {
  const n = ex.pairs.length;
  const m = ex.pairs.findIndex(p => p.id === pairId);
  if (m < 0 || n < 2) return pairId;
  return ex.pairs[(((m - matchShift(ex)) % n) + n) % n].id;
}

/** The real right-side id behind a client-visible pair id (null if unknown). */
function realRightId(ex, viewId) {
  const n = ex.pairs.length;
  const j = ex.pairs.findIndex(p => p.id === viewId);
  if (j < 0) return null;
  return ex.pairs[(j + matchShift(ex)) % n].id;
}

/** Trim, lowercase, collapse whitespace, drop trailing punctuation. */
function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?]+$/, '');
}

function grade(ex, value) {
  switch (ex.type) {
    case 'mc':
    case 'tf':
      return normalize(value) === normalize(ex.answer);

    case 'multi': {
      if (!Array.isArray(value)) return false;
      const got = new Set(value.map(v => String(v)));
      const want = new Set((ex.answers || []).map(v => String(v)));
      if (got.size !== want.size) return false;
      for (const v of want) if (!got.has(v)) return false;
      return true;
    }

    case 'match': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const want = ex.match_answer || {};
      const keys = Object.keys(want);
      if (keys.length === 0) return false;
      return keys.every(k => {
        const real = realRightId(ex, String(value[k] ?? ''));
        return real !== null && real === String(want[k]);
      });
    }

    case 'order': {
      if (!Array.isArray(value)) return false;
      const want = ex.order || [];
      return value.length === want.length && value.every((v, i) => v === want[i]);
    }

    case 'input': {
      const guess = normalize(value);
      if (!guess) return false;
      const accepted = [ex.answer, ...(ex.accepted || [])].map(normalize);
      return accepted.includes(guess);
    }

    default:
      return false;
  }
}

/**
 * Strip everything that would leak the answer before the payload reaches the
 * client. Explanation is revealed only by check/complete.
 * Optional `hint` is passed through (guidance, not the answer).
 */
function publicExercise(ex) {
  const {
    answer, answers, order, match_answer, accepted, explain,
    ...rest
  } = ex;
  return rest;
}

/**
 * Localise an exercise for the client: strip answer keys, pick the language and
 * remove every positional hint to the answer (option order, pair adjacency,
 * authored item order).
 */
function localizeExercise(ex, lang) {
  const pub = publicExercise(ex);
  pub.q = ex.q[lang];
  if (ex.options) {
    pub.options = shuffledBy(ex.id, ex.options).map(o => ({ id: o.id, text: o[lang] }));
  }
  if (ex.pairs) {
    const shift = matchShift(ex);
    const n = ex.pairs.length;
    pub.pairs = ex.pairs.map((p, j) => ({
      id: p.id,
      left: p.left[lang],
      right: ex.pairs[(j + shift) % n].right[lang],
    }));
  }
  if (ex.items) {
    let items = shuffledBy(ex.id, ex.items);
    const same = Array.isArray(ex.order) && items.every((it, i) => it.id === ex.order[i]);
    if (same && items.length > 1) items = [...items.slice(1), items[0]];
    pub.items = items.map(i => ({ id: i.id, text: i[lang] }));
  }
  return pub;
}

/**
 * What the client needs to highlight the right choice after grading.
 * Ids for choice types (client maps id -> localised text), raw text for input.
 */
function answerReveal(ex) {
  switch (ex.type) {
    case 'mc':
    case 'tf':
      return { answer: ex.answer };
    case 'multi':
      return { answers: ex.answers };
    case 'match':
      return {
        match_answer: Object.fromEntries(
          Object.entries(ex.match_answer || {}).map(([k, v]) => [k, viewIdForRight(ex, String(v))])
        ),
      };
    case 'order':
      return { order: ex.order };
    case 'input':
      return { answer: ex.answer };
    default:
      return {};
  }
}

/** Structural validation used by setup.js when seeding curriculum. */
function validateExercise(ex, where) {
  const errors = [];
  const push = m => errors.push(`${where}: ${m}`);

  if (!ex || typeof ex !== 'object') return [`${where}: not an object`];
  if (!ex.id || typeof ex.id !== 'string') push('missing id');
  if (!TYPES.includes(ex.type)) push(`bad type "${ex.type}"`);
  if (!ex.q || !ex.q.uz || !ex.q.ru) push('q.uz / q.ru required');
  if (!ex.explain || !ex.explain.uz || !ex.explain.ru) push('explain.uz / explain.ru required');

  switch (ex.type) {
    case 'mc':
      if (!Array.isArray(ex.options) || ex.options.length < 2) push('mc needs >=2 options');
      else if (!ex.options.some(o => o.id === ex.answer)) push(`mc answer "${ex.answer}" not in options`);
      break;
    case 'tf':
      if (!['true', 'false'].includes(ex.answer)) push("tf answer must be 'true'|'false'");
      break;
    case 'multi':
      if (!Array.isArray(ex.options) || ex.options.length < 2) push('multi needs >=2 options');
      if (!Array.isArray(ex.answers) || ex.answers.length < 2) push('multi needs >=2 answers');
      break;
    case 'match':
      if (!Array.isArray(ex.pairs) || ex.pairs.length < 2) push('match needs >=2 pairs');
      else if (!ex.match_answer || Object.keys(ex.match_answer).length !== ex.pairs.length)
        push('match_answer must map every pair');
      else if (!ex.pairs.every(p => p && p.left && p.right && p.left.uz && p.left.ru && p.right.uz && p.right.ru))
        push('match pairs need left/right with uz+ru');
      else if (!Object.entries(ex.match_answer).every(([k, v]) =>
        ex.pairs.some(p => p.id === k) && ex.pairs.some(p => p.id === v)))
        push('match_answer must map pair ids to pair ids');
      break;
    case 'order':
      if (!Array.isArray(ex.items) || ex.items.length < 3) push('order needs >=3 items');
      if (!Array.isArray(ex.order) || !Array.isArray(ex.items)) push('order missing sequence');
      else if (ex.order.length !== ex.items.length) push('order length != items length');
      break;
    case 'input':
      if (!ex.answer) push('input needs answer');
      break;
  }
  return errors;
}

/**
 * Validate a lesson-completion submission against the authoritative exercise
 * set. The expected ids come from the curriculum, never from the request, so a
 * partial, duplicated or fabricated payload can never be graded into lesson XP,
 * completion or the perfect-lesson achievement.
 *
 * Returns { ok: true, count } when every exercise is answered exactly once, or
 * { ok: false, code, message, missing? } describing the first violation.
 * Codes: VALIDATION_ERROR | UNKNOWN_EXERCISE | DUPLICATE_EXERCISE |
 *        INCOMPLETE_SUBMISSION.
 */
function validateLessonSubmission(exercises, answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'answers[] must not be empty.' };
  }

  const expected = new Set();
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    if (ex && typeof ex.id === 'string' && ex.id) expected.add(ex.id);
  }

  const seen = new Set();
  for (const a of answers) {
    if (!a || typeof a !== 'object' || Array.isArray(a) || typeof a.id !== 'string' || !a.id) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: 'each answer must be an object with a string id.',
      };
    }
    if (!expected.has(a.id)) {
      return {
        ok: false,
        code: 'UNKNOWN_EXERCISE',
        message: `unknown exercise id "${a.id}" for this module.`,
      };
    }
    if (seen.has(a.id)) {
      return { ok: false, code: 'DUPLICATE_EXERCISE', message: `duplicate exercise id "${a.id}".` };
    }
    seen.add(a.id);
  }

  const missing = [...expected].filter(id => !seen.has(id));
  if (missing.length) {
    return {
      ok: false,
      code: 'INCOMPLETE_SUBMISSION',
      message: `missing answers for ${missing.length} exercise(s).`,
      missing,
    };
  }

  return { ok: true, count: seen.size };
}

module.exports = {
  grade,
  publicExercise,
  localizeExercise,
  answerReveal,
  validateExercise,
  validateLessonSubmission,
  normalize,
  TYPES,
};
