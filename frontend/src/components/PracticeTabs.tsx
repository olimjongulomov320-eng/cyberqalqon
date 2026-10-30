'use client';
import Link from 'next/link';
import { useRef } from 'react';
import SlidingIndicator from '@/components/SlidingIndicator';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import PracticeHub from '@/components/PracticeHub';
import { isUnder13 } from '@/lib/ageGroups';

/** Switches between the two halves of Practice: questions and coding challenges. */
export default function PracticeTabs() {
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
