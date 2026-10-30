'use client';
import SlidingIndicator from '@/components/SlidingIndicator';
import LogoMark from '@/components/LogoMark';
import Wordmark from '@/components/Wordmark';
import AccountMenu from '@/components/AccountMenu';
import CommandPalette from '@/components/CommandPalette';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Lang, LANGS, makeT } from '@/lib/i18n';
import {
  BookIcon,
  CodeIcon,
  HomeIcon,
  SearchIcon,
  SignalOffIcon,
  SignalOnIcon,
  TargetIcon,
  UserIcon,
  type IconProps,
} from '@/components/icons';

type NavItem = { href: string; label: string; Icon: (p: IconProps) => React.ReactElement; also?: string[] };

// Five destinations. "Practice" is the challenge catalogue; mistake review
// (/review) and the leaderboard live under Progress, and `also` keeps Progress
// highlighted on those pages. The legacy /practice URL redirects to /review.
const NAV: NavItem[] = [
  { href: '/', label: 'navHome', Icon: HomeIcon },
  { href: '/learn', label: 'navLearn', Icon: BookIcon },
  { href: '/problems', label: 'navPractice', Icon: CodeIcon, also: ['/challenges'] },
  { href: '/assessments', label: 'navAssessments', Icon: TargetIcon },
  { href: '/profile', label: 'navProgress', Icon: UserIcon, also: ['/review', '/leaderboard', '/practice'] },
];

export default function NavBar() {
  const { user, lang, setLang, lowBandwidth, setLowBandwidth } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mac, setMac] = useState(false);

  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  // Ctrl/Cmd+K opens the palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // The bar firms up once the page moves, and a hairline under it tracks how
  // far down the page you are. The line is a transform written straight to the
  // element, so scrolling never re-renders React.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(prev => (prev === y > 8 ? prev : y > 8));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const el = progressRef.current;
      if (el) el.style.transform = `scaleX(${max > 240 ? Math.min(1, Math.max(0, y / max)) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const closePalette = () => {
    setPaletteOpen(false);
    searchBtn.current?.focus();
  };

  const isActive = (item: NavItem) =>
    item.href === '/'
      ? pathname === '/'
      : [item.href, ...(item.also ?? [])].some(h => pathname.startsWith(h));

  return (
    <>
    <header
      className={`sticky top-0 z-nav border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ${
        scrolled
          ? 'border-border-light bg-surface-950/95 shadow-[0_6px_20px_-12px_rgb(0_0_0/0.6)]'
          : 'border-border bg-surface-950/70 supports-[backdrop-filter]:bg-surface-950/60'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={tr('appName')}
          className="group -ml-1 flex items-center gap-2.5 rounded-lg px-1 py-1"
        >
          <LogoMark size={28} className="shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
          {/* The wordmark is dropped below 420px: at that width the brand lockup
              plus the controls no longer fit on one row. The logo mark, page
              title and bottom nav still carry the brand. */}
          <Wordmark className="hidden text-[0.9375rem] min-[420px]:inline" />
        </Link>

        <nav ref={navRef} aria-label={tr('tracks')} className="relative hidden items-center gap-0.5 sm:flex">
          {NAV.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-1.5 rounded-md px-2.5 py-2 font-mono text-[0.75rem] font-medium tracking-wide transition-colors ${
                  active
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:bg-surface-800/80 hover:text-text-primary'
                }`}
              >
                <item.Icon
                  size={15}
                  className={`hidden shrink-0 transition-[transform,color] duration-200 group-hover:-translate-y-px lg:block ${
                    active ? 'text-cyan-400' : 'text-text-muted group-hover:text-cyan-400'
                  }`}
                />
                {tr(item.label)}
              </Link>
            );
          })}
          <SlidingIndicator containerRef={navRef} activeKey={pathname ?? ''} />
        </nav>

        <div className="flex items-center gap-1">
          <button
            ref={searchBtn}
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label={tr('searchOpen')}
            aria-keyshortcuts="Control+K Meta+K"
            title={tr('searchOpen')}
            className="group flex h-9 items-center gap-2 rounded-lg px-2.5 text-text-secondary transition-colors hover:bg-surface-800 hover:text-text-primary lg:border lg:border-border lg:pr-2 lg:hover:border-border-light"
          >
            <SearchIcon size={17} className="transition-transform duration-200 group-hover:scale-110" />
            <kbd className="hidden font-sans text-[0.6875rem] text-text-muted lg:block">{mac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <ThemeToggle />

          {user ? (
            <div className="ml-1">
              <AccountMenu />
            </div>
          ) : (
            <>
              <LowBandwidthToggle on={lowBandwidth} toggle={() => setLowBandwidth(!lowBandwidth)} label={tr('lowBandwidth')} />
              <Link
                href="/auth"
                className="ml-1 rounded-lg bg-cyan-400 px-3.5 py-2 text-[0.8125rem] font-bold text-text-inverse transition-[background-color,transform] hover:bg-cyan-300 active:scale-[0.97]"
              >
                {tr('login')}
              </Link>
            </>
          )}

          <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-border" />
          <LangToggle lang={lang} setLang={setLang} label={tr('languageLabel')} />
        </div>
      </div>

      <span
        ref={progressRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-cyan-400/80"
      />
    </header>
    {/* Outside the header: its backdrop-filter would otherwise become the
        containing block for the palette's fixed overlay. */}
    <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}

/**
 * UZ / RU segmented switch. One thumb slides between the two options (a
 * transform, so nothing reflows). The page is deliberately not remounted on a
 * switch: that would discard in-progress lesson answers.
 */
function LangToggle({
  lang,
  setLang,
  label,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  label: string;
}) {
  const index = Math.max(0, LANGS.indexOf(lang));
  return (
    <div role="group" aria-label={label} className="relative flex rounded-md border border-border bg-surface-900/60 p-0.5">
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 rounded-[4px] bg-cyan-500/20 ring-1 ring-inset ring-cyan-400/40 transition-transform duration-300 ease-spring"
        style={{ width: `calc((100% - 0.25rem) / ${LANGS.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {LANGS.map(l => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`relative z-10 min-w-9 px-2 py-2 text-[0.6875rem] font-bold uppercase tracking-wide transition-colors duration-200 ${
            lang === l ? 'text-cyan-300' : 'text-text-muted hover:text-text-secondary'
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
