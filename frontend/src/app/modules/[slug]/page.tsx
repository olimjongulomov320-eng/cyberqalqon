'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  AnswerValue,
  CompleteResult,
  Exercise,
  checkAnswer,
  completeModule,
  fetchModule,
  practiceAnswer,
} from '@/lib/api';
import { Hearts, Confetti, AchievementBadge, XPChip } from '@/components/game';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { loseHeart, restoreHeart, useHearts } from '@/lib/hearts';
import { Button, ButtonLink, Card, ErrorNote, Progress, Skeleton } from '@/components/ui';

type Phase = 'loading' | 'intro' | 'active' | 'celebrate' | 'error';

interface AnswerRec {
  id: string;
  value: AnswerValue;
}

function Text({ role = 'banner' }: { role?: 'banner' | 'alert' | 'status' }) {
  return (
    <span role={role} className="sr-only">
      .
    </span>
  );
}

export default function LessonPage({ params }: { params: { slug: string } }) {
  const { lang, user, setUser } = useApp();
  const tr = makeT(lang);
  const router = useRouter();
  const slug = params.slug;

  const [phase, setPhase] = useState<Phase>('loading');
  const [module, setModule] = useState<NonNullable<Awaited<ReturnType<typeof fetchModule>>['module']> | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadError, setLoadError] = useState<ApiError | null>(null);

  const [idx, setIdx] = useState(0); // current exercise index
  const [answers, setAnswers] = useState<AnswerRec[]>([]); // accumulated
  const [value, setValue] = useState<AnswerValue | undefined>(undefined);
  const [checked, setChecked] = useState<{
    correct: boolean;
    xp_earned: number;
    explain: string;
    reveal: import('@/lib/api').Reveal;
    new_achievements: string[];
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [complete, setComplete] = useState<CompleteResult | null>(null);
  const [completing, setCompleting] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);
  const [practice, setPractice] = useState<{
    ex: Exercise;
    value: AnswerValue | undefined;
    result: { correct: boolean; explain: string; reveal: import('@/lib/api').Reveal } | null;
    checking: boolean;
  } | null>(null);

  const hearts = useHearts();
  const heartsLostOnWrong = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchModule(slug, lang);
        setModule(data.module);
        setExercises(data.exercises);
        setPhase('intro');
      } catch (err) {
        setLoadError(err as ApiError);
        setPhase('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Keep the top of the exercise card in view when advancing.
  useEffect(() => {
    if (phase !== 'active') return;
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [idx, phase]);

  // Exit dialog: move focus in, trap Tab, close on Escape, restore focus after.
  useEffect(() => {
    if (!exitOpen) return;
    const node = exitRef.current;
    const previous = document.activeElement as HTMLElement | null;
    node?.querySelector<HTMLElement>('button')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setExitOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const focusables = node.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [exitOpen]);

  const current = exercises[idx];

  const handleCheck = useCallback(async () => {
    if (!current || !user || checking || checked) return;
    setLoadError(null);
    setChecking(true);
    try {
      const res = await checkAnswer(slug, { exercise_id: current.id, value: value as AnswerValue }, lang);
      setChecked({
        correct: res.correct,
        xp_earned: res.xp_earned,
        explain: res.explain,
        reveal: res.reveal,
        new_achievements: res.new_achievements,
      });
      if (!res.correct) {
        loseHeart();
        heartsLostOnWrong.current = true;
      } else {
        heartsLostOnWrong.current = false;
      }
      setAnswers(prev => [...prev.filter(a => a.id !== current.id), { id: current.id, value: value as AnswerValue }]);
      if (res.total_xp !== user.total_xp) {
        setUser({
          ...user,
          total_xp: res.total_xp,
          current_streak: res.streak,
          longest_streak: res.longest_streak,
        });
      }
    } catch (err) {
      setLoadError(err as ApiError);
    } finally {
      setChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, value, slug, lang, user, checked, checking, setUser]);

  /** Start a practice question to earn a heart back (never recorded). */
  const startPractice = useCallback(() => {
    if (!exercises.length) return;
    const currentId = current?.id;
    const pool = exercises.filter(e => e.type !== 'match' && e.type !== 'order' && e.id !== currentId);
    const from = pool.length ? pool : exercises.filter(e => e.type !== 'match' && e.type !== 'order');
    const list = from.length ? from : exercises;
    const pick = list[Math.floor(Math.random() * list.length)];
    setPractice({ ex: pick, value: undefined, result: null, checking: false });
  }, [exercises, current]);

  /** Grade the practice answer; on success give the heart back. */
  const gradePractice = useCallback(async () => {
    if (!practice || !user || practice.value === undefined || practice.value === null) return;
    setLoadError(null);
    setPractice(p => (p ? { ...p, checking: true } : p));
    try {
      const res = await practiceAnswer(slug, { exercise_id: practice.ex.id, value: practice.value as AnswerValue }, lang);
      setPractice(p => (p ? { ...p, result: { correct: res.correct, explain: res.explain, reveal: res.reveal }, checking: false } : p));
      if (res.correct) {
        restoreHeart();
        heartsLostOnWrong.current = false;
        window.setTimeout(() => setPractice(null), 900);
      }
    } catch (err) {
      setLoadError(err as ApiError);
      setPractice(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, slug, lang, user, tr]);

  const handleNext = useCallback(async () => {
    if (!checked) return;
    if (idx + 1 < exercises.length) {
      setIdx(idx + 1);
      setValue(undefined);
      setChecked(null);
      setToasts(checked.new_achievements);
      return;
    }
    // Last exercise → finish the lesson.
    if (!user) return;
    setCompleting(true);
    try {
      const res = await completeModule(slug, { answers }, lang);
      setComplete(res);
      setToasts(res.new_achievements);
      setPhase('celebrate');
      setChecked(null);
      // Keep the shell's XP/streak fresh without another network round-trip.
      if (user) {
        setUser({
          ...user,
          total_xp: res.total_xp,
          current_streak: res.streak,
          longest_streak: res.longest_streak,
          modules_completed: (user.modules_completed ?? 0) + (res.first_time ? 1 : 0),
        });
      }
    } catch (err) {
      setLoadError(err as ApiError);
      setPhase('error');
    } finally {
      setCompleting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, idx, exercises.length, answers, slug, lang, user]);

  const exitGo = useCallback(() => {
    router.push('/learn');
  }, [router]);

  /* ── Loading ── */
  if (phase === 'loading' || phase === 'error') {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-10 sm:pb-12">
        {loadError && (
          <Card>
            <ErrorNote>{loadError.message}</ErrorNote>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => window.location.reload()}>{tr('retry')}</Button>
              <ButtonLink href="/learn" variant="secondary">{tr('backToModules')}</ButtonLink>
            </div>
          </Card>
        )}
        {!loadError && (
          <Card>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">{tr('loadingLesson')}</p>
          </Card>
        )}
      </main>
    );
  }

  /* ── Intro card ── */
  if (phase === 'intro' && module) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-8 sm:pb-12">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  {module.domain_title ?? tr('modules')}
                </p>
                <h1 className="display mt-1">{module.title}</h1>
              </div>
              {module.domain_icon && (
                <span aria-hidden="true" className="text-3xl">{module.domain_icon}</span>
              )}
            </div>

            {module.content && (
              <div className="lesson">
                <ReactMarkdown>{module.content}</ReactMarkdown>
              </div>
            )}

            <div className="flex items-center gap-4 rounded-md border border-border bg-surface-900 px-3.5 py-3 text-sm">
              <span className="num text-xs text-slate-400">
                {exercises.length} {tr('challenge').toLowerCase()}
              </span>
              <span className="num text-xs text-slate-400">·</span>
              <XPChip xp={module.xp_reward} />
              <span className="num text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{tr('featReview')}</span>
            </div>

            <div aria-hidden="true" role="presentation" className="flex items-center gap-0.5">
              <Hearts count={hearts} label={tr('heartsLabel')} />
              <span className="ml-2 text-xs text-slate-500">{tr('heartsLabel')}</span>
            </div>

            {user ? (
              <Button size="lg" onClick={() => setPhase('active')}>
                {tr('startLesson')}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <ButtonLink href="/auth" size="lg" className="w-full justify-center">
                  {tr('login')}
                </ButtonLink>
                <p className="text-center text-xs text-slate-500">{tr('signInToAnswer')}</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    );
  }

  /* ── Celebration ── */
  if (phase === 'celebrate' && complete) {
    const next = complete.next_module_slug ? `/modules/${complete.next_module_slug}` : undefined;
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-10 sm:pb-12">
        <Confetti show />
        <Card className="overflow-hidden border-cyan-500/30">
          <div className="stagger flex flex-col items-center gap-4 text-center">
            <span aria-hidden="true" className="text-5xl">{complete.is_checkpoint ? '🏆' : '🎉'}</span>
            <h1 className="display">{complete.is_checkpoint ? tr('checkpointComplete') : tr('lessonCompleteTitle')}</h1>
            {complete.perfect && <p className="text-sm font-semibold text-success">💎 {tr('perfect')}</p>}

            <div role="status" aria-live="polite" className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg border border-warning/30 bg-warning/15 px-4 py-2 text-xl font-extrabold text-warning">
                <span aria-hidden="true">⚡</span>
                <span className="num">+{complete.xp_earned}</span>
                <span className="sr-only">XP</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-900 px-4 py-2 text-lg font-bold text-slate-200">
                <span aria-hidden="true">🔥</span>
                <span className="num">{complete.streak}</span>
                <span className="sr-only">{tr('streak')}</span>
              </span>
            </div>

            <p className="num text-sm text-slate-400">
              {tr('accuracy')}: <span className="font-bold text-white">{complete.accuracy}%</span> ·{' '}
              {complete.results.length} {tr('question').toLowerCase()}
            </p>

            {complete.new_achievements.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {complete.new_achievements.map(k => (
                  <span key={k} className="sr-only">{k}</span>
                ))}
                <AchievementBadge emoji="🏅" title={tr('newAchievement')} />
              </div>
            )}

            <Text role="status" />

            <div className="grid w-full gap-2">
              {next && (
                <Button size="lg" onClick={() => router.push(next)}>
                  {tr('nextModule')} →
                </Button>
              )}
              <ButtonLink href="/learn" variant={next ? 'secondary' : 'primary'} size="lg">
                {tr('viewPath')}
              </ButtonLink>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  /* ── Active lesson ── */
  const ex = current as Exercise | undefined;
  const ready = ex ? isAnswerReady(ex, value) : false;
  const showHeartsPitch = hearts === 0 && checked && !checked.correct && heartsLostOnWrong.current;
  const practiceReady = practice ? isAnswerReady(practice.ex, practice.value) : false;

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4 pb-28 sm:pb-12">
      {/* Top bar */}
      <div ref={topRef} className="scroll-mt-24 pt-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExitOpen(true)}
            aria-label={tr('exitBtn')}
            className="rounded-md px-1.5 py-1 text-lg leading-none text-slate-500 transition-colors hover:text-white"
          >
            ✕
          </button>
          <Progress
            value={idx + (checked ? 1 : 0)}
            max={exercises.length}
            label={tr('loadingLesson')}
            tone={checked && !checked.correct ? 'xp' : 'primary'}
            className="flex-1"
          />
          <span className="num text-xs font-bold text-slate-500">
            {idx + 1}/{exercises.length}
          </span>
          <Hearts count={hearts} label={tr('heartsLabel')} />
        </div>
      </div>

      {/* Achievement toasts */}
      {toasts.length > 0 && (
        <div aria-live="polite" className="mt-3 flex flex-col gap-1.5">
          {toasts.map(k => (
            <div key={k} className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/15 px-3 py-2 text-sm font-bold text-warning">
              <span aria-hidden="true">🏅</span>
              <span className="truncate">{tr('newAchievement')}</span>
              <span className="sr-only">{k}</span>
            </div>
          ))}
        </div>
      )}

      {/* Exercise card */}
      <div className="flex flex-1 flex-col justify-center py-6">
        <Card className="gap-5">
          {ex ? (
            <ExerciseRenderer
              key={ex.id}
              ex={ex}
              value={value}
              onChange={setValue}
              locked={Boolean(checked)}
              reveal={checked?.reveal}
            />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </Card>

        {/* Feedback panel */}
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
            {checked.xp_earned > 0 && (
              <p role="status" className="num mt-2 inline-flex items-center gap-1 text-xs font-bold text-warning">
                <span aria-hidden="true">⚡</span> +{checked.xp_earned} XP
              </p>
            )}
          </section>
        )}

        {/* Restore-a-heart pitch */}
        {showHeartsPitch && (
          <Card className="mt-4 border-warning/40">
            {!practice ? (
              <>
                <p className="text-sm font-bold text-white">🫀 {tr('outOfHearts')}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{tr('outOfHeartsBody')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startPractice}
                    className="inline-flex items-center justify-center rounded-md border border-warning/40 bg-warning/15 px-4 py-2 text-sm font-bold text-warning transition-colors hover:bg-warning/25"
                  >
                    {tr('restoreHeart')} ❤️
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      heartsLostOnWrong.current = false;
                      setPractice(null);
                    }}
                    className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                  >
                    {tr('next')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-white">
                  🫀 {practice.result?.correct ? tr('heartRestored') : tr('restoreHeart')}
                </p>
                <ExerciseRenderer
                  key={practice.ex.id}
                  ex={practice.ex}
                  value={practice.value}
                  onChange={(v: AnswerValue) =>
                    setPractice(p => (p ? { ...p, value: v, result: null } : p))
                  }
                  locked={Boolean(practice.result)}
                  reveal={practice.result?.reveal}
                />
                {practice.result && (
                  <div
                    role="status"
                    className={`rounded-md border p-3 text-sm leading-relaxed ${
                      practice.result.correct ? 'border-success/50 bg-success/10 text-success' : 'border-danger/50 bg-danger/10 text-danger'
                    }`}
                  >
                    <p className="font-bold">
                      {practice.result.correct ? tr('correctTitle') : tr('wrongTitle')}
                    </p>
                    <p className="mt-1 text-slate-300">{practice.result.explain}</p>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="success"
                  onClick={gradePractice}
                  disabled={!practiceReady || practice.checking || Boolean(practice.result?.correct)}
                >
                  {practice.checking ? tr('loading') : tr('check')}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* A failed /check or /practice request used to fail silently here. */}
        {loadError && (
          <ErrorNote className="mt-4">
            {loadError.isOffline ? tr('networkError') : tr('loadError')}
          </ErrorNote>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2">
        {checked ? (
          <Button size="lg" className="flex-1" onClick={handleNext} disabled={completing}>
            {idx + 1 < exercises.length ? tr('next') : tr('gotIt')}
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1"
            onClick={handleCheck}
            disabled={!ready || checking || !user}
          >
            {checking ? tr('loading') : tr('check')}
          </Button>
        )}
      </div>

      {/* Exit confirm */}
      {exitOpen && (
        <div
          ref={exitRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-title"
          className="fixed inset-0 z-[60] grid animate-fade-in place-items-center bg-surface-950/70 p-4 backdrop-blur-sm"
          onClick={() => setExitOpen(false)}
        >
          <Card className="w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 id="exit-title" className="text-lg font-bold text-white">{tr('exitLessonTitle')}</h2>
            <p className="mt-1 text-sm text-slate-400">{tr('exitLessonBody')}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setExitOpen(false)}>{tr('stay')}</Button>
              <Button onClick={exitGo}>{tr('exitBtn')}</Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}