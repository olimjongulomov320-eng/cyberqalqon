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

const TYPES = ['mc', 'tf', 'multi', 'match', 'order', 'input'];

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
      return keys.every(k => normalize(value[k]) === normalize(want[k]));
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
 */
function publicExercise(ex) {
  const {
    answer, answers, order, match_answer, accepted, explain,
    ...rest
  } = ex;
  return rest;
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
      return { match_answer: ex.match_answer };
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

module.exports = { grade, publicExercise, answerReveal, validateExercise, normalize, TYPES };
