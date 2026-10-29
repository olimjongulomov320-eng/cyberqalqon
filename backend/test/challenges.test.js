const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { CHALLENGES, DIFFICULTIES, MAX_CODE_BYTES, bySlug, summary, detail, validateReport } = require('../lib/challenges');
const { loadModules } = require('../curriculum');

const hasPython = spawnSync('python3', ['--version']).status === 0;
const skipPy = hasPython ? false : 'python3 not available';

test('challenge content is complete, bilingual and well-formed', () => {
  const slugs = new Set();
  const moduleSlugs = new Set(loadModules().map(m => m.slug));
  for (const c of CHALLENGES) {
    assert.match(c.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.equal(slugs.has(c.slug), false, `duplicate ${c.slug}`);
    slugs.add(c.slug);
    assert.ok(DIFFICULTIES.includes(c.difficulty), c.slug);
    assert.ok(Number.isInteger(c.points) && c.points > 0);
    assert.ok(c.tags.length >= 1);
    assert.equal(c.language, 'python');
    assert.equal(c.needs_review, true, `${c.slug}: drafts must stay flagged`);
    assert.ok(moduleSlugs.has(c.module), `${c.slug}: unknown module ${c.module}`);
    for (const l of ['uz', 'ru']) {
      assert.ok(c.title[l] && c.statement[l] && c.constraints[l], `${c.slug} ${l}`);
    }
    assert.match(c.starter, new RegExp(`def ${c.entry}\\(`));
    assert.ok(c.examples.length >= 1);
    assert.ok(c.tests.filter(t => !t.hidden).length >= 2, `${c.slug}: needs >=2 visible tests`);
    assert.ok(c.tests.filter(t => t.hidden).length >= 3, `${c.slug}: needs >=3 hidden tests`);
    for (const t of c.tests) assert.deepEqual(JSON.parse(JSON.stringify(t)), t, 'tests must be plain JSON');
  }
  assert.ok(CHALLENGES.length >= 12);
  for (const d of DIFFICULTIES) assert.ok(CHALLENGES.some(c => c.difficulty === d), `no ${d} challenge`);
});

const RUN = `
import json, sys
spec = json.load(sys.stdin)
ns = {}
exec(spec["code"], ns)
fn = ns[spec["entry"]]
bad = []
for i, t in enumerate(spec["tests"]):
    try:
        got = json.loads(json.dumps(fn(*t["args"])))
    except Exception as e:
        got = "EXC:" + type(e).__name__
    if got != t["expected"]:
        bad.append(i)
print(json.dumps(bad))
`;
function runPython(code, c) {
  const r = spawnSync('python3', ['-I', '-c', RUN], {
    input: JSON.stringify({ code, entry: c.entry, tests: c.tests }),
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}

test('every reference solution passes every test (independent python3 check)', { skip: skipPy }, () => {
  for (const c of CHALLENGES) assert.deepEqual(runPython(c.reference, c), [], c.slug);
});

test('the starter code does NOT already solve the challenge', { skip: skipPy }, () => {
  for (const c of CHALLENGES) assert.ok(runPython(c.starter, c).length > 0, `${c.slug} starter already passes`);
});

test('API shapes never contain the reference solution', () => {
  for (const c of CHALLENGES) {
    for (const lang of ['uz', 'ru']) {
      const json = JSON.stringify([summary(c, lang), detail(c, lang)]);
      assert.equal(json.includes('"reference"'), false);
      assert.equal(json.includes(c.reference.split('\n')[1]?.trim() ?? '\u0000'), false, `${c.slug} leaks solution text`);
    }
    assert.equal(JSON.stringify(summary(c, 'uz')).includes('"tests"'), false, 'list rows carry no tests');
  }
});

test('submit validation: counts are checked, solved is derived', () => {
  const c = bySlug.get('reverse-string');
  const n = c.tests.length;
  assert.deepEqual(validateReport(c, { passed: n, total: n, code: 'x=1' }), { ok: true, solved: true });
  assert.deepEqual(validateReport(c, { passed: n - 1, total: n, code: 'x=1' }), { ok: true, solved: false });
  assert.equal(validateReport(c, { passed: n, total: n + 1, code: 'x' }).ok, false, 'wrong total');
  assert.equal(validateReport(c, { passed: n + 1, total: n, code: 'x' }).ok, false, 'passed > total');
  assert.equal(validateReport(c, { passed: -1, total: n, code: 'x' }).ok, false);
  assert.equal(validateReport(c, { passed: 1.5, total: n, code: 'x' }).ok, false);
  assert.equal(validateReport(c, { passed: n, total: n, code: '   ' }).ok, false);
  assert.equal(validateReport(c, { passed: n, total: n, code: 'a'.repeat(MAX_CODE_BYTES + 1) }).ok, false);
  assert.equal(validateReport(c, null).ok, false);
  assert.equal(validateReport(c, { solved: true, code: 'x' }).ok, false, 'a bare solved flag is not accepted');
});
