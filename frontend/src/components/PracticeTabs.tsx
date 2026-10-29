'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';

/** Switches between the two halves of Practice: questions and coding challenges. */
export default function PracticeTabs() {
  const { lang } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();
  const tabs = [
    { href: '/problems', label: 'tabQuestions' },
    { href: '/challenges', label: 'tabChallenges' },
  ];
  return (
    <nav aria-label={tr('navPractice')} className="mb-5 inline-flex rounded-lg border border-border bg-surface-900 p-1">
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
    </nav>
  );
}
