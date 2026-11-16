'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Markdown from '@/components/Markdown';
import LogoMark from '@/components/LogoMark';
import RoundTimeline from '@/components/RoundTimeline';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  InterviewAnswers,
  InterviewChoice,
  InterviewRound,
  InterviewSession,
  fetchInterviewSession,
  finishInterview,
  startInterview,
} from '@/lib/api';
import { PyRunner } from '@/lib/pyRunner';
import { evaluate, formatCall, sampleIndexes, type Evaluation } from '@/lib/runner';
import { LETTERS, ROUND_LABEL, clock, fill } from '@/lib/interview';
import { Button, ButtonLink, ErrorNote, Skeleton } from '@/components/ui';
import { CheckIcon, CloseIcon, TimerIcon } from '@/components/icons';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

type Msg = { from: 'iv' | 'me'; text: string };
type Phase = 'loading' | 'error' | 'intro' | 'speaking' | 'round' | 'grading';

interface Saved {
  id: string;
  round: number;
  idx: number;
  answers: InterviewAnswers;
  roundStart: number;
  messages: Msg[];
  code: string;
  phase: Phase;
}

const STORE = 'cq_iv_room';
const ACKS = ['ivAck1', 'ivAck2', 'ivAck3', 'ivAck4'];
const wait = (ms: number) => new Promise(r => window.setTimeout(r, ms));

function loadSaved(id: string): Saved | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORE) ?? 'null') as Saved | null;
    return s && s.id === id ? s : null;
  } catch {
    return null;
  }
}

