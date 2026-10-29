'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, ChallengeDetail, fetchChallenge, submitChallenge } from '@/lib/api';
import { PyRunner } from '@/lib/pyRunner';
import { Evaluation, evaluate, formatCall, sampleIndexes } from '@/lib/runner';
import { Badge, Button, Card, DifficultyTag, ErrorNote, Skeleton } from '@/components/ui';
import { ArrowLeftIcon, CheckIcon, CloseIcon } from '@/components/icons';

// Editor + its language/theme packages load only when this page opens.
const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const DIFF_KEY = { easy: 'chEasy', medium: 'chMedium', hard: 'chHard' } as const;

const show = (v: unknown) => JSON.stringify(v);

type Mode = 'run' | 'submit';

export default function SolveChallengePage() {
  const { lang, user } = useApp();
  const tr = makeT(lang);
  const slug = useMemo(
    () => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('slug') ?? ''),
    []
  );

  const [ch, setCh] = useState<ChallengeDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [code, setCode] = useState('');
  const [engine, setEngine] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState<Mode | null>(null);
  const [ev, setEv] = useState<{ mode: Mode; evaluation: Evaluation; stdout: string; timedOut: boolean } | null>(null);
  const [result, setResult] = useState<{ solved: boolean; points: number } | null>(null);
  const [saveError, setSaveError] = useState(false);
  const runner = useRef<PyRunner | null>(null);

  const draftKey = `cq_challenge:${slug}`;

  useEffect(() => {
    let alive = true;
    if (!slug) return setLoadError(true);
    fetchChallenge(slug, lang)
      .then(d => {
        if (!alive) return;
        setCh(d.challenge);
        let draft: string | null = null;
        try { draft = localStorage.getItem(draftKey); } catch { /* ignore */ }
        setCode(draft ?? d.challenge.starter);
      })
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, [slug, lang, draftKey]);

  // Start loading Python in the background as soon as the page opens.
  useEffect(() => {
    const r = new PyRunner();
    runner.current = r;
    r.warm().then(() => setEngine('ready')).catch(() => setEngine('error'));
    return () => r.stop();
  }, []);

  useEffect(() => {
    if (!ch) return;
    try { localStorage.setItem(draftKey, code); } catch { /* ignore */ }
  }, [code, ch, draftKey]);

  const execute = useCallback(
    async (mode: Mode) => {
      if (!ch || !runner.current || busy) return;
      setBusy(mode);
      setResult(null);
      setSaveError(false);
      const only = mode === 'run' ? sampleIndexes(ch.tests) : undefined;
      const picked = ch.tests.filter((_, i) => !only || only.includes(i));
      const reply = await runner.current.run(code, ch.entry, picked.map(t => t.args));
      const evaluation = evaluate(ch.tests, reply, only);
      setEv({ mode, evaluation, stdout: reply.stdout ?? '', timedOut: reply.error === 'timeout' });
      setEngine(reply.error === 'load-timeout' || reply.error === 'worker-error' ? 'error' : 'ready');

      if (mode === 'submit' && user && !evaluation.runnerError && !evaluation.compileError) {
        try {
          const r = await submitChallenge(ch.slug, { passed: evaluation.passed, total: evaluation.total, code });
          setResult({ solved: r.solved, points: r.points });
        } catch (e) {
          if (!(e instanceof ApiError) || e.status !== 401) setSaveError(true);
        }
      }
      setBusy(null);
    },
    [ch, code, user, busy]
  );

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <ErrorNote>{tr('loadError')}</ErrorNote>
        <Link href="/challenges" className="text-sm font-semibold text-cyan-300 hover:underline">{tr('chBack')}</Link>
      </div>
    );
  }
  if (!ch) return <Skeleton className="h-96 w-full" />;

  const e = ev?.evaluation;
  const engineNote =
    engine === 'loading' ? tr('chEngineLoading') : engine === 'error' ? tr('chEngineError') : null;

  return (
    <div>
      <Link href="/challenges" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary">
        <ArrowLeftIcon size={16} /> {tr('chBack')}
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Problem (left) */}
        <section aria-label={tr('chProblem')} className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">{ch.title}</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <DifficultyTag level={ch.difficulty} label={tr(DIFF_KEY[ch.difficulty])} />
            <span className="num font-semibold text-warning">{ch.points} {tr('chPoints')}</span>
            {ch.tags.map(t => (
              <span key={t} className="rounded-md bg-surface-800 px-2 py-0.5 text-text-secondary">#{t}</span>
            ))}
            {ch.needs_review && <Badge tone="warning">{tr('trackDraft')}</Badge>}
          </div>

          <div className="lesson mt-4 text-sm leading-relaxed text-text-secondary">
            <ReactMarkdown>{ch.statement}</ReactMarkdown>
          </div>

          <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-text-muted">{tr('chExamples')}</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {ch.examples.map((x, i) => (
              <li key={i} className="rounded-lg border border-border bg-surface-900 p-3 font-mono text-xs">
                <div className="text-text-secondary">{tr('chInput')}: <span className="text-text-primary">{formatCall(ch.entry, x.args)}</span></div>
                <div className="mt-1 text-text-secondary">{tr('chOutput')}: <span className="text-text-primary">{show(x.expected)}</span></div>
              </li>
            ))}
          </ul>

          <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-text-muted">{tr('chConstraints')}</h2>
          <p className="mt-2 text-sm text-text-secondary">{ch.constraints}</p>
        </section>

        {/* Editor (right) */}
        <section aria-label={tr('chEditor')} className="flex min-w-0 flex-col gap-3">
          <div className="min-h-[18rem] flex-1">
            <CodeEditor value={code} onChange={setCode} onRun={() => void execute('run')} label={tr('chEditor')} />
          </div>
          {engineNote && <p role="status" className="text-xs text-text-muted">{engineNote}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => void execute('run')} disabled={busy !== null || engine === 'error'}>
              {busy === 'run' ? tr('chRunning') : tr('chRun')}
            </Button>
            <Button onClick={() => void execute('submit')} disabled={busy !== null || engine === 'error'}>
              {busy === 'submit' ? tr('chRunning') : tr('chSubmit')}
            </Button>
            <Button variant="ghost" onClick={() => setCode(ch.starter)} disabled={busy !== null}>{tr('chReset')}</Button>
            <span className="ml-auto hidden text-xs text-text-muted sm:inline">{tr('chShortcut')}</span>
          </div>

          {e && (
            <Card className="p-4" aria-live="polite">
              {e.compileError ? (
                <p className="font-mono text-xs text-danger">{e.compileError}</p>
              ) : e.runnerError ? (
                <p className="text-sm text-danger">{ev?.timedOut ? tr('chTimeout') : tr('chRunnerError')}</p>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-sm font-bold">
                    {e.allPassed ? <CheckIcon size={16} className="text-success" /> : <CloseIcon size={16} className="text-danger" />}
                    <span className={e.allPassed ? 'text-success' : 'text-danger'}>
                      {e.passed}/{e.total} {tr('chTestsPassed')}
                    </span>
                    <span className="ml-auto text-xs font-normal text-text-muted">
                      {ev?.mode === 'run' ? tr('chSamplesOnly') : tr('chAllTests')}
                    </span>
                  </p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {e.outcomes.map(o => (
                      <li key={o.index} className="rounded-lg border border-border p-2 text-xs">
                        <div className="flex items-center gap-2">
                          {o.passed ? <CheckIcon size={13} className="text-success" /> : <CloseIcon size={13} className="text-danger" />}
                          <span className="font-semibold text-text-primary">
                            {o.hidden ? `${tr('chHiddenTest')} ${o.index + 1}` : `${tr('chSampleTest')} ${o.index + 1}`}
                          </span>
                        </div>
                        {!o.hidden && !o.passed && (
                          <div className="mt-1.5 font-mono text-text-secondary">
                            <div>{formatCall(ch.entry, o.args ?? [])}</div>
                            <div>{tr('chExpected')}: <span className="text-success">{show(o.expected)}</span></div>
                            <div>{tr('chGot')}: <span className="text-danger">{o.error ?? show(o.got)}</span></div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {ev?.stdout && (
                <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-surface-950 p-2 font-mono text-xs text-text-secondary">{ev.stdout}</pre>
              )}
            </Card>
          )}

          {result?.solved && (
            <p role="status" className="rounded-lg border border-success/50 bg-success/10 p-3 text-sm font-semibold text-success">
              {tr('chSolvedMsg')} +{result.points} {tr('chPoints')} <span className="font-normal text-text-muted">({tr('chUnverified')})</span>
            </p>
          )}
          {ev?.mode === 'submit' && !user && <p className="text-xs text-text-muted">{tr('chSignInToSave')}</p>}
          {saveError && <ErrorNote>{tr('chSaveFailed')}</ErrorNote>}
        </section>
      </div>
    </div>
  );
}
