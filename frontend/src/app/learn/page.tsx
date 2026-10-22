'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  Difficulty,
  fetchPaths,
  fetchStats,
  LearningPath,
  Domain,
  PathModule,
  TopicStat,
} from '@/lib/api';
import { Card, ErrorNote, EmptyState, Skeleton, ButtonLink, Badge } from '@/components/ui';
import { ArrowRightIcon, CheckIcon, ChevronRightIcon, CodeIcon, CompassIcon, DomainIcon, LockIcon, PlayIcon, RefreshIcon, TrophyIcon } from '@/components/icons';

const DIFF_KEY: Record<Difficulty, string> = {
  beginner: 'difficultyBeginner',
  intermediate: 'difficultyIntermediate',
  advanced: 'difficultyAdvanced',
};

const DIFF_TONE: Record<Difficulty, 'success' | 'primary' | 'warning'> = {
  beginner: 'success',
  intermediate: 'primary',
  advanced: 'warning',
};

/** One module on the path: a numbered node on a connected route, plus a card
 *  carrying the title, exercise count, XP and the module's state. Circles are an
 *  intentional exception to the squircle rule: a node is a position on a route,
 *  not a control. The `state`/`href`/locked logic is unchanged from before. */
function ModuleRow({ m, i, last }: { m: PathModule; i: number; last: boolean }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const status = m.state;
  const locked = status === 'locked';
  const href = locked ? undefined : `/modules/${m.slug}`;

  const nodeStyle: Record<PathModule['state'], string> = {
    done: 'border-success/50 bg-success/15 text-success',
    current: 'border-cyan-400 bg-cyan-400 text-text-inverse shadow-[0_0_0_4px_rgb(34_211_238/0.18)]',
    open: 'border-border-light bg-surface-700 text-text-primary',
    locked: 'border-border bg-surface-800 text-text-muted',
  };

  const nodeIcon =
    status === 'done' ? (
      <CheckIcon size={18} />
    ) : status === 'current' ? (
      <PlayIcon size={16} />
    ) : locked ? (
      <LockIcon size={15} />
    ) : m.kind === 'checkpoint' ? (
      <TrophyIcon size={16} />
    ) : (
      <span className="num text-sm">{i + 1}</span>
    );

  const cardStyle =
    status === 'current'
      ? 'border-cyan-500/40 bg-cyan-500/[0.07] hover:border-cyan-400/60'
      : status === 'done'
        ? 'border-border bg-surface-900 hover:border-border-light'
        : locked
          ? 'border-border/70 bg-surface-950/50'
          : 'border-border bg-surface-900 hover:border-border-light hover:bg-surface-800';

  const row = (
    <>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-snug break-words ${locked ? 'text-text-muted' : 'text-text-primary'}`}>{m.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          {m.difficulty && DIFF_KEY[m.difficulty] && (
            <Badge tone={DIFF_TONE[m.difficulty]}>{tr(DIFF_KEY[m.difficulty])}</Badge>
          )}
          <span className="num text-xs text-text-muted">
            {m.exercise_count} {tr('challenge').toLowerCase()}
            <span aria-hidden="true"> · </span>
            {m.xp_reward} XP
            {m.kind === 'checkpoint' && (
              <>
                <span aria-hidden="true"> · </span>
                {tr('checkpoint')}
              </>
            )}
          </span>
        </div>
        {locked && m.prerequisite && (
          <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
            {tr('prereqNeeded')} <span className="text-text-secondary">«{m.prerequisite.title}»</span>
          </p>
        )}
      </div>
      <span className="shrink-0">
        {status === 'done' ? (
          <Badge tone="success">{tr('stateDone')}</Badge>
        ) : status === 'current' ? (
          <Badge tone="primary">{tr('stateCurrent')}</Badge>
        ) : locked ? (
          <Badge tone="neutral">{tr('stateLocked')}</Badge>
        ) : (
          <ChevronRightIcon size={18} className="text-text-muted" />
        )}
      </span>
    </>
  );

  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center self-stretch">
        <span
          aria-hidden="true"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-base font-bold ${nodeStyle[status]}`}
        >
          {nodeIcon}
        </span>
        {!last && <span aria-hidden="true" className="mt-1 w-px flex-1 rounded bg-border" />}
      </div>
      {href ? (
        <Link
          href={href}
          className={`mb-2 flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3.5 py-3 transition-colors ${cardStyle}`}
        >
          {row}
        </Link>
      ) : (
        <div
          aria-disabled="true"
          className={`mb-2 flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3.5 py-3 ${cardStyle}`}
        >
          {row}
        </div>
      )}
    </li>
  );
}

