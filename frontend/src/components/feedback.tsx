'use client';
import type { ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import type { AnswerValue, Exercise, Reveal } from '@/lib/api';
import { CheckIcon, CloseIcon } from '@/components/icons';

/**
 * Turning a graded answer into prose the learner can act on.
 *
 * The server grades every exercise and returns a `reveal` naming the correct
 * answer plus an authored bilingual `explain` (all 329 exercises have one).
 * These helpers render that payload as human text — they never guess an answer
 * and never invent an explanation, which is why the correct-answer branch is
 * driven purely by `reveal`.
 *
 * Shared by the lesson, the arena and the review session: before this the
 * lesson had the only copy, so the arena could say "wrong" and nothing more.
 */

type Tr = (key: string) => string;

/** The correct answer as human text, from the server's `reveal` only. */
export function revealText(ex: Exercise, r: Reveal, tr: Tr): string {
  switch (ex.type) {
    case 'mc':
    case 'multi': {
      const ids = r.answers ?? (r.answer ? [r.answer] : []);
      return ids.map(id => ex.options.find(o => o.id === id)?.text ?? id).join(', ');
    }
    case 'tf':
      return r.answer === 'true' ? tr('optTrue') : r.answer === 'false' ? tr('optFalse') : '';
    case 'input':
      return r.answer ?? '';
    case 'order':
      return (r.order ?? []).map(id => ex.items.find(i => i.id === id)?.text ?? id).join(' → ');
    case 'match': {
      const m = r.match_answer ?? {};
      return Object.entries(m)
        .map(([pid, rid]) => {
          const left = ex.pairs.find(p => p.id === pid)?.left ?? pid;
          const right = ex.pairs.find(p => p.id === rid)?.right ?? rid;
          return `${left} = ${right}`;
        })
        .join('; ');
    }
    default:
      return '';
  }
}

/** What the learner actually submitted, as human text, from local state. */
export function answerText(ex: Exercise, value: AnswerValue | undefined, tr: Tr): string {
  if (value === undefined || value === null) return '';
  switch (ex.type) {
    case 'mc':
    case 'multi': {
      const ids = Array.isArray(value) ? value : [value];
      return ids.map(id => ex.options.find(o => o.id === String(id))?.text ?? String(id)).join(', ');
    }
    case 'tf':
      return value === 'true' ? tr('optTrue') : value === 'false' ? tr('optFalse') : '';
    case 'input':
      return String(value);
    case 'order':
      return (value as string[]).map(id => ex.items.find(i => i.id === id)?.text ?? id).join(' → ');
    case 'match': {
      const m = value as Record<string, string>;
      return Object.entries(m)
        .map(([pid, rid]) => {
          const left = ex.pairs.find(p => p.id === pid)?.left ?? pid;
          const right = ex.pairs.find(p => p.id === rid)?.right ?? rid;
          return `${left} = ${right}`;
        })
        .join('; ');
    }
    default:
      return '';
  }
}

/**
 * The feedback panel: verdict, what you answered, the correct answer and the
 * authored explanation.
 *
 * Why it shows more than a verdict: the brief asks the learner to understand
 * *why* an answer worked. Guessing is only possible when the grader says
 * "wrong" and stops; naming the learner's own answer next to the correct one
 * makes the difference legible, and the explanation — authored per exercise in
 * the curriculum, not generated here — is the concept itself.
 *
 * Correctness is never carried by colour alone: each branch has an icon and a
 * text verdict, and the panel is an `aria-live` region so the verdict is
 * announced when it appears.
 */
export function AnswerFeedback({
  correct,
  reveal,
  explain,
  exercise,
  value,
  xpEarned,
  action,
  className = '',
}: {
  correct: boolean;
  reveal?: Reveal;
  explain?: string;
  exercise: Exercise;
  /** The learner's own answer, for the "your answer" line. */
  value?: AnswerValue;
  xpEarned?: number;
  /** Optional next-action row (retry, review the concept, continue). */
  action?: ReactNode;
  className?: string;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);

  const mine = answerText(exercise, value, tr);
  const right = reveal ? revealText(exercise, reveal, tr) : '';

  return (
    <section
      aria-live="polite"
      className={`rounded-xl border p-4 ${
        correct ? 'border-success/50 bg-success/[0.07]' : 'border-danger/50 bg-danger/[0.07]'
      } ${className}`}
    >
      <p
        className={`flex items-center gap-2 text-sm font-bold ${
          correct ? 'text-success' : 'text-danger'
        }`}
      >
        <span aria-hidden="true" className={correct ? 'text-success' : 'text-danger'}>
          {correct ? <CheckIcon size={16} /> : <CloseIcon size={16} />}
        </span>
        {correct ? tr('correctTitle') : tr('wrongTitle')}
        {typeof xpEarned === 'number' && xpEarned > 0 && (
          <span className="num ml-auto text-xs font-bold text-warning">+{xpEarned} XP</span>
        )}
      </p>

      {/* A wrong answer is only instructive next to the right one. The correct
          answer comes from the server's reveal, never from the client. */}
      {!correct && (mine || right) && (
        <dl className="mt-3 flex flex-col gap-1.5 text-xs">
          {mine && (
            <div className="flex flex-wrap gap-x-1.5">
              <dt className="font-semibold text-text-muted">{tr('yourAnswer')}:</dt>
              <dd className="text-text-secondary break-words">{mine}</dd>
            </div>
          )}
          {right && (
            <div className="flex flex-wrap gap-x-1.5">
              <dt className="font-semibold text-text-muted">{tr('answerIs')}:</dt>
              <dd className="font-semibold text-success break-words">{right}</dd>
            </div>
          )}
        </dl>
      )}

      {/* The authored explanation of the underlying concept. */}
      {explain && (
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">{tr('whyLabel')}: </span>
          {explain}
        </p>
      )}

      {action && <div className="mt-3">{action}</div>}
    </section>
  );
}
