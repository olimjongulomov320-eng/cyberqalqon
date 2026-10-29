'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  Difficulty,
  Domain,
  LearningPath,
  PathModule,
  TopicStat,
  fetchPaths,
  fetchStats,
} from '@/lib/api';
import {
  DirectoryFilter,
  defaultOpenDomain,
  domainStatus,
  filterDirectory,
  nextCheckpoint,
  pathTotals,
} from '@/lib/directory';
import PathTrail from '@/components/PathTrail';
import Journey from '@/components/Journey';
import { Badge, ButtonLink, EmptyState, ErrorNote, Progress, Skeleton } from '@/components/ui';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  CodeIcon,
  CompassIcon,
  DomainIcon,
  LockIcon,
  PlayIcon,
  RefreshIcon,
  SearchIcon,
  TargetIcon,
  TrophyIcon,
} from '@/components/icons';

/**
 * DISCOVER — stage 01 of the journey.
 *
 * This page used to paint a card per domain with every module of all 80
 * modules exposed as its own bordered row (~92 cards on first paint). It is
 * now a skill directory: one bordered container, dense domain rows separated
 * by dividers, progressive disclosure per domain, search + status filters, and
 * a compact rail carrying the real next actions (continue, practice, apply,
 * review). Nothing here is decorative: every count, state and target comes
 * from `GET /v1/paths` and `GET /users/me/stats`.
 */


const DIFF_TONE: Record<Difficulty, 'success' | 'primary' | 'warning'> = {
  beginner: 'success',
  intermediate: 'primary',
  advanced: 'warning',
};

const FILTERS: { key: DirectoryFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'todo', labelKey: 'filterNext' },
  { key: 'done', labelKey: 'stateDone' },
  { key: 'locked', labelKey: 'stateLocked' },
];

