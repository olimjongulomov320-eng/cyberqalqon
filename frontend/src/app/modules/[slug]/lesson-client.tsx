'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  AnswerValue,
  CompleteResult,
  Exercise,
  ModuleDetail,
  PathModule,
  checkAnswer,
  completeModule,
  fetchModule,
  fetchPaths,
  practiceAnswer,
} from '@/lib/api';
import Journey from '@/components/Journey';
import HintLadder from '@/components/HintLadder';
import { Hearts, Confetti, NewAchievementChip, XPChip } from '@/components/game';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { AnswerFeedback, answerText, revealText } from '@/components/feedback';
import { loseHeart, restoreHeart, useHearts } from '@/lib/hearts';
import { HEARTS_ENABLED } from '@/lib/config';
import { levelFromXp } from '@/lib/gamification';
import { Badge, Button, ButtonLink, Card, ErrorNote, Progress, Skeleton } from '@/components/ui';
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  DomainIcon,
  FlameIcon,
  HeartIcon,
  LockIcon,
  RefreshIcon,
  SparkleIcon,
  TrophyIcon,
} from '@/components/icons';

type Phase = 'loading' | 'intro' | 'active' | 'celebrate' | 'error';

interface AnswerRec {
  id: string;
  value: AnswerValue;
}

/** Where this module sits in its domain, from the same `/paths` call /learn
 *  uses. Best-effort context: if it fails the lesson still runs, it just has
 *  no sequence rail. */
interface SequenceInfo {
  domainSlug: string;
  domainTitle: string;
  siblings: PathModule[];
  index: number;
}

function Text({ role = 'banner' }: { role?: 'banner' | 'alert' | 'status' }) {
  return (
    <span role={role} className="sr-only">
      .
    </span>
  );
}

/* ── Workspace rail ──────────────────────────────────────────────────────────
   The learner's place in the domain sequence plus the lesson text, so an
   exercise can be answered without leaving the workspace. States come from
   `/paths` - the same real data the Discover directory renders. */

