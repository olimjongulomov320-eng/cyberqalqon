'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  AnswerValue,
  AttemptRow,
  Exercise,
  Reveal,
  ReviewPayload,
  ReviewResult,
  fetchAttempts,
  fetchReview,
  fetchStats,
  practiceAnswer,
  submitReview,
} from '@/lib/api';
import type { DomainSkillStat } from '@/lib/skills';
import { dedupeLatest, harderReady } from '@/lib/recommend';
import Journey from '@/components/Journey';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { AnswerFeedback } from '@/components/feedback';
import { XPChip } from '@/components/game';
import { levelFromXp } from '@/lib/gamification';
import { Button, ButtonLink, Card, EmptyState, ErrorNote, Progress, SectionHeading, Skeleton } from '@/components/ui';
import { ArrowRightIcon, CheckIcon, CloseIcon, CodeIcon, DomainIcon, RefreshIcon, ShieldIcon, SparkleIcon, TargetIcon } from '@/components/icons';

type Phase = 'loading' | 'topics' | 'session' | 'results' | 'error';
type RevExercise = Exercise;

/**
 * A stable per-attempt idempotency key. Reused across retries of the same
 * submission so a retry after a timeout is deduped by the server instead of
 * double-recording the attempts and review XP.
 */
function newIdempotencyKey(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through to the manual key */
  }
  return `review-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

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
  // Generated once per logical submission and reused on every retry.
  const submitKey = useRef<string | null>(null);

  // Real performance behind this hub's recommendations: missed questions come
  // from the graded-attempt timeline, "ready for harder" from per-domain
  // accuracy. Both fail soft - an error degrades to an empty section with an
  // honest message, never to an invented suggestion.
  const [missed, setMissed] = useState<AttemptRow[] | null>(null);
  const [skillDomains, setSkillDomains] = useState<DomainSkillStat[]>([]);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setMissed(null);
      setSkillDomains([]);
      return;
    }
    Promise.allSettled([
      fetchAttempts({ lang, result: 'wrong', limit: 20 }),
      fetchStats(lang),
    ]).then(([attemptRes, statsRes]) => {
      if (!alive) return;
      setMissed(attemptRes.status === 'fulfilled' ? dedupeLatest(attemptRes.value.attempts).slice(0, 6) : []);
      setSkillDomains(statsRes.status === 'fulfilled' ? statsRes.value.domains ?? [] : []);
    });
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  const harder = useMemo(() => harderReady(skillDomains), [skillDomains]);
  const missedList = missed ?? [];

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
    submitKey.current = null;
    setPhase('session');
  };

  /**
   * Grade the current question immediately (stateless - recording happens once
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
      if (!submitKey.current) submitKey.current = newIdempotencyKey();
      const res = await submitReview(
        { module_slug: session.module_slug, answers, idempotency_key: submitKey.current },
        lang
      );
      setResult(res);
      setPhase('results');
      submitKey.current = null; // a fresh session gets a fresh key
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
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Card className="p-6 text-center">
            <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-border bg-surface-800 text-cyan-300">
              <TargetIcon size={26} />
            </span>
            <p className="mt-3 text-sm text-text-secondary">{tr('signInToAnswer')}</p>
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
          <Card className="p-5">
            <ErrorNote>
              {error.isTimeout ? tr('timeoutError') : error.isOffline ? tr('networkError') : error.message}
            </ErrorNote>
            <div className="mt-4 flex gap-2">
              <Button onClick={load}>{tr('retry')}</Button>
              <ButtonLink href="/learn" variant="secondary">{tr('goLearn')}</ButtonLink>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
      </div>
    );
  }

  /* ── Topics overview ── */
  if (phase === 'topics') {
    return (
      <div>
        <header className="mb-4">
          <p className="label mb-2 flex items-center gap-1.5 text-cyan-300">
            <RefreshIcon size={14} aria-hidden="true" /> {tr('stageReview')}
          </p>
          <h1 className="display">{tr('reviewTitle')}</h1>
          <p className="mt-1.5 max-w-[62ch] text-sm text-text-secondary">
            {tr('practiceSubtitle')}
          </p>
        </header>

        <Journey className="mb-5" />

        {/* Recommended session - the learner's weakest module, most-missed
            exercises first (server-selected from real recorded mistakes). */}
        {session && (
          <Card className="mb-4 flex items-center justify-between gap-3 border-cyan-500/30 bg-cyan-500/[0.06] p-4">
            <div className="min-w-0">
              <p className="label text-cyan-300">{tr('reviewSession')}</p>
              <p className="truncate text-sm font-bold text-white">{session.module_title}</p>
              <p className="num text-xs text-text-secondary">
                {exercises.length} {tr('question').toLowerCase()} · {tr('weakest')}
              </p>
            </div>
            <Button onClick={start} className="shrink-0">{tr('startLesson')}</Button>
          </Card>
        )}

        {!session && (data?.topics.length ?? 0) === 0 && missedList.length === 0 ? (
          <EmptyState
            icon={<ShieldIcon size={26} className="text-text-muted" />}
            title={tr('noReviewTitle')}
            body={tr('noReviewBody')}
            action={<ButtonLink href="/learn">{tr('goLearn')}</ButtonLink>}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Previously missed questions - from this account's real graded
                history, newest verdict per task (see lib/recommend). */}
            <section aria-labelledby="missed-h">
              <SectionHeading
                action={
                  <span className="text-[0.6875rem] text-text-muted">{tr('reviewBasedOn')}</span>
                }
              >
                <span id="missed-h">{tr('reviewMissedTitle')}</span>
              </SectionHeading>
              {missed === null ? (
                <div className="flex flex-col gap-2" aria-busy="true" aria-label={tr('loading')}>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : missedList.length === 0 ? (
                <div className="rounded-lg border border-border bg-surface-900 px-4 py-3.5">
                  <p className="text-sm font-semibold text-text-primary">
                    {tr('reviewMissedEmpty')}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">{tr('reviewMissedEmptyBody')}</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-surface-900">
                  <ul className="divide-y divide-border/60">
                    {missedList.map(a => (
                      <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                        <span aria-hidden="true" className="shrink-0 text-danger">
                          <CloseIcon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {a.question || tr('historyNoQuestion')}
                          </p>
                          <p className="truncate text-xs text-text-muted">{a.module_title}</p>
                        </div>
                        <ButtonLink
                          href={`/problems?module=${encodeURIComponent(a.module_slug)}&exercise=${encodeURIComponent(a.exercise_id)}`}
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                        >
                          {tr('retryAttempt')}
                        </ButtonLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-1.5 px-1 text-[0.6875rem] text-text-muted">
                {tr('reviewMissedBody')}
              </p>
            </section>

            {(data?.topics.length ?? 0) > 0 && (
              <section aria-labelledby="weak-h">
                <SectionHeading><span id="weak-h">{tr('weakTopics')}</span></SectionHeading>
                <div className="overflow-hidden rounded-lg border border-border bg-surface-900">
                  <ul className="divide-y divide-border/60">
                    {data?.topics.map(t => (
                      <li key={t.slug} className="flex items-center gap-3 px-3 py-2.5">
                        <span aria-hidden="true" className="shrink-0 text-cyan-300">
                          <DomainIcon slug={t.slug} size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{t.title}</p>
                          <p className="num text-xs text-text-secondary">
                            {t.wrong} {tr('mistakesCount')} · {t.accuracy}%
                          </p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-surface-800 sm:w-16"
                        >
                          <span
                            className="block h-full rounded-full bg-danger/60"
                            style={{ width: `${Math.min(100, t.accuracy)}%` }}
                          />
                        </span>
                        <ButtonLink
                          href={`/problems?domain=${encodeURIComponent(t.slug)}`}
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                        >
                          {tr('reviewOpenDomain')}
                          <ArrowRightIcon size={14} />
                        </ButtonLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Ready for a harder challenge - the rule is printed, and when no
                domain qualifies the section says so instead of guessing. */}
            <section aria-labelledby="harder-h">
              <SectionHeading>
                <span id="harder-h">{tr('reviewHarderTitle')}</span>
              </SectionHeading>
              <p className="mb-2 px-1 text-xs text-text-muted">{tr('reviewHarderBody')}</p>
              {harder.length === 0 ? (
                <div className="rounded-lg border border-border bg-surface-900 px-4 py-3.5">
                  <p className="text-sm font-semibold text-text-primary">
                    {tr('reviewHarderEmpty')}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">{tr('reviewHarderEmptyBody')}</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-surface-900">
                  <ul className="divide-y divide-border/60">
                    {harder.map(c => (
                      <li key={c.slug} className="flex items-center gap-3 px-3 py-2.5">
                        <span aria-hidden="true" className="shrink-0 text-cyan-300">
                          <DomainIcon slug={c.slug} size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{c.title}</p>
                          <p className="num text-xs text-text-secondary">
                            {c.accuracy}% · {c.attempts} {tr('answersShort')}
                          </p>
                        </div>
                        <ButtonLink
                          href={`/problems?domain=${encodeURIComponent(c.slug)}&difficulty=advanced`}
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                        >
                          {tr('reviewOpenDomain')}
                          <ArrowRightIcon size={14} />
                        </ButtonLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Arena shortcut - the practice stage in one line */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-900 px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <CodeIcon size={15} aria-hidden="true" className="text-cyan-300" />
                  {tr('arenaTitle')}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{tr('arenaBlurb')}</p>
              </div>
              <ButtonLink href="/problems" variant="secondary" size="sm">
                {tr('openArena')}
                <ArrowRightIcon size={15} />
              </ButtonLink>
            </div>

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
          <div className="flex items-center gap-3">
            <Link
              href="/review"
              aria-label={tr('exitBtn')}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-800 hover:text-white"
            >
              <CloseIcon size={18} />
            </Link>
            <Progress
              value={idx + (checked ? 1 : 0)}
              max={exercises.length}
              label={`${tr('question')} ${idx + 1}/${exercises.length}`}
              className="flex-1"
            />
            <span className="num text-xs font-bold text-text-muted">
              {idx + 1}/{exercises.length}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <Card className="p-5 sm:p-6">
            <ExerciseRenderer
              key={ex.id}
              ex={ex}
              value={value}
              onChange={setValue}
              locked={Boolean(checked)}
              reveal={checked?.reveal}
            />
          </Card>

          {checked && ex && (
            <AnswerFeedback
              className="mt-4"
              correct={checked.correct}
              reveal={checked.reveal}
              explain={checked.explain}
              exercise={ex}
              value={value}
            />
          )}

          {error && (
            <ErrorNote className="mt-4">
              {error.isTimeout ? tr('timeoutError') : error.isOffline ? tr('networkError') : tr('loadError')}
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
        <Card className="border-cyan-500/30 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
            >
              <CheckIcon size={30} />
            </span>
            <h1 className="display">{tr('reviewDoneTitle')}</h1>
            <p className="text-sm text-text-secondary">{tr('reviewDoneBody')}</p>
            <div className="flex items-center gap-2">
              <XPChip xp={result.xp_earned} />
              <span className="num text-sm text-text-secondary">
                {correct}/{result.results.length} {tr('correct').toLowerCase()}
              </span>
            </div>

            {leveledUp && (
              <div
                role="status"
                aria-live="polite"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-cyan-500/40 bg-cyan-500/[0.08] px-4 py-3 text-left"
              >
                <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-500/15 text-cyan-300">
                  <SparkleIcon size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-cyan-300">
                    {tr('levelUpTitle')} · Lv.{endLevel}
                  </p>
                  <p className="text-xs text-text-secondary">{tr('levelUpBody')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {result.results.map(r => (
              <div
                key={r.id}
                className={`flex items-start gap-2.5 rounded-lg border p-3 ${
                  r.correct ? 'border-success/40 bg-success/[0.06]' : 'border-danger/40 bg-danger/[0.06]'
                }`}
              >
                <span aria-hidden="true" className={`mt-0.5 shrink-0 ${r.correct ? 'text-success' : 'text-danger'}`}>
                  {r.correct ? <CheckIcon size={16} /> : <CloseIcon size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-text-secondary">{r.explain}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ButtonLink href="/review" className="justify-center">{tr('reviewSession')}</ButtonLink>
            <ButtonLink href="/learn" variant="secondary" className="justify-center">{tr('goLearn')}</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
