'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import {
  ApiError,
  AnswerValue,
  AssessmentPaper,
  AssessmentResult,
  fetchAttempt,
  startAssessment,
  submitAssessment,
} from '@/lib/api';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { AnswerFeedback } from '@/components/feedback';
import { Badge, Button, ButtonLink, Card, ErrorNote, Progress, Skeleton } from '@/components/ui';

type Phase = 'loading' | 'taking' | 'submitting' | 'result' | 'error';

function formatClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * One page, driven by the query string (a static export has no dynamic
 * segments for runtime ids): ?slug=<assessment> starts or resumes a paper,
 * ?attempt=<id> reopens a paper or its result.
 *
 * The server draws the questions, owns the clock and grades; this page only
 * collects answers. Answers are kept in localStorage purely so a reload does
 * not lose typing — they carry no authority.
 */
export default function TakeAssessmentPage() {
  const { lang, user, ready } = useApp();
  const tr = makeT(lang);

  const [phase, setPhase] = useState<Phase>('loading');
  const [paper, setPaper] = useState<AssessmentPaper | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<{ code: string; message: string; extra?: string } | null>(null);
  const [idx, setIdx] = useState(0);
  const [values, setValues] = useState<Record<number, AnswerValue>>({});
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const autoSubmitted = useRef(false);

  const params = useMemo(
    () => (typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)),
    []
  );

  const storeKey = (id: string) => `cq_assess:${id}`;

  const load = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const attemptId = params.get('attempt');
      const slug = params.get('slug');
      const data = attemptId
        ? await fetchAttempt(attemptId, lang)
        : slug
          ? await startAssessment(slug, lang)
          : null;
      if (!data) throw new ApiError('missing', 'NOT_FOUND', 404);
      if ('items' in data) {
        setResult(data);
        setPhase('result');
        return;
      }
      setPaper(data);
      try {
        const saved = JSON.parse(localStorage.getItem(storeKey(data.attempt_id)) ?? 'null');
        if (saved && typeof saved === 'object') setValues(saved);
      } catch { /* storage unavailable */ }
      setPhase('taking');
    } catch (e) {
      const err = e as ApiError;
      setError({ code: err.code ?? 'UNKNOWN', message: err.message, extra: undefined });
      setPhase('error');
    }
  }, [params, lang]);

  useEffect(() => {
    if (ready && user && phase === 'loading' && !paper && !result && !error) void load();
  }, [ready, user, phase, paper, result, error, load]);

  // Live clock while taking.
  useEffect(() => {
    if (phase !== 'taking') return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  // Keep typed answers across a reload.
  useEffect(() => {
    if (phase !== 'taking' || !paper) return;
    try {
      localStorage.setItem(storeKey(paper.attempt_id), JSON.stringify(values));
    } catch { /* ignore */ }
  }, [values, phase, paper]);

  const submit = useCallback(async () => {
    if (!paper) return;
    setPhase('submitting');
    setConfirming(false);
    try {
      const answers = paper.questions.map(q => ({ n: q.n, value: (values[q.n] ?? null) as AnswerValue }));
      const res = await submitAssessment(paper.attempt_id, answers, lang);
      try { localStorage.removeItem(storeKey(paper.attempt_id)); } catch { /* ignore */ }
      setResult(res);
      setPhase('result');
    } catch (e) {
      const err = e as ApiError;
      setError({ code: err.code ?? 'UNKNOWN', message: err.message });
      setPhase('error');
    }
  }, [paper, values, lang]);

  const remaining = paper ? new Date(paper.expires_at).getTime() - now : 0;
  useEffect(() => {
    if (phase === 'taking' && paper && remaining <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void submit();
    }
  }, [phase, paper, remaining, submit]);

  if (ready && !user) {
    return (
      <Card className="p-5">
        <p className="text-sm text-text-secondary">{tr('assessmentsSignIn')}</p>
        <ButtonLink href="/auth?next=/assessments" className="mt-3">{tr('login')}</ButtonLink>
      </Card>
    );
  }

  if (phase === 'loading' || phase === 'submitting' || !ready) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-48 w-full" />
        {phase === 'submitting' && <p className="text-sm text-text-secondary">{tr('assessSubmitting')}</p>}
      </div>
    );
  }

  if (phase === 'error' && error) {
    const text =
      error.code === 'NOT_ELIGIBLE'
        ? tr('assessNotEligible')
        : error.code === 'ATTEMPT_EXPIRED'
          ? tr('assessExpired')
          : error.code === 'NETWORK' || error.code === 'TIMEOUT'
            ? tr('networkError')
            : tr('loadError');
    return (
      <div className="flex flex-col items-start gap-3">
        <ErrorNote>{text}</ErrorNote>
        <div className="flex gap-2">
          <ButtonLink href="/assessments" variant="secondary">{tr('assessBack')}</ButtonLink>
          {(error.code === 'NETWORK' || error.code === 'TIMEOUT') && (
            <Button onClick={() => { setError(null); setPhase('loading'); }}>{tr('retry')}</Button>
          )}
        </div>
      </div>
    );
  }

  /* ── Result ── */
  if (phase === 'result' && result) {
    const wrong = result.items.filter(i => !i.correct);
    return (
      <div>
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{tr('assessResultTitle')}</h1>
            <Badge tone={result.passed ? 'success' : 'warning'}>{result.passed ? tr('assessPassed') : tr('assessNotPassed')}</Badge>
          </div>
          <p className="num mt-3 text-4xl font-extrabold text-text-primary">
            {result.percent}%
            <span className="ml-2 text-base font-semibold text-text-muted">
              {result.score}/{result.total}
            </span>
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {tr('assessPassMark')}: {result.pass_mark}%
            {typeof result.xp_earned === 'number' && result.xp_earned > 0 && (
              <span className="num ml-3 font-bold text-warning">+{result.xp_earned} XP</span>
            )}
          </p>
          {result.replayed && <p className="mt-2 text-xs text-text-muted">{tr('assessReplayed')}</p>}
          <p className="mt-3 text-xs text-text-muted">{tr('assessNotCertificate')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href={`/assessments/take?slug=${result.assessment}`}>{tr('assessRetake')}</ButtonLink>
            <ButtonLink href="/assessments" variant="secondary">{tr('assessBack')}</ButtonLink>
          </div>
        </Card>

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-text-muted">
          {tr('assessReview')} ({wrong.length}/{result.total} {tr('assessToReview')})
        </h2>
        <ul className="mt-3 flex flex-col gap-4">
          {result.items.map(item => (
            <li key={item.n}>
              <Card className="p-4">
                <p className="text-sm font-semibold text-text-primary">
                  {item.n + 1}. {item.question}
                </p>
                {item.exercise ? (
                  <AnswerFeedback
                    className="mt-3"
                    correct={item.correct}
                    reveal={item.reveal}
                    explain={item.explain}
                    exercise={item.exercise}
                    value={(values[item.n] ?? undefined) as AnswerValue | undefined}
                  />
                ) : null}
                {!item.answered && <p className="mt-2 text-xs text-text-muted">{tr('assessUnanswered')}</p>}
                <p className="mt-2 text-xs">
                  <Link href={`/modules/${item.module_slug}`} className="font-semibold text-cyan-300 hover:underline">
                    {tr('assessRevisit')}
                  </Link>
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* ── Taking ── */
  if (phase === 'taking' && paper) {
    const q = paper.questions[idx];
    const answeredCount = paper.questions.filter(x => isAnswerReady(x, values[x.n])).length;
    const low = remaining <= 60_000;
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-extrabold tracking-tight text-text-primary">{paper.title}</h1>
          <span
            role="timer"
            aria-label={tr('assessTimeLeft')}
            className={`num rounded-md border px-2.5 py-1 text-sm font-bold ${low ? 'border-danger/60 text-danger' : 'border-border text-text-primary'}`}
          >
            {formatClock(remaining)}
          </span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {tr('assessProgress')} {idx + 1}/{paper.questions.length} · {tr('assessAnswered')} {answeredCount}
        </p>
        <Progress value={((idx + 1) / paper.questions.length) * 100} label={tr('assessProgress')} className="mt-2" />

        <Card className="mt-4 p-4 sm:p-5">
          <ExerciseRenderer
            key={q.n}
            ex={q}
            value={values[q.n]}
            onChange={v => setValues(prev => ({ ...prev, [q.n]: v }))}
            locked={false}
          />
        </Card>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>
            {tr('assessPrev')}
          </Button>
          {idx < paper.questions.length - 1 ? (
            <Button onClick={() => setIdx(i => i + 1)}>{tr('assessNext')}</Button>
          ) : (
            <Button onClick={() => setConfirming(true)}>{tr('assessFinish')}</Button>
          )}
        </div>

        <nav aria-label={tr('assessProgress')} className="mt-4 flex flex-wrap gap-1.5">
          {paper.questions.map((x, i) => (
            <button
              key={x.n}
              type="button"
              onClick={() => setIdx(i)}
              aria-current={i === idx ? 'step' : undefined}
              className={`num h-8 w-8 rounded-md border text-xs font-semibold ${
                i === idx
                  ? 'border-cyan-400 bg-cyan-400/15 text-white'
                  : isAnswerReady(x, values[x.n])
                    ? 'border-border-light bg-surface-700 text-text-primary'
                    : 'border-border bg-surface-900 text-text-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>

        {confirming && (
          <div role="dialog" aria-modal="true" aria-label={tr('assessFinish')} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
            <Card className="w-full max-w-sm p-5">
              <p className="text-sm text-text-primary">
                {answeredCount < paper.questions.length
                  ? `${tr('assessUnansweredWarn')} ${paper.questions.length - answeredCount}`
                  : tr('assessConfirm')}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setConfirming(false)}>{tr('cancelAction')}</Button>
                <Button onClick={submit}>{tr('assessSubmit')}</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return null;
}
