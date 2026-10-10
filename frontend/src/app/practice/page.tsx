'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  AnswerValue,
  Exercise,
  Reveal,
  ReviewPayload,
  ReviewResult,
  fetchReview,
  practiceAnswer,
  submitReview,
} from '@/lib/api';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { XPChip } from '@/components/game';
import { levelFromXp } from '@/lib/gamification';
import { Button, ButtonLink, Card, EmptyState, ErrorNote, Progress, Skeleton } from '@/components/ui';

type Phase = 'loading' | 'topics' | 'session' | 'results' | 'error';
type RevExercise = Exercise;

export default function PracticePage() {
  const { lang, user, setUser, ready: sessionReady } = useApp();
  const tr = makeT(lang);

  const [phase, setPhase] = useState<Phase>('loading');
  const [data, setData] = useState<ReviewPayload | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ id: string; value: AnswerValue }[]>([]);
  const [value, setValue] = useState<AnswerValue | undefined>(undefined);
  const [checked, setChecked] = useState<{ correct: boolean; explain: string; reveal: Reveal } | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  // XP when the session began; the results screen compares it to the post-submit
  // total to surface a level-up (computed from real XP, never fabricated).
  const sessionStartXp = useRef<number | null>(null);

  const load = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const res = await fetchReview(lang);
      setData(res);
      setPhase('topics');
      if (res.session) {
        setIdx(0);
        setAnswers([]);
        setValue(undefined);
        setChecked(null);
      }
    } catch (err) {
      setError(err as ApiError);
      setPhase('error');
    }
  }, [lang]);

  useEffect(() => {
    if (user) load();
  }, [load, user?.id]);

  const session = data?.session ?? null;
  const exercises = session?.exercises ?? [];
  const ex: RevExercise | undefined = exercises[idx];
  const ready = ex ? isAnswerReady(ex, value) : false;

  const start = () => {
    setIdx(0);
    setAnswers([]);
    setValue(undefined);
    setChecked(null);
    setError(null);
    sessionStartXp.current = user?.total_xp ?? null;
    setPhase('session');
  };

  /**
   * Grade the current question immediately (stateless — recording happens once
   * on final submit), then lock it so the learner sees the reveal right away
   * instead of only at the end of the session.
   */
  const check = async () => {
    if (!ex || !session || checking || checked) return;
    setError(null);
    setChecking(true);
    try {
      const res = await practiceAnswer(
        session.module_slug,
        { exercise_id: ex.id, value: value as AnswerValue },
        lang
      );
      setChecked({ correct: res.correct, explain: res.explain, reveal: res.reveal });
      setAnswers(prev => [...prev.filter(a => a.id !== ex.id), { id: ex.id, value: value as AnswerValue }]);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setChecking(false);
    }
  };

  const next = async () => {
    if (!checked || !session) return;
    if (idx + 1 < exercises.length) {
      setIdx(idx + 1);
      setValue(undefined);
      setChecked(null);
      return;
    }
    // Final answer → record the whole session.
    setSubmitting(true);
    try {
      const res = await submitReview(
        { module_slug: session.module_slug, answers },
        lang
      );
      setResult(res);
      setPhase('results');
      if (user) {
        setUser({
          ...user,
          total_xp: res.total_xp,
          current_streak: res.streak,
          longest_streak: res.longest_streak,
        });
      }
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionReady || !user) {
    return (
      <div>
        {!sessionReady ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ) : (
          <Card className="p-6 text-center">
            <span aria-hidden="true" className="text-3xl">🎯</span>
            <p className="mt-2 text-sm text-text-secondary">{tr('signInToAnswer')}</p>
            <div className="mt-4 flex justify-center">
              <ButtonLink href="/auth">{tr('login')}</ButtonLink>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (phase === 'loading' || phase === 'error') {
    return (
      <div>
        {error ? (
          <Card>
            <ErrorNote>{error.message}</ErrorNote>
            <div className="mt-4 flex gap-2">
              <Button onClick={load}>{tr('retry')}</Button>
              <ButtonLink href="/learn" variant="secondary">{tr('goLearn')}</ButtonLink>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        )}
      </div>
    );
  }

  /* ── Topics overview ── */
  if (phase === 'topics') {
    return (
      <div>
        <header className="mb-5">
          <h1 className="display">{tr('navPractice')}</h1>
          <p className="mt-1 text-sm text-slate-400">{tr('practiceSubtitle')}</p>
        </header>

        {!session && (data?.topics.length ?? 0) === 0 ? (
          <EmptyState
            emoji="🛡️"
            title={tr('noReviewTitle')}
            body={tr('noReviewBody')}
            action={<ButtonLink href="/learn">{tr('goLearn')}</ButtonLink>}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {session && (
              <Card className="border-cyan-500/30 bg-cyan-500/5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{tr('reviewSession')}</p>
                    <p className="truncate text-sm font-bold text-white">{session.module_title}</p>
                    <p className="num text-xs text-slate-400">
                      {exercises.length} {tr('question').toLowerCase()} · {tr('weakest')}
                    </p>
                  </div>
                  <Button onClick={start} className="shrink-0">{tr('startLesson')}</Button>
                </div>
              </Card>
            )}

            {(data?.topics.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-2 px-1 text-sm font-bold text-slate-300">{tr('weakTopics')}</h2>
                <div className="flex flex-col gap-2">
                  {data?.topics.map(t => (
                    <Card key={t.slug} className="flex items-center gap-3">
                      <span aria-hidden="true" className="text-xl">{t.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{t.title}</p>
                        <p className="num text-xs text-slate-400">
                          {t.wrong} {tr('mistakesCount')} · {t.accuracy}%
                        </p>
                      </div>
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-700">
                        <span
                          className="block h-full rounded-full bg-danger/70"
                          style={{ width: `${Math.min(100, t.accuracy)}%` }}
                        />
                      </span>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <ButtonLink href="/learn" variant="ghost" className="mx-auto">{tr('goLearn')}</ButtonLink>
          </div>
        )}
      </div>
    );
  }

  /* ── Live session ── */
  if (phase === 'session' && ex) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl flex-col">
        <div className="pt-6">
          <Progress value={idx + (checked ? 1 : 0)} max={exercises.length} label={tr('loadingLesson')} tone="xp" />
          <div className="mt-2 flex items-center justify-between">
            <Link href="/practice" className="rounded-md px-1 text-sm text-slate-500 hover:text-white">
              ✕
            </Link>
            <span className="num text-xs font-bold text-slate-500">
              {idx + 1}/{exercises.length}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <Card className="gap-5">
            <ExerciseRenderer
              key={ex.id}
              ex={ex}
              value={value}
              onChange={setValue}
              locked={Boolean(checked)}
              reveal={checked?.reveal}
            />
          </Card>

          {checked && (
            <section
              aria-live="polite"
              className={`stagger mt-4 rounded-md border p-4 ${
                checked.correct ? 'border-success/50 bg-success/10' : 'border-danger/50 bg-danger/10'
              }`}
            >
              <p className={`text-sm font-bold ${checked.correct ? 'text-success' : 'text-danger'}`}>
                {checked.correct ? tr('correctTitle') : tr('wrongTitle')}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                <span className="font-semibold text-slate-200">{tr('whyLabel')}: </span>
                {checked.explain}
              </p>
            </section>
          )}

          {error && (
            <ErrorNote className="mt-4">
              {error.isOffline ? tr('networkError') : tr('loadError')}
            </ErrorNote>
          )}
        </div>

        <div className="flex items-center gap-2">
          {checked ? (
            <Button size="lg" className="flex-1" onClick={next} disabled={submitting}>
              {idx + 1 < exercises.length ? tr('next') : tr('finalResults')}
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={check} disabled={!ready || checking}>
              {checking ? tr('loading') : tr('check')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ── Results ── */
  if (phase === 'results' && result) {
    const correct = result.results.filter(r => r.correct).length;
    const endLevel = levelFromXp(result.total_xp).level;
    const startLevel = levelFromXp(sessionStartXp.current ?? result.total_xp).level;
    const leveledUp = endLevel > startLevel;
    return (
      <div>
        <Card className="border-cyan-500/30">
          <div className="flex flex-col items-center gap-3 text-center">
            <span aria-hidden="true" className="text-4xl">💪</span>
            <h1 className="display">{tr('reviewDoneTitle')}</h1>
            <p className="text-sm text-slate-400">{tr('reviewDoneBody')}</p>
            <div className="flex items-center gap-2">
              <XPChip xp={result.xp_earned} />
              <span className="num text-sm text-slate-400">
                {correct}/{result.results.length} {tr('correct').toLowerCase()}
              </span>
            </div>

            {leveledUp && (
              <div
                role="status"
                aria-live="polite"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-left"
              >
                <span aria-hidden="true" className="text-2xl">⬆️</span>
                <div>
                  <p className="text-sm font-bold text-cyan-300">
                    {tr('levelUpTitle')} · Lv.{endLevel}
                  </p>
                  <p className="text-xs text-slate-400">{tr('levelUpBody')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {result.results.map(r => (
              <div
                key={r.id}
                className={`flex items-start gap-2.5 rounded-md border p-3 ${
                  r.correct ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5'
                }`}
              >
                <span aria-hidden="true" className="text-sm">{r.correct ? '✅' : '❌'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-slate-300">{r.explain}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <ButtonLink href="/practice" className="justify-center">{tr('reviewSession')}</ButtonLink>
            <ButtonLink href="/learn" variant="secondary" className="justify-center">{tr('goLearn')}</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}