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
  UserIcon,
} from '@/components/icons';

// Five tabs. Practice is the challenge catalogue; mistake review and the
// leaderboard are reached from Progress (`also` keeps it highlighted there).
const TABS = [
  { href: '/', label: 'navHome', Icon: HomeIcon, also: [] as string[] },
  { href: '/learn', label: 'navLearn', Icon: BookIcon, also: [] as string[] },
  { href: '/problems', label: 'navPractice', Icon: CodeIcon, also: [] as string[] },
  { href: '/assessments', label: 'navAssessments', Icon: TargetIcon, also: [] as string[] },
  { href: '/profile', label: 'navProgress', Icon: UserIcon, also: ['/review', '/leaderboard', '/practice'] },
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
          const active =
            tab.href === '/' ? pathname === '/' : [tab.href, ...tab.also].some(h => pathname.startsWith(h));
          const Icon = tab.Icon;
          return (
            <li key={tab.href} className="relative flex-1">
              {active && (
                <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-cyan-400" />
              )}
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 px-0.5 text-[0.625rem] font-semibold transition-colors ${
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
