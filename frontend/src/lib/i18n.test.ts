import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t, LANGS } from './i18n.ts';
import { LEGAL } from './legal.ts';

test('every locale defines the same set of keys', () => {
  const expected = Object.keys(t.uz).sort();
  for (const lang of LANGS) {
    assert.deepEqual(Object.keys(t[lang]).sort(), expected, `locale "${lang}" key drift`);
  }
});

test('no translation value is empty', () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(t[lang])) {
      assert.equal(typeof value, 'string', `${lang}.${key} must be a string`);
      assert.ok(value.trim().length > 0, `${lang}.${key} must not be empty`);
    }
  }
});

test('legal documents are present and complete in both locales', () => {
  for (const kind of ['privacy', 'terms'] as const) {
    for (const lang of LANGS) {
      const doc = LEGAL[kind][lang];
      assert.ok(doc, `${kind}.${lang} is missing`);
      assert.ok(doc.title.trim().length > 0, `${kind}.${lang}.title`);
      assert.ok(doc.note.trim().length > 0, `${kind}.${lang}.note`);
      assert.ok(doc.sections.length > 0, `${kind}.${lang}.sections`);
      for (const section of doc.sections) {
        assert.ok(section.heading.trim().length > 0, `${kind}.${lang} section heading`);
      }
    }
  }
});