const chipClass = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
      : 'border-border bg-surface-800 text-text-muted hover:text-text-primary'
  }`;

/* ── Module sequence (shown when a domain is expanded) ───────────────────── */

/* ── Domain row ───────────────────────────────────────────────────────────── */

function DomainRow({
  domain,
  visible,
  open,
  onToggle,
}: {
  domain: Domain;
  visible: PathModule[];
  open: boolean;
  onToggle: () => void;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const status = domainStatus(domain);
  const pct = domain.total > 0 ? Math.round((domain.completed / domain.total) * 100) : 0;
  const panelId = `domain-panel-${domain.slug}`;

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-surface-800/60 sm:px-4"
      >
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-800 text-cyan-300"
        >
          <DomainIcon slug={domain.slug} size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-bold text-white">{domain.title}</span>
            {status === 'done' && <Badge tone="success">{tr('stateDone')}</Badge>}
            {status === 'active' && <Badge tone="primary">{tr('stateCurrent')}</Badge>}
            {status === 'locked' && <Badge tone="neutral">{tr('stateLocked')}</Badge>}
          </span>
          <span className="mt-0.5 block truncate text-xs text-text-muted">{domain.description}</span>
          <span className="mt-2 flex items-center gap-2">
            <span aria-hidden="true" className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-800">
              <span
                className="block h-full rounded-full bg-cyan-400"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="num shrink-0 text-[0.6875rem] font-semibold text-text-muted">
              {domain.completed}/{domain.total}
            </span>
          </span>
        </span>

        <ChevronRightIcon
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-text-muted transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div id={panelId}>
          {visible.length === 0 ? (
            <p className="border-t border-border/60 px-4 py-3 text-xs text-text-muted">
              {tr('discoverEmptyBody')}
            </p>
          ) : (
            <PathTrail domainSlug={domain.slug} modules={visible} completed={domain.completed} all={domain.modules} />
          )}
        </div>
      )}
    </section>
  );
}

/* ── Action rail (right column on desktop, first block on mobile) ────────── */

function Rail({
  continueTarget,
  weakTopics,
  checkpoint,
  pathDone,
  pathTotal,
}: {
  continueTarget: { slug: string; title: string; position: number; total: number } | null;
  weakTopics: TopicStat[];
  checkpoint: { slug: string; domainTitle: string } | null;
  pathDone: number;
  pathTotal: number;
}) {
  const { user, lang } = useApp();
  const tr = makeT(lang);

  return (
    <div
      aria-label={tr('quickActions')}
      className="overflow-hidden rounded-xl border border-border bg-surface-900 shadow-card edge-light lg:sticky lg:top-20"
    >
      {/* 02 · Learn — the real continue target */}
      <section className="p-3.5">
        <p className="label text-cyan-300">{tr('continueLearning')}</p>
        {continueTarget ? (
          <>
            <p className="mt-1 truncate text-sm font-bold text-white">{continueTarget.title}</p>
            <p className="num mt-0.5 text-xs text-text-secondary">
              {continueTarget.position}/{continueTarget.total}
            </p>
            <Progress
              className="mt-2"
              value={continueTarget.position}
              max={Math.max(1, continueTarget.total)}
              label={tr('trackProgress')}
            />
            <ButtonLink href={`/modules/${continueTarget.slug}`} size="sm" className="mt-3 w-full">
              {tr('resumeLesson')}
              <ArrowRightIcon size={15} />
            </ButtonLink>
          </>
        ) : pathTotal > 0 ? (
          <>
            <p className="mt-1 text-sm text-text-secondary">{tr('pathAllDone')}</p>
            <p className="num mt-1 text-xs text-text-muted">
              {pathDone}/{pathTotal} · 100%
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-text-muted">{tr('pathEmptyBody')}</p>
        )}
      </section>

      {/* 03 · Practice — straight into the arena.
          On phones the three lower blocks collapse to one dense row each:
          the directory below must still start within the first screen. Every
          link stays reachable; only the supporting copy waits for `lg`. */}
      <section className="border-t border-border/60 p-3 lg:p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
          <CodeIcon size={13} aria-hidden="true" /> {tr('stagePractice')}
        </p>
        <p className="mt-1 text-sm font-bold text-white">{tr('arenaTitle')}</p>
        <p className="mt-0.5 hidden text-xs leading-relaxed text-text-muted lg:block">
          {tr('arenaBlurb')}
        </p>
        <ButtonLink href="/problems" variant="secondary" size="sm" className="mt-1.5 w-full lg:mt-2.5">
          {tr('openArena')}
          <ArrowRightIcon size={15} />
        </ButtonLink>
      </section>

      {/* 04 · Apply — the next reachable assessment, else advanced tasks */}
      <section className="border-t border-border/60 p-3 lg:p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
          <TrophyIcon size={13} aria-hidden="true" /> {tr('stageApply')}
        </p>
        {checkpoint ? (
          <>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
              <Badge tone="warning">{tr('checkpoint')}</Badge>
              <span className="truncate">{checkpoint.domainTitle}</span>
            </p>
            <p className="mt-0.5 hidden text-xs leading-relaxed text-text-muted lg:block">
              {tr('applyBody')}
            </p>
            <ButtonLink
              href={`/modules/${checkpoint.slug}`}
              variant="secondary"
              size="sm"
              className="mt-1.5 w-full lg:mt-2.5"
            >
              {tr('applyEntry')}
              <ArrowRightIcon size={15} />
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm font-bold text-white">{tr('applyFallbackTitle')}</p>
            <p className="mt-0.5 hidden text-xs leading-relaxed text-text-muted lg:block">
              {tr('applyFallbackBody')}
            </p>
            <ButtonLink
              href="/problems?difficulty=advanced"
              variant="secondary"
              size="sm"
              className="mt-1.5 w-full lg:mt-2.5"
            >
              {tr('openArena')}
              <ArrowRightIcon size={15} />
            </ButtonLink>
          </>
        )}
      </section>

      {/* 05 · Review — real weak topics only, honest when there are none */}
      <section className="border-t border-border/60 p-3 lg:p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
          <RefreshIcon size={13} aria-hidden="true" /> {tr('stageReview')}
        </p>
        {!user ? (
          <>
            <p className="mt-1 text-sm text-text-secondary">{tr('signInToAnswer')}</p>
            <ButtonLink href="/auth" variant="secondary" size="sm" className="mt-2.5 w-full">
              {tr('login')}
            </ButtonLink>
          </>
        ) : weakTopics.length > 0 ? (
          <>
            <p className="mt-1 text-sm font-bold text-white">{tr('pathReviewTitle')}</p>
            <ul className="mt-1.5 hidden flex-wrap gap-1.5 lg:flex">
              {weakTopics.slice(0, 3).map(t => (
                <li key={t.slug}>
                  <Badge tone="warning">
                    {t.title}
                    <span className="num text-text-muted">{t.wrong}</span>
                  </Badge>
                </li>
              ))}
            </ul>
            <ButtonLink href="/review" variant="secondary" size="sm" className="mt-1.5 w-full lg:mt-2.5">
              {tr('pathReviewAction')}
              <ArrowRightIcon size={15} />
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm font-bold text-white">{tr('pathNoReview')}</p>
            <p className="mt-0.5 hidden text-xs leading-relaxed text-text-muted lg:block">
              {tr('pathNoReviewBody')}
            </p>
          </>
        )}
      </section>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

function LearnInner() {
  const { lang, user } = useApp();
  const tr = makeT(lang);

  const [data, setData] = useState<{
    paths: LearningPath[];
    continue: { slug: string; title: string; position: number; total: number } | null;
  } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [weakTopics, setWeakTopics] = useState<TopicStat[]>([]);

  const [pathSlug, setPathSlug] = useState('');
  const [filter, setFilter] = useState<DirectoryFilter>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    setError(null);
    (async () => {
      try {
        const res = await fetchPaths(lang);
        if (!alive) return;
        setData({ paths: res.paths, continue: res.continue ?? null });
      } catch (err) {
        if (alive) setError(err as ApiError);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  // Weak topics power the review block; a failure must never break discovery.
  useEffect(() => {
    let alive = true;
    if (!user) {
      setWeakTopics([]);
      return;
    }
    fetchStats(lang)
      .then(s => alive && setWeakTopics(s.weak_topics ?? []))
      .catch(() => alive && setWeakTopics([]));
    return () => {
      alive = false;
    };
  }, [lang, user]);

  // Deep link (`?domain=…`) and default expansion: the learner's continue
  // domain opens so the first screen already points at the next real step.
  useEffect(() => {
    if (!data) return;
    const fromUrl = new URLSearchParams(window.location.search).get('domain');
    if (fromUrl) {
      const hit = data.paths.find(p => p.domains.some(d => d.slug === fromUrl));
      if (hit) {
        setPathSlug(hit.slug);
        setOpen(new Set([fromUrl]));
        return;
      }
    }
    const fallback = defaultOpenDomain(data.paths, data.continue?.slug ?? null);
    setOpen(new Set(fallback ? [fallback] : []));
    setPathSlug(prev => prev || data.paths[0]?.slug || '');
  }, [data]);

  const path = useMemo(
    () => data?.paths.find(p => p.slug === pathSlug) ?? data?.paths[0] ?? null,
    [data, pathSlug]
  );

  const { domains: visibleDomains, moduleCount } = useMemo(
    () => (path ? filterDirectory(path, { filter, query }) : { domains: [], moduleCount: 0 }),
    [path, filter, query]
  );

  const totals = useMemo(() => (path ? pathTotals(path) : { done: 0, total: 0, pct: 0 }), [path]);
  const checkpoint = useMemo(() => (data ? nextCheckpoint(data.paths) : null), [data]);

  const toggle = (slug: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface-900 p-5">
        <ErrorNote>
          {error.isTimeout
            ? tr('timeoutError')
            : error.isOffline
              ? tr('networkError')
              : error.message}
        </ErrorNote>
        <div className="mt-4">
          <ButtonLink href="/learn" variant="secondary">
            {tr('retry')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!data || !path) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label={tr('loading')}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
        <p className="text-center text-sm text-text-muted">{tr('loading')}</p>
      </div>
    );
  }

  const isEmpty = data.paths.every(p => p.domains.every(d => d.modules.length === 0));

  if (isEmpty) {
    return (
      <EmptyState
        icon={<CompassIcon size={26} className="text-text-muted" />}
        title={tr('pathEmptyTitle')}
        body={tr('pathEmptyBody')}
        action={<ButtonLink href="/">{tr('goHome')}</ButtonLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Journey
        sources={{
          continueSlug: data.continue?.slug ?? null,
          checkpointSlug: checkpoint?.slug ?? null,
        }}
      />

      {/* Overall progress for the selected path — one line, real counts. */}
      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {tr('pathOverall')}
        </p>
        <span aria-hidden="true" className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-800">
          <span className="block h-full rounded-full bg-cyan-400" style={{ width: `${totals.pct}%` }} />
        </span>
        <p className="num shrink-0 text-xs font-bold text-text-secondary">
          {totals.done}/{totals.total} · {totals.pct}%
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        {/* Rail first in DOM so mobile opens with the next real action; on
            desktop it moves to the right column. */}
        <aside className="order-1 lg:order-2">
          <Rail
            continueTarget={data.continue}
            weakTopics={weakTopics}
            checkpoint={checkpoint}
            pathDone={totals.done}
            pathTotal={totals.total}
          />
        </aside>

        <div className="order-2 flex flex-col gap-3 lg:order-1">
          {/* Path switcher + search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="tablist"
              aria-label={tr('tracks')}
              className="flex min-w-0 gap-1 overflow-x-auto rounded-lg border border-border bg-surface-900 p-1"
            >
              {data.paths.map(p => {
                const t = pathTotals(p);
                const active = p.slug === path.slug;
                return (
                  <button
                    key={p.slug}
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setPathSlug(p.slug);
                      setOpen(new Set());
                    }}
                    className={`flex min-w-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      active ? 'bg-surface-700 text-white' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="num text-[0.625rem] font-semibold opacity-70">
                      {t.done}/{t.total}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full sm:w-64">
              <span className="sr-only">{tr('discoverSearch')}</span>
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={tr('discoverSearchPlaceholder')}
                aria-label={tr('discoverSearch')}
                className="input-base pl-9"
              />
            </label>
          </div>

          {/* Status chips + visible count */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2" role="group" aria-label={tr('filterDomain')}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={chipClass(filter === f.key)}
                >
                  {tr(f.labelKey)}
                </button>
              ))}
            </div>
            <p className="num text-[0.6875rem] text-text-muted">
              {moduleCount} {tr('discoverShowing')}
            </p>
          </div>

          {/* The directory: ONE bordered container, rows divided — not a card
              grid. */}
          {visibleDomains.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface-900">
              <EmptyState
                icon={<SearchIcon size={26} className="text-text-muted" />}
                title={tr('discoverEmptyTitle')}
                body={tr('discoverEmptyBody')}
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setFilter('all');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-800 px-3 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-700"
                  >
                    <RefreshIcon size={15} />
                    {tr('clearFilters')}
                  </button>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-surface-900 shadow-card edge-light">
              {visibleDomains.map(d => (
                <DomainRow
                  key={d.slug}
                  domain={path.domains.find(orig => orig.slug === d.slug) ?? d}
                  visible={d.modules}
                  open={open.has(d.slug)}
                  onToggle={() => toggle(d.slug)}
                />
              ))}
            </div>
          )}

          <p className="px-1 text-[0.6875rem] leading-relaxed text-text-muted">
            {tr('skillsRuleShort')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const { lang } = useApp();
  const tr = makeT(lang);
  return (
    <div>
      <header className="mb-4">
        <p className="label mb-2 flex items-center gap-1.5 text-cyan-300">
          <CompassIcon size={14} aria-hidden="true" /> {tr('stageDiscover')}
        </p>
        <h1 className="display">{tr('discoverTitle')}</h1>
        <p className="mt-1.5 max-w-[62ch] text-sm text-text-secondary">{tr('discoverSubtitle')}</p>
      </header>
      <LearnInner />
    </div>
  );
}
