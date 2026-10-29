'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { MoonIcon, SunIcon, SystemIcon } from '@/components/icons';
import { ThemePref, applyTheme, nextTheme, readThemePref, saveThemePref } from '@/lib/theme';

const ICON = { system: SystemIcon, light: SunIcon, dark: MoonIcon } as const;
const LABEL: Record<ThemePref, string> = { system: 'themeSystem', light: 'themeLight', dark: 'themeDark' };

/** Cycles system → light → dark. Follows the OS live while on "system". */
export default function ThemeToggle() {
  const { lang } = useApp();
  const tr = makeT(lang);
  const [pref, setPref] = useState<ThemePref>('system');

  useEffect(() => {
    setPref(readThemePref());
  }, []);

  useEffect(() => {
    if (pref !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const cycle = () => {
    const next = nextTheme(pref);
    setPref(next);
    saveThemePref(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${tr('themeLabel')}: ${tr(LABEL[pref])}`}
      title={`${tr('themeLabel')}: ${tr(LABEL[pref])}`}
      className="grid h-9 w-9 place-items-center rounded-lg text-base text-text-secondary transition-colors hover:bg-surface-800 hover:text-text-primary"
    >
      {(() => { const I = ICON[pref]; return <I size={18} />; })()}
    </button>
  );
}
