'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { LearningPath, fetchPaths } from '@/lib/api';
import { Badge, ButtonLink, Card, EmptyState, ErrorNote, Skeleton } from '@/components/ui';
import { CompassIcon, LockIcon } from '@/components/icons';

interface Item {
  slug: string;
  title: string;
  domainTitle: string;
  domainIcon: string;
  state: 'done' | 'current' | 'locked';
  requires: string | null;
  exercises: number;
}

/**
 * Today's assessments are the end-of-topic checkpoints: server-graded like any
 * lesson, but they do not yet have a separate scored attempt record, pass mark
 * or retake history. The page says so plainly instead of implying a
 * certificate; scored assessments are a later stage.
 */
export default function AssessmentsPage() {
  const { lang, user, ready } = useApp();
  const tr = makeT(lang);
  const [items, setItems] = useState<Item[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    fetchPaths(lang)
      .then(d => {
        if (!alive) return;
        const out: Item[] = [];
        for (const p of d.paths as LearningPath[]) {
          for (const dom of p.domains) {
            for (const m of dom.modules) {
              if (m.kind !== 'checkpoint') continue;
              out.push({
                slug: m.slug,
                title: m.title,
                domainTitle: dom.title,
                domainIcon: dom.icon,
                state: m.state as Item['state'],
                requires: m.prerequisite?.title ?? null,
                exercises: m.exercise_count,
              });
            }
          }
        }
        setItems(out);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{tr('assessmentsTitle')}</h1>
      <p className="mt-2 max-w-prose text-sm text-text-secondary">{tr('assessmentsIntro')}</p>
      <p className="mt-2 max-w-prose rounded-lg border border-border bg-surface-900 px-3 py-2 text-xs text-text-muted">
        {tr('assessmentsNote')}
      </p>

      {ready && !user && (
        <div className="mt-4">
          <ErrorNote>{tr('assessmentsSignIn')}</ErrorNote>
        </div>
      )}

      <div className="mt-6">
        {failed ? (
          <Card>
            <EmptyState icon={<CompassIcon size={26} className="text-text-muted" />} title={tr('loadError')} body={tr('networkError')} />
          </Card>
        ) : !items ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState icon={<CompassIcon size={26} className="text-text-muted" />} title={tr('assessmentsEmpty')} body="" />
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map(it => (
              <li key={it.slug}>
                <Card className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="text-2xl leading-none">{it.domainIcon}</span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-bold leading-snug text-text-primary">{it.title}</h2>
                      <p className="mt-0.5 text-xs text-text-secondary">{it.domainTitle}</p>
                    </div>
                    <Badge tone={it.state === 'done' ? 'success' : it.state === 'current' ? 'primary' : 'neutral'}>
                      {it.state === 'done' ? tr('assessmentDone') : it.state === 'current' ? tr('assessmentOpen') : tr('assessmentLocked')}
                    </Badge>
                  </div>
                  <div className="mt-auto">
                    {it.state === 'locked' ? (
                      <p className="flex items-center gap-1.5 text-xs text-text-muted">
                        <LockIcon size={13} />
                        {tr('assessmentRequires')} {it.requires}
                      </p>
                    ) : (
                      <ButtonLink href={`/modules/${it.slug}`} size="sm" variant={it.state === 'done' ? 'secondary' : 'primary'}>
                        {it.state === 'done' ? tr('assessmentRetake') : tr('assessmentStart')}
                      </ButtonLink>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
