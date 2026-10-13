'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, fetchPaths, LearningPath, Domain, PathModule } from '@/lib/api';
import { Card, ErrorNote, EmptyState, Skeleton, ButtonLink } from '@/components/ui';
import { CheckIcon, CompassIcon, LockIcon, PlayIcon } from '@/components/icons';

function nodeStatus(pm: PathModule): 'done' | 'current' | 'open' | 'locked' {
  return pm.state;
}

/** One node on the path. Circles are an intentional exception to the squircle
 *  rule: a node is a position on a route, not a control. */
function PathNode({ m, i }: { m: PathModule; i: number }) {
  const status = nodeStatus(m);
  const href = status === 'locked' ? undefined : `/modules/${m.slug}`;
  const locked = status === 'locked';

  const styles: Record<string, string> = {
    done: 'border-success/50 bg-success/15 text-success',
    current: 'border-cyan-400 bg-cyan-400 text-text-inverse shadow-[0_0_0_4px_rgb(34_211_238/0.2)] animate-[cq-pop_0.6s_ease]',
    open: 'border-border-light bg-surface-700 text-text-primary hover:border-cyan-500/60 hover:text-white',
    locked: 'border-border bg-surface-800 text-text-muted',
  };

  const content =
    status === 'done' ? (
      <CheckIcon size={20} />
    ) : status === 'current' ? (
      <PlayIcon size={18} />
    ) : locked ? (
      <LockIcon size={17} />
    ) : (
      <span className="num text-sm">{i + 1}</span>
    );

  const statusLabel = { done: 'done', current: 'current', open: 'open', locked: 'locked' }[status];

  const node = (
    <span
      aria-label={statusLabel}
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-lg font-bold ${styles[status]} ${
        locked ? '' : 'transition-transform duration-150 hover:scale-105'
      }`}
    >
      {content}
    </span>
  );

  const label = (
    <span
      title={m.title}
      className={`w-16 text-center text-[0.625rem] font-medium leading-snug ${locked ? 'text-text-muted' : 'text-text-secondary'}`}
      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
    >
      {m.title}
    </span>
  );

  return (
    <li className="flex flex-col items-center gap-1.5">
      {href ? (
        <Link href={href} aria-label={m.title} className="flex flex-col items-center gap-1.5">
          {node}
          {label}
        </Link>
      ) : (
        <span className="flex flex-col items-center gap-1.5" aria-disabled={locked}>
          {node}
          {label}
        </span>
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
          <span aria-hidden="true" className="text-xl">{domain.icon}</span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-white">{domain.title}</h3>
            <p className="truncate text-xs text-text-muted">{domain.description}</p>
          </div>
        </div>
        <span className="num shrink-0 text-xs font-bold text-text-secondary">
          {domain.completed}/{domain.total}
        </span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
        <div
          className="fill-x h-full rounded-full bg-cyan-400"
          style={{ transform: `scaleX(${pct / 100})`, transformOrigin: 'left' }}
        />
      </div>
      <ol className="flex items-start justify-start gap-3 overflow-x-auto pb-1">
        {domain.modules.map((m, i) => (
          <PathNode key={m.slug} m={m} i={i} />
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
