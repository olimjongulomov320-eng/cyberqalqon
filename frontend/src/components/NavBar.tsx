'use client';
import Wordmark from '@/components/Wordmark';
import { Avatar } from '@/components/ui';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Lang, LANGS, makeT } from '@/lib/i18n';
import { BoltIcon, SignalOffIcon, SignalOnIcon } from '@/components/icons';

type NavItem = { href: string; label: string; also?: string[] };

// Five destinations. "Practice" is the challenge catalogue; mistake review
// (/review) and the leaderboard live under Progress, and `also` keeps Progress
// highlighted on those pages. The legacy /practice URL redirects to /review.
const NAV: NavItem[] = [
  { href: '/', label: 'navHome' },
  { href: '/learn', label: 'navLearn' },
  { href: '/problems', label: 'navPractice', also: ['/challenges'] },
  { href: '/assessments', label: 'navAssessments' },
  { href: '/profile', label: 'navProgress', also: ['/review', '/leaderboard', '/practice'] },
];

export default function NavBar() {
  const { user, lang, setLang, lowBandwidth, setLowBandwidth } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.href === '/'
      ? pathname === '/'
      : [item.href, ...(item.also ?? [])].some(h => pathname.startsWith(h));

  return (
    <header className="sticky top-0 z-nav border-b border-border bg-surface-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-surface-950/70">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={tr('appName')}
          className="-ml-1 flex items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-85"
        >
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.svg`} alt="" width={28} height={28} className="shrink-0" priority />
          {/* The wordmark is dropped below 360px: at that width the brand lockup
              plus the language / low-traffic / profile controls no longer fit on
              one row (they used to push the header ~15px past the viewport). The
              logo mark, page title and bottom nav still carry the brand. */}
          <Wordmark className="hidden text-[0.9375rem] min-[360px]:inline" />
        </Link>

        <nav aria-label={tr('tracks')} className="hidden items-center gap-1 sm:flex">
          {NAV.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-sm px-2.5 py-1.5 font-mono text-[0.75rem] font-medium tracking-wide transition-colors ${
                  active
                    ? 'bg-surface-800 text-white'
                    : 'text-text-secondary hover:bg-surface-900 hover:text-text-primary'
                }`}
              >
                {tr(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <LangToggle lang={lang} setLang={setLang} label={tr('languageLabel')} />
          <LowBandwidthToggle on={lowBandwidth} toggle={() => setLowBandwidth(!lowBandwidth)} label={tr('lowBandwidth')} />

          {user ? (
            <Link
              href="/profile"
              aria-label={user.display_name}
              className="flex items-center gap-1.5 rounded-lg py-1.5 pl-1 pr-2 text-sm font-semibold text-white transition-colors hover:bg-surface-900"
            >
              <Avatar name={user.display_name} size="xs" />
              <span className="num inline-flex items-center gap-0.5 text-xs text-warning">
                <BoltIcon size={13} className="shrink-0" />
                {user.total_xp}
              </span>
              <span className="sr-only">{user.display_name}</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg bg-cyan-400 px-3.5 py-2 text-[0.8125rem] font-bold text-text-inverse transition-colors hover:bg-cyan-300"
            >
              {tr('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function LangToggle({
  lang,
  setLang,
  label,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex overflow-hidden rounded-md border border-border">
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wide transition-colors ${
            lang === l ? 'bg-cyan-500/15 text-cyan-300' : 'text-text-muted hover:text-text-secondary'
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
      className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${
        on ? 'bg-warning/10 text-warning' : 'text-text-muted hover:text-text-secondary'
      }`}
    >
      {on ? <SignalOffIcon size={16} /> : <SignalOnIcon size={16} />}
      <span className="sr-only">{label}</span>
    </button>
  );
}
