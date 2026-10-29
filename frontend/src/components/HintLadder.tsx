'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, Exercise, HintResult, fetchHint } from '@/lib/api';
import { AlertIcon, EyeIcon } from '@/components/icons';

/**
 * GRADUATED HINTS - two levels, none of which is the answer.
 *
 * Level 1 is a strategy line for the exercise type: it ships from the local
 * dictionary, needs no request and leaks nothing.
 * Level 2 asks the server (`POST /v1/modules/:slug/hint`), which derives a
 * partial narrowing from the stored answer - one eliminated option, the number
 * of correct choices, the first step of a sequence, one matched pair, or the
 * shape of a typed answer. The full answer never appears in that payload.
 *
 * The ladder resets per exercise (the parent renders it with `key={ex.id}`) so
 * a new question starts without hints again. Hints cost no XP and record no
 * attempt: they are a learning aid, not an outcome.
 */

const STRATEGY_KEY: Record<Exercise['type'], string> = {
  mc: 'hintStrategyMc',
  tf: 'hintStrategyTf',
  multi: 'hintStrategyMulti',
  match: 'hintStrategyMatch',
  order: 'hintStrategyOrder',
  input: 'hintStrategyInput',
};

const LENGTH_KEY = {
  short: 'hintLengthShort',
  medium: 'hintLengthMedium',
  long: 'hintLengthLong',
} as const;

export default function HintLadder({
  moduleSlug,
  exercise,
  lessonHref,
  className = '',
}: {
  moduleSlug: string;
  exercise: Exercise;
  /** Route back to the lesson text when no further hint exists (arena). */
  lessonHref?: string;
  className?: string;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [result, setResult] = useState<HintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const requestLevel2 = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      setResult(await fetchHint(moduleSlug, exercise.id));
      setStep(2);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  const btn =
    'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-800 px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:border-border-light hover:text-text-primary disabled:pointer-events-none disabled:opacity-45';

  const level2 = () => {
    if (!result) return <p className="text-xs text-text-muted">{tr('loading')}</p>;

    if (!result.available) {
      return (
        <p className="text-sm leading-relaxed text-text-secondary">
          {tr('hintNone')}
          {lessonHref && (
            <>
              {' '}
              <Link href={lessonHref} className="font-semibold text-cyan-400 hover:underline">
                {tr('lessonNotes')}
              </Link>
            </>
          )}
        </p>
      );
    }

    switch (result.kind) {
      case 'eliminate': {
        const labels = result.ids
          .map(id =>
            exercise.type === 'mc' ? exercise.options.find(o => o.id === id)?.text ?? id : id
          )
          .join(', ');
        return (
          <p className="text-sm leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">{tr('hintEliminate')} </span>
            {labels}
          </p>
        );
      }
      case 'count':
        return (
          <p className="text-sm leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">{tr('hintCount')} </span>
            <span className="num">{result.count}</span>
          </p>
        );
      case 'first': {
        const label =
          exercise.type === 'order'
            ? exercise.items.find(i => i.id === result.id)?.text ?? result.id
            : result.id;
        return (
          <p className="text-sm leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">{tr('hintFirst')} </span>
            {label}
          </p>
        );
      }
      case 'pair': {
        // Only match exercises carry `pairs`. The hint payload has already been
        // validated as `kind: 'pair'`, so this branch is only reachable here when
        // `exercise.type === 'match' && result?.kind === 'pair'`.
        if (exercise.type !== 'match') {
          return (
            <p className="text-sm leading-relaxed text-text-secondary">
              {tr('hintPair')} {result.left_id} = {result.right_id}
            </p>
          );
        }

        const pairs = exercise.pairs;
        const pairsIndexed = new Map<string, typeof pairs[number]>();
        for (const p of pairs) {
          if (p && typeof p === 'object') {
            // The rendered right label comes from the right item's text field: the
            // rendered form is { id, text } (api.ts MatchPair) when the backend
            // localizes, or { id, uz, ru } when the client receives raw pairs.
            const rid =
              typeof p.right === 'object' && p.right !== null && 'id' in p.right
                ? (p.right as { id: string }).id
                : undefined;
            if (rid) pairsIndexed.set(rid, p);
          }
        }

        const leftPair =
          pairsIndexed.get(result.left_id) ?? pairs.find(p => p.id === result.left_id);
        const left =
          leftPair
            ? typeof leftPair.left === 'object' && leftPair.left !== null && 'text' in leftPair.left
              ? (leftPair.left as { text: string }).text
              : typeof leftPair.left === 'string'
                ? leftPair.left
                : undefined
            : undefined;

        const rightPair =
          pairsIndexed.get(result.right_id) ?? pairs.find(p => p.id === result.right_id);
        const right =
          rightPair
            ? typeof rightPair.right === 'object' && rightPair.right !== null && 'text' in rightPair.right
              ? (rightPair.right as { text: string }).text
              : typeof rightPair.right === 'string'
                ? rightPair.right
                : undefined
            : undefined;

        return (
          <p className="text-sm leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">{tr('hintPair')} </span>
            {(left ?? result.left_id)} = {(right ?? result.right_id)}
          </p>
        );
      }
      case 'shape':
        return (
          <p className="text-sm leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">{tr('hintShapeWords')}: </span>
            <span className="num">{result.words}</span>
            <span aria-hidden="true"> · </span>
            <span className="font-semibold text-text-primary">{tr('hintShapeLength')}: </span>
            {tr(LENGTH_KEY[result.length])}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg border border-border bg-surface-950/50 px-3 py-2.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
          <EyeIcon size={13} aria-hidden="true" /> {tr('hintsLabel')}
        </p>
        <div className="flex gap-2">
          {step === 0 && (
            <button type="button" className={btn} onClick={() => setStep(1)}>
              {tr('hintShow1')}
            </button>
          )}
          {step === 1 && (
            <button type="button" className={btn} onClick={requestLevel2} disabled={loading}>
              {loading ? tr('loading') : tr('hintShow2')}
            </button>
          )}
        </div>
      </div>

      {step >= 1 && (
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {tr(STRATEGY_KEY[exercise.type])}
        </p>
      )}

      {step >= 2 && <div className="mt-2 border-t border-border/60 pt-2">{level2()}</div>}

      {error && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-danger">
          <AlertIcon size={14} className="mt-0.5 shrink-0" />
          <span>
            {error.isTimeout
              ? tr('timeoutError')
              : error.isOffline
                ? tr('networkError')
                : tr('loadError')}
          </span>
        </p>
      )}
    </div>
  );
}
