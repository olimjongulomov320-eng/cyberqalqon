/**
 * Pure assessment logic: drawing questions and scoring. No I/O, so the rules
 * are unit-tested without a database.
 */
const { grade } = require('./grade');

/** Fisher–Yates with an injectable rng (tests pass a seeded one). */
function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` distinct questions spread across modules: modules are visited in
 * random order, round-robin, taking one unused exercise from each per round, so
 * a single large module cannot dominate the paper.
 *
 * @param {{module_slug: string, exercise_id: string}[]} pool
 * @returns {{m: string, e: string}[]} refs (module slug, exercise id)
 */
function drawQuestions(pool, count, rng = Math.random) {
  const byModule = new Map();
  for (const p of pool) {
    if (!byModule.has(p.module_slug)) byModule.set(p.module_slug, []);
    byModule.get(p.module_slug).push(p.exercise_id);
  }
  const queues = shuffle([...byModule.entries()], rng).map(([m, ids]) => ({ m, ids: shuffle(ids, rng) }));

  const out = [];
  while (out.length < count && queues.some(q => q.ids.length)) {
    for (const q of queues) {
      if (out.length >= count) break;
      if (q.ids.length) out.push({ m: q.m, e: q.ids.pop() });
    }
  }
  return out;
}

/**
 * Score a submission against the stored question refs.
 *
 * @param refs        [{m, e}] in question order
 * @param exercises   Map "module::exerciseId" → stored exercise
 * @param answers     [{n, value}] — n is the question index; unknown, duplicate
 *                    or out-of-range entries are ignored (first one wins)
 * @param passMark    percent needed to pass
 */
function scoreAttempt(refs, exercises, answers, passMark) {
  const byN = new Map();
  for (const a of Array.isArray(answers) ? answers : []) {
    if (a && Number.isInteger(a.n) && a.n >= 0 && a.n < refs.length && !byN.has(a.n)) byN.set(a.n, a.value);
  }

  const results = refs.map((r, n) => {
    const ex = exercises.get(`${r.m}::${r.e}`);
    const answered = byN.has(n);
    const correct = Boolean(ex) && answered && grade(ex, byN.get(n)) === true;
    return { n, module_slug: r.m, exercise_id: r.e, answered, correct };
  });

  const total = refs.length;
  const score = results.filter(r => r.correct).length;
  const percent = total ? Math.round((score / total) * 100) : 0;

  const per_module = {};
  for (const r of results) {
    const m = (per_module[r.module_slug] ??= { correct: 0, total: 0 });
    m.total++;
    if (r.correct) m.correct++;
  }

  return { results, score, total, percent, passed: total > 0 && percent >= passMark, per_module };
}

/** Unfinished attempts expire at `expires_at`; submit allows a small network grace. */
const SUBMIT_GRACE_SECONDS = 30;

module.exports = { shuffle, drawQuestions, scoreAttempt, SUBMIT_GRACE_SECONDS };
