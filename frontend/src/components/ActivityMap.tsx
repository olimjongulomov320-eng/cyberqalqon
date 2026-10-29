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
  const summary = `${tr('activityActive')}: ${activeDays}, ${tr('activityRun')}: ${run}`;

  return (
    <div>
      <div
        role="img"
        aria-label={summary}
        className="grid w-max gap-1"
        style={{
          gridTemplateColumns: `repeat(${weeks}, 16px)`,
          gridTemplateRows: 'repeat(7, 16px)',
          gridAutoFlow: 'column',
        }}
      >
        {cells.map((c, i) => (
          <span
            key={c.day}
            style={{ background: c.future ? 'transparent' : FILL[c.level], ['--col' as string]: Math.floor(i / 7) } as React.CSSProperties}
            title={c.future ? undefined : `${c.day}: ${c.answers}`}
            className="cell-in h-4 w-4 rounded-[3px]"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[0.6875rem] text-text-muted">
        <span>
          {tr('activityActive')}: <span className="num font-bold text-text-primary">{activeDays}</span>
          <span aria-hidden="true"> | </span>
          {tr('activityRun')}: <span className="num font-bold text-text-primary">{run}</span>
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
