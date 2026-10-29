'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { AssessmentSummary, LearningPath, fetchAssessments, fetchPaths } from '@/lib/api';
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
  const [scored, setScored] = useState<AssessmentSummary[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAssessments(lang)
      .then(d => alive && setScored(d.assessments))
      .catch(() => alive && setScored([]));
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

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

      <section aria-labelledby="scored-h" className="mt-6">
        <h2 id="scored-h" className="text-sm font-bold uppercase tracking-wide text-text-muted">{tr('assessTrackTitle')}</h2>
        {!scored ? (
          <Skeleton className="mt-3 h-24 w-full" />
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {scored.map(a => (
              <li key={a.slug}>
                <Card className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="text-2xl leading-none">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold leading-snug text-text-primary">{a.title}</h3>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {a.question_count} {tr('assessQuestions')} · {a.time_limit_minutes} {tr('assessMinutes')} · {tr('assessPassMark')} {a.pass_mark}%
                      </p>
                    </div>
                    {a.passed && <Badge tone="success">{tr('assessPassed')}</Badge>}
                  </div>
                  {a.attempts > 0 && (
                    <p className="num text-xs text-text-muted">
                      {tr('assessBest')}: {a.best_percent}% · {a.attempts} {tr('assessAttempts')}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    {a.in_progress ? (
                      <ButtonLink href={`/assessments/take?attempt=${a.in_progress.attempt_id}`} size="sm">{tr('assessContinue')}</ButtonLink>
                    ) : a.eligible && user ? (
                      <ButtonLink href={`/assessments/take?slug=${a.slug}`} size="sm" variant={a.attempts > 0 ? 'secondary' : 'primary'}>
                        {a.attempts > 0 ? tr('assessRetake') : tr('assessmentStart')}
                      </ButtonLink>
                    ) : (
                      <p className="flex items-center gap-1.5 text-xs text-text-muted">
                        <LockIcon size={13} />
                        {tr('assessNeedLessons')} {a.lessons_completed}/{a.lessons_required}
                      </p>
                    )}
                    {a.needs_review && <Badge tone="warning">{tr('trackDraft')}</Badge>}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-text-muted">{tr('assessCheckpointsTitle')}</h2>
      <div className="mt-3">
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
