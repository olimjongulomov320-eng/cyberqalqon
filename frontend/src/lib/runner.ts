/**
 * Pure evaluation of a challenge run. The browser worker only executes code and
 * returns raw values; deciding pass/fail happens here so it can be unit-tested
 * and so hidden-test details stay out of what the UI renders.
 */

export interface TestCase {
  args: unknown[];
  expected: unknown;
  hidden: boolean;
}

export type RawCase = { ok: true; value: unknown } | { ok: false; error: string };

export interface RunnerReply {
  ok: boolean;
  error?: string;
  compile_error?: string;
  results?: RawCase[];
  stdout?: string;
}

export interface CaseOutcome {
  index: number;
  hidden: boolean;
  passed: boolean;
  /** Only populated for visible tests. */
  args?: unknown[];
  expected?: unknown;
  got?: unknown;
  error?: string;
}

export interface Evaluation {
  compileError?: string;
  runnerError?: string;
  outcomes: CaseOutcome[];
  passed: number;
  total: number;
  allPassed: boolean;
}

/** JSON-structural equality (key order and array order matter only where JSON says so). */
export function jsonEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => jsonEqual(v, b[i]));
  }
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  return (
    ka.length === kb.length &&
    ka.every(k => k in (b as object) && jsonEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  );
}

/**
 * @param only  restrict to these test indexes (the "Run" button runs samples only)
 */
export function evaluate(tests: TestCase[], reply: RunnerReply, only?: number[]): Evaluation {
  const picked = tests.map((t, i) => ({ t, i })).filter(({ i }) => !only || only.includes(i));
  const total = picked.length;

  if (!reply.ok) return { runnerError: reply.error ?? 'runner failed', outcomes: [], passed: 0, total, allPassed: false };
  if (reply.compile_error) {
    return { compileError: reply.compile_error, outcomes: [], passed: 0, total, allPassed: false };
  }

  const results = reply.results ?? [];
  const outcomes: CaseOutcome[] = picked.map(({ t, i }, pos) => {
    const r = results[pos];
    const base: CaseOutcome = { index: i, hidden: t.hidden, passed: false };
    const show = !t.hidden;
    if (!r) return { ...base, error: 'no result' };
    if (!r.ok) return { ...base, ...(show ? { args: t.args, expected: t.expected } : {}), error: show ? r.error : undefined };
    const passed = jsonEqual(r.value, t.expected);
    return { ...base, passed, ...(show ? { args: t.args, expected: t.expected, got: r.value } : {}) };
  });

  const passed = outcomes.filter(o => o.passed).length;
  return { outcomes, passed, total, allPassed: total > 0 && passed === total };
}

/** Indexes of the visible (sample) tests. */
export function sampleIndexes(tests: TestCase[]): number[] {
  return tests.map((t, i) => (t.hidden ? -1 : i)).filter(i => i >= 0);
}

/** Compact "f(1, 'a')" rendering of a call, for the results list. */
export function formatCall(entry: string, args: unknown[]): string {
  return `${entry}(${args.map(a => JSON.stringify(a)).join(', ')})`;
}
