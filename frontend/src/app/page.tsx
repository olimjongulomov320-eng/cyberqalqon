'use client';
import { stagger } from '@/lib/motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { fetchPaths, fetchStats, StatsPayload, LeaderboardEntry, fetchLeaderboard, LearningPath } from '@/lib/api';
import { AchievementBadge, DailyGoal, RingProgress, XPChip } from '@/components/game';
import LandingPreview from '@/components/LandingPreview';
import TracksSection from '@/components/TracksSection';
import AgePicker from '@/components/AgePicker';
import { useRouter } from 'next/navigation';
import { isMinor, scopePaths } from '@/lib/ageGroups';
import { achievementMeta, levelFromXp, tierIndex, tierKey } from '@/lib/gamification';
import { Avatar, Badge, ButtonLink, Card, EmptyState, SectionHeading, Skeleton } from '@/components/ui';
import {
  ArrowRightIcon,
  BoltIcon,
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
  const { lang, user, ageGroup, setAgeGroup } = useApp();
  const tr = makeT(lang);
  const router = useRouter();
  const minor = isMinor(ageGroup);

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
        const [s, p] = await Promise.all([fetchStats(lang), fetchPaths(lang, ageGroup)]);
        if (!alive) return;
        setStats(s);
        setContinueCtx(
          p.continue ? { slug: p.continue.slug, title: p.continue.title, position: p.continue.position, total: p.continue.total } : null
        );
        setPaths(scopePaths(p.paths, ageGroup, false));
      } catch {
        if (alive) setStatsFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, lang, ageGroup]);

  useEffect(() => {
    if (!user || minor) return;
    fetchLeaderboard('week', 3)
      .then(d => setTop(d.leaderboard))
      .catch(() => setTop([]));
  }, [user, minor]);

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
        {/* Asymmetric hero - copy on the left, the real interactive preview on
            the right. The preview is the product itself, not a screenshot. */}
        <section className="grid grid-cols-1 items-center gap-10 pt-4 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-10">
          <div className="flex flex-col items-start gap-5">
            {/* No kicker/eyebrow above the H1. The tagline pill was a rounded
                badge sitting in the classic "small label over the headline"
                slot; the tagline already appears in the footer, so the
                headline now opens the page at full display weight. */}
            <h1 className="display stagger-item min-w-0 text-balance" style={stagger(0)}>{tr('heroTitle')}</h1>

            <p className="stagger-item max-w-[46ch] text-base leading-relaxed text-text-secondary text-pretty" style={stagger(1)}>{tr('heroBody')}</p>

            <ButtonLink href="/auth" size="lg" className="stagger-item group" style={stagger(2)}>
              {tr('ctaStart')}
              <ArrowRightIcon size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </ButtonLink>

            <ul className="stagger-item mt-1 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2" style={stagger(3)}>
              {features.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[0.8125rem] font-medium text-text-secondary">
                  <Icon size={16} className="shrink-0 text-cyan-400" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="stagger-item relative isolate lg:mt-8" style={stagger(2)}>
            {/* Single cyan bloom behind the card - the only glow on the page. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-cyan-500/10 blur-3xl"
            />
            <p className="label mb-3">{tr('previewTag')}</p>
            <LandingPreview />
          </div>
        </section>

        {/* Who is learning - choosing a band opens the matching path. */}
        <section aria-labelledby="age-h" className="mt-14 border-t border-border/60 pt-10">
          <p id="age-h" className="label mb-1.5">{tr('agePickTitle')}</p>
          <p className="mb-4 max-w-[60ch] text-sm text-text-secondary">{tr('agePickSubtitle')}</p>
          <AgePicker
            value={ageGroup}
            onChange={g => {
              setAgeGroup(g);
              router.push('/learn');
            }}
          />
        </section>

        {/* How it works - an editorial numbered sequence, not three identical
            cards. The count is the structure. */}
        <section aria-labelledby="how-h" className="mt-16 border-t border-border/60 pt-10">
          <p id="how-h" className="label mb-6">{tr('howItWorks')}</p>
          <ol className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-t border-border/60 pt-4 sm:flex sm:flex-col sm:gap-3 sm:border-t-0 sm:pt-0">
                <span className="num text-[0.8125rem] font-bold leading-relaxed text-cyan-400">{String(i + 1).padStart(2, '0')}</span>
                <span aria-hidden="true" className="hidden h-px w-full bg-border sm:block" />
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

      {/* No group chosen yet: ask once, here. The Learn page asks the same. */}
      {ageGroup === null && (
        <section aria-labelledby="age-h" className="mt-4 rounded-lg border border-border bg-surface-900 p-4">
          <p id="age-h" className="text-sm font-semibold text-text-primary">{tr('agePickTitle')}</p>
          <p className="mb-3 mt-0.5 text-xs text-text-muted">{tr('agePickSubtitle')}</p>
          <AgePicker value={ageGroup} onChange={setAgeGroup} />
        </section>
      )}

      {/* Progress snapshot - deliberately tighter (12px) than the
          subject sections below (32px). */}
      <div className="mt-4 flex flex-col gap-3">

        {/* Continue card */}
        {continueCtx ? (
          <Link
            href={`/modules/${continueCtx.slug}`}
            className="group flex items-center gap-3.5 rounded-lg border border-cyan-500/40 bg-cyan-500/[0.08] p-4 shadow-card transition-colors hover:bg-cyan-500/[0.14]"
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
            className="group flex items-center gap-3.5 rounded-lg border border-border bg-surface-900 p-4 shadow-card transition-colors hover:bg-surface-800"
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

        {/* Status panel: three counters, the daily goal and the level in one
            instrument strip instead of four loosely centred tiles. */}
        <Card className="grid grid-cols-3 overflow-hidden lg:grid-cols-[repeat(3,minmax(0,0.8fr))_minmax(0,1.25fr)_minmax(0,1.25fr)]">
          <Stat label={tr('streak')} icon={<FlameIcon size={13} className={(stats?.profile.current_streak ?? user.current_streak ?? 0) > 0 ? 'text-warning' : ''} />}>
            {stats?.profile.current_streak ?? user.current_streak ?? 0}
          </Stat>
          <Stat label={tr('weekXp')} icon={<BoltIcon size={13} />} className="border-l border-border">
            {stats?.week_xp ?? 0}
          </Stat>
          <Stat label={tr('lessonsShort')} icon={<BookIcon size={13} />} className="border-l border-border">
            {stats?.profile.modules_completed ?? 0}
          </Stat>
          <div className="col-span-3 flex items-center border-t border-border px-4 py-3.5 lg:col-span-1 lg:border-l lg:border-t-0">
            <DailyGoal dailyXp={stats?.daily_xp ?? 0} goal={goal} />
          </div>
          <Link
            href="/profile"
            className="group col-span-3 flex items-center gap-3 border-t border-border px-4 py-3.5 transition-colors hover:bg-surface-800/60 lg:col-span-1 lg:border-l lg:border-t-0"
          >
            <RingProgress
              value={level.intoLevel}
              max={level.toNext}
              ariaLabel={tr('levelProgress')}
              label={<span className="num text-xs font-bold text-text-primary">{level.level}</span>}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-primary">{tr('levelProgress')}</p>
              <p className="num mt-0.5 text-xs text-text-secondary">
                Lv.{level.level} · {level.intoLevel}/{level.toNext} XP
              </p>
            </div>
            <ChevronRightIcon size={16} className="shrink-0 text-text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-cyan-400" />
          </Link>
        </Card>
      </div>

      {/* Learning paths + skill mastery - built from the real /paths data the
          dashboard already fetches. "Mastery" here is honest: a domain counts as
          mastered only when every one of its modules is completed. */}
      {paths.length > 0 && (
        <section aria-labelledby="paths-h" className="mt-8">
          <SectionHeading
            action={
              <Link href="/learn" className="inline-flex min-h-9 items-center text-xs font-medium text-cyan-400 hover:underline">
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

      {/* The eight tracks are the adult course. */}
      {!minor && <TracksSection />}

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
                  <Link href="/review" className="inline-flex min-h-9 items-center text-xs font-medium text-cyan-400 hover:underline">
                    {tr('sharpSkills')}
                  </Link>
                }
              >
                <span id="weak-h">{tr('weakTopics')}</span>
              </SectionHeading>
              <Card as="ul" className="divide-y divide-border overflow-hidden">
                {stats.weak_topics.slice(0, 3).map(t => (
                  <li key={t.slug}>
                    {/* The row shows a chevron, so it has to go somewhere: the
                        review session, same as the section's own link. */}
                    <Link href="/review" className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-800/60">
                      <span aria-hidden="true" className="text-cyan-300"><DomainIcon slug={t.slug} size={18} /></span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{t.title}</span>
                      <span className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full bg-surface-800 sm:block" aria-hidden="true">
                        <span className="fill-x block h-full rounded-full bg-warning/80" style={{ transform: `scaleX(${t.accuracy / 100})` }} />
                      </span>
                      <span className="num w-9 text-right text-xs font-semibold text-warning">{t.accuracy}%</span>
                      <ChevronRightIcon size={16} className="shrink-0 text-text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                    </Link>
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
                  <Link href="/profile" className="inline-flex min-h-9 items-center text-xs font-medium text-cyan-400 hover:underline">
                    {tr('seeAll')}
                  </Link>
                }
              >
                <span id="ach-h">{tr('achievements')}</span>
              </SectionHeading>
              <div className="flex flex-wrap gap-2">
                {stats.achievements.slice(0, 6).map(a => {
                  const meta = achievementMeta(a.key, lang, tr);
                  return <AchievementBadge key={a.key} icon={meta?.icon ?? 'medal'} title={meta?.title ?? a.key} />;
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

          {/* Leaderboard preview - never shown to children and teens. */}
          {!minor && (
          <section aria-labelledby="lb-h">
            <SectionHeading
              action={
                <Link href="/leaderboard" className="inline-flex min-h-9 items-center text-xs font-medium text-cyan-400 hover:underline">
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
          )}

          {/* Continue to full path */}
          {/* A closing rule with the path link, not a full-width slab that
              outweighs everything above it. */}
          <div className="flex items-center gap-4 lg:col-span-2">
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent to-border-light" />
            <ButtonLink href="/learn" variant="secondary" className="group">
              {tr('viewPath')}
              <ArrowRightIcon size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </ButtonLink>
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-border-light" />
          </div>
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

/** One counter in the dashboard status panel: a mono label over a large value. */
function Stat({ label, icon, children, className = '' }: { label: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between gap-1.5 px-3 py-3.5 sm:px-4 ${className}`}>
      {/* Labels wrap rather than truncate: "Дневная серия" in a 130px phone
          column must stay readable. */}
      <span className="flex min-w-0 items-start gap-1.5 text-text-muted">
        <span aria-hidden="true" className="mt-px shrink-0">{icon}</span>
        <span className="label leading-snug">{label}</span>
      </span>
      <span className="num text-2xl font-extrabold leading-none tracking-tight text-text-primary">{children}</span>
    </div>
  );
}
