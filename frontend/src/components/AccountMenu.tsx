'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { levelFromXp } from '@/lib/gamification';
import { isMinor } from '@/lib/ageGroups';
import { Avatar } from '@/components/ui';
import {
  BoltIcon,
  ChartIcon,
  FlameIcon,
  RefreshIcon,
  SignalOffIcon,
  SignalOnIcon,
  SignOutIcon,
  TrophyIcon,
} from '@/components/icons';

const RING = 40;
const STROKE = 2.5;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Avatar wrapped in a ring that fills as the learner approaches the next level. */
function LevelAvatar({ name, fraction }: { name: string; fraction: number }) {
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: RING, height: RING }}>
      <svg width={RING} height={RING} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={RING / 2} cy={RING / 2} r={R} fill="none" strokeWidth={STROKE} className="stroke-surface-700" />
        <circle
          cx={RING / 2}
          cy={RING / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          className="stroke-cyan-400 transition-[stroke-dashoffset] duration-700 ease-spring"
        />
      </svg>
      <Avatar name={name} size="xs" className="border-0" />
    </span>
  );
}

/**
 * Signed-in menu: who you are, how close the next level is, where to go, and the
 * switches that used to crowd the bar. Standard menu-button behaviour: opens on
 * click, arrow keys move between items, Esc closes and returns focus.
 */
export default function AccountMenu() {
  const { user, lang, lowBandwidth, setLowBandwidth, logout, ageGroup } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Move focus to the first item when the menu opens from the keyboard.
  useEffect(() => {
    if (open && root.current?.dataset.kb === '1') {
      root.current.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    }
  }, [open]);

  if (!user) return null;
  const level = levelFromXp(user.total_xp);
  const streak = user.current_streak ?? 0;

  const items = () => Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    if (!open) {
      if (root.current) root.current.dataset.kb = '1';
      setOpen(true);
      return;
    }
    const list = items();
    if (!list.length) return;
    const i = list.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : e.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
    list[next].focus();
  };

  const linkCls =
    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-800 hover:text-text-primary focus-visible:bg-surface-800 focus-visible:text-text-primary';

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${tr('accountMenu')}: ${user.display_name}`}
        onClick={() => {
          if (root.current) root.current.dataset.kb = '0';
          setOpen(o => !o);
        }}
        className={`group flex items-center gap-2 rounded-lg py-0.5 pl-0.5 pr-1.5 transition-colors hover:bg-surface-800 sm:pr-2.5 ${open ? 'bg-surface-800' : ''}`}
      >
        <LevelAvatar name={user.display_name} fraction={level.intoLevel / level.toNext} />
        <span className="num hidden items-center gap-0.5 text-xs font-semibold text-warning sm:inline-flex">
          <BoltIcon size={13} className="shrink-0 transition-transform duration-200 group-hover:scale-125" />
          {user.total_xp}
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={tr('accountMenu')}
          className="page-enter absolute right-0 top-[calc(100%+0.5rem)] z-overlay w-64 origin-top-right overflow-hidden rounded-lg border border-border-light bg-surface-900 shadow-2xl"
        >
          <div className="border-b border-border px-3.5 py-3">
            <p className="truncate text-sm font-bold text-text-primary">{user.display_name}</p>
            <div className="mt-1.5 flex items-center justify-between font-mono text-[0.6875rem] text-text-muted">
              <span>
                {tr('level')} <span className="num font-bold text-text-primary">{level.level}</span>
              </span>
              <span className="num">
                {level.intoLevel}/{level.toNext} XP
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-700" aria-hidden="true">
              <div className="h-full origin-left bg-cyan-400" style={{ transform: `scaleX(${level.intoLevel / level.toNext})` }} />
            </div>
            {streak > 0 && (
              <p className="num mt-2 inline-flex items-center gap-1 text-xs font-semibold text-warning">
                <FlameIcon size={14} /> {streak} <span className="font-normal text-text-muted">{tr('streak').toLowerCase()}</span>
              </p>
            )}
          </div>

          <div className="p-1.5">
            <Link href="/profile" role="menuitem" className={linkCls}>
              <ChartIcon size={16} /> {tr('navProgress')}
            </Link>
            <Link href="/review" role="menuitem" className={linkCls}>
              <RefreshIcon size={16} /> {tr('reviewTitle')}
            </Link>
            {!isMinor(ageGroup) && (
              <Link href="/leaderboard" role="menuitem" className={linkCls}>
                <TrophyIcon size={16} /> {tr('leaderboard')}
              </Link>
            )}
          </div>

          <div className="border-t border-border p-1.5">
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={lowBandwidth}
              onClick={() => setLowBandwidth(!lowBandwidth)}
              className={`${linkCls} w-full`}
            >
              {lowBandwidth ? <SignalOffIcon size={16} className="text-warning" /> : <SignalOnIcon size={16} />}
              <span className="flex-1 text-left">{tr('lowBandwidth')}</span>
              <span
                aria-hidden="true"
                className={`relative h-4 w-7 rounded-full transition-colors ${lowBandwidth ? 'bg-warning/60' : 'bg-surface-700'}`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-surface-200 transition-transform ${lowBandwidth ? 'translate-x-3' : ''}`}
                />
              </span>
            </button>
            <button type="button" role="menuitem" onClick={logout} className={`${linkCls} w-full hover:text-danger`}>
              <SignOutIcon size={16} /> {tr('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
