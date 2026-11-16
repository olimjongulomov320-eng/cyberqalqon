const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { SKILLS } = require('../curriculum/interviews');
const iv = require('../lib/interview');
const { loadModules } = require('../curriculum');

const hasPython = spawnSync('python3', ['--version']).status === 0;
const skipPy = hasPython ? false : 'python3 not available';

const graded = role => [...role.concepts, ...role.scenarios.flatMap(s => s.steps)];

test('interview content is complete, bilingual and consistent', () => {
  const moduleSlugs = new Set(loadModules().map(m => m.slug));
  for (const [key, s] of Object.entries(SKILLS)) {
    assert.ok(s.uz && s.ru, key);
    for (const m of s.modules) assert.ok(moduleSlugs.has(m), `${key}: unknown module ${m}`);
  }
  const ids = new Set();
  for (const role of iv.ROLES) {
    assert.equal(role.needs_review, true, `${role.slug}: drafts must stay flagged`);
    for (const l of ['uz', 'ru']) assert.ok(role.title[l] && role.summary[l], `${role.slug} ${l}`);
    for (const k of role.skills) assert.ok(SKILLS[k], `${role.slug}: unknown skill ${k}`);
    assert.ok(role.brief.length >= 3);
    for (const b of role.brief) for (const l of ['uz', 'ru']) assert.ok(b.title[l] && b.body[l].length > 200);
    assert.ok(role.concepts.length >= iv.FORMAT[0].pick);
    assert.ok(role.scenarios.length >= 2);
    for (const q of graded(role)) {
      assert.ok(SKILLS[q.skill], `unknown skill ${q.skill}`);
      for (const l of ['uz', 'ru']) {
        assert.ok(q.q[l] && q.why[l]);
        assert.equal(q.options[l].length, 4);
      }
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    }
    for (const q of role.concepts) {
      assert.equal(ids.has(q.id), false, `duplicate ${q.id}`);
      ids.add(q.id);
    }
    // The key is not always the same letter.
    assert.ok(new Set(graded(role).map(q => q.answer)).size >= 3, `${role.slug}: answers too predictable`);
    const t = role.task;
    assert.match(t.starter, new RegExp(`def ${t.entry}\\(`));
    assert.ok(t.tests.filter(c => !c.hidden).length >= 2);
    assert.ok(t.tests.filter(c => c.hidden).length >= 3);
  }
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
function failing(code, t) {
  const r = spawnSync('python3', ['-I', '-c', RUN], {
    input: JSON.stringify({ code, entry: t.entry, tests: t.tests }),
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}

test('every coding task: reference passes all tests, starter does not', { skip: skipPy }, () => {
  for (const role of iv.ROLES) {
    assert.deepEqual(failing(role.task.reference, role.task), [], role.task.slug);
    assert.ok(failing(role.task.starter, role.task).length > 0, `${role.task.slug}: starter already passes`);
  }
});

test('the paper never carries answers or explanations', () => {
  for (const role of iv.ROLES) {
    const plan = iv.makePlan(role);
    assert.equal(plan.concepts.length, iv.FORMAT[0].pick);
    assert.equal(new Set(plan.concepts).size, plan.concepts.length);
    const json = JSON.stringify(iv.paper(role, plan, 'uz'));
    assert.equal(/"answer"|"why"|"reference"/.test(json), false);
  }
});

function perfect(role, plan) {
  const byId = new Map(role.concepts.map(q => [q.id, q]));
  return {
    concepts: Object.fromEntries(plan.concepts.map(id => [id, byId.get(id).answer])),
    scenario: role.scenarios.find(s => s.id === plan.scenario).steps.map(s => s.answer),
    coding: { passed: role.task.tests.length, total: role.task.tests.length, code: 'def solve(x): pass' },
    round_seconds: iv.FORMAT.map(r => r.minutes * 60 - 30),
  };
}

test('grading: a perfect sitting scores 100, a blank one 0', () => {
  const role = iv.ROLES[0];
  const plan = iv.makePlan(role);
  const best = iv.score(role, plan, perfect(role, plan));
  assert.equal(best.overall, 100);
  assert.deepEqual(best.dims, { knowledge: 100, analysis: 100, practical: 100, time: 100 });

  const blank = { concepts: {}, scenario: [], coding: null, round_seconds: [9999, 9999, 9999] };
  const worst = iv.score(role, plan, blank);
  assert.equal(worst.overall, 0);
  assert.equal(worst.dims.time, 0);
  assert.equal(iv.verdictOf(100), 'ready');
  assert.equal(iv.verdictOf(65), 'close');
  assert.equal(iv.verdictOf(10), 'notyet');
});

test('finish payloads are validated against the session plan', () => {
  const role = iv.ROLES[1];
  const plan = iv.makePlan(role);
  const good = perfect(role, plan);
  assert.equal(iv.validateAnswers(role, plan, good), null);
  assert.match(iv.validateAnswers(role, plan, { ...good, concepts: { 'not-in-plan': 0 } }), /unknown question/);
  assert.match(iv.validateAnswers(role, plan, { ...good, scenario: [0, 0, 0, 0, 0, 0] }), /scenario/);
  assert.match(iv.validateAnswers(role, plan, { ...good, coding: { passed: 99, total: role.task.tests.length, code: 'x' } }), /coding/);
  assert.match(iv.validateAnswers(role, plan, { ...good, round_seconds: [1, 2] }), /round_seconds/);
  assert.equal(iv.validateAnswers(role, plan, { ...good, coding: null }), null);
});

test('the scorecard lists every item with its key and ranks weak skills first', () => {
  const role = iv.ROLES[2];
  const plan = iv.makePlan(role);
  const answers = { ...perfect(role, plan), coding: null };
  const { overall, dims } = iv.score(role, plan, answers);
  const r = iv.report({ id: 'x', role_slug: role.slug, plan, answers, score: overall, dims, late: false }, 'ru');
  assert.equal(r.rounds[0].items.length, plan.concepts.length);
  assert.ok(r.rounds[0].items.every(i => i.correct && i.why));
  assert.equal(r.rounds[2].attempted, false);
  assert.equal(r.skills[0].key, 'python');
  assert.equal(r.skills[0].status, 'focus');
  assert.ok(r.skills[0].modules.length > 0 && r.skills[0].modules[0].title);
});
