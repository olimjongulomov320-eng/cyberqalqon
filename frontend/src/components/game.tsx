'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { levelFromXp } from '@/lib/gamification';
import { MAX_HEARTS } from '@/lib/hearts';

/* ── Hearts ────────────────────────────────────────────────────────────────── */
export function Hearts({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${label}: ${count}`}>
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`text-base leading-none transition-all duration-200 ${
            i < count ? 'opacity-100' : 'opacity-20 grayscale'
          } ${i === count - 1 ? 'animate-[cq-pop_0.3s_ease]' : ''}`}
        >
          ❤️
        </span>
      ))}
      <span className="sr-only">{count}</span>
    </span>
  );
}

/* ── Streak flame ──────────────────────────────────────────────────────────── */
export function Flame({ streak, short = false }: { streak: number; short?: boolean }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-100">
      <span aria-hidden="true" className={streak > 0 ? 'text-warning' : 'opacity-40'}>
        🔥
      </span>
      <span className="num">{streak}</span>
      {!short && <span className="text-xs font-medium text-slate-400">{tr('streakDay')}</span>}
      <span className="sr-only">{tr('streak')}</span>
    </span>
  );
}

/* ── XP chip + level ───────────────────────────────────────────────────────── */
export function XPChip({ xp, showLevel = false }: { xp: number; showLevel?: boolean }) {
  const level = showLevel ? levelFromXp(xp) : null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-warning/25 bg-warning/10 px-2 py-0.5 text-[0.8125rem] font-bold text-warning">
      <span aria-hidden="true">⚡</span>
      <span className="num">{xp}</span>
      <span className="sr-only">XP</span>
      {level && (
        <>
          <span className="text-slate-500">·</span>
          <span className="num text-xs text-slate-300">Lv.{level.level}</span>
        </>
      )}
    </span>
  );
}

/* ── Ring progress (SVG) ───────────────────────────────────────────────────── */
export function RingProgress({
  value,
  max,
  size = 56,
  stroke = 6,
  className = '',
  label,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-label={typeof label === 'string' ? label : undefined}
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-700" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="stroke-cyan-500 transition-[stroke-dashoffset] duration-500 ease-spring"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-center leading-none">{label}</span>
    </div>
  );
}

/* ── Daily goal widget ─────────────────────────────────────────────────────── */
export function DailyGoal({ dailyXp, goal }: { dailyXp: number; goal: number }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const done = goal > 0 && dailyXp >= goal;

  return (
    <div className="flex items-center gap-3">
      <RingProgress
        value={dailyXp}
        max={goal}
        label={
          <span className="text-[0.6875rem] font-bold leading-tight">
            <span className="num block text-xs">{Math.min(dailyXp, goal)}</span>
            <span className="num block text-[0.625rem] text-slate-500">/ {goal}</span>
          </span>
        }
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">{done ? tr('goalDone') : tr('todayGoal')}</p>
        <p className="num mt-0.5 text-xs text-slate-400">
          {done ? `${dailyXp} XP` : tr('dailyGoal')}
        </p>
      </div>
    </div>
  );
}

/* ── Achievement badge / toast ─────────────────────────────────────────────── */
export function AchievementBadge({ emoji, title }: { emoji: string; title: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
      <span aria-hidden="true">{emoji}</span>
      <span className="truncate">{title}</span>
    </span>
  );
}

/* ── Confetti for the celebration screen ───────────────────────────────────── */
const CONFETTI_COLORS = ['#fde047', '#22d3ee', '#4ade80', '#c084fc', '#fb923c'];

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {Array.from({ length: 28 }, (_, i) => {
        const left = (i * 37.3) % 100;
        const delay = (i % 7) * 0.09;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const w = 5 + (i % 3) * 2;
        return (
          <span
            key={i}
            className="absolute top-[-2rem] animate-[cq-fall_2.2s_ease-in_forwards]"
            style={{
              left: `${left}%`,
              width: w,
              height: w * 1.6,
              backgroundColor: color,
              opacity: 0.9,
              animationDelay: `${delay}s`,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
}