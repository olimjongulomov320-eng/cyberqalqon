'use client';
import Link from 'next/link';
import { useRef } from 'react';
import SlidingIndicator from '@/components/SlidingIndicator';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import PracticeHub from '@/components/PracticeHub';

/** Switches between the two halves of Practice: questions and coding challenges. */
export default function PracticeTabs() {
  const { lang } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const tabs = [
    { href: '/problems', label: 'tabQuestions' },
    { href: '/challenges', label: 'tabChallenges' },
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
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              active ? 'bg-cyan-400 text-text-inverse' : 'text-text-secondary hover:text-text-primary'
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
