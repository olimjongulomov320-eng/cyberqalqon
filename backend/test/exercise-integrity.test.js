const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { grade, answerReveal, localizeExercise, validateExercise } = require('../lib/grade');
const { seedData } = require('../curriculum');

const { modules } = seedData();
const all = modules.flatMap(m => m.exercises.map(ex => ({ m, ex })));

test('every curriculum exercise still validates', () => {
  const errs = all.flatMap(({ m, ex }) => validateExercise(ex, `${m.slug}/${ex.id}`));
  assert.deepEqual(errs, []);
});

test('match: the public payload never pairs a left with its true right', () => {
  const matches = all.filter(({ ex }) => ex.type === 'match');
  assert.ok(matches.length > 0);
  for (const { ex } of matches) {
    const pub = localizeExercise(ex, 'uz');
    for (const p of pub.pairs) {
      const real = ex.pairs.find(q => q.id === p.id);
      assert.notEqual(p.right, real.right.uz, `${ex.id}: ${p.id} leaks its own right`);
    }
  }
});

test('match: revealed answer, applied by the client, is graded correct', () => {
  for (const { ex } of all.filter(({ ex }) => ex.type === 'match')) {
    const { match_answer } = answerReveal(ex);
    assert.equal(grade(ex, match_answer), true, ex.id);
    // the raw (identity) mapping must NOT grade correct any more
    assert.equal(grade(ex, ex.match_answer), false, `${ex.id}: identity mapping still accepted`);
  }
});

test('match: the displayed right text for the revealed id is the correct one', () => {
  for (const { ex } of all.filter(({ ex }) => ex.type === 'match')) {
    const pub = localizeExercise(ex, 'ru');
    const { match_answer } = answerReveal(ex);
    for (const [leftId, viewId] of Object.entries(match_answer)) {
      const shown = pub.pairs.find(p => p.id === viewId).right;
      const truth = ex.pairs.find(p => p.id === ex.match_answer[leftId]).right.ru;
      assert.equal(shown, truth, ex.id);
    }
  }
});

test('order: served items are never in the correct sequence', () => {
  for (const { ex } of all.filter(({ ex }) => ex.type === 'order')) {
    const ids = localizeExercise(ex, 'uz').items.map(i => i.id);
    assert.notDeepEqual(ids, ex.order, ex.id);
    assert.equal(grade(ex, ex.order), true);
  }
});

test('mc/multi: option order is shuffled, ids and grading unchanged', () => {
  const mcs = all.filter(({ ex }) => ex.type === 'mc');
  let firstIsAnswer = 0;
  for (const { ex } of mcs) {
    const pub = localizeExercise(ex, 'uz');
    assert.deepEqual(pub.options.map(o => o.id).sort(), ex.options.map(o => o.id).sort());
    if (pub.options[0].id === ex.answer) firstIsAnswer++;
    assert.equal(grade(ex, ex.answer), true);
  }
  // Authored data has the answer first ~85% of the time; shuffled it must not.
  assert.ok(firstIsAnswer / mcs.length < 0.5, `first option is the answer ${firstIsAnswer}/${mcs.length}`);
});

test('public exercise never contains answer keys', () => {
  for (const { ex } of all) {
    const pub = localizeExercise(ex, 'uz');
    for (const k of ['answer', 'answers', 'order', 'match_answer', 'accepted', 'explain']) {
      assert.equal(k in pub, false, `${ex.id} leaks ${k}`);
    }
  }
});

test('frontend module-slugs.json matches the curriculum', () => {
  const file = path.join(__dirname, '..', '..', 'frontend', 'src', 'lib', 'module-slugs.json');
  const committed = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual(committed, modules.map(m => m.slug).sort());
});
