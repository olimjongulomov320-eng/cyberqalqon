'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import type { ActivityDay } from '@/lib/api';
import { buildGrid, currentRun } from '@/lib/activity';

// Intensity 0-4 as an opacity of the accent over the neutral base.
const FILL = [
  'rgb(var(--surface-700))',
  'rgb(var(--cyan-400) / 0.28)',
  'rgb(var(--cyan-400) / 0.5)',
  'rgb(var(--cyan-400) / 0.75)',
  'rgb(var(--cyan-400))',
];

/**
 * Graded answers per day for the last weeks, like a contribution graph. It is
 * a summary, not a data table: the container carries one text alternative and
 * the cells are decorative.
 */
export default function ActivityMap({ activity, today, weeks = 12 }: { activity: ActivityDay[]; today: string; weeks?: number }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const grid = buildGrid(activity, today, weeks);
  const cells = grid.flat();
  const activeDays = cells.filter(c => c.answers > 0).length;
  const run = currentRun(activity, today);
  const summary = `${activeDays} ${tr('activityActive')}, ${run} ${tr('activityRun')}`;

  return (
    <div>
      <div
        role="img"
        aria-label={summary}
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
          gridTemplateRows: 'repeat(7, auto)',
          gridAutoFlow: 'column',
        }}
      >
        {cells.map((c, i) => (
          <span
            key={c.day}
            style={{ background: c.future ? 'transparent' : FILL[c.level], ['--col' as string]: Math.floor(i / 7) } as React.CSSProperties}
            title={c.future ? undefined : `${c.day}: ${c.answers}`}
            className="cell-in aspect-square rounded-[2px]"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[0.6875rem] text-text-muted">
        <span>
          <span className="num font-bold text-text-primary">{activeDays}</span> {tr('activityActive')}
          <span aria-hidden="true"> | </span>
          <span className="num font-bold text-text-primary">{run}</span> {tr('activityRun')}
        </span>
        <span aria-hidden="true" className="flex items-center gap-1">
          {tr('activityLess')}
          {FILL.map((f, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: f }} />
          ))}
          {tr('activityMore')}
        </span>
      </div>
    </div>
  );
}
