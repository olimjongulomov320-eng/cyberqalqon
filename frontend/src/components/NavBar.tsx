'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Lang, LANGS, makeT } from '@/lib/i18n';

const NAV = [
  { href: '/', label: 'navHome', emoji: '🏠' },
  { href: '/learn', label: 'navLearn', emoji: '📘' },
  { href: '/practice', label: 'navPractice', emoji: '🎯' },
  { href: '/leaderboard', label: 'leaderboard', emoji: '🏆' },
  { href: '/profile', label: 'navProfile', emoji: '👤' },
] as const;

export default function NavBar() {
  const { user, lang, setLang, lowBandwidth, setLowBandwidth } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-nav border-b border-border bg-surface-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="-ml-1 flex items-center gap-2 rounded-md px-1 py-1 transition-opacity hover:opacity-80"
        >
          <Image src="/logo.svg" alt="" width={26} height={26} className="shrink-0" priority />
          <span className="text-[0.9375rem] font-bold tracking-tight text-white">{tr('appName')}</span>
        </Link>

        <nav aria-label={tr('tracks')} className="hidden items-center gap-0.5 sm:flex">
          {NAV.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                  active ? 'bg-surface-700 text-white' : 'text-slate-400 hover:bg-surface-900 hover:text-slate-200'
                }`}
              >
                {tr(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <LangToggle lang={lang} setLang={setLang} />
          <LowBandwidthToggle on={lowBandwidth} toggle={() => setLowBandwidth(!lowBandwidth)} label={tr('lowBandwidth')} />

          {user ? (
            <Link
              href="/profile"
              aria-label={user.display_name}
              className="flex items-center gap-1.5 rounded-md py-1 pl-1 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-surface-900"
            >
              <span aria-hidden="true">{user.avatar_emoji}</span>
              <span className="num text-xs text-slate-400">{user.total_xp}</span>
              <span className="sr-only">{user.display_name}</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="rounded-md bg-cyan-500 px-3 py-1.5 text-[0.8125rem] font-bold text-text-inverse transition-colors hover:bg-cyan-400"
            >
              {tr('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div role="group" aria-label="Language / Til" className="flex overflow-hidden rounded-md border border-border">
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-1.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide transition-colors ${
            lang === l ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function LowBandwidthToggle({
  on,
  toggle,
  label,
}: {
  on: boolean;
  toggle: () => void;
  label: string;
}) {
  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={on}
      title={label}
      className={`rounded-md px-1.5 py-1 text-base leading-none transition-colors ${
        on ? 'bg-warning/10 text-warning' : 'text-slate-600 hover:text-slate-400'
      }`}
    >
      <span aria-hidden="true">{on ? '📵' : '📶'}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
