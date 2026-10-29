import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isThemePref, nextTheme, resolveTheme, THEME_BOOTSTRAP } from './theme.ts';

test('system follows the OS; explicit choices win', () => {
  assert.equal(resolveTheme('system', true), 'light');
  assert.equal(resolveTheme('system', false), 'dark');
  assert.equal(resolveTheme('dark', true), 'dark');
  assert.equal(resolveTheme('light', false), 'light');
});

test('toggle cycles system -> light -> dark -> system', () => {
  assert.equal(nextTheme('system'), 'light');
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'system');
});

test('only valid preferences are accepted', () => {
  assert.equal(isThemePref('light'), true);
  assert.equal(isThemePref('blue'), false);
  assert.equal(isThemePref(null), false);
});

test('bootstrap script is self-contained and never throws on bad storage', () => {
  assert.doesNotThrow(() => new Function(THEME_BOOTSTRAP));
  assert.match(THEME_BOOTSTRAP, /catch\(e\)/);
});
