const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { TRACKS, trackOfModule } = require('../curriculum/tracks');
const { seedData } = require('../curriculum');
const { computeMastery, MIN_EXERCISES } = require('../lib/mastery');

const { modules, domains } = seedData();
const slugs = new Set(modules.map(m => m.slug));

test('every track module exists in the curriculum', () => {
  for (const t of TRACKS) for (const m of t.modules) assert.ok(slugs.has(m), `${t.slug} -> ${m}`);
});

test('a module belongs to at most one track', () => {
  const seen = new Map();
  for (const t of TRACKS) {
    for (const m of t.modules) {
      assert.equal(seen.has(m), false, `${m} is in ${seen.get(m)} and ${t.slug}`);
      seen.set(m, t.slug);
    }
  }
});

test('tracks are complete, bilingual and consistent', () => {
  const trackSlugs = new Set(TRACKS.map(t => t.slug));
  assert.equal(trackSlugs.size, TRACKS.length);
  for (const t of TRACKS) {
    for (const l of ['uz', 'ru']) {
      assert.ok(t.title[l] && t.description[l], `${t.slug} ${l} copy`);
      assert.ok(t.objectives[l].length >= 3, `${t.slug} ${l} objectives`);
    }
    assert.equal(t.objectives.uz.length, t.objectives.ru.length);
    for (const p of t.prerequisites) assert.ok(trackSlugs.has(p), `${t.slug} prerequisite ${p}`);
    assert.ok(t.modules.length >= 3);
  }
});

test('tracks never move modules between domains (domains are untouched)', () => {
  const known = new Set(domains.map(d => d.slug));
  for (const m of modules) assert.ok(known.has(m.domain), m.slug);
  assert.equal(trackOfModule().get('phishing-basics'), 'phishing-and-social-engineering');
  assert.equal(modules.find(m => m.slug === 'phishing-basics').domain, 'web-security');
});

test('draft content is flagged and uses only fictional example.* hosts', () => {
  for (const file of ['phishing', 'privacy']) {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'curriculum', `${file}.js`), 'utf8');
    for (const m of require(`../curriculum/${file}.js`)) assert.equal(m.needs_review, true, m.slug);
    const hosts = [...raw.matchAll(/(?:https?:\/\/|[\w.-]+@)([a-z0-9.-]+\.[a-z]{2,})/gi)].map(x => x[1].toLowerCase());
    for (const h of hosts) assert.match(h, /(^|\.)example\.(com|net|org)$/, `non-fictional host: ${h}`);
  }
});

test('review list mentions every draft module', () => {
  const doc = fs.readFileSync(path.join(__dirname, '..', '..', 'CONTENT_REVIEW.md'), 'utf8');
  for (const m of modules.filter(x => x.needs_review)) assert.ok(doc.includes(m.slug), m.slug);
});

test('mastery: states and the 5-exercise / 80% boundary', () => {
  const v = (c, n) => Array.from({ length: n }, () => ({ correct: c }));
  assert.equal(computeMastery([]).state, 'not_started');
  assert.equal(computeMastery([]).accuracy, null);
  assert.equal(computeMastery(v(true, MIN_EXERCISES - 1)).state, 'practising'); // too few
  assert.equal(computeMastery(v(true, 5)).state, 'mastered');
  assert.equal(computeMastery([...v(true, 4), ...v(false, 1)]).state, 'mastered'); // exactly 80%
  assert.equal(computeMastery([...v(true, 3), ...v(false, 2)]).state, 'practising'); // 60%
  assert.equal(computeMastery([...v(true, 7), ...v(false, 2)]).accuracy, 78); // 7/9 < 80%
  assert.equal(computeMastery([...v(true, 7), ...v(false, 2)]).state, 'practising');
  assert.equal(computeMastery(v(true, 3)).needed, 2);
});

test('mastery: ignores malformed entries instead of crashing', () => {
  assert.equal(computeMastery(null).state, 'not_started');
  assert.equal(computeMastery([null, undefined, { correct: 'yes' }]).correct, 0);
});
