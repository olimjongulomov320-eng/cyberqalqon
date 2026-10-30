const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AGE_GROUPS, SLUGS, isAgeGroup, isMinor, isUnder13, DEFAULT_GROUP } = require('../curriculum/ageGroups');
const { PATHS, DOMAINS, seedData } = require('../curriculum');

const { modules } = seedData();
const pathOf = slug => PATHS.find(p => p.slug === slug);
const modulesOfGroup = g => {
  const domains = DOMAINS.filter(d => d.path === g.path).map(d => d.slug);
  return modules.filter(m => domains.includes(m.domain));
};

test('the five age groups are defined in order, with the adult course as the default', () => {
  assert.deepEqual(SLUGS, ['1-4', '5-7', '8-12', '13-17', '18+']);
  assert.equal(DEFAULT_GROUP, '18+');
  assert.equal(isAgeGroup('5-7'), true);
  assert.equal(isAgeGroup('5-8'), false);
  assert.equal(isAgeGroup(undefined), false);
});

test('every group points at a real path that points back at it', () => {
  for (const g of AGE_GROUPS) {
    const p = pathOf(g.path);
    assert.ok(p, `${g.slug}: path ${g.path} is missing`);
    assert.equal(p.age_group, g.slug, `${g.path} should carry age_group ${g.slug}`);
    for (const l of ['uz', 'ru']) assert.ok(g.title[l] && g.who[l] && g.description[l], `${g.slug} ${l} copy`);
  }
  for (const p of PATHS) assert.ok(SLUGS.includes(p.age_group), `${p.slug} has an unknown age_group`);
});

test('every age path has lessons to take', () => {
  for (const g of AGE_GROUPS) {
    const mods = modulesOfGroup(g);
    assert.ok(mods.length >= 4, `${g.slug}: only ${mods.length} modules`);
    for (const m of mods) assert.ok(m.exercises.length >= 3, `${m.slug}: needs at least 3 exercises`);
  }
});

test('minor and under-13 flags match the groups', () => {
  assert.equal(isMinor('1-4') && isMinor('5-7') && isMinor('8-12') && isMinor('13-17'), true);
  assert.equal(isMinor('18+'), false);
  assert.equal(isMinor(undefined), false);
  assert.equal(isMinor(null), false);
  assert.equal(isUnder13('8-12'), true);
  assert.equal(isUnder13('13-17'), false);
  assert.equal(isUnder13('18+'), false);
});

test('children\'s content is flagged as draft for review', () => {
  for (const g of AGE_GROUPS.filter(x => x.minor)) {
    for (const m of modulesOfGroup(g)) assert.equal(m.needs_review, true, m.slug);
  }
});

test('children\'s content has no links, emoji or Cyrillic in the Uzbek text', () => {
  const walk = (v, where, out) => {
    if (typeof v === 'string') out.push([where, v]);
    else if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], `${where}.${k}`, out);
  };
  for (const g of AGE_GROUPS.filter(x => x.minor)) {
    for (const m of modulesOfGroup(g)) {
      const strings = [];
      walk(m, m.slug, strings);
      for (const [where, s] of strings) {
        assert.doesNotMatch(s, /https?:\/\/|www\./i, `${where} contains a link`);
        assert.doesNotMatch(s, /\p{Extended_Pictographic}/u, `${where} contains an emoji`);
        if (where.endsWith('.uz')) assert.doesNotMatch(s, /[Ѐ-ӿ]/, `${where} has Cyrillic in Uzbek text`);
        if (where.endsWith('.ru')) assert.doesNotMatch(s, /[ʻʼ]|o‘|g‘/, `${where} has Uzbek letters in Russian text`);
      }
    }
  }
});

test('ages 5-7 get short, closed questions only', () => {
  const g = AGE_GROUPS.find(x => x.slug === '5-7');
  for (const m of modulesOfGroup(g)) {
    for (const ex of m.exercises) {
      assert.ok(['mc', 'tf', 'multi', 'order'].includes(ex.type), `${m.slug}/${ex.id}: ${ex.type} is too hard to type or match at this age`);
      assert.ok(ex.q.uz.length <= 90 && ex.q.ru.length <= 90, `${m.slug}/${ex.id}: question too long`);
      if (ex.options) assert.ok(ex.options.length <= 4, `${m.slug}/${ex.id}: too many options`);
    }
  }
});

test('the parent path asks nothing of a child and the other paths are not adult-only wording', () => {
  const g = AGE_GROUPS.find(x => x.slug === '1-4');
  assert.equal(g.audience, 'parent');
  for (const m of modulesOfGroup(g)) {
    for (const ex of m.exercises) assert.notEqual(ex.type, 'input', `${m.slug}/${ex.id}: typing is not a parent task`);
  }
});

test('the pressure lesson never names an invented hotline number', () => {
  const m = modules.find(x => x.slug === 'pressure-and-blackmail');
  const text = JSON.stringify(m);
  assert.doesNotMatch(text, /\+?\d[\d\s-]{6,}\d/, 'a phone number must come from the project owner, verified');
  assert.match(m.content.ru, /не виноват/);
  assert.match(m.content.uz, /aybing emas/);
});
