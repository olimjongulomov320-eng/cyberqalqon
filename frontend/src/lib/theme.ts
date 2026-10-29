/**
 * Theme preference: 'system' follows the OS, 'light' / 'dark' are explicit.
 * The resolved theme is written to <html data-theme> (CSS variables do the
 * rest). The inline bootstrap in layout.tsx applies it before first paint so
 * there is no flash; this module is the runtime half.
 */
export type ThemePref = 'system' | 'light' | 'dark';
export const THEME_KEY = 'cq_theme';

export function isThemePref(v: unknown): v is ThemePref {
  return v === 'system' || v === 'light' || v === 'dark';
}

export function resolveTheme(pref: ThemePref, systemPrefersLight: boolean): 'light' | 'dark' {
  if (pref === 'system') return systemPrefersLight ? 'light' : 'dark';
  return pref;
}

/** Next preference in the toggle cycle. */
export function nextTheme(pref: ThemePref): ThemePref {
  return pref === 'system' ? 'light' : pref === 'light' ? 'dark' : 'system';
}

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isThemePref(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(pref: ThemePref) {
  const light = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme = resolveTheme(pref, light);
}

export function saveThemePref(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* private mode: the choice just won't persist */
  }
}

/** Source of the inline pre-paint script (kept here so it is unit-tested). */
export const THEME_BOOTSTRAP = `(function(){try{var p=localStorage.getItem('${THEME_KEY}');if(p!=='light'&&p!=='dark'){p=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=p}catch(e){document.documentElement.dataset.theme='dark'}})();`;
