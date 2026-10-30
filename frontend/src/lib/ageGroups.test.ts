import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { AGE_GROUPS, AGE_SLUGS, isMinor, isUnder13, scopePaths } from './ageGroups.ts';

const require = createRequire(import.meta.url);
const backend = require('../../../backend/curriculum/ageGroups') as {
  AGE_GROUPS: { slug: string; icon: string; minor: boolean; under13: boolean; audience: string; title: Record<string, string>; who: Record<string, string>; description: Record<string, string> }[];
};

test('the frontend age groups match the backend exactly', () => {
  assert.deepEqual(AGE_SLUGS, backend.AGE_GROUPS.map(g => g.slug));
  for (const b of backend.AGE_GROUPS) {
    const f = AGE_GROUPS.find(g => g.slug === b.slug)!;
    assert.ok(f, b.slug);
    assert.equal(f.icon, b.icon, `${b.slug} icon`);
    assert.equal(f.minor, b.minor, `${b.slug} minor`);
    assert.equal(f.under13, b.under13, `${b.slug} under13`);
    assert.equal(f.audience, b.audience, `${b.slug} audience`);
    for (const l of ['uz', 'ru']) {
      assert.equal(f.title[l as 'uz'], b.title[l], `${b.slug} title ${l}`);
      assert.equal(f.who[l as 'uz'], b.who[l], `${b.slug} who ${l}`);
      assert.equal(f.description[l as 'uz'], b.description[l], `${b.slug} description ${l}`);
    }
  }
});

test('minor rules', () => {
  assert.equal(isMinor('13-17'), true);
  assert.equal(isMinor('18+'), false);
  assert.equal(isMinor(null), false);
  assert.equal(isUnder13('8-12'), true);
  assert.equal(isUnder13('13-17'), false);
});

test('scopePaths offers the chosen group first, or everything on request', () => {
  const paths = [
    { slug: 'adult', age_group: '18+' },
    { slug: 'kids', age_group: '5-7' },
    { slug: 'adult2', age_group: '18+' },
  ];
  assert.deepEqual(scopePaths(paths, '5-7', false).map(p => p.slug), ['kids']);
  assert.deepEqual(scopePaths(paths, null, false).map(p => p.slug), ['adult', 'adult2']);
  assert.equal(scopePaths(paths, '5-7', true).length, 3);
  // a group with no path never leaves the page empty
  assert.equal(scopePaths(paths, '13-17', false).length, 3);
});
