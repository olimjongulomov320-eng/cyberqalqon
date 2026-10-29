import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Contrast guard for the design tokens in globals.css. Parses the real CSS
 * variables (so the test can never drift from the stylesheet) and checks WCAG
 * contrast for the text/surface pairs the UI actually uses, in both themes.
 */
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

function block(selector: string): Record<string, [number, number, number]> {
  const start = css.indexOf(selector);
  const open = css.indexOf('{', start);
  const close = css.indexOf('\n  }', open);
  const body = css.slice(open + 1, close);
  const out: Record<string, [number, number, number]> = {};
  for (const m of Array.from(body.matchAll(/--([a-z0-9-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g))) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

const lum = ([r, g, b]: number[]) => {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const dark = block(':root {');
const light = { ...dark, ...block(":root[data-theme='light']") };

// [foreground token, background token, minimum ratio, what it is]
const PAIRS: [string, string, number, string][] = [
  ['text-primary', 'surface-900', 4.5, 'body text on cards'],
  ['text-primary', 'surface-950', 4.5, 'body text on page'],
  ['text-secondary', 'surface-900', 4.5, 'secondary text on cards'],
  ['text-secondary', 'surface-950', 4.5, 'secondary text on page'],
  ['text-muted', 'surface-900', 4.5, 'muted text on cards'],
  ['text-muted', 'surface-800', 4.5, 'muted text on raised'],
  ['cyan-400', 'surface-900', 4.5, 'links/icons on cards'],
  ['cyan-300', 'surface-900', 4.5, 'emphasis text on cards'],
  ['text-inverse', 'cyan-400', 4.5, 'primary button label'],
  ['text-inverse', 'success', 4.5, 'success button label'],
  ['success', 'surface-900', 4.5, 'success text'],
  ['warning', 'surface-900', 4.5, 'XP / warning text'],
  ['danger', 'surface-900', 4.5, 'error text'],
];

for (const [themeName, tokens] of [['dark', dark], ['light', light]] as const) {
  test(`${themeName} theme: key text/surface pairs meet WCAG AA`, () => {
    const failures: string[] = [];
    for (const [fg, bg, min, what] of PAIRS) {
      const r = ratio(tokens[fg], tokens[bg]);
      if (r < min) failures.push(`${what}: ${fg} on ${bg} = ${r.toFixed(2)} (< ${min})`);
    }
    assert.deepEqual(failures, []);
  });
}

test('danger button label (white) is legible on the danger fill in both themes', () => {
  for (const tokens of [dark, light]) assert.ok(ratio([255, 255, 255], tokens['danger-dark']) >= 4.5);
});

/**
 * Regression guard: a fixed palette shade (cyan-100/200, amber-*, slate-* ...)
 * looks fine in dark mode and vanishes in light mode. Colours must come from the
 * themed tokens, so none of the fixed shades may appear in the UI source.
 */
test('no fixed palette shades that would be unreadable in the light theme', async () => {
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  const root = new URL('..', import.meta.url).pathname;
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx|css)$/.test(name)) files.push(p);
    }
  };
  walk(root);
  const bad: string[] = [];
  const re = /(?:text|bg|border|ring|fill|stroke)-(?:cyan-(?:50|100|200)|amber|emerald|slate|sky|rose|zinc|gray|neutral|stone|lime|teal|violet|purple|indigo|blue|red|orange|yellow|green)-\d+|colors\.(?:slate|gray|zinc)\./g;
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    for (const m of Array.from(text.matchAll(re))) bad.push(`${f.replace(root, '')}: ${m[0]}`);
  }
  assert.deepEqual(bad, []);
});
