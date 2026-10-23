import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { t, LANGS } from './i18n.ts';

/**
 * Every translation key the UI asks for must exist in BOTH locales.
 *
 * `makeT` silently falls back to the Uzbek string (and then to the key
 * itself), so a missing Russian entry renders Uzbek text with no error
 * anywhere. This test closes that gap by walking the real source: any
 * `tr('someKey')` / `tr(\`someKey\`)` literal must resolve in uz and ru.
 */

const SRC = join(import.meta.dirname, '..');
const KEY_PATTERN = /\btr\(\s*'([A-Za-z0-9_]+)'/g;
// Keys assembled dynamically (maps of keys) can't be read as literals; their
// values live in the constants below, which we also scan as plain lists.
const DYNAMIC = /([A-Za-z0-9_]+Key|Label)\s*:\s*'([A-Za-z0-9_]+)'/g;
// …and maps written the other way around: `mc: 'hintStrategyMc'` inside
// STRATEGY_KEY / CORRECT_KEY / PROF_KEY / LENGTH_KEY.
const MAP_VALUE = /:\s*'((?:hint|prof|stage|discover|review|trend|skills|correct)[A-Za-z0-9_]+)'/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') && name !== 'i18n.ts') {
      // i18n.ts is the dictionary itself: `key: 'value'` there would be read
      // as a usage of the value, so it is never scanned.
      out.push(full);
    }
  }
  return out;
}

function collectKeys(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const file of walk(SRC)) {
    const source = readFileSync(file, 'utf8');
    for (const re of [KEY_PATTERN, DYNAMIC, MAP_VALUE]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(source))) {
        const key = m[2] ?? m[1];
        if (!found.has(key)) found.set(key, []);
        found.get(key)!.push(file.slice(SRC.length + 1));
      }
    }
  }
  return found;
}

test('every tr() key used in the source exists in both locales', () => {
  const used = collectKeys();
  assert.ok(used.size > 50, 'expected to find translation keys in the source');

  const missing: string[] = [];
  // Array.from, not spread: this file is typechecked with the project's ES5
  // target, where spreading a Map/Set is an error under downlevelIteration.
  for (const entry of Array.from(used)) {
    const key = entry[0];
    const files = entry[1];
    for (const lang of LANGS) {
      if (typeof t[lang][key] !== 'string') {
        missing.push(`${lang}.${key} (used in ${Array.from(new Set(files)).join(', ')})`);
      }
    }
  }
  assert.deepEqual(missing, [], `missing translations:\n${missing.join('\n')}`);
});

test('the locale dictionaries carry no unused orphan keys for new surfaces', () => {
  // Not every key is a literal (achievement keys are built as `ach_${k}_t`),
  // so this only checks the journey/directory/hint/skill families we added
  // in the redesign — the ones most likely to drift.
  const used = collectKeys();
  const families = ['stage', 'hint', 'prof', 'review', 'discover', 'trend', 'skills', 'correct'];
  const orphans: string[] = [];
  for (const lang of LANGS) {
    for (const key of Object.keys(t[lang])) {
      if (!families.some(f => key.startsWith(f))) continue;
      if (key === 'correctTitle' || key === 'correct') continue; // lesson verdict
      if (!used.has(key)) orphans.push(`${lang}.${key}`);
    }
  }
  assert.deepEqual(orphans, [], `dictionary keys no screen uses:\n${orphans.join('\n')}`);
});