function DomainRow({ domain }: { domain: Domain }) {
  const pct = domain.total > 0 ? Math.round((domain.completed / domain.total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border bg-surface-900 p-4 shadow-card edge-light">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-800 text-cyan-300"
          >
            <DomainIcon slug={domain.slug} size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-white">{domain.title}</h3>
            <p className="truncate text-xs text-text-muted">{domain.description}</p>
          </div>
        </div>
        <span className="num shrink-0 text-xs font-bold text-text-secondary">
          {domain.completed}/{domain.total}
        </span>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
        <div
          className="fill-x h-full rounded-full bg-cyan-400"
          style={{ transform: `scaleX(${pct / 100})`, transformOrigin: 'left' }}
        />
      </div>
      <ol className="flex flex-col">
        {domain.modules.map((m, i) => (
          <ModuleRow key={m.slug} m={m} i={i} last={i === domain.modules.length - 1} />
        ))}
      </ol>
    </section>
  );
}

/**
 * Real progress across the whole curriculum, counted from the `state` field the
 * API already assigns to every module. Nothing here is estimated: done counts
 * `state === 'done'`, review counts modules the learner has attempted without
 * completing, and the bar is done/total.
 */
function PathSummary({ paths }: { paths: LearningPath[] }) {
  const { lang } = useApp();
  const tr = makeT(lang);

  const all = paths.flatMap(p => p.domains.flatMap(d => d.modules));
  const total = all.length;
  const done = all.filter(m => m.state === 'done').length;
  const current = all.filter(m => m.state === 'current').length;
  const locked = all.filter(m => m.state === 'locked').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const cells: { key: string; label: string; value: number; tone: string }[] = [
    { key: 'done', label: tr('pathSummaryDone'), value: done, tone: 'text-success' },
    { key: 'current', label: tr('pathSummaryCurrent'), value: current, tone: 'text-cyan-300' },
    { key: 'locked', label: tr('pathSummaryLocked'), value: locked, tone: 'text-text-muted' },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {tr('pathOverall')}
        </p>
        <p className="num text-sm font-bold text-text-primary">
          {done}/{total} <span className="text-text-muted">· {pct}%</span>
        </p>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
        <div
          className="fill-x h-full rounded-full bg-cyan-400"
          style={{ transform: `scaleX(${pct / 100})`, transformOrigin: 'left' }}
        />
      </div>
      <dl className="mt-3.5 grid grid-cols-3 gap-2">
        {cells.map(c => (
          <div key={c.key} className="rounded-lg border border-border bg-surface-950/50 px-2.5 py-2">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-text-muted">
              {c.label}
            </dt>
            <dd className={`num mt-0.5 text-lg font-bold ${c.tone}`}>{c.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/**
 * The topics the learner should review, sourced from `/me/stats` weak_topics —
 * domains where real mistakes were recorded. Signed out, or with no mistakes,
 * it says so rather than inventing a recommendation.
 */
function ReviewPanel({ topics, signedIn }: { topics: TopicStat[]; signedIn: boolean }) {
  const { lang } = useApp();
  const tr = makeT(lang);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-800 text-cyan-300"
        >
          <RefreshIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">
            {topics.length > 0 ? tr('pathReviewTitle') : tr('pathNoReview')}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
            {topics.length > 0 ? tr('pathReviewBody') : tr('pathNoReviewBody')}
          </p>
        </div>
      </div>

      {topics.length > 0 && (
        <>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {topics.slice(0, 4).map(t => (
              <li key={t.slug}>
                <Badge tone="warning">
                  <DomainIcon slug={t.slug} size={12} />
                  {t.title}
                  <span className="num text-text-muted">{t.wrong}</span>
                </Badge>
              </li>
            ))}
          </ul>
          <ButtonLink href="/practice" variant="secondary" size="sm" className="mt-3 w-full sm:w-auto">
            {tr('pathReviewAction')}
            <ArrowRightIcon size={16} />
          </ButtonLink>
        </>
      )}

      {topics.length === 0 && !signedIn && (
        <ButtonLink href="/auth" variant="secondary" size="sm" className="mt-3 w-full sm:w-auto">
          {tr('login')}
          <ArrowRightIcon size={16} />
        </ButtonLink>
      )}
    </Card>
  );
}

function LearnInner() {
  const { lang, user } = useApp();
  const tr = makeT(lang);
  const [data, setData] = useState<{ paths: LearningPath[]; continue: { slug: string; title: string; position: number; total: number } | null } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [weakTopics, setWeakTopics] = useState<TopicStat[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchPaths(lang);
        if (!alive) return;
        setData({
          paths: res.paths,
          continue: res.continue
            ? { slug: res.continue.slug, title: res.continue.title, position: res.continue.position, total: res.continue.total }
            : null,
        });
      } catch (err) {
        if (alive) setError(err as ApiError);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  // Weak topics are a signed-in, best-effort signal. A failure here must not
  // break the path itself, so it is swallowed and simply renders the empty case.
  useEffect(() => {
    let alive = true;
    if (!user) {
      setWeakTopics([]);
      return;
    }
    fetchStats(lang)
      .then(s => {
        if (alive) setWeakTopics(s.weak_topics ?? []);
      })
      .catch(() => {
        if (alive) setWeakTopics([]);
      });
    return () => {
      alive = false;
    };
  }, [lang, user]);

  if (error) {
    return (
      <Card>
        <ErrorNote>{error.message}</ErrorNote>
        <div className="mt-4">
          <ButtonLink href="/learn">{tr('retry')}</ButtonLink>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const isEmpty = data.paths.every(p => p.domains.every(d => d.modules.length === 0));

  return (
    <div className="flex flex-col gap-8">
      {/* Progress summary — counted from real module states. */}
      {!isEmpty && <PathSummary paths={data.paths} />}

      {/* Continue strip */}
      {data.continue && (
        <Card className="flex items-center gap-3 border-cyan-500/30 bg-cyan-500/[0.06] p-4">
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-400 text-text-inverse">
            <PlayIcon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="label text-cyan-300">{tr('continueLearning')}</p>
            <p className="truncate text-sm font-bold text-white">{data.continue.title}</p>
            <p className="num text-xs text-text-secondary">
              {data.continue.position}/{data.continue.total}
            </p>
          </div>
          <Link
            href={`/modules/${data.continue.slug}`}
            className="shrink-0 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-bold text-text-inverse transition-colors hover:bg-cyan-300"
          >
            {tr('resumeLesson')}
          </Link>
        </Card>
      )}

      {isEmpty ? (
        <EmptyState
          icon={<CompassIcon size={26} className="text-text-muted" />}
          title={tr('pathEmptyTitle')}
          body={tr('pathEmptyBody')}
          action={<ButtonLink href="/">{tr('goHome')}</ButtonLink>}
        />
      ) : (
        data.paths.map(path => (
          <div key={path.slug} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span aria-hidden="true" className="text-cyan-300"><DomainIcon slug={path.slug} size={20} /></span>
              <h2 className="text-lg font-extrabold tracking-tight text-white">{path.title}</h2>
            </div>
            {path.domains.length === 0 ? (
              <EmptyState icon={<DomainIcon slug={path.slug} size={26} className="text-text-muted" />} title={tr('pathEmptyTitle')} body={tr('pathEmptyBody')} />
            ) : (
              path.domains.map(domain => <DomainRow key={domain.slug} domain={domain} />)
            )}
          </div>
        ))
      )}

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-800 text-cyan-300"
          >
            <CodeIcon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">{tr('arenaTitle')}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{tr('arenaBlurb')}</p>
          </div>
        </div>
        <ButtonLink href="/problems" variant="secondary" size="sm" className="mt-3 w-full sm:w-auto">
          {tr('openArena')}
          <ArrowRightIcon size={16} />
        </ButtonLink>
      </Card>

      <ReviewPanel topics={weakTopics} signedIn={Boolean(user)} />
    </div>
  );
}

export default function LearnPage() {
  const { lang } = useApp();
  const tr = makeT(lang);
  return (
    <div>
      <header className="mb-5">
        <h1 className="display">{tr('learningPath')}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{tr('choosePath')}</p>
      </header>
      <LearnInner />
    </div>
  );
}