function RailBlocks({
  seq,
  module,
  showNotes,
}: {
  seq: SequenceInfo | null;
  module: ModuleDetail;
  showNotes: boolean;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const total = seq?.siblings.length ?? 0;
  const pos = seq ? seq.index + 1 : 0;

  return (
    <>
      <div className="rounded-lg border border-border bg-surface-900 p-3">
        <p className="label truncate text-cyan-300">
          {seq?.domainTitle ?? module.domain_title ?? tr('modules')}
        </p>
        <p className="mt-1 truncate text-sm font-bold text-white">{module.title}</p>
        {seq && (
          <>
            <p className="num mt-1 text-xs text-text-secondary">
              {pos}/{total}
            </p>
            <Progress className="mt-2" value={pos} max={total} label={tr('trackProgress')} />
          </>
        )}
      </div>

      {seq && (
        <nav
          aria-label={tr('sequenceLabel')}
          className="overflow-hidden rounded-lg border border-border bg-surface-900"
        >
          <p className="border-b border-border/60 px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-wide text-text-muted">
            {tr('sequenceLabel')}
          </p>
          <ol className="max-h-56 divide-y divide-border/50 overflow-y-auto">
            {seq.siblings.map((m, i) => {
              const isCurrent = m.slug === module.slug;
              const locked = m.state === 'locked';
              const nodeCls =
                m.state === 'done'
                  ? 'border-success/50 bg-success/15 text-success'
                  : isCurrent
                    ? 'border-cyan-400 bg-cyan-400 text-text-inverse'
                    : locked
                      ? 'border-border bg-surface-950 text-text-muted'
                      : 'border-border-light bg-surface-800 text-text-primary';
              const inner = (
                <>
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.625rem] font-bold ${nodeCls}`}
                  >
                    {m.state === 'done' ? (
                      <CheckIcon size={10} />
                    ) : locked ? (
                      <LockIcon size={9} />
                    ) : (
                      <span className="num">{i + 1}</span>
                    )}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-xs ${
                      isCurrent
                        ? 'font-bold text-white'
                        : locked
                          ? 'text-text-muted'
                          : 'text-text-secondary'
                    }`}
                  >
                    {m.title}
                  </span>
                  {isCurrent && (
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  )}
                </>
              );
              return (
                <li key={m.slug}>
                  {locked ? (
                    <span aria-disabled="true" className="flex w-full items-center gap-2 px-3 py-2 opacity-70">
                      {inner}
                    </span>
                  ) : (
                    <Link
                      href={`/modules/${m.slug}`}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={`flex w-full items-center gap-2 px-3 py-2 transition-colors hover:bg-surface-800 ${
                        isCurrent ? 'bg-cyan-500/[0.07]' : ''
                      }`}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {showNotes && module.content && (
        <details className="group overflow-hidden rounded-lg border border-border bg-surface-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[0.6875rem] font-bold uppercase tracking-wide text-text-muted [&::-webkit-details-marker]:hidden">
            {tr('lessonNotes')}
            <ChevronRightIcon
              size={13}
              aria-hidden="true"
              className="transition-transform group-open:rotate-90"
            />
          </summary>
          <div className="lesson max-h-64 overflow-y-auto border-t border-border/60 px-3 py-2 text-sm">
            <ReactMarkdown>{module.content}</ReactMarkdown>
          </div>
        </details>
      )}
    </>
  );
}

/** Collapsed summary on mobile, sticky column on desktop - same blocks. */
function LessonRail({
  seq,
  module,
  showNotes,
}: {
  seq: SequenceInfo | null;
  module: ModuleDetail;
  showNotes: boolean;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const blocks = <RailBlocks seq={seq} module={module} showNotes={showNotes} />;

  return (
    <>
      <details className="group mb-3 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-border bg-surface-900 px-3 py-2.5 text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
          <span className="truncate">
            {seq?.domainTitle ?? module.domain_title ?? tr('modules')}
            {seq && (
              <span className="num text-text-muted">
                {' '}
                · {seq.index + 1}/{seq.siblings.length}
              </span>
            )}
          </span>
          <ChevronRightIcon
            size={14}
            aria-hidden="true"
            className="shrink-0 text-text-muted transition-transform group-open:rotate-90"
          />
        </summary>
        <div className="mt-2 flex flex-col gap-2">{blocks}</div>
      </details>
      <div className="hidden lg:flex lg:flex-col lg:gap-3">{blocks}</div>
    </>
  );
}

export default function LessonView({ slug }: { slug: string }) {
  const { lang, user, setUser } = useApp();
  const tr = makeT(lang);
  const router = useRouter();

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
  const [mistakesOpen, setMistakesOpen] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);
  const [practice, setPractice] = useState<{
    ex: Exercise;
    value: AnswerValue | undefined;
    result: { correct: boolean; explain: string; reveal: import('@/lib/api').Reveal } | null;
    checking: boolean;
  } | null>(null);

  const [seq, setSeq] = useState<SequenceInfo | null>(null);

  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  // Persist progress so a reload or closed tab does not discard answered questions.
  useEffect(() => {
    if (!user || (phase !== 'active' && phase !== 'intro')) return;
    try {
      if (answers.length) localStorage.setItem(`cq_lesson:${slug}`, JSON.stringify({ uid: user.id, idx, answers }));
    } catch { /* storage full or blocked */ }
  }, [phase, slug, idx, answers, user]);
  useEffect(() => {
    if (phase !== 'celebrate') return;
    try { localStorage.removeItem(`cq_lesson:${slug}`); } catch { /* ignore */ }
  }, [phase, slug]);

  const hearts = useHearts();
  const heartsLostOnWrong = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  // XP when the learner pressed "Start lesson" - lets the celebration screen
  // tell whether this run pushed them over a level boundary (real, computed
  // from actual XP; nothing is invented).
  const lessonStartXp = useRef<number | null>(null);

  // Refetch on slug AND language: switching lang with a lesson open must reload
  // the localised title/content/exercises instead of serving the previous
  // language. `alive` discards stale responses if the slug changes mid-flight.
  // An in-progress quiz keeps its position - exercise ids are stable across
  // languages - but the graded reveal is cleared so the explanation re-localises.
  useEffect(() => {
    let alive = true;
    setLoadError(null);
    (async () => {
      try {
        const data = await fetchModule(slug, lang);
        if (!alive) return;
        setModule(data.module);
        setExercises(data.exercises);
        // Resume an interrupted lesson (same user, same exercises) after a reload.
        try {
          const saved = JSON.parse(localStorage.getItem(`cq_lesson:${slug}`) ?? 'null');
          const ids = new Set(data.exercises.map(e => e.id));
          if (
            saved && saved.uid === userIdRef.current && Array.isArray(saved.answers) &&
            Number.isInteger(saved.idx) && saved.idx >= 0 && saved.idx < data.exercises.length &&
            saved.answers.every((a: AnswerRec) => a && ids.has(a.id))
          ) {
            setAnswers(saved.answers);
            setIdx(saved.idx);
          }
        } catch { /* storage unavailable or corrupt: start fresh */ }
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

  // Sibling sequence for the workspace rail. Separate from the module fetch so
  // a slow or failed /paths never blocks the lesson itself.
  useEffect(() => {
    let alive = true;
    setSeq(null);
    fetchPaths(lang)
      .then(res => {
        if (!alive) return;
        for (const p of res.paths) {
          for (const d of p.domains) {
            const i = d.modules.findIndex(m => m.slug === slug);
            if (i >= 0) {
              setSeq({ domainSlug: d.slug, domainTitle: d.title, siblings: d.modules, index: i });
              return;
            }
          }
        }
      })
      .catch(() => {
        /* optional context - the lesson works without it */
      });
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
    // Only questions already answered in this lesson: the server refuses to
    // grade practice on exercises the learner has not met.
    const answeredIds = new Set(answers.map(a => a.id));
    const met = exercises.filter(e => answeredIds.has(e.id) && e.type !== 'match' && e.type !== 'order');
    if (!met.length) return;
    const currentId = current?.id;
    const list = met.filter(e => e.id !== currentId);
    const pick = (list.length ? list : met)[Math.floor(Math.random() * (list.length || met.length))];
    setPractice({ ex: pick, value: undefined, result: null, checking: false });
  }, [exercises, current, answers]);

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

  // Keyboard-first answering: digits pick an option, Enter checks the answer /
  // advances. Ignored while typing in a field (except Enter on the single-line
  // answer input, which submits) and whenever a modifier key is held, so we
  // never shadow browser or assistive shortcuts. Presentation only - grading
  // still happens server-side.
  useEffect(() => {
    if (phase !== 'active') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const isText = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(t?.isContentEditable);
      const cur = current;
      const readyNow = cur ? isAnswerReady(cur, value) : false;

      if (e.key === 'Enter') {
        if (isText && cur?.type !== 'input') return;
        if (checked) {
          e.preventDefault();
          void handleNext();
        } else if (readyNow && !checking && user) {
          e.preventDefault();
          void handleCheck();
        }
        return;
      }

      if (isText || checked || !cur) return;

      if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        const ids =
          cur.type === 'mc' || cur.type === 'multi'
            ? cur.options.map(o => o.id)
            : cur.type === 'tf'
              ? ['true', 'false']
              : null;
        if (!ids || i >= ids.length) return;
        e.preventDefault();
        if (cur.type === 'multi') {
          const arr = Array.isArray(value) ? (value as string[]) : [];
          setValue(arr.includes(ids[i]) ? arr.filter(x => x !== ids[i]) : [...arr, ids[i]]);
        } else {
          setValue(ids[i]);
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [phase, current, value, checked, checking, user, handleCheck, handleNext, setValue]);

  /* ── Loading ── */
  if (phase === 'loading' || phase === 'error') {
    return (
      <div>
        {loadError && (
          <Card className="p-5">
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
      <div className="flex flex-col gap-3">
        <Journey
          sources={{ continueSlug: slug }}
          stage={module.kind === 'checkpoint' ? 'apply' : 'learn'}
        />
        <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-20">
            <LessonRail seq={seq} module={module} showNotes={false} />
          </aside>

          <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label text-cyan-300">{module.domain_title ?? tr('modules')}</p>
                <h1 className="display mt-2">{module.title}</h1>
              </div>
              <span aria-hidden="true" className="shrink-0 text-cyan-300">{module.domain_slug && <DomainIcon slug={module.domain_slug} size={28} />}</span>
            </header>

            {module.content && (
              <div className="lesson border-t border-border/60 pt-5">
                <ReactMarkdown>{module.content}</ReactMarkdown>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-surface-950/60 px-4 py-3 text-sm">
              <span className="num inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <CheckIcon size={14} className="text-cyan-400" />
                {exercises.length} {tr('challenge').toLowerCase()}
              </span>
              <XPChip xp={module.xp_reward} />
              <span className="text-xs text-text-secondary">{tr('featReview')}</span>
            </div>

            <div className="flex items-center gap-2">
              {HEARTS_ENABLED && <Hearts count={hearts} label={tr('heartsLabel')} />}
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
      </div>
    );
  }

  /* ── Celebration ── */
  if (phase === 'celebrate' && complete) {
    const next = complete.next_module_slug ? `/modules/${complete.next_module_slug}` : undefined;
    const endLevel = levelFromXp(complete.total_xp).level;
    const startLevel = levelFromXp(lessonStartXp.current ?? complete.total_xp).level;
    const leveledUp = endLevel > startLevel;
    const mistakes = complete.results.filter(r => !r.correct);
    return (
      <div>
        <Confetti show />
        <Card className="p-5 border-cyan-500/30 sm:p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
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

            <div role="status" aria-live="polite" className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-xl font-extrabold text-warning">
                <BoltIcon size={20} />
                <span className="num">+{complete.xp_earned}</span>
                <span className="sr-only">XP</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-900 px-4 py-2 text-lg font-bold text-text-primary">
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

            {mistakes.length > 0 ? (
              <div className="w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMistakesOpen(v => !v)}
                  aria-expanded={mistakesOpen}
                  className="mx-auto"
                >
                  <RefreshIcon size={15} />
                  {tr('reviewMistakes')} ({mistakes.length})
                </Button>
                {mistakesOpen && (
                  <ul className="mt-3 flex flex-col gap-2 text-left">
                    {mistakes.map(r => {
                      const ex = exercises.find(e => e.id === r.id);
                      const mine = answers.find(a => a.id === r.id)?.value;
                      return (
                        <li key={r.id} className="rounded-lg border border-danger/25 bg-danger/[0.05] p-3">
                          {ex && <p className="text-sm font-semibold text-text-primary">{ex.q}</p>}
                          {ex && (
                            <p className="mt-1.5 text-xs text-text-muted">
                              <span className="font-semibold text-text-secondary">{tr('yourAnswer')}: </span>
                              {answerText(ex, mine, tr) || tr('answerFirst')}
                            </p>
                          )}
                          {ex && (
                            <p className="mt-1 text-xs text-success">
                              <span className="font-semibold">{tr('answerIs')}: </span>
                              {revealText(ex, r, tr)}
                            </p>
                          )}
                          {r.explain && (
                            <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                              <span className="font-semibold text-text-primary">{tr('whyLabel')}: </span>
                              {r.explain}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-xs font-semibold text-success">{tr('allCorrect')}</p>
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
    <div className="flex flex-1 flex-col">
      <Journey
        sources={{ continueSlug: slug }}
        stage={module?.kind === 'checkpoint' ? 'apply' : 'learn'}
        className="mb-3"
      />
      {/* Top bar */}
      <div ref={topRef} className="scroll-mt-24">
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
          {HEARTS_ENABLED && <Hearts count={hearts} label={tr('heartsLabel')} />}
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

      {/* Workspace: compact sequence rail (left on desktop, collapsed summary
          on mobile) + the challenge column. */}
      <div className="grid flex-1 gap-4 py-3 sm:py-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-20">
          {module && <LessonRail seq={seq} module={module} showNotes />}
        </aside>

        <div className="flex flex-1 flex-col justify-center">
        <Card className="p-4 sm:p-5">
          {ex ? (
            <div key={ex.id} style={{ animation: 'cq-rise 0.2s ease-out' }}>
              <ExerciseRenderer
                ex={ex}
                value={value}
                onChange={setValue}
                locked={Boolean(checked)}
                reveal={checked?.reveal}
              />
            </div>
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </Card>

        {/* Feedback panel - verdict, your answer vs the correct one, and the
            authored explanation. Shared with the arena and review session. */}
        {checked && ex && (
          <AnswerFeedback
            className="mt-3"
            correct={checked.correct}
            reveal={checked.reveal}
            explain={checked.explain}
            exercise={ex}
            value={value}
            xpEarned={checked.xp_earned}
          />
        )}

        {/* Graduated hints - strategy first, then a derived narrowing from the
            server. Hidden once graded: the feedback panel already carries the
            explanation. */}
        {!checked && ex && (
          <HintLadder key={ex.id} moduleSlug={slug} exercise={ex} className="mt-3" />
        )}

        {/* Restore-a-heart pitch */}
        {showHeartsPitch && (
          <Card className="mt-4 border-warning/40 p-4">
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

        {/* Action row */}
        <div className="mt-4 flex items-center gap-2">
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
        <p className="mt-2 hidden justify-center text-center text-xs text-text-muted sm:flex">
          {tr('keyboardHint')}
        </p>
        </div>
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
          <Card className="w-full max-w-sm p-5 animate-scale-in" onClick={e => e.stopPropagation()}>
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
