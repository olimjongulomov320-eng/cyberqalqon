import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripLeadingTitle } from './lesson.ts';

test('removes a leading heading that repeats the title', () => {
  const md = "## Zaxira nusxa va ma'lumotni himoya\n\nBackup - nusxa.\n\n- a\n- b";
  assert.equal(stripLeadingTitle(md, "Zaxira nusxa va ma'lumotni himoya"), 'Backup - nusxa.\n\n- a\n- b');
});

test('ignores case, punctuation and heading level', () => {
  assert.equal(stripLeadingTitle('# Резервные копии: защита!\n\nТекст', 'резервные копии защита'), 'Текст');
  assert.equal(stripLeadingTitle('### Title\nbody', 'TITLE'), 'body');
});

test('keeps a first heading that is a different section', () => {
  const md = '## Why it matters\n\nBody';
  assert.equal(stripLeadingTitle(md, 'Backups'), md);
});

test('only the very first heading is considered', () => {
  const md = 'Intro line\n\n## Backups\n\nBody';
  assert.equal(stripLeadingTitle(md, 'Backups'), md);
});

test('empty or heading-less content is returned unchanged', () => {
  assert.equal(stripLeadingTitle('', 'X'), '');
  assert.equal(stripLeadingTitle('plain text', 'plain text'), 'plain text');
});
