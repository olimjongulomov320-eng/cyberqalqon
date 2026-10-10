'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lang, makeT } from '@/lib/i18n';
import type { AnswerValue, Exercise } from '@/lib/api';

/* ── Readiness ─────────────────────────────────────────────────────────────── */
export function isAnswerReady(ex: Exercise, value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  switch (ex.type) {
    case 'mc':
    case 'tf':
    case 'input':
      return String(value).trim().length > 0;
    case 'multi':
      return Array.isArray(value) && value.length > 0;
    case 'order':
      return Array.isArray(value) && value.length === ex.items.length;
    case 'match':
      return (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        ex.pairs.every(p => Boolean((value as Record<string, string>)[p.id]))
      );
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Shared question card ──────────────────────────────────────────────────── */
function Question({ ex, children }: { ex: Exercise; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[1.0625rem] font-bold leading-snug text-white sm:text-lg">{ex.q}</h2>
      {ex.code && (
        <pre className="overflow-x-auto rounded-md border border-border bg-surface-800 px-3 py-2.5 font-mono text-[0.8125rem] leading-relaxed text-cyan-200">
          <code>{ex.code}</code>
        </pre>
      )}
      {children}
    </div>
  );
}

/* ── Multiple choice / single select ───────────────────────────────────────── */
function SelectOne({
  ex,
  value,
  onChange,
  locked,
  reveal,
}: {
  ex: Extract<Exercise, { type: 'mc' | 'multi' }>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  locked: boolean;
  reveal?: { answer?: string; answers?: string[] };
}) {
  const selected = new Set((Array.isArray(value) ? value : value ? [value] : []) as string[]);
  const correctSet = new Set(reveal?.answers ?? (reveal?.answer ? [reveal.answer] : []));
  const multi = ex.type === 'multi';
  const hint = multi ? 'selectSome' : 'chooseAnswer';

  return (
    <div className="flex flex-col gap-2" role={multi ? 'group' : 'radiogroup'} aria-label={hint}>
      {ex.options.map(opt => {
        const isSel = selected.has(opt.id);
        const isCorr = correctSet.has(opt.id);
        let cls = 'border-border bg-surface-900 text-slate-200 hover:border-border-light hover:bg-surface-700';
        if (locked && isCorr) cls = 'border-success/70 bg-success/15 text-success animate-[cq-pop_0.35s_ease]';
        else if (locked && isSel && !isCorr) cls = 'border-danger/70 bg-danger/10 text-danger animate-[cq-shake_0.35s_ease]';
        else if (isSel) cls = 'border-cyan-500/70 bg-cyan-500/15 text-white';
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => (locked ? undefined : onChange(multi ? toggleIn(selected, opt.id) : opt.id))}
            disabled={locked}
            aria-pressed={isSel}
            className={`flex items-center gap-3 rounded-md border px-3.5 py-3 text-left text-sm font-medium transition-colors ${
              locked ? 'cursor-default' : ''
            } ${cls}`}
          >
            <span
              aria-hidden="true"
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-[0.375rem] border text-[0.625rem] font-bold ${
                isSel ? 'border-cyan-500 bg-cyan-500 text-text-inverse' : 'border-border-light text-transparent'
              }`}
            >
              {multi ? '✓' : ''}
            </span>
            <span>{opt.text}</span>
            {locked && isCorr && <span aria-hidden="true" className="ml-auto text-success">✓</span>}
            {locked && isSel && !isCorr && <span aria-hidden="true" className="ml-auto text-danger">✗</span>}
          </button>
        );
      })}
    </div>
  );
}

function toggleIn(set: Set<string>, id: string): string[] {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return Array.from(next);
}

/* ── True / False ──────────────────────────────────────────────────────────── */
function TrueFalse({
  value,
  onChange,
  locked,
  reveal,
  lang,
}: {
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  locked: boolean;
  reveal?: { answer?: string };
  lang: Lang;
}) {
  const tr = makeT(lang);
  const options = [
    { id: 'true', emoji: '👍', label: tr('optTrue') },
    { id: 'false', emoji: '👎', label: tr('optFalse') },
  ] as const;
  return (
    <div role="radiogroup" className="grid grid-cols-2 gap-2" aria-label="true or false">
      {options.map(o => {
        const isSel = value === o.id;
        const isCorr = locked && reveal?.answer === o.id;
        let cls = 'border-border bg-surface-900 text-slate-200 hover:border-border-light hover:bg-surface-700';
        if (locked && isCorr) cls = 'border-success/70 bg-success/15 text-success animate-[cq-pop_0.35s_ease]';
        else if (locked && isSel && !isCorr) cls = 'border-danger/70 bg-danger/10 text-danger animate-[cq-shake_0.35s_ease]';
        else if (isSel) cls = 'border-cyan-500/70 bg-cyan-500/15 text-white';
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => !locked && onChange(o.id)}
            disabled={locked}
            aria-pressed={isSel}
            className={`flex flex-col items-center gap-1.5 rounded-md border px-3 py-4 text-sm font-semibold transition-colors ${cls}`}
          >
            <span aria-hidden="true" className="text-xl">{o.emoji}</span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Match pairs ● Auto IDs: right items use pair ids (curriculum convention) ── */
function Match({
  ex,
  value,
  onChange,
  locked,
  reveal,
  lang,
}: {
  ex: Extract<Exercise, { type: 'match' }>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  locked: boolean;
  reveal?: { match_answer?: Record<string, string> };
  lang: Lang;
}) {
  const tr = makeT(lang);
  const [sel, setSel] = useState<string | null>(null);
  const [rightOrder] = useState(() => shuffle(ex.pairs.map(p => p.id)));

  const assignments = (value as Record<string, string>) || {};

  useEffect(() => {
    if (locked) setSel(null);
  }, [locked]);

  const takeLeft = (pairId: string) => {
    if (locked) return;
    if (assignments[pairId] && sel === null) {
      // Tapping an already-assigned left un-assigns it.
      const next = { ...assignments };
      delete next[pairId];
      onChange(next);
      return;
    }
    setSel(pairId);
  };

  const takeRight = (rightId: string) => {
    if (locked || !sel) return;
    onChange({ ...assignments, [sel]: rightId });
    setSel(null);
  };

  const clearAll = () => {
    if (locked) return;
    onChange({});
    setSel(null);
  };

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-400">{tr('matchHint')}</p>
      <div className="grid grid-cols-2 gap-2.5">
        <ul className="flex flex-col gap-2">
          {ex.pairs.map(p => {
            const isSel = sel === p.id;
            const assigned = assignments[p.id];
            const isCorr = locked && reveal?.match_answer?.[p.id] === assigned;
            let cls = 'border-border bg-surface-900 text-slate-200';
            if (locked && assigned && isCorr) cls = 'border-success/70 bg-success/15 text-success animate-[cq-pop_0.35s_ease]';
            else if (locked && assigned && !isCorr) cls = 'border-danger/70 bg-danger/10 text-danger animate-[cq-shake_0.35s_ease]';
            else if (isSel) cls = 'border-cyan-500/70 bg-cyan-500/15 text-white';
            else if (assigned) cls = 'border-border-light bg-surface-700 text-slate-100';
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => takeLeft(p.id)}
                  disabled={locked}
                  aria-pressed={isSel}
                  className={`w-full rounded-md border px-3 py-2.5 text-left text-[0.8125rem] font-medium transition-colors ${cls}`}
                >
                  <span className="block break-words">{p.left}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="flex flex-col gap-2">
          {rightOrder.map(rightId => {
            const pairedBy = Object.entries(assignments).find(([, v]) => v === rightId)?.[0] as string | undefined;
            const isCorr = locked && Boolean(pairedBy) && (pairedBy ? reveal?.match_answer?.[pairedBy] === rightId : false);
            let cls = 'border-border bg-surface-900 text-slate-200 hover:border-border-light hover:bg-surface-700';
            if (locked && isCorr) cls = 'border-success/70 bg-success/15 text-success animate-[cq-pop_0.35s_ease]';
            else if (locked && pairedBy && !isCorr) cls = 'border-danger/70 bg-danger/10 text-danger animate-[cq-shake_0.35s_ease]';
            else if (pairedBy) cls = 'border-border-light bg-surface-700 text-slate-100';
            const pair = ex.pairs.find(p => p.id === rightId)!;
            return (
              <li key={rightId}>
                <button
                  type="button"
                  onClick={() => takeRight(rightId)}
                  disabled={locked}
                  aria-pressed={Boolean(pairedBy)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left text-[0.8125rem] font-medium transition-colors ${cls}`}
                >
                  <span className="block break-words">{pair.right}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="num text-xs text-slate-500">
          {Object.keys(assignments).length} / {ex.pairs.length}
        </p>
        <button
          type="button"
          onClick={clearAll}
          disabled={locked || Object.keys(assignments).length === 0}
          className="text-xs font-semibold text-slate-400 transition-colors hover:text-white disabled:opacity-40"
        >
          {tr('clearOrder')}
        </button>
      </div>
    </div>
  );
}

/* ── Order / arrange ───────────────────────────────────────────────────────── */
function Order({
  ex,
  value,
  onChange,
  locked,
  reveal,
  lang,
}: {
  ex: Extract<Exercise, { type: 'order' }>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  locked: boolean;
  reveal?: { order?: string[] };
  lang: Lang;
}) {
  const tr = makeT(lang);
  const correct = new Set(reveal?.order ?? []);
  const placed = (Array.isArray(value) ? value : []) as string[];
  const placedSet = new Set(placed);
  // Stable shuffled order of ALL item ids; placed items are filtered out for
  // the pool, so tapping an item toggles it between pool and the answer list.
  const [shuffledAll] = useState(() => shuffle(ex.items.map(i => i.id)));
  const pool = shuffledAll.filter(id => !placedSet.has(id));

  const place = (id: string) => {
    if (locked) return;
    if (placedSet.has(id)) {
      onChange(placed.filter(p => p !== id));
    } else {
      onChange([...placed, id]);
    }
  };

  const itemById = (id: string) => ex.items.find(i => i.id === id)!;

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-400">{tr('orderHint')}</p>

      {placed.length > 0 && (
        <ol className="mb-3 flex flex-col gap-1.5">
          {placed.map((id, i) => {
            const isCorr = locked && correct.has(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => place(id)}
                  disabled={locked}
                  className={`flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-[0.8125rem] font-medium transition-colors ${
                    locked && !isCorr
                      ? 'border-danger/70 bg-danger/10 text-danger animate-[cq-shake_0.35s_ease]'
                      : 'border-cyan-500/50 bg-cyan-500/10 text-slate-100'
                  }`}
                >
                  <span className="num w-5 text-xs text-slate-500">{i + 1}</span>
                  <span className="flex-1">{itemById(id).text}</span>
                  <span aria-hidden="true" className="text-slate-500">↑</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {pool.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label={tr('inputHint')}>
          {pool.map(id => (
            <button
              key={id}
              type="button"
              onClick={() => place(id)}
              disabled={locked}
              className="rounded-md border border-border bg-surface-900 px-3 py-2 text-[0.8125rem] font-medium text-slate-200 transition-colors hover:border-border-light hover:bg-surface-700"
            >
              {itemById(id).text}
            </button>
          ))}
        </div>
      )}
      <p className="num mt-3 text-xs text-slate-500">
        {placed.length} / {ex.items.length}
      </p>
    </div>
  );
}

/* ── Text / command input ──────────────────────────────────────────────────── */
function TextInput({
  ex,
  value,
  onChange,
  locked,
  reveal,
  lang,
}: {
  ex: Extract<Exercise, { type: 'input' }>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  locked: boolean;
  reveal?: { answer?: string };
  lang: Lang;
}) {
  const tr = makeT(lang);
  const text = (value as string) ?? '';
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-400">{tr('inputHint')}</p>
      <input
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        value={text}
        onChange={e => !locked && onChange(e.target.value)}
        disabled={locked}
        aria-label={tr('typeAnswer')}
        placeholder={tr('typeAnswer')}
        className={`w-full rounded-md border bg-surface-800 px-3.5 py-3 font-mono text-[0.9375rem] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/30 ${
          locked && reveal?.answer && text && text.trim().toLowerCase() === reveal.answer.toLowerCase()
            ? 'border-success/70 bg-success/10'
            : locked
              ? 'border-border'
              : 'border-border'
        }`}
      />
      {locked && reveal?.answer && (
        <p className="mt-2 text-sm font-semibold text-success">
          {tr('answerIs')} <span className="font-mono">{reveal.answer}</span>
        </p>
      )}
    </div>
  );
}

/* ── Registry + dispatcher ─────────────────────────────────────────────────── */
export function ExerciseRenderer({
  ex,
  value,
  onChange,
  locked,
  reveal,
}: {
  ex: Exercise;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  locked: boolean;
  reveal?: import('@/lib/api').Reveal;
}) {
  const { lang } = useApp();
  const v: AnswerValue = value ?? null;

  return (
    <Question ex={ex}>
      {ex.type === 'mc' && (
        <SelectOne ex={ex} value={v} onChange={onChange} locked={locked} reveal={reveal} />
      )}
      {ex.type === 'multi' && (
        <SelectOne ex={ex} value={v} onChange={onChange} locked={locked} reveal={reveal} />
      )}
      {ex.type === 'tf' && (
        <TrueFalse value={v} onChange={onChange} locked={locked} reveal={reveal} lang={lang} />
      )}
      {ex.type === 'match' && (
        <Match ex={ex} value={v} onChange={onChange} locked={locked} reveal={reveal} lang={lang} />
      )}
      {ex.type === 'order' && (
        <Order ex={ex} value={v} onChange={onChange} locked={locked} reveal={reveal} lang={lang} />
      )}
      {ex.type === 'input' && (
        <TextInput ex={ex} value={v} onChange={onChange} locked={locked} reveal={reveal} lang={lang} />
      )}
    </Question>
  );
}