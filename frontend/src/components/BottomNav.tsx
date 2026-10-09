'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';

const TABS = [
  { href: '/', label: 'navHome', emoji: '🏠' },
  { href: '/learn', label: 'navLearn', emoji: '📘' },
  { href: '/practice', label: 'navPractice', emoji: '🎯' },
  { href: '/leaderboard', label: 'leaderboard', emoji: '🏆' },
  { href: '/profile', label: 'navProfile', emoji: '👤' },
] as const;

export default function BottomNav() {
  const { lang } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();

  return (
    <nav
      aria-label={tr('tracks')}
      className="fixed inset-x-0 bottom-0 z-nav border-t border-border bg-surface-950/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch">
        {TABS.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-semibold transition-colors ${
                  active ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {tab.emoji}
                </span>
                <span className="truncate px-1">{tr(tab.label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
