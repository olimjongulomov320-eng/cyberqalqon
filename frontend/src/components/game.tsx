'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { levelFromXp } from '@/lib/gamification';
import { useCountUp } from '@/components/CountUp';
import { MAX_HEARTS } from '@/lib/hearts';
import { BoltIcon, ContentIcon, FlameIcon, HeartIcon, SparkleIcon } from '@/components/icons';

/* ── Hearts ────────────────────────────────────────────────────────────────── */
export function Hearts({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${label}: ${count}`}>
      {Array.from({ length: MAX_HEARTS }, (_, i) => {
        const alive = i < count;
        return (
          <HeartIcon
            key={i}
            size={16}
            filled={alive}
            className={`transition-colors duration-200 ${
              alive ? 'text-danger' : 'text-surface-600'
            }`}
          />
        );
      })}
      <span className="sr-only">{count}</span>
    </span>
  );
}

/* ── Streak flame ──────────────────────────────────────────────────────────── */
export function Flame({ streak, short = false }: { streak: number; short?: boolean }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-text-primary">
      <FlameIcon
        size={16}
        className={streak > 0 ? 'text-warning' : 'text-surface-600'}
      />
      <span className="num">{streak}</span>
      {!short && <span className="text-xs font-medium text-text-secondary">{tr('streakDay')}</span>}
      <span className="sr-only">{tr('streak')}</span>
    </span>
  );
}

/* ── XP chip + level ───────────────────────────────────────────────────────── */
export function XPChip({ xp, showLevel = false }: { xp: number; showLevel?: boolean }) {
  const shown = useCountUp(xp);
  const level = showLevel ? levelFromXp(xp) : null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-warning/25 bg-warning/10 px-2 py-0.5 text-[0.8125rem] font-bold text-warning">
      <BoltIcon size={14} className="shrink-0" />
      <span className="num" aria-hidden="true">{shown}</span>
      <span className="sr-only">{xp} XP</span>
      {level && (
        <>
          <span className="text-text-muted">·</span>
          <span className="num text-xs text-text-secondary">Lv.{level.level}</span>
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
          className="stroke-cyan-400 transition-[stroke-dashoffset] duration-500 ease-spring"
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
            <span className="num block text-[0.625rem] text-text-muted">/ {goal}</span>
          </span>
        }
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">{done ? tr('goalDone') : tr('todayGoal')}</p>
        <p className="num mt-0.5 text-xs text-text-secondary">
          {done ? `${dailyXp} XP` : tr('dailyGoal')}
        </p>
      </div>
    </div>
  );
}

/* ── Achievement badge / toast ─────────────────────────────────────────────── */
export function AchievementBadge({ icon, title }: { icon: string; title: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
      <ContentIcon name={icon} size={14} className="shrink-0" />
      <span className="truncate">{title}</span>
    </span>
  );
}

export function NewAchievementChip({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/15 px-2.5 py-1 text-xs font-bold text-warning">
      <SparkleIcon size={14} className="shrink-0" />
      <span className="truncate">{title}</span>
    </span>
  );
}

/* ── Confetti for the celebration screen ───────────────────────────────────── */
const CONFETTI_COLORS = ['#39d98a', '#82f0b4', '#fbbf24', '#e8f0ec'];

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {Array.from({ length: 24 }, (_, i) => {
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
              opacity: 0.85,
              animationDelay: `${delay}s`,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
}
