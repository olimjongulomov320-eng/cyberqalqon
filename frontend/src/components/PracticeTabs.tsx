'use client';
import Link from 'next/link';
import { useRef } from 'react';
import SlidingIndicator from '@/components/SlidingIndicator';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import PracticeHub from '@/components/PracticeHub';
import { isUnder13 } from '@/lib/ageGroups';

/**
 * Page head for both halves of Practice: the page's own title first, then the
 * questions / code-challenges switch, then the stats hub. The title used to sit
 * below the tabs and the hub, so the page read bottom-up.
 */
export default function PracticeTabs({
  title,
  subtitle,
  note,
}: {
  title: string;
  subtitle: string;
  note?: React.ReactNode;
}) {
  const { lang, ageGroup } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  // Code challenges are not offered under 13 (the API refuses them too).
  const tabs = [
    { href: '/problems', label: 'tabQuestions' },
    ...(isUnder13(ageGroup) ? [] : [{ href: '/challenges', label: 'tabChallenges' }]),
  ];
  return (
    <>
    <div className="mb-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">{subtitle}</p>
      {note}
    </div>
    <nav ref={ref} aria-label={tr('navPractice')} className="relative mb-5 flex gap-1 border-b border-border">
      {tabs.map(t => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={`px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
              active ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tr(t.label)}
          </Link>
        );
      })}
      <SlidingIndicator containerRef={ref} activeKey={pathname} />
    </nav>
    <PracticeHub />
    </>
  );
}
