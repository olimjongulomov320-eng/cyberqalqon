'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { fetchPaths, fetchStats, StatsPayload, LeaderboardEntry, fetchLeaderboard, LearningPath } from '@/lib/api';
import { AchievementBadge, DailyGoal, Flame, RingProgress, XPChip } from '@/components/game';
import LandingPreview from '@/components/LandingPreview';
import { achievementMeta, levelFromXp, tierIndex, tierKey } from '@/lib/gamification';
import { Avatar, Badge, ButtonLink, Card, EmptyState, SectionHeading, Skeleton } from '@/components/ui';
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ChevronRightIcon,
  CompassIcon,
  DomainIcon,
  FlameIcon,
  PlayIcon,
  RefreshIcon,
  TargetIcon,
} from '@/components/icons';

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
  const [paths, setPaths] = useState<LearningPath[]>([]);
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
        setPaths(p.paths);
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

  /* ── Signed out: landing ── */
  if (!user) {
    const features = [
      { Icon: BookIcon, label: tr('featLessons') },
      { Icon: FlameIcon, label: tr('featStreak') },
      { Icon: TargetIcon, label: tr('featReview') },
    ];
    const steps = [tr('step1'), tr('step2'), tr('step3')];

    return (
      <div className="flex flex-col">
        {/* Asymmetric hero — copy on the left, the real interactive preview on
            the right. The preview is the product itself, not a screenshot. */}
        <section className="grid grid-cols-1 items-center gap-10 pt-4 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-10">
          <div className="flex flex-col items-start gap-5">
            {/* No kicker/eyebrow above the H1. The tagline pill was a rounded
                badge sitting in the classic "small label over the headline"
                slot; the tagline already appears in the footer, so the
                headline now opens the page at full display weight. */}
            <h1 className="display min-w-0 text-balance">{tr('heroTitle')}</h1>

            <p className="max-w-[46ch] text-base leading-relaxed text-text-secondary text-pretty">{tr('heroBody')}</p>

            <ButtonLink href="/auth" size="lg" className="group">
              {tr('ctaStart')}
              <ArrowRightIcon size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </ButtonLink>

            <ul className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              {features.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[0.8125rem] font-medium text-text-secondary">
                  <Icon size={16} className="shrink-0 text-cyan-400" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:mt-8">
            {/* Single cyan bloom behind the card — the only glow on the page. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-cyan-500/10 blur-3xl"
            />
            <p className="label mb-3">{tr('previewTag')}</p>
            <LandingPreview />
          </div>
        </section>

        {/* How it works — an editorial numbered sequence, not three identical
            cards. The count is the structure. */}
        <section aria-labelledby="how-h" className="mt-16 border-t border-border/60 pt-10">
          <p id="how-h" className="label mb-6">{tr('howItWorks')}</p>
          <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <li key={i} className="flex flex-col gap-3">
                <span className="num text-[0.8125rem] font-bold text-cyan-400">{String(i + 1).padStart(2, '0')}</span>
                <span aria-hidden="true" className="h-px w-full bg-border" />
                <p className="text-[0.9375rem] leading-relaxed text-text-secondary text-pretty">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }

  /* ── Signed in: gamified dashboard ── */
  const level = levelFromXp(user.total_xp);
  const goal = stats?.profile.daily_goal_xp ?? 20;
  const tier = tierKey(tierIndex(level.level));

  return (
    <div className="flex flex-col">
      {/* Greeting + level */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar emoji={user.avatar_emoji} name={user.display_name} size="lg" ring />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-white">
              {tr('welcome')}, {user.display_name}
            </h1>
            <div className="flex items-center gap-1.5">
              <Badge>{tr(tier)}</Badge>
              <span className="num text-xs text-text-muted">Lv.{level.level}</span>
            </div>
          </div>
        </div>
        <XPChip xp={user.total_xp} />
      </header>

      {/* Progress snapshot — deliberately tighter (12px) than the
          subject sections below (32px). */}
      <div className="mt-4 flex flex-col gap-3">

        {/* Continue card */}
        {continueCtx ? (
          <Link
            href={`/modules/${continueCtx.slug}`}
            className="group flex items-center gap-3.5 rounded-xl border border-cyan-500/40 bg-cyan-500/[0.08] p-4 shadow-card transition-colors hover:bg-cyan-500/[0.14]"
          >
            <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-cyan-400 text-text-inverse">
              <PlayIcon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="label text-cyan-300">{tr('continueLearning')}</p>
              <p className="truncate text-[0.9375rem] font-bold text-white">{continueCtx.title}</p>
              <p className="num text-xs text-text-secondary">
                {tr('continueHint')} · {continueCtx.position}/{continueCtx.total}
              </p>
              <div aria-hidden="true" className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-cyan-500/15">
                <div
                  className="fill-x h-full rounded-full bg-cyan-400"
                  style={{ transform: `scaleX(${continueCtx.position / continueCtx.total})`, transformOrigin: 'left' }}
                />
              </div>
            </div>
            <ChevronRightIcon size={20} className="shrink-0 text-text-muted transition-colors group-hover:text-cyan-400" />
          </Link>
        ) : (
          <Link
            href="/learn"
            className="group flex items-center gap-3.5 rounded-xl border border-border bg-surface-900 p-4 shadow-card transition-colors hover:bg-surface-800"
          >
            <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-800 text-cyan-300">
              <CompassIcon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="label">{tr('learningPath')}</p>
              <p className="truncate text-[0.9375rem] font-bold text-white">{tr('choosePath')}</p>
            </div>
            <ChevronRightIcon size={20} className="shrink-0 text-text-muted transition-colors group-hover:text-cyan-400" />
          </Link>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="flex flex-col items-center gap-1 p-3 text-center">
            <Flame streak={stats?.profile.current_streak ?? user.current_streak ?? 0} short />
            <span className="text-xs text-text-muted">{tr('streak')}</span>
          </Card>
          <Card className="flex flex-col items-center gap-1 p-3 text-center">
            <span className="num text-lg font-extrabold text-text-primary">{stats?.week_xp ?? 0}</span>
            <span className="text-xs text-text-muted">{tr('weekXp')}</span>
          </Card>
          <Card className="flex flex-col items-center gap-1 p-3 text-center">
            <span className="num text-lg font-extrabold text-text-primary">{stats?.profile.modules_completed ?? 0}</span>
            <span className="text-xs text-text-muted">{tr('lessonsShort')}</span>
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
                label={<span className="num text-[0.625rem] font-bold text-text-primary">{level.intoLevel}</span>}
              />
              <Link href="/profile" className="text-[0.6875rem] font-medium text-cyan-400 hover:underline">
                {tr('levelProgress')}
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Learning paths + skill mastery — built from the real /paths data the
          dashboard already fetches. "Mastery" here is honest: a domain counts as
          mastered only when every one of its modules is completed. */}
      {paths.length > 0 && (
        <section aria-labelledby="paths-h" className="mt-8">
          <SectionHeading
            action={
              <Link href="/learn" className="text-xs font-medium text-cyan-400 hover:underline">
                {tr('viewPath')}
              </Link>
            }
          >
            <span id="paths-h">{tr('yourPath')}</span>
          </SectionHeading>
          <div className="flex flex-col gap-2">
            {paths.map(path => {
              const done = path.domains.reduce((n, d) => n + d.completed, 0);
              const total = path.domains.reduce((n, d) => n + d.total, 0);
              const pct = total > 0 ? done / total : 0;
              return (
                <Card key={path.slug} className="p-4">
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="text-cyan-300"><DomainIcon slug={path.slug} size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{path.title}</p>
                      <p className="num text-xs text-text-muted">
                        {done}/{total} {tr('modulesDone')} · {Math.round(pct * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
                    <div
                      className="fill-x h-full rounded-full bg-cyan-400"
                      style={{ transform: `scaleX(${pct})`, transformOrigin: 'left' }}
                    />
                  </div>
                  {path.domains.length > 0 && (
                    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-6">
                      {path.domains.map(d => {
                        const dp = d.total > 0 ? d.completed / d.total : 0;
                        const mastered = d.total > 0 && d.completed >= d.total;
                        return (
                          <li key={d.slug} className="flex min-w-0 items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[0.625rem] ${
                                mastered ? 'border-success/40 bg-success/10 text-success' : 'border-border bg-surface-800'
                              }`}
                            >
                              {mastered ? <CheckIcon size={9} /> : <DomainIcon slug={d.slug} size={12} className="text-cyan-300" />}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{d.title}</span>
                            <span aria-hidden="true" className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-surface-800">
                              <span
                                className="fill-x block h-full rounded-full bg-cyan-400/70"
                                style={{ transform: `scaleX(${dp})`, transformOrigin: 'left' }}
                              />
                            </span>
                            <span className="num w-8 shrink-0 text-right text-[0.6875rem] text-text-muted">
                              {d.completed}/{d.total}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {statsFailed ? (
        <Card className="mt-8">
          <EmptyState
            icon={<CompassIcon size={26} className="text-text-muted" />}
            title={tr('loadError')}
            body={tr('networkError')}
          />
        </Card>
      ) : !stats ? (
        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-8">
          {/* Supporting sections flow two-up on desktop, so the dashboard stops
              being one 16px-gapped column of equally weighted blocks. */}
          {/* Weak topics → practice */}
          {stats.weak_topics.length > 0 && (
            <section aria-labelledby="weak-h">
              <SectionHeading
                action={
                  <Link href="/practice" className="text-xs font-medium text-cyan-400 hover:underline">
                    {tr('sharpSkills')}
                  </Link>
                }
              >
                <span id="weak-h">{tr('weakTopics')}</span>
              </SectionHeading>
              <Card as="ul" className="divide-y divide-border overflow-hidden">
                {stats.weak_topics.slice(0, 3).map(t => (
                  <li key={t.slug} className="flex items-center gap-3 px-4 py-3">
                    <span aria-hidden="true" className="text-cyan-300"><DomainIcon slug={t.slug} size={18} /></span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{t.title}</span>
                    <span className="num text-xs text-text-muted">{t.accuracy}%</span>
                    <ChevronRightIcon size={16} className="shrink-0 text-text-muted" />
                  </li>
                ))}
              </Card>
            </section>
          )}

          {/* Achievements */}
          {stats.achievements.length > 0 && (
            <section aria-labelledby="ach-h">
              <SectionHeading
                action={
                  <Link href="/profile" className="text-xs font-medium text-cyan-400 hover:underline">
                    {tr('seeAll')}
                  </Link>
                }
              >
                <span id="ach-h">{tr('achievements')}</span>
              </SectionHeading>
              <div className="flex flex-wrap gap-2">
                {stats.achievements.slice(0, 6).map(a => {
                  const meta = achievementMeta(a.key, lang, tr);
                  return <AchievementBadge key={a.key} emoji={meta?.emoji ?? '🏅'} title={meta?.title ?? a.key} />;
                })}
              </div>
            </section>
          )}

          {/* Recent activity */}
          {stats.recent.length > 0 && (
            <section aria-labelledby="act-h">
              <SectionHeading><span id="act-h">{tr('recentActivity')}</span></SectionHeading>
              <Card as="ul" className="divide-y divide-border overflow-hidden">
                {stats.recent.slice(0, 4).map((r, i) => {
                  const ActivityIcon = r.kind === 'review' ? RefreshIcon : r.kind === 'correct' ? TargetIcon : BookIcon;
                  return (
                    <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <ActivityIcon size={16} className="shrink-0 text-text-muted" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {tr(ACTIVITY_LABEL[r.kind] ?? 'activityLesson')}
                          {r.module_title ? ` · ${r.module_title}` : ''}
                        </p>
                      </div>
                      <span className="num shrink-0 text-xs font-bold text-warning">+{r.amount}</span>
                    </li>
                  );
                })}
              </Card>
            </section>
          )}

          {/* Leaderboard preview */}
          <section aria-labelledby="lb-h">
            <SectionHeading
              action={
                <Link href="/leaderboard" className="text-xs font-medium text-cyan-400 hover:underline">
                  {tr('seeAll')}
                </Link>
              }
            >
              <span id="lb-h">{tr('leaderboard')}</span>
            </SectionHeading>
            <Card as="ul" className="divide-y divide-border overflow-hidden">
              {top && top.length > 0 ? (
                top.map(entry => (
                  <li key={entry.user_id} className="flex items-center gap-3 px-4 py-3">
                    <Rank rank={entry.rank} />
                    <Avatar emoji={entry.avatar_emoji} name={entry.display_name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{entry.display_name}</span>
                    <span className="num shrink-0 text-sm font-bold text-warning">{entry.total_xp}</span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-sm text-text-muted">{tr('emptyLeaderboardTitle')}</li>
              )}
            </Card>
          </section>

          {/* Continue to full path */}
          <ButtonLink href="/learn" size="lg" className="group w-full justify-center lg:col-span-2">
            {tr('viewPath')}
            <ArrowRightIcon size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

function Rank({ rank }: { rank: number }) {
  const tone = { 1: 'text-warning', 2: 'text-text-secondary', 3: 'text-success' }[rank] ?? 'text-text-muted';
  return (
    <span className={`num w-5 shrink-0 text-center text-sm font-bold ${tone}`} aria-label={`${rank}`}>
      {rank}
    </span>
  );
}
