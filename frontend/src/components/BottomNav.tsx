'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  BookIcon,
  CodeIcon,
  HomeIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
} from '@/components/icons';

// Six tabs: the arena (03 · Practice) is a first-class stage of the learning
// journey, so it is reachable directly on mobile instead of only through the
// desktop-only header link.
const TABS = [
  { href: '/', label: 'navHome', Icon: HomeIcon },
  { href: '/learn', label: 'navLearn', Icon: BookIcon },
  { href: '/problems', label: 'navProblems', Icon: CodeIcon },
  { href: '/practice', label: 'navPractice', Icon: TargetIcon },
  { href: '/leaderboard', label: 'leaderboard', Icon: TrophyIcon },
  { href: '/profile', label: 'navProfile', Icon: UserIcon },
] as const;

export default function BottomNav() {
  const { lang } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();

  return (
    <nav
      aria-label={tr('tracks')}
      className="fixed inset-x-0 bottom-0 z-nav border-t border-border bg-surface-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-surface-950/80 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch">
        {TABS.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.Icon;
          return (
            <li key={tab.href} className="relative flex-1">
              {active && (
                <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-cyan-400" />
              )}
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 px-0.5 text-[0.5625rem] font-semibold transition-colors ${
                  active ? 'text-cyan-300' : 'text-text-muted'
                }`}
              >
                <Icon size={20} />
                <span className="w-full truncate text-center">{tr(tab.label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
