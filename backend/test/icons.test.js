const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { PATHS, DOMAINS } = require('../curriculum');
const { TRACKS } = require('../curriculum/tracks');

// The frontend registry is TSX, so read its keys as text (no build needed).
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'icons.tsx'), 'utf8');
const block = src.slice(src.indexOf('export const CONTENT_ICONS'), src.indexOf('export function hasContentIcon'));
const registry = new Set([...block.matchAll(/^\s+'?([a-z-]+)'?:\s+[A-Z]/gm)].map(m => m[1]));

test('the frontend icon registry was parsed', () => {
  assert.ok(registry.size >= 20, `parsed ${registry.size} keys`);
});

test('every icon in curriculum data is a registered icon key, never an emoji', () => {
  const used = [
    ...PATHS.map(p => ['path ' + p.slug, p.icon]),
    ...DOMAINS.map(d => ['domain ' + d.slug, d.icon]),
    ...TRACKS.map(t => ['track ' + t.slug, t.icon]),
  ];
  for (const [what, icon] of used) {
    assert.match(icon, /^[a-z-]+$/, `${what}: "${icon}" is not an icon key`);
    assert.ok(registry.has(icon), `${what}: "${icon}" is not in CONTENT_ICONS`);
  }
});
