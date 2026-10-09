'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { Progress } from './ui';

const XP_PER_LEVEL = 100;

/** XP needed to reach the next level, from a given lifetime total. */
export function levelFromXp(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const intoLevel = totalXp % XP_PER_LEVEL;
  return { level, intoLevel, needed: XP_PER_LEVEL - intoLevel, toNext: XP_PER_LEVEL };
}

export default function XPBar() {
  const { user, lang } = useApp();
  const tr = makeT(lang);
  if (!user) return null;

  const { level, intoLevel, needed } = levelFromXp(user.total_xp);

  return (
    <section
      aria-labelledby="xp-heading"
      className="relative overflow-hidden rounded-lg border border-border bg-surface-900 p-4 shadow-card edge-light"
    >
      {/* Single cyan-500 wash, radial rather than an even left-to-right fade. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-cyan-500/[0.07] blur-3xl"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="xp-heading" className="label">
            {tr('welcome')}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 truncate text-lg font-bold tracking-tight text-white">
            {user.display_name}
            <span aria-hidden="true">{user.avatar_emoji}</span>
          </p>
        </div>
        <p className="num shrink-0 text-right text-sm font-bold text-warning">
          {user.total_xp}
          <span className="ml-0.5 text-[0.625rem] text-warning/60">XP</span>
        </p>
      </div>

      <div className="relative mt-4 flex items-baseline justify-between gap-3 text-[0.8125rem]">
        <span className="text-slate-400">
          {tr('level')} <span className="num font-semibold text-slate-200">{level}</span>
        </span>
        <span className="num text-slate-500">
          {intoLevel} / {XP_PER_LEVEL}
        </span>
      </div>

      <Progress value={intoLevel} max={XP_PER_LEVEL} label={tr('progressLabel')} className="relative mt-2 h-2" />

      <p className="relative mt-2 text-[0.6875rem] text-slate-600">
        {tr('xpToNextLevel')} <span className="num">{needed}</span> XP
      </p>
    </section>
  );
}
