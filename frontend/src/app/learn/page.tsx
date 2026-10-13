'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, fetchPaths, LearningPath, Domain, PathModule } from '@/lib/api';
import { Card, ErrorNote, EmptyState, Skeleton, ButtonLink, Badge } from '@/components/ui';
import { CheckIcon, ChevronRightIcon, CompassIcon, LockIcon, PlayIcon, TrophyIcon } from '@/components/icons';

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
    current: 'border-cyan-400 bg-cyan-400 text-text-inverse shadow-[0_0_0_4px_rgb(34_211_238/0.18)] animate-[cq-pop_0.6s_ease]',
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
        <p className={`text-sm font-semibold leading-snug ${locked ? 'text-text-muted' : 'text-text-primary'}`}>{m.title}</p>
        <p className="num mt-1 text-xs text-text-muted">
          {m.exercise_count} {tr('challenge').toLowerCase()}
          <span aria-hidden="true"> · </span>
          {m.xp_reward} XP
          {m.kind === 'checkpoint' && (
            <>
              <span aria-hidden="true"> · </span>
              {tr('checkpoint')}
            </>
          )}
        </p>
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
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-800 text-lg"
          >
            {domain.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-white">{domain.title}</h3>
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

function LearnInner() {
  const { lang, user } = useApp();
  const tr = makeT(lang);
  const [data, setData] = useState<{ paths: LearningPath[]; continue: { slug: string; title: string; position: number; total: number } | null } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

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
    <div className="stagger flex flex-col gap-4">
      {/* Continue strip */}
      {data.continue && (
        <Card className="flex items-center gap-3 border-cyan-500/30 bg-cyan-500/[0.06]">
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
              <span aria-hidden="true" className="text-xl">{path.icon}</span>
              <h2 className="text-base font-extrabold tracking-tight text-white">{path.title}</h2>
            </div>
            {path.domains.length === 0 ? (
              <EmptyState emoji={path.icon} title={tr('pathEmptyTitle')} body={tr('pathEmptyBody')} />
            ) : (
              path.domains.map(domain => <DomainRow key={domain.slug} domain={domain} />)
            )}
          </div>
        ))
      )}
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
