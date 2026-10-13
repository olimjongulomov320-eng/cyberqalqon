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
import { Hearts, Confetti, NewAchievementChip, XPChip } from '@/components/game';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { loseHeart, restoreHeart, useHearts } from '@/lib/hearts';
import { levelFromXp } from '@/lib/gamification';
import { Badge, Button, ButtonLink, Card, ErrorNote, Progress, Skeleton } from '@/components/ui';
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  CloseIcon,
  FlameIcon,
  HeartIcon,
  SparkleIcon,
  TrophyIcon,
} from '@/components/icons';

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
  // XP when the learner pressed "Start lesson" — lets the celebration screen
  // tell whether this run pushed them over a level boundary (real, computed
  // from actual XP; nothing is invented).
  const lessonStartXp = useRef<number | null>(null);

  // Refetch on slug AND language: switching lang with a lesson open must reload
  // the localised title/content/exercises instead of serving the previous
  // language. `alive` discards stale responses if the slug changes mid-flight.
  // An in-progress quiz keeps its position — exercise ids are stable across
  // languages — but the graded reveal is cleared so the explanation re-localises.
  useEffect(() => {
    let alive = true;
    setLoadError(null);
    (async () => {
      try {
        const data = await fetchModule(slug, lang);
        if (!alive) return;
        setModule(data.module);
        setExercises(data.exercises);
        setChecked(null);
        setPractice(null);
        setPhase(p => (p === 'loading' ? 'intro' : p));
      } catch (err) {
        if (!alive) return;
        setLoadError(err as ApiError);
        setPhase('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, lang]);

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
      <div>
        {loadError && (
          <Card>
            <ErrorNote>
              {loadError.isTimeout
                ? tr('timeoutError')
                : loadError.isOffline
                  ? tr('networkError')
                  : loadError.message}
            </ErrorNote>
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
              <Skeleton className="h-40 w-full" />
            </div>
            <p className="mt-4 text-center text-sm text-text-muted">{tr('loadingLesson')}</p>
          </Card>
        )}
      </div>
    );
  }

  /* ── Intro card ── */
  if (phase === 'intro' && module) {
    return (
      <div>
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-5">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label text-cyan-300">{module.domain_title ?? tr('modules')}</p>
                <h1 className="display mt-2">{module.title}</h1>
              </div>
              {module.domain_icon && (
                <span aria-hidden="true" className="shrink-0 text-3xl">{module.domain_icon}</span>
              )}
            </header>

            {module.content && (
              <div className="lesson border-t border-border/60 pt-5">
                <ReactMarkdown>{module.content}</ReactMarkdown>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-surface-950/60 px-4 py-3 text-sm">
              <span className="num inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <CheckIcon size={14} className="text-cyan-400" />
                {exercises.length} {tr('challenge').toLowerCase()}
              </span>
              <XPChip xp={module.xp_reward} />
              <span className="text-xs text-text-secondary">{tr('featReview')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Hearts count={hearts} label={tr('heartsLabel')} />
              <span className="text-xs text-text-muted">{tr('heartsLabel')}</span>
            </div>

            {user ? (
              <Button size="lg" onClick={() => { lessonStartXp.current = user.total_xp; setPhase('active'); }}>
                {tr('startLesson')}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <ButtonLink href="/auth" size="lg" className="w-full justify-center">
                  {tr('login')}
                </ButtonLink>
                <p className="text-center text-xs text-text-muted">{tr('signInToAnswer')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  /* ── Celebration ── */
  if (phase === 'celebrate' && complete) {
    const next = complete.next_module_slug ? `/modules/${complete.next_module_slug}` : undefined;
    const endLevel = levelFromXp(complete.total_xp).level;
    const startLevel = levelFromXp(lessonStartXp.current ?? complete.total_xp).level;
    const leveledUp = endLevel > startLevel;
    return (
      <div>
        <Confetti show />
        <Card className="overflow-hidden border-cyan-500/30">
          <div className="stagger flex flex-col items-center gap-4 text-center">
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
            >
              {complete.is_checkpoint ? <TrophyIcon size={30} /> : <SparkleIcon size={30} />}
            </span>
            <h1 className="display">
              {complete.is_checkpoint ? tr('checkpointComplete') : tr('lessonCompleteTitle')}
            </h1>
            {complete.perfect && (
              <Badge tone="success">
                <CheckIcon size={13} /> {tr('perfect')}
              </Badge>
            )}

            {leveledUp && (
              <div
                role="status"
                aria-live="polite"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-cyan-500/40 bg-cyan-500/[0.08] px-4 py-3 text-left"
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

            <div role="status" aria-live="polite" className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2 text-xl font-extrabold text-warning">
                <BoltIcon size={20} />
                <span className="num">+{complete.xp_earned}</span>
                <span className="sr-only">XP</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-900 px-4 py-2 text-lg font-bold text-text-primary">
                <FlameIcon size={20} className="text-danger" />
                <span className="num">{complete.streak}</span>
                <span className="sr-only">{tr('streak')}</span>
              </span>
            </div>

            <p className="num text-sm text-text-secondary">
              {tr('accuracy')}: <span className="font-bold text-white">{complete.accuracy}%</span> ·{' '}
              {complete.results.length} {tr('question').toLowerCase()}
            </p>

            {complete.new_achievements.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {complete.new_achievements.map(k => (
                  <span key={k} className="sr-only">{k}</span>
                ))}
                <NewAchievementChip title={tr('newAchievement')} />
              </div>
            )}

            <Text role="status" />

            <div className="grid w-full gap-2">
              {next && (
                <Button size="lg" className="group" onClick={() => router.push(next)}>
                  {tr('nextModule')}
                  <ArrowRightIcon size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              )}
              <ButtonLink href="/learn" variant={next ? 'secondary' : 'primary'} size="lg">
                {tr('viewPath')}
              </ButtonLink>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Active lesson ── */
  const ex = current as Exercise | undefined;
  const ready = ex ? isAnswerReady(ex, value) : false;
  const showHeartsPitch = hearts === 0 && checked && !checked.correct && heartsLostOnWrong.current;
  const practiceReady = practice ? isAnswerReady(practice.ex, practice.value) : false;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Top bar */}
      <div ref={topRef} className="scroll-mt-24 pt-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExitOpen(true)}
            aria-label={tr('exitBtn')}
            className="grid h-8 w-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-800 hover:text-white"
          >
            <CloseIcon size={18} />
          </button>
          <Progress
            value={idx + (checked ? 1 : 0)}
            max={exercises.length}
            label={`${tr('challenge')} ${idx + 1}/${exercises.length}`}
            className="flex-1"
          />
          <span className="num text-xs font-bold text-text-muted">
            {idx + 1}/{exercises.length}
          </span>
          <Hearts count={hearts} label={tr('heartsLabel')} />
        </div>
      </div>

      {/* Achievement toasts */}
      {toasts.length > 0 && (
        <div aria-live="polite" className="mt-3 flex flex-col gap-1.5">
          {toasts.map(k => (
            <div key={k} className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-bold text-warning">
              <SparkleIcon size={15} className="shrink-0" />
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
            className={`stagger mt-4 rounded-xl border p-4 ${
              checked.correct ? 'border-success/50 bg-success/[0.08]' : 'border-danger/50 bg-danger/[0.08]'
            }`}
          >
            <p className={`flex items-center gap-1.5 text-sm font-bold ${checked.correct ? 'text-success' : 'text-danger'}`}>
              {checked.correct ? <CheckIcon size={16} /> : <CloseIcon size={16} />}
              {checked.correct ? tr('correctTitle') : tr('wrongTitle')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              <span className="font-semibold text-text-primary">{tr('whyLabel')}: </span>
              {checked.explain}
            </p>
            {checked.xp_earned > 0 && (
              <p role="status" className="num mt-2 inline-flex items-center gap-1 text-xs font-bold text-warning">
                <BoltIcon size={14} /> +{checked.xp_earned} XP
              </p>
            )}
          </section>
        )}

        {/* Restore-a-heart pitch */}
        {showHeartsPitch && (
          <Card className="mt-4 border-warning/40">
            {!practice ? (
              <>
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <HeartIcon size={16} className="text-danger" /> {tr('outOfHearts')}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">{tr('outOfHeartsBody')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startPractice}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-sm font-bold text-warning transition-colors hover:bg-warning/20"
                  >
                    <HeartIcon size={15} filled />
                    {tr('restoreHeart')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      heartsLostOnWrong.current = false;
                      setPractice(null);
                    }}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:text-white"
                  >
                    {tr('next')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <HeartIcon size={16} className={practice.result?.correct ? 'text-danger' : 'text-danger'} filled={Boolean(practice.result?.correct)} />
                  {practice.result?.correct ? tr('heartRestored') : tr('restoreHeart')}
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
                    className={`rounded-lg border p-3 text-sm leading-relaxed ${
                      practice.result.correct ? 'border-success/50 bg-success/[0.08] text-success' : 'border-danger/50 bg-danger/[0.08] text-danger'
                    }`}
                  >
                    <p className="font-bold">
                      {practice.result.correct ? tr('correctTitle') : tr('wrongTitle')}
                    </p>
                    <p className="mt-1 text-text-secondary">{practice.result.explain}</p>
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
            {loadError.isTimeout
              ? tr('timeoutError')
              : loadError.isOffline
                ? tr('networkError')
                : tr('loadError')}
          </ErrorNote>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2">
        {checked ? (
          <Button size="lg" className="w-full" onClick={handleNext} disabled={completing}>
            {idx + 1 < exercises.length ? tr('next') : tr('gotIt')}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full"
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
          className="fixed inset-0 z-overlay grid animate-fade-in place-items-center bg-surface-950/70 p-4 backdrop-blur-sm"
          onClick={() => setExitOpen(false)}
        >
          <Card className="w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 id="exit-title" className="text-lg font-bold text-white">{tr('exitLessonTitle')}</h2>
            <p className="mt-1 text-sm text-text-secondary">{tr('exitLessonBody')}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setExitOpen(false)}>{tr('stay')}</Button>
              <Button onClick={exitGo}>{tr('exitBtn')}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
