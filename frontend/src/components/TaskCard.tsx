'use client';
import { stagger } from '@/lib/motion';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, AnswerValue, CheckResult, Exercise, Reveal, checkAnswer, fetchSolution } from '@/lib/api';
import { ExerciseRenderer, isAnswerReady } from '@/components/exercises';
import { AnswerFeedback } from '@/components/feedback';
import HintLadder from '@/components/HintLadder';
import { Badge, Button } from '@/components/ui';
import { CheckIcon, CloseIcon } from '@/components/icons';

type Status = 'open' | 'wrong' | 'solved';

interface Shown {
  explain: string;
  reveal: Reveal;
  /** true when this came from "Show solution" rather than from solving it. */
  viaSolution: boolean;
}

export interface TaskOutcome {
  correct: boolean;
  result: CheckResult;
}

/**
 * One task, practice-problem style: read the prompt, submit, get a verdict,
 * retry as often as needed. A wrong attempt returns a verdict only. The
 * explanation arrives once the task is solved, or on request after two failed
 * attempts ("Show solution"), which never marks the task solved.
 */
export default function TaskCard({
  slug,
  ex,
  index,
  initiallySolved,
  canSubmit,
  onResult,
}: {
  slug: string;
  ex: Exercise;
  index: number;
  initiallySolved: boolean;
  /** False when signed out: the server needs an account to record attempts. */
  canSubmit: boolean;
  onResult: (id: string, outcome: TaskOutcome) => void;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);

  const [value, setValue] = useState<AnswerValue | undefined>(undefined);
  const [status, setStatus] = useState<Status>(initiallySolved ? 'solved' : 'open');
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [canReveal, setCanReveal] = useState(initiallySolved);
  const [shown, setShown] = useState<Shown | null>(null);
  const [xp, setXp] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const solved = status === 'solved';
  const ready = isAnswerReady(ex, value);
  // A task solved in an earlier visit has no answer on this screen to show, so
  // it collapses to its prompt and verdict. The options come back, with the
  // correct one marked, once the learner asks for the explanation.
  const collapsed = solved && initiallySolved && !shown;

  async function check() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await checkAnswer(slug, { exercise_id: ex.id, value: value as AnswerValue }, lang);
      setAttempts(n => n + 1);
      setWrongTotal(res.wrong_attempts);
      setCanReveal(res.can_reveal);
      if (res.correct) {
        setStatus('solved');
        setFlash(true);
        setXp(res.xp_earned);
        if (res.explain && res.reveal) setShown({ explain: res.explain, reveal: res.reveal, viaSolution: false });
      } else {
        setStatus('wrong');
      }
      onResult(ex.id, { correct: res.correct, result: res });
    } catch (e) {
      const err = e as ApiError;
      setError(err.code === 'ASSESSMENT_IN_PROGRESS' ? tr('taskAssessmentLock') : err.isOffline || err.isTimeout ? tr('networkError') : tr('loadError'));
    } finally {
      setBusy(false);
    }
  }

  async function showSolution() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetchSolution(slug, ex.id, lang);
      setShown({ explain: res.explain, reveal: res.reveal, viaSolution: !solved });
    } catch (e) {
      const err = e as ApiError;
      setError(err.code === 'ASSESSMENT_IN_PROGRESS' ? tr('taskAssessmentLock') : tr('loadError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby={`task-${ex.id}`}
      style={stagger(index)}
      className={`stagger-item rounded-lg border bg-surface-900 transition-colors duration-300 ${solved ? 'border-success/40' : 'border-border'} ${flash ? 'solved-flash' : ''}`}
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <h3 id={`task-${ex.id}`} className="text-sm font-bold text-text-primary">
          {tr('taskLabel')} {index + 1}
        </h3>
        {solved ? <Badge tone="success">{tr('taskSolved')}</Badge> : <Badge tone="neutral">{tr('taskUnsolved')}</Badge>}
        {attempts > 0 && !solved && (
          <span className="num ml-auto text-xs text-text-muted">
            {tr('taskAttempt')} {attempts}
          </span>
        )}
        {xp > 0 && <span className="num ml-auto text-xs font-bold text-warning">+{xp} XP</span>}
      </header>

      <div className="p-4">
        {collapsed ? (
          <p className="text-[1.0625rem] font-bold leading-snug text-text-primary text-pretty lg:text-lg">{ex.q}</p>
        ) : (
        <ExerciseRenderer
          ex={ex}
          value={value}
          onChange={v => {
            setValue(v);
            if (status === 'wrong') setStatus('open');
          }}
          locked={solved}
          reveal={shown?.reveal}
        />
        )}

        {!solved && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={check} disabled={!ready || busy || !canSubmit}>
              {busy ? tr('taskChecking') : tr('taskCheck')}
            </Button>
            {canReveal && !shown && (
              <Button variant="ghost" onClick={showSolution} disabled={busy}>
                {tr('taskShowSolution')}
              </Button>
            )}
            {!canSubmit && <span className="text-xs text-text-muted">{tr('lessonSignIn')}</span>}
          </div>
        )}

        {!solved && (
          <div className="mt-3">
            <HintLadder moduleSlug={slug} exercise={ex} />
          </div>
        )}

        <div aria-live="polite">
          {status === 'wrong' && (
            <p
              style={{ animation: 'cq-rise 0.2s ease-out' }}
              className="mt-3 flex items-center gap-2 rounded-md border border-danger/50 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger"
            >
              <CloseIcon size={16} />
              {tr('taskWrong')}
              {!canReveal && (
                <span className="ml-auto text-xs font-normal text-text-muted">
                  {tr('taskSolutionLater')} {Math.max(0, 2 - wrongTotal)}
                </span>
              )}
            </p>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
        </div>

        {solved && (
          <div className="mt-3">
            {shown ? (
              <AnswerFeedback correct reveal={shown.reveal} explain={shown.explain} exercise={ex} />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                  <CheckIcon size={16} /> {tr('correctTitle')}
                </span>
                <Button variant="ghost" size="sm" onClick={showSolution} disabled={busy}>
                  {tr('taskShowExplanation')}
                </Button>
              </div>
            )}
          </div>
        )}

        {!solved && shown && (
          <div className="mt-3">
            <p className="mb-2 text-xs text-text-muted">{tr('taskSolutionNote')}</p>
            <AnswerFeedback correct={false} reveal={shown.reveal} explain={shown.explain} exercise={ex} />
          </div>
        )}
      </div>
    </section>
  );
}
