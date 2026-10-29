'use client';
import { stagger } from '@/lib/motion';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { AssessmentSummary, LearningPath, fetchAssessments, fetchPaths } from '@/lib/api';
import { Badge, ButtonLink, Card, EmptyState, ErrorNote, Skeleton } from '@/components/ui';
import { CompassIcon, ContentIcon, LockIcon } from '@/components/icons';

type Readiness = 'passed' | 'inprogress' | 'ready' | 'locked';

function readiness(a: AssessmentSummary): Readiness {
  if (a.in_progress) return 'inprogress';
  if (a.passed) return 'passed';
  return a.eligible ? 'ready' : 'locked';
}

const STATUS_TONE = { passed: 'success', inprogress: 'primary', ready: 'primary', locked: 'neutral' } as const;
const STATUS_KEY = { passed: 'assessPassed', inprogress: 'statusInProgress', ready: 'statusReady', locked: 'assessmentLocked' } as const;

interface Checkpoint {
  slug: string;
  title: string;
  domainTitle: string;
  domainIcon: string;
  state: 'done' | 'current' | 'locked';
  requires: string | null;
}

/**
 * Assessments, as one readiness table. Each track has a scored, timed paper
 * graded by the server (pass mark, one-time XP, unlimited retakes); topic
 * checkpoints are listed underneath and are graded like lessons. Neither is a
 * certificate, and the page says so once, plainly.
 */
export default function AssessmentsPage() {
  const { lang, user, ready } = useApp();
  const tr = makeT(lang);

  const [scored, setScored] = useState<AssessmentSummary[] | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    fetchAssessments(lang)
      .then(d => alive && setScored(d.assessments))
      .catch(() => alive && setFailed(true));
    fetchPaths(lang)
      .then(d => {
        if (!alive) return;
        const out: Checkpoint[] = [];
        for (const p of d.paths as LearningPath[]) {
          for (const dom of p.domains) {
            for (const m of dom.modules) {
              if (m.kind !== 'checkpoint') continue;
              out.push({
                slug: m.slug,
                title: m.title,
                domainTitle: dom.title,
                domainIcon: dom.icon,
                state: m.state as Checkpoint['state'],
                requires: m.prerequisite?.title ?? null,
              });
            }
          }
        }
        setCheckpoints(out);
      })
      .catch(() => alive && setCheckpoints([]));
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  const passedCount = useMemo(() => scored?.filter(a => a.passed).length ?? 0, [scored]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{tr('assessmentsTitle')}</h1>
      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">{tr('assessmentsIntro')}</p>

      {scored && (
        <p className="num mt-4 font-mono text-sm text-text-secondary">
          <span className="font-bold text-text-primary">{passedCount}</span>
          <span aria-hidden="true">/</span>
          <span>{scored.length}</span> {tr('assessSummary')}
        </p>
      )}

      {ready && !user && (
        <div className="mt-4">
          <ErrorNote>{tr('assessmentsSignIn')}</ErrorNote>
        </div>
      )}

      <div className="mt-5">
        {failed ? (
          <Card>
            <EmptyState icon={<CompassIcon size={26} className="text-text-muted" />} title={tr('loadError')} body={tr('networkError')} />
          </Card>
        ) : !scored ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1fr)_6rem_6rem_8rem_8rem] gap-3 border-b border-border/60 bg-surface-950/40 px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-wider text-text-muted md:grid"
            >
              <span>{tr('colTrack')}</span>
              <span>{tr('colLessons')}</span>
              <span>{tr('colBest')}</span>
              <span>{tr('colStatus')}</span>
              <span />
            </div>
            <ul className="divide-y divide-border/60">
              {scored.map((a, i) => {
                const st = readiness(a);
                return (
                  <li
                    key={a.slug}
                    style={stagger(i)}
                    className="stagger-item grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_6rem_6rem_8rem_8rem]"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <ContentIcon name={a.icon} size={18} className="shrink-0 text-cyan-300" />
                        <span className="min-w-0 break-words">{a.title}</span>
                      </p>
                      <p className="num mt-0.5 pl-[1.625rem] font-mono text-[0.6875rem] text-text-muted">
                        {a.question_count} {tr('assessQuestions')} | {a.time_limit_minutes} {tr('assessMinutes')} | {a.pass_mark}%
                      </p>
                    </div>

                    <p className="num order-3 text-xs text-text-secondary md:order-none md:text-sm">
                      <span className="md:hidden">{tr('colLessons')}: </span>
                      {a.lessons_completed}/{a.lessons_required}
                    </p>
                    <p className="num order-4 text-xs text-text-secondary md:order-none md:text-sm">
                      <span className="md:hidden">{tr('colBest')}: </span>
                      {a.best_percent === null ? '-' : `${a.best_percent}%`}
                      {a.attempts > 0 && <span className="text-text-muted"> ({a.attempts})</span>}
                    </p>
                    <p className="order-2 justify-self-end md:order-none md:justify-self-start">
                      <Badge tone={STATUS_TONE[st]}>{tr(STATUS_KEY[st])}</Badge>
                    </p>

                    <div className="order-5 col-span-2 md:order-none md:col-span-1 md:justify-self-end">
                      {st === 'locked' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                          <LockIcon size={13} /> {tr('assessNeedLessons')} {a.lessons_required - a.lessons_completed}
                        </span>
                      ) : a.in_progress ? (
                        <ButtonLink href={`/assessments/take?attempt=${a.in_progress.attempt_id}`} size="sm">{tr('assessContinue')}</ButtonLink>
                      ) : (
                        <ButtonLink href={`/assessments/take?slug=${a.slug}`} size="sm" variant={a.attempts > 0 ? 'secondary' : 'primary'}>
                          {a.attempts > 0 ? tr('assessRetake') : tr('assessmentStart')}
                        </ButtonLink>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      <p className="mt-3 text-xs text-text-muted">{tr('assessmentsNote')}</p>

      {checkpoints && checkpoints.length > 0 && (
        <details className="mt-8 rounded-lg border border-border bg-surface-900">
          <summary className="cursor-pointer select-none px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary">
            {tr('assessCheckpointsTitle')} ({checkpoints.length})
          </summary>
          <ul className="divide-y divide-border/60 border-t border-border/60">
            {checkpoints.map(c => (
              <li key={c.slug} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <ContentIcon name={c.domainIcon} size={16} className="shrink-0 text-cyan-300" />
                <span className="min-w-0 flex-1 text-sm text-text-primary">{c.title}</span>
                {c.state === 'locked' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                    <LockIcon size={13} /> {tr('stateLocked')}
                  </span>
                ) : (
                  <Link
                    href={`/modules/${c.slug}`}
                    className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold text-text-primary hover:bg-surface-800"
                  >
                    {c.state === 'done' ? tr('rowReview') : tr('assessmentStart')}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
