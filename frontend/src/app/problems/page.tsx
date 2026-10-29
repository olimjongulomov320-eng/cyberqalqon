'use client';
import PracticeTabs from '@/components/PracticeTabs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  AnswerValue,
  ApiError,
  CheckResult,
  Difficulty,
  ExerciseType,
  ProblemDetail,
  ProblemStatus,
  ProblemSummary,
  ProblemsPayload,
  checkAnswer,
  fetchProblem,
  fetchProblems,
} from '@/lib/api';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { AnswerFeedback } from '@/components/feedback';
import Journey from '@/components/Journey';
import HintLadder from '@/components/HintLadder';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ErrorNote,
  Progress,
  Skeleton,
} from '@/components/ui';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  CodeIcon,
  DomainIcon,
  RefreshIcon,
  SearchIcon,
  TargetIcon,
} from '@/components/icons';

const PAGE_SIZE = 24;

const DIFF_TONE: Record<Difficulty, 'success' | 'primary' | 'warning'> = {
  beginner: 'success',
  intermediate: 'primary',
  advanced: 'warning',
};

const DIFF_KEY: Record<Difficulty, string> = {
  beginner: 'difficultyBeginner',
  intermediate: 'difficultyIntermediate',
  advanced: 'difficultyAdvanced',
};

const TYPE_KEY: Record<ExerciseType, string> = {
  mc: 'typeMc',
  tf: 'typeTf',
  multi: 'typeMulti',
  match: 'typeMatch',
  order: 'typeOrder',
  input: 'typeInput',
};

const STATUS_KEY: Record<ProblemStatus, string> = {
  new: 'statusNew',
  attempted: 'statusAttempted',
  solved: 'statusSolved',
};

/** What a correct answer means for each exercise type — real semantics of the
 *  grader (backend/lib/grade.js), shown before the learner commits. */
const CORRECT_KEY: Record<ExerciseType, string> = {
  mc: 'correctMc',
  tf: 'correctTf',
  multi: 'correctMulti',
  match: 'correctMatch',
  order: 'correctOrder',
  input: 'correctInput',
};

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const TYPES: ExerciseType[] = ['mc', 'tf', 'multi', 'match', 'order', 'input'];

const errText = (e: unknown) =>
  e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e);

