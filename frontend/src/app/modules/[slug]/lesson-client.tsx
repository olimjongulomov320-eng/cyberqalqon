'use client';
import { stagger } from '@/lib/motion';
import CountUp from '@/components/CountUp';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, CompleteResult, Exercise, ModuleDetail, completeModule, fetchModule } from '@/lib/api';
import { achievementMeta } from '@/lib/gamification';
import TaskCard, { TaskOutcome } from '@/components/TaskCard';
import { Badge, Button, ButtonLink, Card, ErrorNote, Progress, Skeleton } from '@/components/ui';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@/components/icons';

type Phase = 'loading' | 'ready' | 'done' | 'error';

/**
 * A lesson is a workspace, not a quiz: the concept on the left, the tasks on
 * the right. Tasks can be attempted in any order and retried freely; the
 * lesson is complete when every task is solved. All grading and the
 * "solved" rule live on the server.
 */
export default function LessonView({ slug }: { slug: string }) {
  const { lang, user, setUser, ready: sessionReady } = useApp();
  const tr = makeT(lang);

  const [phase, setPhase] = useState<Phase>('loading');
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [initiallySolved, setInitiallySolved] = useState<Set<string>>(new Set());
  const [error, setError] = useState<ApiError | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [complete, setComplete] = useState<CompleteResult | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    let alive = true;
    setError(null);
    fetchModule(slug, lang)
      .then(d => {
        if (!alive) return;
        setModule(d.module);
        setExercises(d.exercises);
        const s = new Set(d.progress?.solved ?? []);
        setSolved(s);
        setInitiallySolved(s);
        setPhase('ready');
      })
      .catch(e => {
        if (!alive) return;
        setError(e as ApiError);
        setPhase('error');
      });
    return () => {
      alive = false;
    };
    // initiallySolved is derived from the fetch; refetching on language change keeps solved state.
  }, [slug, lang, sessionReady, user?.id]);

  const onResult = useCallback(
    (id: string, outcome: TaskOutcome) => {
      if (outcome.correct) setSolved(prev => new Set(prev).add(id));
      const r = outcome.result;
      if (user && typeof r.total_xp === 'number') {
        setUser({ ...user, total_xp: r.total_xp, current_streak: r.streak, longest_streak: r.longest_streak });
      }
    },
    [user, setUser]
  );

  const total = exercises.length;
  const solvedCount = useMemo(() => exercises.filter(e => solved.has(e.id)).length, [exercises, solved]);
  const allSolved = total > 0 && solvedCount === total;

  async function finish() {
    if (!allSolved || finishing) return;
    setFinishing(true);
    setFinishError(null);
    try {
      const res = await completeModule(slug, lang);
      setComplete(res);
      setPhase('done');
      if (user) {
        setUser({
          ...user,
          total_xp: res.total_xp,
          current_streak: res.streak,
          longest_streak: res.longest_streak,
          modules_completed: (user.modules_completed ?? 0) + (res.first_time ? 1 : 0),
        });
      }
    } catch (e) {
      const err = e as ApiError;
      setFinishError(err.isOffline || err.isTimeout ? tr('networkError') : tr('loadError'));
    } finally {
      setFinishing(false);
    }
  }

  /* ── Loading / error ── */
  if (phase === 'loading') {
    return (
      <div className="grid gap-6 lg:grid-cols-[5fr_7fr]" aria-busy="true">
        <Skeleton className="h-80 w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (phase === 'error' || !module) {
    const locked = error?.code === 'MODULE_LOCKED';
    return (
      <Card className="p-5">
        <ErrorNote>
          {locked ? tr('lessonLockedMsg') : error?.isTimeout ? tr('timeoutError') : error?.isOffline ? tr('networkError') : tr('loadError')}
        </ErrorNote>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => window.location.reload()}>{tr('retry')}</Button>
          <ButtonLink href="/learn" variant="secondary">{tr('backToModules')}</ButtonLink>
        </div>
      </Card>
    );
  }

  /* ── Finished ── */
  if (phase === 'done' && complete) {
    const isCheckpoint = complete.is_checkpoint;
    return (
      <div className="mx-auto max-w-xl">
        <Card className="p-6">
          <p className="label">{module.domain_title}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
            {isCheckpoint ? tr('checkpointComplete') : tr('lessonCompleteTitle')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{module.title}</p>

          <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="stagger-item rounded-md border border-border p-3" style={stagger(1)}>
              <dd className="text-xl font-bold text-warning">+<CountUp value={complete.xp_earned} /></dd>
              <dt className="mt-0.5 text-xs text-text-muted">XP</dt>
            </div>
            <div className="stagger-item rounded-md border border-border p-3" style={stagger(2)}>
              <dd className="text-xl font-bold text-text-primary"><CountUp value={complete.accuracy} suffix="%" /></dd>
              <dt className="mt-0.5 text-xs text-text-muted">{tr('accuracy')}</dt>
            </div>
            <div className="stagger-item rounded-md border border-border p-3" style={stagger(3)}>
              <dd className="text-xl font-bold text-text-primary"><CountUp value={complete.streak} /></dd>
              <dt className="mt-0.5 text-xs text-text-muted">{tr('streak')}</dt>
            </div>
          </dl>

          {complete.perfect && <p className="mt-4 text-sm font-semibold text-success">{tr('perfect')}</p>}

          {complete.new_achievements.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {complete.new_achievements.map(k => (
                <li key={k}>
                  <Badge tone="warning">{achievementMeta(k, lang, tr)?.title ?? k}</Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {complete.next_module_slug ? (
              <ButtonLink href={`/modules/${complete.next_module_slug}`}>
                {tr('nextModule')}: {complete.next_module_title}
                <ArrowRightIcon size={16} />
              </ButtonLink>
            ) : null}
            <ButtonLink href="/learn" variant="secondary">{tr('viewPath')}</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Workspace ── */
  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
        <Link href="/learn" className="inline-flex items-center gap-1 font-medium hover:text-text-primary">
          <ArrowLeftIcon size={14} />
          {tr('navLearn')}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{module.domain_title}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary [overflow-wrap:anywhere] sm:text-[1.75rem]">{module.title}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {module.kind === 'checkpoint' ? <Badge tone="warning">{tr('checkpoint')}</Badge> : null}{' '}
            <span className="num">{total}</span> {tr('lessonTasks').toLowerCase()} | <span className="num">{module.xp_reward}</span> XP
          </p>
        </div>
        <div className="w-full sm:w-56">
          <div className="mb-1 flex justify-between text-xs text-text-muted">
            <span>{tr('lessonSolvedOf')}</span>
            <span className="num font-semibold text-text-primary">{solvedCount}/{total}</span>
          </div>
          <Progress value={total ? (solvedCount / total) * 100 : 0} label={tr('lessonSolvedOf')} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {/* Concept */}
        <section
          aria-label={tr('lessonConcept')}
          className="rounded-lg border border-border bg-surface-900 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto"
        >
          <h2 className="border-b border-border/60 px-4 py-2.5 text-sm font-bold text-text-primary">{tr('lessonConcept')}</h2>
          <div className="lesson px-4 py-4 text-sm">
            <ReactMarkdown>{module.content}</ReactMarkdown>
          </div>
        </section>

        {/* Tasks */}
        <section aria-label={tr('lessonTasks')} className="flex min-w-0 flex-col gap-4">
          {exercises.map((ex, i) => (
            <TaskCard
              key={ex.id}
              slug={slug}
              ex={ex}
              index={i}
              initiallySolved={initiallySolved.has(ex.id)}
              canSubmit={Boolean(user)}
              onResult={onResult}
            />
          ))}

          <div className="sticky bottom-[4.5rem] z-10 sm:bottom-3 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-900/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-surface-900/80">
            <span className="text-sm text-text-secondary">
              {allSolved ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                  <CheckIcon size={16} /> {tr('lessonAllSolved')}
                </span>
              ) : (
                tr('lessonFinishLocked')
              )}
            </span>
            <Button className="ml-auto" onClick={finish} disabled={!allSolved || finishing || !user}>
              {finishing ? tr('taskChecking') : tr('lessonFinish')}
            </Button>
            {finishError && <p role="alert" className="w-full text-sm text-danger">{finishError}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
