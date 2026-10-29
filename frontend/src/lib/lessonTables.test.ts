import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

// Lessons are authored in the backend curriculum. Every pipe table in them has
// to come out of the lesson renderer (react-markdown + remark-gfm) as a real
// table; without GFM they show up as a line of raw pipes.
const require = createRequire(import.meta.url);
const { modules } = require('../../../backend/curriculum').seedData() as {
  modules: { slug: string; content: Record<'uz' | 'ru', string> }[];
};

const parser = unified().use(remarkParse).use(remarkGfm);

function tableCount(md: string): number {
  let n = 0;
  const walk = (node: { type: string; children?: unknown[] }) => {
    if (node.type === 'table') n += 1;
    (node.children ?? []).forEach(c => walk(c as { type: string; children?: unknown[] }));
  };
  walk(parser.parse(md) as { type: string; children?: unknown[] });
  return n;
}

test('every pipe table in a lesson parses as a table', () => {
  let seen = 0;
  for (const m of modules) {
    for (const lang of ['uz', 'ru'] as const) {
      const md = m.content[lang];
      // A table starts at a delimiter row such as |---|---|.
      const expected = (md.match(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/gm) ?? []).length;
      assert.equal(tableCount(md), expected, `${m.slug} (${lang}): ${expected} table(s) written, ${tableCount(md)} rendered`);
      seen += expected;
    }
  }
  assert.ok(seen > 0, 'expected the curriculum to contain tables');
});