const chipClass = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
      : 'border-border bg-surface-800 text-text-muted hover:text-text-primary'
  }`;

/**
 * Problem Arena — a filterable view over the *real* curriculum.
 *
 * Every row is an existing exercise (329 of them), served through the same
 * answer-stripping serializer the lesson uses. Solving calls the same
 * `POST /modules/:slug/check` endpoint, so XP, attempt recording and
 * explanations are the real ones — this page adds no second grading path and
 * no fake content.
 *
 * Why the solver lives on this route instead of /problems/[module]/[exercise]:
 * the frontend is a static export, so a dynamic route would require
 * enumerating all 329 pairs at build time (and calling a sleeping free-tier
 * API 329 times). An in-page panel keeps the build deterministic.
 */
export default function ProblemsPage() {
  const { lang, user, ready } = useApp();
  const tr = makeT(lang);

  const [domain, setDomain] = useState('');
  const [track, setTrack] = useState('');
  const [difficulty, setDifficulty] = useState<'' | Difficulty>('');
  const [type, setType] = useState<'' | ExerciseType>('');
  const [status, setStatus] = useState<'' | ProblemStatus>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [data, setData] = useState<ProblemsPayload | null>(null);
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProblemDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [value, setValue] = useState<AnswerValue>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Guards "load more" against a filter change that happens mid-flight.
  const queryKey = useRef('');

  // Deep links (?domain=, ?difficulty=, ?type=, ?status=, ?q=, ?module=,
  // ?exercise=) let Review/Profile recommendations land on one exact task or a
  // pre-filtered set. Parsed once, client-side: reading window during render
  // would break static-export hydration, so the first catalogue fetch waits for
  // this effect instead of fetching defaults and refetching.
  const [deepLinked, setDeepLinked] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = q.get('domain');
    const tk = q.get('track');
    const diff = q.get('difficulty');
    const t = q.get('type');
    const st = q.get('status');
    const text = q.get('q');
    const m = q.get('module');
    const e = q.get('exercise');

    if (d) setDomain(d);
    if (tk) setTrack(tk);
    if (diff && (DIFFICULTIES as string[]).includes(diff)) setDifficulty(diff as Difficulty);
    if (t && (TYPES as string[]).includes(t)) setType(t as ExerciseType);
    if (st && (['new', 'attempted', 'solved'] as string[]).includes(st)) {
      setStatus(st as ProblemStatus);
    }
    if (text) {
      setSearch(text);
      setDebouncedSearch(text);
    }
    if (m && e) {
      setSelectedModule(m);
      setSelectedExercise(e);
    }
    setDeepLinked(true);
  }, []);

  // Debounce the free-text search so typing does not hit the API per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Status is per-learner; drop the filter when the session goes away so the
  // UI never shows a paused filter that cannot be applied.
  useEffect(() => {
    if (!user && status) setStatus('');
  }, [user, status]);

  const params = useMemo(
    () => ({
      lang,
      domain: domain || undefined,
      track: track || undefined,
      difficulty: difficulty || undefined,
      type: type || undefined,
      status: status || undefined,
      q: debouncedSearch || undefined,
    }),
    [lang, domain, track, difficulty, type, status, debouncedSearch]
  );

  useEffect(() => {
    if (!deepLinked) return; // wait for the one-time deep-link parse
    let alive = true;
    const key = JSON.stringify(params);
    queryKey.current = key;
    setLoading(true);
    setError(null);

    fetchProblems({ ...params, limit: PAGE_SIZE, offset: 0 })
      .then(res => {
        if (!alive) return;
        setData(res);
        setProblems(res.problems);
      })
      .catch((e: unknown) => {
        if (alive) setError(errText(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [params, user?.id, reloadKey, deepLinked]);

  const loadMore = useCallback(async () => {
    if (!data?.has_more || loadingMore) return;
    const key = queryKey.current;
    setLoadingMore(true);
    try {
      const res = await fetchProblems({ ...params, limit: PAGE_SIZE, offset: problems.length });
      if (queryKey.current !== key) return;
      setData(res);
      setProblems(prev => {
        const seen = new Set(prev.map(p => `${p.module_slug}::${p.exercise_id}`));
        return [...prev, ...res.problems.filter(p => !seen.has(`${p.module_slug}::${p.exercise_id}`))];
      });
    } catch (e: unknown) {
      if (queryKey.current === key) setError(errText(e));
    } finally {
      setLoadingMore(false);
    }
  }, [data?.has_more, loadingMore, params, problems.length]);

  // Load the selected problem (answers stripped; grading is a separate call).
  useEffect(() => {
    if (!selectedModule || !selectedExercise) {
      setDetail(null);
      return;
    }
    let alive = true;
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    setValue(null);
    setResult(null);
    setCheckError(null);

    fetchProblem(selectedModule, selectedExercise, lang)
      .then(res => {
        if (alive) setDetail(res.problem);
      })
      .catch((e: unknown) => {
        if (alive) setDetailError(errText(e));
      })
      .finally(() => {
        if (alive) setDetailLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedModule, selectedExercise, lang]);

  const selectProblem = (p: ProblemSummary) => {
    setSelectedModule(p.module_slug);
    setSelectedExercise(p.exercise_id);
  };

  const clearSelection = () => {
    setSelectedModule(null);
    setSelectedExercise(null);
  };

  /** Reflect a graded answer in the list, the detail and the summary without a
   *  refetch. When a status filter is active and the row no longer matches it,
   *  the row is removed instead of being left visibly wrong. */
  const applyStatus = (newStatus: ProblemStatus) => {
    if (!detail) return;
    const id = `${detail.module_slug}::${detail.exercise_id}`;
    const before = problems.find(p => `${p.module_slug}::${p.exercise_id}` === id);

    setProblems(list => {
      const next = list.map(p =>
        `${p.module_slug}::${p.exercise_id}` === id
          ? { ...p, status: newStatus, solved: newStatus === 'solved', attempted: true }
          : p
      );
      return status ? next.filter(p => p.status === status) : next;
    });

    if (status && status !== newStatus) {
      setData(d => (d ? { ...d, total: Math.max(0, d.total - 1) } : d));
    }
    if (newStatus === 'solved' && before?.status !== 'solved') {
      setData(d => (d ? { ...d, solved_total: d.solved_total + 1 } : d));
    }
    setDetail(d =>
      d ? { ...d, status: newStatus, solved: newStatus === 'solved', attempted: true } : d
    );
  };

  const onCheck = async () => {
    if (!detail || checking) return;
    if (!user) return;
    setChecking(true);
    setCheckError(null);
    try {
      const res = await checkAnswer(
        detail.module_slug,
        { exercise_id: detail.exercise_id, value },
        lang
      );
      setResult(res);
      applyStatus(res.correct ? 'solved' : detail.status === 'solved' ? 'solved' : 'attempted');
    } catch (e: unknown) {
      setCheckError(errText(e));
    } finally {
      setChecking(false);
    }
  };

  const selectedId = useMemo(
    () => (selectedModule && selectedExercise ? `${selectedModule}::${selectedExercise}` : null),
    [selectedModule, selectedExercise]
  );

  const currentIndex = selectedId
    ? problems.findIndex(p => `${p.module_slug}::${p.exercise_id}` === selectedId)
    : -1;

  const nextProblem =
    currentIndex >= 0 && currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;

  const pickRandom = () => {
    if (problems.length === 0) return;
    const candidates = problems.filter(
      (_, i) => i !== currentIndex
    );
    const pool = candidates.length > 0 ? candidates : problems;
    selectProblem(pool[Math.floor(Math.random() * pool.length)]);
  };

  /** Clear a graded result so the learner can genuinely re-attempt. XP rules
   *  are untouched: the server only ever awards the first-ever correct answer. */
  const retry = () => {
    setResult(null);
    setValue(null);
    setCheckError(null);
  };

  const activeFilters =
    (domain ? 1 : 0) +
    (track ? 1 : 0) +
    (difficulty ? 1 : 0) +
    (type ? 1 : 0) +
    (status ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const clearFilters = () => {
    setDomain('');
    setTrack('');
    setDifficulty('');
    setType('');
    setStatus('');
    setSearch('');
    setDebouncedSearch('');
  };

  if (!ready) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PracticeTabs />
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link
            href="/review"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeftIcon size={16} />
            {tr('back')}
          </Link>
          <Badge tone="primary">
            <CodeIcon size={12} />
            {tr('navProblems')}
          </Badge>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {tr('problemsTitle')}
        </h1>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
          {tr('problemsSubtitle')}
        </p>
      </div>

      <Journey className="mb-4" />

      {data && (
        <Card className="mb-4 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="flex items-baseline gap-1.5">
              <span className="num text-2xl font-extrabold text-white">{data.solved_total}</span>
              <span className="num text-sm font-semibold text-text-muted">
                / {data.catalogue_total}
              </span>
              <span className="text-sm text-text-muted">{tr('problemsSolved')}</span>
            </p>
            <p className="text-xs text-text-muted">
              <span className="num font-semibold text-text-secondary">{data.total}</span>{' '}
              {tr('problemsCount')}
            </p>
          </div>
          <Progress
            className="mt-3"
            value={data.solved_total}
            max={Math.max(1, data.catalogue_total)}
            tone="success"
            label={tr('problemsProgress')}
          />
        </Card>
      )}

      <Card className="mb-4 p-4">
        {/* grid-cols-1 = minmax(0,1fr): keeps the single-column mobile form
            from being floored by an input's intrinsic width (see the list grid
            comment below). */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="form-label">{tr('problemSearch')}</span>
            <span className="relative block">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-9"
                placeholder={tr('problemSearchPlaceholder')}
                aria-label={tr('problemSearch')}
              />
            </span>
          </label>

          <label className="block">
            <span className="form-label">{tr('filterTrack')}</span>
            <select className="input-base" value={track} onChange={e => setTrack(e.target.value)}>
              <option value="">{tr('filterAll')}</option>
              {data?.facets.tracks.map(t => (
                <option key={t.slug} value={t.slug}>
                  {t.title} ({t.count})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="form-label">{tr('filterDomain')}</span>
            <select
              className="input-base"
              value={domain}
              onChange={e => setDomain(e.target.value)}
            >
              <option value="">{tr('filterAll')}</option>
              {data?.facets.domains.map(d => (
                <option key={d.slug} value={d.slug}>
                  {d.title} ({d.count})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="form-label">{tr('filterType')}</span>
            <select className="input-base" value={type} onChange={e => setType(e.target.value as '' | ExerciseType)}>
              <option value="">{tr('filterAll')}</option>
              {TYPES.map(key => {
                const count = data?.facets.types.find(t => t.key === key)?.count ?? 0;
                return (
                  <option key={key} value={key}>
                    {tr(TYPE_KEY[key])} ({count})
                  </option>
                );
              })}
            </select>
          </label>

          {user ? (
            <label className="block">
              <span className="form-label">{tr('filterStatus')}</span>
              <select
                className="input-base"
                value={status}
                onChange={e => setStatus(e.target.value as '' | ProblemStatus)}
              >
                <option value="">{tr('filterAll')}</option>
                {(['new', 'attempted', 'solved'] as ProblemStatus[]).map(key => {
                  const count = data?.facets.statuses.find(s => s.key === key)?.count ?? 0;
                  return (
                    <option key={key} value={key}>
                      {tr(STATUS_KEY[key])} ({count})
                    </option>
                  );
                })}
              </select>
            </label>
          ) : (
            <div className="hidden lg:block" aria-hidden="true" />
          )}
        </div>

        <div className="mt-4">
          <span className="form-label">{tr('filterDifficulty')}</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={tr('filterDifficulty')}>
            <button
              type="button"
              aria-pressed={difficulty === ''}
              onClick={() => setDifficulty('')}
              className={chipClass(difficulty === '')}
            >
              {tr('filterAll')}
            </button>
            {DIFFICULTIES.map(key => {
              const count = data?.facets.difficulties.find(d => d.key === key)?.count ?? 0;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={difficulty === key}
                  onClick={() => setDifficulty(key)}
                  className={chipClass(difficulty === key)}
                >
                  {tr(DIFF_KEY[key])}
                  <span className="num opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeFilters > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <span className="text-xs text-text-muted">
              {tr('filtersActive')}: <span className="num font-semibold">{activeFilters}</span>
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
            >
              <RefreshIcon size={14} />
              {tr('clearFilters')}
            </button>
          </div>
        )}
      </Card>

      {/* `grid-cols-1` is Tailwind's `repeat(1, minmax(0,1fr))`. Without it the
          implicit `auto` track resolves to a content-based minimum and refuses
          to shrink below the rows' min-content, pushing a 400px column into a
          360px viewport (horizontal page scroll). `minmax(0,1fr)` lets the
          track shrink and lets the row's own truncation do the clipping. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-start">
        <div className={selectedId ? 'hidden lg:block' : ''}>
          {loading ? (
            <div className="flex flex-col gap-2" aria-busy="true" aria-label={tr('loading')}>
              {[0, 1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-[5.5rem] w-full" />
              ))}
            </div>
          ) : error ? (
            <Card className="p-4">
              <ErrorNote>{error}</ErrorNote>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => setReloadKey(k => k + 1)}>
                  {tr('retry')}
                </Button>
              </div>
            </Card>
          ) : problems.length === 0 ? (
            <Card>
              <EmptyState
                icon={<TargetIcon size={26} />}
                title={tr('problemsEmptyTitle')}
                body={tr('problemsEmptyBody')}
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    {tr('clearFilters')}
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              <ul className="flex flex-col gap-2" role="list">
                {problems.map(p => {
                  const id = `${p.module_slug}::${p.exercise_id}`;
                  const active = id === selectedId;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => selectProblem(p)}
                        aria-current={active ? 'true' : undefined}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                          active
                            ? 'border-cyan-500/40 bg-cyan-500/[0.06]'
                            : p.solved
                              ? 'border-success/30 bg-surface-900 hover:border-success/50'
                              : p.attempted
                                ? 'border-warning/30 bg-surface-900 hover:border-warning/50'
                                : 'border-border bg-surface-900 hover:border-border-light'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                              <Badge tone={DIFF_TONE[p.difficulty]}>{tr(DIFF_KEY[p.difficulty])}</Badge>
                              <Badge>{tr(TYPE_KEY[p.type])}</Badge>
                              {/* Status is icon + text, never colour alone. */}
                              {p.solved && (
                                <Badge tone="success">
                                  <CheckIcon size={12} />
                                  {tr('statusSolved')}
                                </Badge>
                              )}
                              {!p.solved && p.attempted && (
                                <Badge tone="warning">
                                  <RefreshIcon size={12} />
                                  {tr('statusAttempted')}
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`line-clamp-2 text-sm font-medium leading-relaxed ${
                                active ? 'text-white' : 'text-text-primary'
                              }`}
                            >
                              {p.question}
                            </p>
                            <p className="mt-1 truncate text-xs text-text-muted">
                              {p.domain_title} · {p.module_title}
                            </p>
                          </div>
                          <ChevronRightIcon size={16} className="mt-1 shrink-0 text-text-muted" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {data?.has_more && (
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? tr('loading') : tr('loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <aside className={selectedId ? '' : 'hidden lg:block'} aria-label={tr('selectProblem')}>
          <div className="lg:sticky lg:top-20">
            {!selectedId ? (
              <Card className="p-6">
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-xl border border-border bg-surface-800 text-cyan-300">
                    <TargetIcon size={26} />
                  </span>
                  <p className="text-base font-semibold text-white">{tr('selectProblem')}</p>
                  <p className="max-w-[32ch] text-sm leading-relaxed text-text-muted">
                    {tr('selectProblemBody')}
                  </p>
                </div>
              </Card>
            ) : detailLoading ? (
              <Card className="p-4">
                <Skeleton className="mb-3 h-5 w-24" />
                <Skeleton className="mb-2 h-6 w-full" />
                <Skeleton className="h-40 w-full" />
              </Card>
            ) : detailError ? (
              <Card className="p-4">
                <ErrorNote>{detailError}</ErrorNote>
                <div className="mt-3">
                  <Button variant="ghost" onClick={clearSelection}>
                    {tr('backToList')}
                  </Button>
                </div>
              </Card>
            ) : detail ? (
              <Card className="p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary lg:hidden"
                  >
                    <ArrowLeftIcon size={16} />
                    {tr('backToList')}
                  </button>
                  <Badge tone={DIFF_TONE[detail.difficulty]}>
                    {tr(DIFF_KEY[detail.difficulty])}
                  </Badge>
                </div>

                {/* Mission brief. Every line is a real field: the module is the
                    objective (this exercise is one step of it), the domain is
                    the skill being practised, and difficulty/status come from
                    the curriculum and the learner's own attempts. No invented
                    scenario prose — the exercise's own question is the task. */}
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {tr('missionBrief')}
                </p>
                <h2 className="mt-1 text-base font-bold leading-snug text-white">
                  {detail.module_title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone="primary">
                    <DomainIcon slug={detail.domain_slug} size={12} />
                    {detail.domain_title}
                  </Badge>
                  <Badge>{tr(TYPE_KEY[detail.type])}</Badge>
                  {detail.solved ? (
                    <Badge tone="success">
                      <CheckIcon size={12} />
                      {tr('missionStatusSolved')}
                    </Badge>
                  ) : detail.attempted ? (
                    <Badge tone="warning">{tr('missionStatusAttempted')}</Badge>
                  ) : (
                    <Badge>{tr('missionStatusNew')}</Badge>
                  )}
                </div>

                <div className="mt-3 grid gap-1.5 rounded-lg border border-border bg-surface-950/50 px-3 py-2.5 text-xs">
                  <div className="flex flex-wrap gap-x-1.5">
                    <span className="font-semibold text-text-muted">{tr('missionObjective')}:</span>
                    <span className="text-text-secondary">{tr('missionObjectiveBody')}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-1.5">
                    <span className="font-semibold text-text-muted">{tr('missionSkill')}:</span>
                    <span className="text-text-secondary">{detail.domain_title}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-1.5">
                    <span className="font-semibold text-text-muted">
                      {tr('whatCountsAsCorrect')}:
                    </span>
                    <span className="text-text-secondary">{tr(CORRECT_KEY[detail.type])}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <ExerciseRenderer
                    ex={detail.exercise}
                    value={value}
                    onChange={setValue}
                    locked={!user || Boolean(result)}
                    reveal={result?.reveal}
                  />
                </div>

                {/* Graduated hints: strategy first, then a server-derived
                    narrowing — never the answer. Available only before a
                    graded attempt. */}
                {user && !result && (
                  <HintLadder
                    key={detail.exercise_id}
                    moduleSlug={detail.module_slug}
                    exercise={detail.exercise}
                    lessonHref={`/modules/${detail.module_slug}`}
                    className="mt-3"
                  />
                )}

                <div aria-live="polite">
                  {checkError && <ErrorNote className="mt-3">{checkError}</ErrorNote>}
                  {result && (
                    <AnswerFeedback
                      className="mt-3"
                      correct={result.correct}
                      reveal={result.reveal}
                      explain={result.explain}
                      exercise={detail.exercise}
                      value={value}
                      xpEarned={result.xp_earned}
                      action={
                        result.correct ? (
                          result.new_achievements.length > 0 ? (
                            <p className="text-xs font-semibold text-warning">
                              {result.new_achievements.map(k => tr(`ach_${k}_t`)).join(' · ')}
                            </p>
                          ) : undefined
                        ) : (
                          // A wrong answer earns a route back to the concept,
                          // not just a red line: the same domain filter, so the
                          // learner practises the skill they just missed.
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs text-text-muted">{tr('missionReviewBody')}</p>
                            <ButtonLink
                              href="/review"
                              variant="secondary"
                              size="sm"
                            >
                              <RefreshIcon size={14} />
                              {tr('missionReviewAction')}
                            </ButtonLink>
                          </div>
                        )
                      }
                    />
                  )}
                </div>

                {!user ? (
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-text-secondary">{tr('signInToSolve')}</p>
                    <ButtonLink href="/auth?next=/problems" className="w-full">
                      {tr('login')}
                    </ButtonLink>
                  </div>
                ) : result ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      onClick={() => nextProblem && selectProblem(nextProblem)}
                      disabled={!nextProblem}
                      className="w-full"
                    >
                      {tr('nextProblem')}
                      <ArrowRightIcon size={16} />
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={retry} className="flex-1">
                        <RefreshIcon size={15} />
                        {tr('retryAttempt')}
                      </Button>
                      <Button variant="secondary" onClick={pickRandom} className="flex-1">
                        {tr('randomProblem')}
                      </Button>
                    </div>
                    <ButtonLink
                      href={`/modules/${detail.module_slug}`}
                      variant="ghost"
                      className="w-full"
                    >
                      {tr('openLesson')}
                    </ButtonLink>
                  </div>
                ) : (
                  <Button
                    className="mt-4 w-full"
                    onClick={onCheck}
                    disabled={checking || !isAnswerReady(detail.exercise, value)}
                  >
                    {checking ? tr('loading') : tr('submitAnswer')}
                  </Button>
                )}
              </Card>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
