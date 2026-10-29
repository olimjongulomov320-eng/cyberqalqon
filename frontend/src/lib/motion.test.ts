import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stagger } from './motion.ts';

test('stagger index is clamped so long lists never wait long', () => {
  assert.deepEqual(stagger(0), { '--i': 0 });
  assert.deepEqual(stagger(5), { '--i': 5 });
  assert.deepEqual(stagger(500), { '--i': 12 });
  assert.deepEqual(stagger(-3), { '--i': 0 });
  assert.deepEqual(stagger(40, 6), { '--i': 6 });
});

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('reduced-motion and low-bandwidth modes switch every animation off', () => {
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, /animation-duration:\s*0\.01ms\s*!important/);
  assert.match(reduced, /animation-iteration-count:\s*1\s*!important/);
  assert.match(css, /\.low-bandwidth \*,[\s\S]*?animation:\s*none\s*!important/);
});

test('motion only animates transform, opacity and (one-shot) box-shadow', () => {
  // Read every @keyframes block with balanced braces and refuse layout properties.
  const frames: [string, string][] = [];
  for (const m of Array.from(css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g))) {
    let depth = 1;
    let i = (m.index ?? 0) + m[0].length;
    const start = i;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    frames.push([m[1], css.slice(start, i - 1)]);
  }
  assert.ok(frames.length >= 10, `keyframes parsed (${frames.length})`);
  const banned = /\b(width|height|top|left|right|bottom|margin|padding)\s*:/;
  for (const [name, body] of frames) assert.equal(banned.test(body), false, `${name} animates a layout property`);
});
