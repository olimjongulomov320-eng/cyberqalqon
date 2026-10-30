'use client';
import { useEffect, useId, useMemo, useRef, useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { searchKey } from '@/lib/uzText';
import {
  BookIcon,
  CodeIcon,
  GlobeIcon,
  HomeIcon,
  RefreshIcon,
  SearchIcon,
  SignalOffIcon,
  SignOutIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
  type IconProps,
} from '@/components/icons';

type Entry = {
  id: string;
  group: 'searchPages' | 'searchActions';
  label: string;
  hint?: string;
  Icon: ComponentType<IconProps>;
  run: () => void;
};

/**
 * Jump-to palette (Ctrl/Cmd+K). Pages first, then account and preference
 * actions. Focus stays in the input and arrow keys move a highlighted option
 * (combobox + listbox pattern), so a screen reader hears the active option.
 */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, lang, setLang, lowBandwidth, setLowBandwidth, logout } = useApp();
  const tr = makeT(lang);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const entries = useMemo<Entry[]>(() => {
    const go = (href: string) => () => router.push(href);
    const pages: Entry[] = [
      { id: 'home', group: 'searchPages', label: tr('navHome'), hint: '/', Icon: HomeIcon, run: go('/') },
      { id: 'learn', group: 'searchPages', label: tr('navLearn'), hint: '/learn', Icon: BookIcon, run: go('/learn') },
      { id: 'practice', group: 'searchPages', label: tr('navPractice'), hint: '/problems', Icon: CodeIcon, run: go('/problems') },
      { id: 'assess', group: 'searchPages', label: tr('navAssessments'), hint: '/assessments', Icon: TargetIcon, run: go('/assessments') },
      { id: 'progress', group: 'searchPages', label: tr('navProgress'), hint: '/profile', Icon: UserIcon, run: go('/profile') },
      { id: 'review', group: 'searchPages', label: tr('reviewTitle'), hint: '/review', Icon: RefreshIcon, run: go('/review') },
      { id: 'board', group: 'searchPages', label: tr('leaderboard'), hint: '/leaderboard', Icon: TrophyIcon, run: go('/leaderboard') },
    ];
    const actions: Entry[] = [
      {
        id: 'lang',
        group: 'searchActions',
        label: `${tr('languageLabel')}: ${lang === 'uz' ? 'RU' : 'UZ'}`,
        Icon: GlobeIcon,
        run: () => setLang(lang === 'uz' ? 'ru' : 'uz'),
      },
      {
        id: 'lowbw',
        group: 'searchActions',
        label: tr('lowBandwidth'),
        hint: lowBandwidth ? 'ON' : 'OFF',
        Icon: SignalOffIcon,
        run: () => setLowBandwidth(!lowBandwidth),
      },
      user
        ? { id: 'logout', group: 'searchActions', label: tr('logout'), Icon: SignOutIcon, run: logout }
        : { id: 'login', group: 'searchActions', label: tr('login'), hint: '/auth', Icon: UserIcon, run: go('/auth') },
    ];
    return [...pages, ...actions];
  }, [tr, lang, lowBandwidth, user, router, setLang, setLowBandwidth, logout]);

  const shown = useMemo(() => {
    const q = searchKey(query.trim());
    return q ? entries.filter(e => searchKey(e.label).includes(q) || e.hint?.toLowerCase().includes(q)) : entries;
  }, [entries, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // Let the dialog mount before focusing.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const choose = (e: Entry | undefined) => {
    if (!e) return;
    onClose();
    e.run();
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      onClose();
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setActive(i => (shown.length ? (i + 1) % shown.length : 0));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setActive(i => (shown.length ? (i - 1 + shown.length) % shown.length : 0));
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      choose(shown[active]);
    } else if (ev.key === 'Tab') {
      ev.preventDefault(); // the input is the only stop; keep focus inside the dialog
    }
  };

  let lastGroup: Entry['group'] | null = null;
  return (
    <div className="fixed inset-0 z-overlay flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tr('searchOpen')}
        className="page-enter relative w-full max-w-lg overflow-hidden rounded-lg border border-border-light bg-surface-900 shadow-2xl"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-3.5">
          <SearchIcon size={18} className="shrink-0 text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tr('searchPlaceholder')}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={shown[active] ? `${listId}-${shown[active].id}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted !outline-none"
          />
          <kbd className="hidden rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.625rem] text-text-muted sm:block">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label={tr('searchOpen')} className="max-h-[50vh] overflow-y-auto p-1.5">
          {shown.length === 0 && <li className="px-3 py-6 text-center text-sm text-text-muted">{tr('searchEmpty')}</li>}
          {shown.map((e, i) => {
            const header = e.group !== lastGroup;
            lastGroup = e.group;
            return (
              <li key={e.id} role="presentation">
                {header && (
                  <p className="px-2.5 pb-1 pt-2 font-mono text-[0.625rem] uppercase tracking-wider text-text-muted">{tr(e.group)}</p>
                )}
                <div
                  id={`${listId}-${e.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(e)}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    i === active ? 'bg-cyan-500/15 text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  <e.Icon size={17} className={i === active ? 'text-cyan-300' : 'text-text-muted'} />
                  <span className="min-w-0 flex-1 truncate">{e.label}</span>
                  {e.hint && <span className="font-mono text-[0.6875rem] text-text-muted">{e.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
