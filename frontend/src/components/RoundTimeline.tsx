import type { InterviewRole } from '@/lib/api';
import { ROUND_LABEL } from '@/lib/interview';

/** Rounds drawn to scale: each segment's width is its share of the clock. */
export default function RoundTimeline({ rounds, tr, className = '' }: { rounds: InterviewRole['rounds']; tr: (k: string) => string; className?: string }) {
  const total = rounds.reduce((n, r) => n + r.minutes, 0);
  return (
    <div className={`flex gap-1 ${className}`}>
      {rounds.map((r, i) => (
        <div key={r.kind} style={{ flexGrow: r.minutes, flexBasis: 0 }} className="min-w-0">
          <div className={`h-1.5 rounded-full ${['bg-cyan-400/70', 'bg-cyan-400/45', 'bg-cyan-400/25'][i] ?? 'bg-surface-600'}`} />
          {/* Name and minutes on their own lines, so narrow segments never clip. */}
          <p className="mt-1.5 text-[0.6875rem] font-semibold leading-tight text-text-secondary">{tr(ROUND_LABEL[r.kind])}</p>
          <p className="text-[0.6875rem] leading-tight text-text-muted">
            <span className="num">{r.minutes}</span> {tr('ivMin')}
          </p>
        </div>
      ))}
      <span className="sr-only">{total} {tr('ivMin')}</span>
    </div>
  );
}
