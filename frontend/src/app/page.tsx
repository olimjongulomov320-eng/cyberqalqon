'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { fetchPaths, fetchStats, StatsPayload, LeaderboardEntry, fetchLeaderboard } from '@/lib/api';
import { AchievementBadge, DailyGoal, Flame, RingProgress, XPChip } from '@/components/game';
import { achievementMeta, levelFromXp, tierIndex, tierKey } from '@/lib/gamification';
import { Avatar, Badge, ButtonLink, Card, EmptyState, SectionHeading, Skeleton } from '@/components/ui';

const ACTIVITY_LABEL: Record<string, string> = {
  lesson: 'activityLesson',
  correct: 'activityCorrect',
  review: 'activityReview',
};

export default function HomePage() {
  const { lang, user } = useApp();
  const tr = makeT(lang);

  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [continueCtx, setContinueCtx] = useState<{ slug: string; title: string; position: number; total: number } | null>(null);
  const [top, setTop] = useState<LeaderboardEntry[] | null>(null);
  const [statsFailed, setStatsFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [s, p] = await Promise.all([fetchStats(lang), fetchPaths(lang)]);
        if (!alive) return;
        setStats(s);
        setContinueCtx(
          p.continue ? { slug: p.continue.slug, title: p.continue.title, position: p.continue.position, total: p.continue.total } : null
        );
      } catch {
        if (alive) setStatsFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, lang]);

  useEffect(() => {
    if (!user) return;
    fetchLeaderboard('week', 3)
      .then(d => setTop(d.leaderboard))
      .catch(() => setTop([]));
  }, [user]);

  /* ── Signed out: landing hero ── */
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-10 sm:pb-16">
        <section className="stagger flex flex-col items-center gap-4 pb-8 text-center">
          <span aria-hidden="true" className="grid h-20 w-20 place-items-center rounded-2xl border border-border bg-surface-900 text-5xl shadow-card edge-light">
            🛡️
          </span>
          <h1 className="display max-w-lg">{tr('heroTitle')}</h1>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">{tr('heroBody')}</p>
          <ButtonLink href="/auth" size="lg">{tr('ctaStart')}</ButtonLink>
        </section>

        <section aria-labelledby="how-h" className="mt-2">
          <SectionHeading><span id="how-h">{tr('howItWorks')}</span></SectionHeading>
          <div className="grid gap-2 sm:grid-cols-3">
            {[['📖', tr('step1')], ['⚡', tr('step2')], ['🔁', tr('step3')]].map(([e, t], i) => (
              <Card key={i} className="flex flex-col items-start gap-2.5 p-4">
                <span aria-hidden="true" className="text-2xl">{e}</span>
                <p className="text-[0.8125rem] leading-relaxed text-slate-300">{t}</p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="feat-h" className="mt-6">
          <SectionHeading><span id="feat-h">{tr('featLessons')}</span></SectionHeading>
          <Card as="ul" className="divide-y divide-border overflow-hidden">
            {[['🧩', tr('featLessons')], ['🔥', tr('featStreak')], ['🎯', tr('featReview')]].map(([e, t], i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3.5">
                <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-700 text-lg">{e}</span>
                <span className="text-[0.9375rem] font-semibold text-slate-200">{t}</span>
              </li>
            ))}
          </Card>
        </section>
      </div>
    );
  }

  /* ── Signed in: gamified dashboard ── */
  const level = levelFromXp(user.total_xp);
  const goal = stats?.profile.daily_goal_xp ?? 20;
  const tier = tierKey(tierIndex(level.level));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-8 sm:pb-12">
      <div className="stagger flex flex-col gap-4">
        {/* Greeting + level */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar emoji={user.avatar_emoji} name={user.display_name} size="lg" ring />
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold tracking-tight text-white">
                {tr('welcome')}, {user.display_name}
              </p>
              <div className="flex items-center gap-1.5">
                <Badge>{tr(tier)}</Badge>
                <span className="num text-xs text-slate-500">Lv.{level.level}</span>
              </div>
            </div>
          </div>
          <XPChip xp={user.total_xp} />
        </header>

        {/* Continue card */}
        {continueCtx ? (
          <Link
            href={`/modules/${continueCtx.slug}`}
            className="group flex items-center gap-3.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-4 shadow-card transition-colors hover:bg-cyan-500/15"
          >
            <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-cyan-500 text-xl text-text-inverse">
              ▶
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{tr('continueLearning')}</p>
              <p className="truncate text-[0.9375rem] font-bold text-white">{continueCtx.title}</p>
              <p className="num text-xs text-slate-400">
                {tr('continueHint')} · {continueCtx.position}/{continueCtx.total}
              </p>
            </div>
            <span aria-hidden="true" className="shrink-0 text-xl text-slate-500 transition-colors group-hover:text-cyan-500">›</span>
          </Link>
        ) : (
          <Link
            href="/learn"
            className="group flex items-center gap-3.5 rounded-lg border border-border bg-surface-900 p-4 shadow-card transition-colors hover:bg-surface-700"
          >
            <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-surface-700 text-xl">🧭</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tr('learningPath')}</p>
              <p className="truncate text-[0.9375rem] font-bold text-white">{tr('choosePath')}</p>
            </div>
            <span aria-hidden="true" className="shrink-0 text-xl text-slate-500 transition-colors group-hover:text-cyan-500">›</span>
          </Link>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="items-center gap-1 p-3 text-center">
            <Flame streak={stats?.profile.current_streak ?? user.current_streak ?? 0} short />
            <span className="text-xs text-slate-500">{tr('streak')}</span>
          </Card>
          <Card className="items-center gap-1 p-3 text-center">
            <span className="num text-lg font-extrabold text-slate-100">{stats?.week_xp ?? 0}</span>
            <span className="text-xs text-slate-500">{tr('weekXp')}</span>
          </Card>
          <Card className="items-center gap-1 p-3 text-center">
            <span className="num text-lg font-extrabold text-slate-100">
              {stats?.profile.modules_completed ?? 0}
            </span>
            <span className="text-xs text-slate-500">{tr('lessonsShort')}</span>
          </Card>
        </div>

        {/* Daily goal + level progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <DailyGoal dailyXp={stats?.daily_xp ?? 0} goal={goal} />
            <div className="flex flex-col items-end gap-1">
              <RingProgress
                value={level.intoLevel}
                max={level.toNext}
                size={46}
                stroke={5}
                label={<span className="num text-[0.625rem] font-bold text-slate-300">{level.intoLevel}</span>}
              />
              <Link href="/profile" className="text-[0.6875rem] font-medium text-cyan-400 hover:underline">
                {tr('levelProgress')}
              </Link>
            </div>
          </div>
        </Card>

        {statsFailed ? (
          <Card>
            <EmptyState emoji="📡" title={tr('loadError')} body={tr('networkError')} />
          </Card>
        ) : !stats ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Weak topics → practice */}
            {stats.weak_topics.length > 0 && (
              <section aria-labelledby="weak-h">
                <SectionHeading action={<Link href="/practice" className="text-[0.75rem] font-medium text-cyan-400 hover:underline">{tr('sharpSkills')}</Link>}>
                  <span id="weak-h">{tr('weakTopics')}</span>
                </SectionHeading>
                <Card as="ul" className="divide-y divide-border overflow-hidden">
                  {stats.weak_topics.slice(0, 3).map(t => (
                    <li key={t.slug} className="flex items-center gap-3 px-4 py-3">
                      <span aria-hidden="true" className="text-lg">{t.icon}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">{t.title}</span>
                      <span className="num text-xs text-slate-500">{t.accuracy}%</span>
                      <span aria-hidden="true" className="text-slate-600">›</span>
                    </li>
                  ))}
                </Card>
              </section>
            )}

            {/* Achievements */}
            {stats.achievements.length > 0 && (
              <section aria-labelledby="ach-h">
                <SectionHeading action={<Link href="/profile" className="text-[0.75rem] font-medium text-cyan-400 hover:underline">{tr('seeAll')}</Link>}>
                  <span id="ach-h">{tr('achievements')}</span>
                </SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {stats.achievements.slice(0, 6).map(a => {
                    const meta = achievementMeta(a.key, lang, tr);
                    return (
                      <AchievementBadge key={a.key} emoji={meta?.emoji ?? '🏅'} title={meta?.title ?? a.key} />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recent activity */}
            {stats.recent.length > 0 && (
              <section aria-labelledby="act-h">
                <SectionHeading><span id="act-h">{tr('recentActivity')}</span></SectionHeading>
                <Card as="ul" className="divide-y divide-border overflow-hidden">
                  {stats.recent.slice(0, 4).map((r, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <span aria-hidden="true" className="text-base">{r.kind === 'lesson' ? '📘' : r.kind === 'review' ? '🔁' : '🎯'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {tr(ACTIVITY_LABEL[r.kind] ?? 'activityLesson')}
                          {r.module_title ? ` · ${r.module_title}` : ''}
                        </p>
                      </div>
                      <span className="num shrink-0 text-xs font-bold text-warning">+{r.amount}</span>
                    </li>
                  ))}
                </Card>
              </section>
            )}

            {/* Leaderboard preview */}
            <section aria-labelledby="lb-h">
              <SectionHeading action={<Link href="/leaderboard" className="text-[0.75rem] font-medium text-cyan-400 hover:underline">{tr('seeAll')}</Link>}>
                <span id="lb-h">{tr('leaderboard')}</span>
              </SectionHeading>
              <Card as="ul" className="divide-y divide-border overflow-hidden">
                {top && top.length > 0 ? (
                  top.map(entry => (
                    <li key={entry.user_id} className="flex items-center gap-3 px-4 py-3">
                      <Rank rank={entry.rank} />
                      <Avatar emoji={entry.avatar_emoji} name={entry.display_name} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">{entry.display_name}</span>
                      <span className="num shrink-0 text-sm font-bold text-warning">{entry.total_xp}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-center text-sm text-slate-500">{tr('emptyLeaderboardTitle')}</li>
                )}
              </Card>
            </section>

            {/* Continue to full path */}
            <ButtonLink href="/learn" size="lg" className="w-full justify-center">
              {tr('viewPath')} →
            </ButtonLink>
          </>
        )}
      </div>
    </div>
  );
}

function Rank({ rank }: { rank: number }) {
  const tone = { 1: 'text-warning', 2: 'text-slate-300', 3: 'text-success' }[rank] ?? 'text-slate-500';
  return (
    <span className={`num w-5 shrink-0 text-center text-sm font-bold ${tone}`} aria-label={`${rank}`}>
      {rank}
    </span>
  );
}