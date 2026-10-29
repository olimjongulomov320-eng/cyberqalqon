'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { Card } from '@/components/ui';
import { CheckIcon, CloseIcon } from '@/components/icons';

/**
 * Self-contained product preview shown on the signed-out
 * landing page. It demonstrates the exercise interaction (pick → instant
 * correct/wrong feedback + XP chip) with purely local state - it never calls
 * the API and makes no claims about real usage.
 */

const OPTIONS = ['previewA1', 'previewA2', 'previewA3'] as const;
const CORRECT = 'previewA1';

export default function LandingPreview() {
  const { lang } = useApp();
  const tr = makeT(lang);

  const [picked, setPicked] = useState<string | null>(null);
  const solved = picked === CORRECT;

  return (
    <Card className="overflow-hidden p-0">
      {/* Task bar: the same facts as the real lesson header, in console type. */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-950/60 px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-wider text-text-muted">
        <span>
          {tr('lesson')} <span className="num font-bold text-text-secondary">1/3</span>
        </span>
        <span className="num font-bold text-warning">+3 XP</span>
      </div>

      <div className="p-5">
      <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-sm bg-surface-700">
        <div className="fill-x h-full rounded-sm bg-cyan-400" style={{ transform: 'scaleX(0.34)', transformOrigin: 'left' }} />
      </div>

      {/* Question */}
      <h3 className="mt-4 text-[1.0625rem] font-bold leading-snug text-text-primary text-pretty before:mr-2 before:font-mono before:text-cyan-400 before:content-['$']">{tr('previewQ')}</h3>

      {/* Options */}
      <div className="mt-3 flex flex-col gap-2" role="group" aria-label={tr('previewQ')}>
        {OPTIONS.map(key => {
          const isCorrect = key === CORRECT;
          const isPicked = key === picked;
          const stateClass = !picked
            ? 'border-border bg-surface-800 text-text-secondary hover:border-cyan-500/60 hover:bg-surface-700'
            : isPicked
              ? isCorrect
                ? 'border-success/60 bg-success/15 text-success animate-[cq-pop_0.35s_ease]'
                : 'border-danger/60 bg-danger/10 text-danger animate-[cq-shake_0.35s_ease]'
              : isCorrect
                ? 'border-success/60 bg-success/15 text-success'
                : 'border-border bg-surface-800 text-text-muted opacity-60';
          return (
            <button
              key={key}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(key)}
              className={`flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${stateClass}`}
            >
              <span aria-hidden="true" className="font-mono text-xs font-bold text-text-muted">[{OPTIONS.indexOf(key) + 1}]</span>
              <span className="flex-1">{tr(key)}</span>
              {picked && isCorrect && <CheckIcon size={16} className="shrink-0" />}
              {picked && isPicked && !isCorrect && <CloseIcon size={16} className="shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Result line */}
      <p
        className={`mt-3 font-mono text-xs font-semibold transition-colors ${solved ? 'text-success' : 'text-text-muted'}`}
        aria-live="polite"
      >
        {solved ? tr('previewCorrect') : tr('previewPick')}
      </p>
      </div>
    </Card>
  );
}
