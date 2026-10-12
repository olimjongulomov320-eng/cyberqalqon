'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';

/**
 * Skip link must be the first focusable element on the page, but its text has
 * to follow the active locale. Kept as a tiny client component so the root
 * layout can stay a server component.
 */
export default function SkipLink() {
  const { lang } = useApp();
  const tr = makeT(lang);
  return (
    <a
      href="#main"
      className="sr-only rounded-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-skip focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-text-inverse"
    >
      {tr('skipToContent')}
    </a>
  );
}
