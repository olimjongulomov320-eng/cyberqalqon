import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeyStages, stageForPath } from './journey.ts';

test('the six stages are ordered and each has a real destination', () => {
  const stages = journeyStages();
  assert.equal(stages.length, 6);
  assert.deepEqual(
    stages.map(s => s.index),
    [1, 2, 3, 4, 5, 6]
  );
  for (const s of stages) assert.ok(s.href.startsWith('/'), `${s.key} must link to a route`);
});

test('learn and apply follow the learner\'s real position, with honest fallbacks', () => {
  const withPos = journeyStages({ continueSlug: 'intro-to-networking', checkpointSlug: 'networking-checkpoint' });
  assert.equal(withPos.find(s => s.key === 'learn')?.href, '/modules/intro-to-networking');
  assert.equal(withPos.find(s => s.key === 'apply')?.href, '/modules/networking-checkpoint');

  const without = journeyStages();
  assert.equal(without.find(s => s.key === 'learn')?.href, '/learn');
  assert.equal(without.find(s => s.key === 'apply')?.href, '/problems?difficulty=advanced');
});

test('stageForPath maps every learning route and refuses to guess elsewhere', () => {
  assert.equal(stageForPath('/learn'), 'discover');
  assert.equal(stageForPath('/modules/some-slug'), 'learn');
  assert.equal(stageForPath('/modules/some-slug', true), 'apply');
  assert.equal(stageForPath('/problems'), 'practice');
  assert.equal(stageForPath('/practice'), 'review');
  assert.equal(stageForPath('/profile'), 'master');
  assert.equal(stageForPath('/'), null);
  assert.equal(stageForPath('/leaderboard'), null);
});