/* ── One selectable answer row ─────────────────────────────────────────── */
function Options({
  item,
  choice,
  onChoose,
  label,
}: {
  item: InterviewChoice;
  choice: number | null;
  onChoose: (i: number) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-5 flex flex-col gap-2">
      {item.options.map((o, i) => {
        const on = choice === i;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChoose(i)}
            className={`group flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-[0.9375rem] leading-snug transition-[border-color,background-color,transform] duration-150 active:scale-[0.995] ${
              on ? 'border-cyan-400/60 bg-cyan-500/10 text-text-primary' : 'border-border bg-surface-900 text-text-secondary hover:border-surface-500 hover:text-text-primary'
            }`}
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border font-mono text-xs font-bold transition-colors ${
                on ? 'border-cyan-400 bg-cyan-400 text-text-inverse' : 'border-border text-text-muted group-hover:border-surface-500'
              }`}
            >
              {LETTERS[i]}
            </span>
            <span className="pt-0.5">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function InterviewRoomPage() {
  const { lang, user, ready } = useApp();
  const tr = makeT(lang);
  const router = useRouter();
  const params = useMemo(() => (typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)), []);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [loadError, setLoadError] = useState('');
  const [round, setRound] = useState(0);
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswers>({ concepts: {}, scenario: [], coding: null, round_seconds: [0, 0, 0] });
  const [roundStart, setRoundStart] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [code, setCode] = useState('');
  const [engine, setEngine] = useState<'loading' | 'ready' | 'error'>('loading');
  const [running, setRunning] = useState(false);
  const [sample, setSample] = useState<Evaluation | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [finishError, setFinishError] = useState(false);

  const runner = useRef<PyRunner | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const ending = useRef(false);
  const ackN = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /** The interviewer "types" for a beat, then the line lands. Calls queue up. */
  const speak = useCallback((text: string) => {
    queue.current = queue.current.then(async () => {
      setTyping(true);
      await wait(reduced.current ? 0 : Math.min(1500, 500 + text.length * 7));
      setTyping(false);
      setMessages(m => [...m, { from: 'iv', text }]);
    });
    return queue.current;
  }, []);

  const say = (text: string) => setMessages(m => [...m, { from: 'me', text }]);

  /* ── Load or start the session ───────────────────────────────────────── */
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setPhase('error');
      setLoadError('auth');
      return;
    }
    let alive = true;
    const id = params.get('id');
    const role = params.get('role');

    const begin = (s: InterviewSession, restore: Saved | null) => {
      setSession(s);
      const coding = s.rounds.find(r => r.kind === 'coding');
      if (restore) {
        setRound(restore.round);
        setIdx(restore.idx);
        setAnswers(restore.answers);
        setRoundStart(restore.roundStart);
        setMessages(restore.messages);
        setCode(restore.code);
        setPhase(restore.phase === 'speaking' || restore.phase === 'grading' ? 'round' : restore.phase);
        return;
      }
      setCode(coding?.kind === 'coding' ? coding.task.starter : '');
      setPhase('intro');
      void speak(fill(tr('ivHello'), { role: s.role.title }));
    };

    (async () => {
      try {
        if (id) {
          const d = await fetchInterviewSession(id, lang);
          if (!alive) return;
          if (d.report) return router.replace(`/interviews/report?id=${id}`);
          if (d.session) begin(d.session, loadSaved(id));
        } else if (role) {
          const d = await startInterview(role, lang);
          if (!alive) return;
          // Reloading the page now resumes this sitting instead of starting another.
          window.history.replaceState(null, '', `${window.location.pathname}?id=${d.session.id}`);
          begin(d.session, null);
        } else {
          throw new Error('missing');
        }
      } catch (e) {
        if (!alive) return;
        setPhase('error');
        setLoadError(e instanceof ApiError && e.code === 'AGE_RESTRICTED' ? 'age' : 'lost');
      }
    })();
    return () => {
      alive = false;
    };
    // Load once per mount; language switches mid-interview keep the paper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id]);

  // Python starts loading the moment the room opens.
  useEffect(() => {
    const r = new PyRunner();
    runner.current = r;
    r.warm().then(() => setEngine('ready')).catch(() => setEngine('error'));
    return () => r.stop();
  }, []);

  // Persist progress so a reload resumes where the learner was.
  useEffect(() => {
    if (!session || phase === 'loading' || phase === 'error') return;
    const saved: Saved = { id: session.id, round, idx, answers, roundStart, messages, code, phase };
    try {
      sessionStorage.setItem(STORE, JSON.stringify(saved));
    } catch {
      /* storage blocked: the sitting simply cannot resume */
    }
  }, [session, round, idx, answers, roundStart, messages, code, phase]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end', behavior: reduced.current ? 'auto' : 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (phase !== 'round') return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [phase]);

  const current: InterviewRound | undefined = session?.rounds[round];
  const limit = (current?.minutes ?? 0) * 60;
  const elapsed = phase === 'round' && roundStart ? Math.max(0, (now - roundStart) / 1000) : 0;
  const remaining = limit - elapsed;

  /* ── Round flow ──────────────────────────────────────────────────────── */
  const openRound = useCallback(
    async (r: number) => {
      if (!session) return;
      const rd = session.rounds[r];
      setRound(r);
      setIdx(0);
      setChoice(null);
      setSample(null);
      setPhase('speaking');
      const text =
        rd.kind === 'concepts'
          ? fill(tr('ivIntroConcepts'), { n: rd.questions.length, m: rd.minutes })
          : rd.kind === 'scenario'
            ? fill(tr('ivIntroScenario'), { title: rd.scenario.title, m: rd.minutes })
            : fill(tr('ivIntroCoding'), { title: rd.task.title, m: rd.minutes });
      await speak(text);
      // The clock starts once the brief has landed.
      setRoundStart(Date.now());
      setNow(Date.now());
      setPhase('round');
    },
    [session, speak, tr]
  );

  /** Run the full test set on the current code; null when untouched. */
  const finalCoding = useCallback(async (): Promise<InterviewAnswers['coding']> => {
    const rd = session?.rounds.find(r => r.kind === 'coding');
    if (!rd || rd.kind !== 'coding' || !runner.current) return null;
    if (!code.trim() || code.trim() === rd.task.starter.trim()) return null;
    const reply = await runner.current.run(code, rd.task.entry, rd.task.tests.map(t => t.args));
    const ev = evaluate(rd.task.tests, reply);
    return { passed: ev.compileError || ev.runnerError ? 0 : ev.passed, total: rd.task.tests.length, code: code.slice(0, 11_000) };
  }, [session, code]);

  const finish = useCallback(
    async (final: InterviewAnswers) => {
      if (!session) return;
      setPhase('grading');
      setFinishError(false);
      void speak(tr('ivWrapUp'));
      try {
        await finishInterview(session.id, final, lang);
        try {
          sessionStorage.removeItem(STORE);
        } catch {
          /* ignore */
        }
        await queue.current;
        router.push(`/interviews/report?id=${session.id}`);
      } catch {
        setFinishError(true);
      }
    },
    [session, speak, tr, lang, router]
  );

  /** Close the current round (by answer, timeout or ending early). */
  const closeRound = useCallback(
    async (opts: { timeUp?: boolean; early?: boolean } = {}, base: InterviewAnswers = answers) => {
      if (!session || ending.current) return;
      ending.current = true;
      const secs = [...base.round_seconds];
      secs[round] = Math.round(Math.min(elapsed, 4 * 3600));
      let next = { ...base, round_seconds: secs };
      const last = round === session.rounds.length - 1;
      if (last || opts.early) {
        const codingIdx = session.rounds.findIndex(r => r.kind === 'coding');
        if (round === codingIdx) next = { ...next, coding: await finalCoding() };
        setAnswers(next);
        ending.current = false;
        return finish(next);
      }
      setAnswers(next);
      if (opts.timeUp) await speak(tr('ivTimeUpRound'));
      ending.current = false;
      await openRound(round + 1);
    },
    [session, answers, round, elapsed, finalCoding, finish, speak, tr, openRound]
  );

  // Time up: the round closes itself.
  useEffect(() => {
    if (phase === 'round' && limit > 0 && remaining <= 0) void closeRound({ timeUp: true });
  }, [phase, limit, remaining, closeRound]);

  const submitChoice = useCallback(
    (value: number | null) => {
      if (!current || phase !== 'round' || current.kind === 'coding') return;
      const item = current.kind === 'concepts' ? current.questions[idx] : current.scenario.steps[idx];
      const count = current.kind === 'concepts' ? current.questions.length : current.scenario.steps.length;
      say(value === null ? tr('ivSkipped') : `${LETTERS[value]}. ${item.options[value]}`);
      const scenario = [...answers.scenario];
      scenario[idx] = value;
      const next: InterviewAnswers =
        current.kind === 'concepts'
          ? { ...answers, concepts: { ...answers.concepts, [current.questions[idx].id]: value } }
          : { ...answers, scenario: Array.from(scenario, v => v ?? null) };
      setAnswers(next);
      setChoice(null);
      if (idx + 1 < count) {
        setIdx(idx + 1);
        void speak(tr(ACKS[ackN.current++ % ACKS.length]));
      } else {
        void closeRound({}, next);
      }
    },
    [current, phase, idx, answers, tr, speak, closeRound]
  );

  // Keyboard: 1-4 choose, Enter answers (not while typing in a field).
  useEffect(() => {
    if (phase !== 'round' || !current || current.kind === 'coding') return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, [contenteditable="true"]')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) setChoice(n - 1);
      else if (e.key === 'Enter' && choice !== null) {
        e.preventDefault();
        submitChoice(choice);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, current, choice, submitChoice]);

  const runSamples = useCallback(async () => {
    if (!current || current.kind !== 'coding' || !runner.current || running) return;
    setRunning(true);
    const only = sampleIndexes(current.task.tests);
    const picked = current.task.tests.filter((_, i) => only.includes(i));
    const reply = await runner.current.run(code, current.task.entry, picked.map(t => t.args));
    setSample(evaluate(current.task.tests, reply, only));
    setEngine(reply.error === 'load-timeout' || reply.error === 'worker-error' ? 'error' : 'ready');
    setRunning(false);
  }, [current, code, running]);

  /* ── Render ──────────────────────────────────────────────────────────── */
  if (phase === 'error') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-10">
        <ErrorNote>{loadError === 'auth' ? tr('ivSignInToStart') : loadError === 'age' ? tr('ageNoCode') : tr('ivSessionLost')}</ErrorNote>
        {loadError === 'auth' ? (
          <ButtonLink href={`/auth?next=${encodeURIComponent('/interviews')}`}>{tr('login')}</ButtonLink>
        ) : (
          <Link href="/interviews" className="text-sm font-semibold text-cyan-300 hover:underline">{tr('ivAllInterviews')}</Link>
        )}
      </div>
    );
  }
  if (!session) {
    return (
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Skeleton className="h-[32rem] w-full" />
        <Skeleton className="h-[32rem] w-full" />
      </div>
    );
  }

  const lastIv = [...messages].reverse().find(m => m.from === 'iv');
  const warn = phase === 'round' && remaining <= 60;
  const danger = phase === 'round' && remaining <= 15;

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar: role, round stepper, clock */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur sm:top-16 sm:mx-0 sm:rounded-lg sm:border sm:bg-surface-900/90">
        <div className="flex items-center gap-4">
          <div className="hidden min-w-0 shrink-0 sm:block sm:w-48">
            <p className="truncate text-sm font-bold text-text-primary">{session.role.title}</p>
            <p className="text-xs text-text-muted">{tr('ivTitle')}</p>
          </div>
          <ol className="flex min-w-0 flex-1 gap-1.5" aria-label={tr('ivFormatTitle')}>
            {session.rounds.map((r, i) => {
              const done = i < round || phase === 'grading';
              const live = i === round && phase === 'round';
              const fillPct = done ? 100 : live ? Math.min(100, (elapsed / (r.minutes * 60)) * 100) : 0;
              return (
                <li key={r.kind} style={{ flexGrow: r.minutes, flexBasis: 0 }} className="min-w-0" aria-current={i === round ? 'step' : undefined}>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ease-linear ${done ? 'bg-cyan-400' : 'bg-cyan-400/70'}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <p className={`mt-1 truncate text-[0.6875rem] font-semibold ${i === round ? 'text-text-primary' : 'text-text-muted'}`}>
                    {done && <CheckIcon size={10} className="mr-0.5 inline text-cyan-400" />}
                    {tr(ROUND_LABEL[r.kind])}
                  </p>
                </li>
              );
            })}
          </ol>
          <div
            role="timer"
            aria-label={tr('ivTimeLeft')}
            className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-sm font-bold tabular-nums transition-colors ${
              danger ? 'border-danger/60 bg-danger/10 text-danger' : warn ? 'border-warning/50 bg-warning/10 text-warning' : 'border-border text-text-primary'
            }`}
          >
            <TimerIcon size={15} />
            {clock(phase === 'round' ? remaining : limit)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Interviewer transcript (desktop); on phones only the latest line shows. */}
        <aside className="hidden h-[calc(100dvh-13rem)] min-h-[28rem] flex-col overflow-hidden rounded-lg border border-border bg-surface-900 lg:sticky lg:top-36 lg:flex">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan-400/30 bg-surface-950">
              <LogoMark size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-text-primary">{tr('ivInterviewer')}</p>
              <p className="text-[0.6875rem] text-text-muted">{session.role.title}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4" aria-live="polite">
            <ul className="flex flex-col gap-2.5">
              {messages.map((m, i) => (
                <li key={i} className={`rise-in flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      m.from === 'me'
                        ? 'rounded-br-sm bg-cyan-500/15 text-cyan-100 [html[data-theme=light]_&]:text-cyan-900'
                        : 'rounded-bl-sm border border-border bg-surface-800 text-text-primary'
                    }`}
                  >
                    {m.text}
                  </p>
                </li>
              ))}
              {typing && (
                <li className="flex" aria-label={tr('ivTyping')}>
                  <span className="flex gap-1 rounded-lg rounded-bl-sm border border-border bg-surface-800 px-3 py-3">
                    {[0, 1, 2].map(d => (
                      <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-text-muted" style={{ animationDelay: `${d * 150}ms` }} />
                    ))}
                  </span>
                </li>
              )}
            </ul>
            <div ref={bottom} />
          </div>
        </aside>

        <section className="min-w-0">
          {/* Phone: the interviewer's latest line above the work. */}
          {lastIv && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-surface-900 p-3 lg:hidden" aria-live="polite">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cyan-400/30 bg-surface-950">
                <LogoMark size={18} />
              </span>
              <p key={messages.length} className="rise-in text-sm leading-relaxed text-text-primary">
                {typing ? <span className="text-text-muted">{tr('ivInterviewer')} {tr('ivTyping')}...</span> : lastIv.text}
              </p>
            </div>
          )}

          {phase === 'intro' && (
            <div className="rounded-lg border border-border bg-surface-900 p-6 shadow-card edge-light sm:p-8">
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{session.role.title}</h1>
              <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-text-secondary">{session.role.summary}</p>
              <RoundTimeline rounds={session.role.rounds} tr={tr} className="mt-6 max-w-lg" />
              <Button
                size="lg"
                className="mt-8"
                disabled={typing}
                onClick={() => {
                  say(tr('ivReady'));
                  void openRound(0);
                }}
              >
                {tr('ivReady')}
              </Button>
            </div>
          )}

          {phase === 'speaking' && (
            <div className="grid h-64 place-items-center rounded-lg border border-dashed border-border">
              <span className="flex gap-1.5" aria-label={tr('ivTyping')}>
                {[0, 1, 2].map(d => (
                  <span key={d} className="typing-dot h-2 w-2 rounded-full bg-cyan-400/70" style={{ animationDelay: `${d * 150}ms` }} />
                ))}
              </span>
            </div>
          )}

          {phase === 'round' && current && current.kind !== 'coding' && (() => {
            const isConcepts = current.kind === 'concepts';
            const items: InterviewChoice[] = isConcepts ? current.questions : current.scenario.steps;
            const item = items[idx];
            return (
              <div className={isConcepts ? '' : 'grid grid-cols-1 gap-4 xl:grid-cols-2'}>
                {!isConcepts && (
                  <div className="rounded-lg border border-border bg-surface-900 xl:sticky xl:top-36 xl:self-start">
                    <p className="border-b border-border px-4 py-2.5 text-xs font-bold text-text-secondary">
                      {tr('ivCaseFile')} · <span className="text-text-primary">{current.scenario.title}</span>
                    </p>
                    <div className="lesson max-h-[60vh] overflow-y-auto px-4 py-4 text-sm leading-relaxed [&_pre]:whitespace-pre-wrap [&_pre]:break-all">
                      <Markdown>{current.scenario.context}</Markdown>
                    </div>
                  </div>
                )}
                <div key={`${round}-${idx}`} className="rise-in rounded-lg border border-border bg-surface-900 p-5 shadow-card edge-light sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-text-muted">
                      {tr(isConcepts ? 'ivQuestion' : 'ivStep')} <span className="num text-text-primary">{idx + 1}</span>/{items.length}
                    </p>
                    <span className="flex gap-1" aria-hidden="true">
                      {items.map((_, i) => (
                        <span key={i} className={`h-1.5 w-4 rounded-full ${i < idx ? 'bg-cyan-400' : i === idx ? 'bg-cyan-400/50' : 'bg-surface-700'}`} />
                      ))}
                    </span>
                  </div>
                  <div role="heading" aria-level={2} className="mt-3 text-lg font-bold leading-snug text-text-primary [&_code]:font-mono [&_code]:text-[0.9em]">
                    <Markdown>{item.q}</Markdown>
                  </div>
                  <Options item={item} choice={choice} onChoose={setChoice} label={item.q} />
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Button onClick={() => choice !== null && submitChoice(choice)} disabled={choice === null}>
                      {tr('ivSubmitAnswer')}
                    </Button>
                    <Button variant="ghost" onClick={() => submitChoice(null)}>
                      {tr('ivSkip')}
                    </Button>
                    <span className="ml-auto hidden text-xs text-text-muted sm:inline">{tr('ivKeysHint')}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {phase === 'round' && current?.kind === 'coding' && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-lg border border-border bg-surface-900 p-5">
                <h2 className="text-lg font-bold text-text-primary">{current.task.title}</h2>
                <div className="lesson mt-3 text-sm leading-relaxed">
                  <Markdown>{current.task.statement}</Markdown>
                </div>
                <div className="lesson mt-3 border-t border-border pt-3 text-xs text-text-muted">
                  <Markdown>{current.task.constraints}</Markdown>
                </div>
                <ul className="mt-4 flex flex-col gap-1.5">
                  {current.task.tests.filter(t => !t.hidden).map((t, i) => (
                    <li key={i} className="overflow-x-auto rounded-md border border-border bg-surface-950 p-2.5 font-mono text-[0.6875rem] leading-relaxed text-text-secondary">
                      <div className="whitespace-pre-wrap break-all text-text-primary">{formatCall(current.task.entry, t.args)}</div>
                      <div>→ {JSON.stringify(t.expected)}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="min-h-[20rem]">
                  <CodeEditor value={code} onChange={setCode} onRun={() => void runSamples()} label={current.task.title} />
                </div>
                {engine !== 'ready' && (
                  <p role="status" className="text-xs text-text-muted">{tr(engine === 'loading' ? 'chEngineLoading' : 'chEngineError')}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" onClick={() => void runSamples()} disabled={running || engine === 'error'}>
                    {running ? tr('chRunning') : tr('ivRunSamples')}
                  </Button>
                  <Button onClick={() => void closeRound()} disabled={running}>
                    {tr('ivFinishInterview')}
                  </Button>
                  <span className="ml-auto hidden text-xs text-text-muted sm:inline">{tr('chShortcut')}</span>
                </div>
                {sample && (
                  <div className="rise-in rounded-lg border border-border bg-surface-900 p-3" aria-live="polite">
                    {sample.compileError ? (
                      <p className="font-mono text-xs text-danger">{sample.compileError}</p>
                    ) : sample.runnerError ? (
                      <p className="text-sm text-danger">{tr('chRunnerError')}</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {sample.outcomes.map(o => (
                          <li key={o.index} className="flex items-start gap-2 font-mono text-xs">
                            {o.passed ? <CheckIcon size={13} className="mt-0.5 text-success" /> : <CloseIcon size={13} className="mt-0.5 text-danger" />}
                            <span className="min-w-0 break-all text-text-secondary">
                              {o.passed ? `${tr('chSampleTest')} ${o.index + 1}` : `${tr('chGot')}: ${o.error ?? JSON.stringify(o.got)}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === 'grading' && (
            <div className="grid min-h-72 place-items-center rounded-lg border border-border bg-surface-900 p-8 text-center">
              {finishError ? (
                <div className="flex flex-col items-center gap-3">
                  <ErrorNote>{tr('networkError')}</ErrorNote>
                  <Button onClick={() => void finish(answers)}>{tr('retry')}</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <LogoMark size={44} key="grading" />
                  <p className="text-sm font-semibold text-text-primary">{tr('ivGrading')}<span className="caret" /></p>
                </div>
              )}
            </div>
          )}

          {(phase === 'round' || phase === 'speaking') && (
            <div className="mt-6 flex items-center justify-end gap-2 text-sm">
              {confirmEnd ? (
                <div className="rise-in flex flex-wrap items-center justify-end gap-2">
                  <span className="text-text-muted">{tr('ivEndConfirm')}</span>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmEnd(false)}>{tr('ivCancel')}</Button>
                  <Button size="sm" variant="danger" onClick={() => { setConfirmEnd(false); void closeRound({ early: true }); }}>
                    {tr('ivEndYes')}
                  </Button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmEnd(true)} className="text-xs font-semibold text-text-muted transition-colors hover:text-danger">
                  {tr('ivEndEarly')}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
