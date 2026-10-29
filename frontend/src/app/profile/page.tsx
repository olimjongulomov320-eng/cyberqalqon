'use client';
import { ContentIcon } from '@/components/icons';
import ChallengeStats from '@/components/ChallengeStats';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ActivityMap from '@/components/ActivityMap';
import { appDayKey } from '@/lib/appday';
import { useApp } from '@/context/AppContext';
import { Lang, makeT } from '@/lib/i18n';
import { ActivityDay, ApiError, AttemptRow, StatsPayload, Track, deleteAccount, fetchActivity, fetchAttempts, fetchStats, fetchTracks, updateMe } from '@/lib/api';
import { accuracyOf, proficiency, sortForMatrix, type Proficiency } from '@/lib/skills';
import { achievementMeta, tierIndex, tierKey, levelFromXp } from '@/lib/gamification';
import { RingProgress } from '@/components/game';
import { Avatar, Badge, Button, ButtonLink, Card, EmptyState, ErrorNote, Skeleton } from '@/components/ui';
import {
  BoltIcon,
  BookIcon,
  ChartIcon,
  CheckIcon,
  CloseIcon,
  DomainIcon,
  FlameIcon,
  RefreshIcon,
  TargetIcon,
  TrophyBadgeIcon,
} from '@/components/icons';

const GOALS = [10, 20, 30, 50];

const ACTIVITY_LABEL: Record<string, string> = {
  lesson: 'activityLesson',
  correct: 'activityCorrect',
  review: 'activityReview',
};

const HISTORY_PAGE = 8;
type HistoryFilter = 'all' | 'correct' | 'wrong';

const PROF_KEY: Record<Proficiency, string> = {
  notStarted: 'profNotStarted',
  learning: 'profLearning',
  needsPractice: 'profNeedsPractice',
  mastered: 'profMastered',
};

const PROF_TONE: Record<Proficiency, 'neutral' | 'primary' | 'warning' | 'success'> = {
  notStarted: 'neutral',
  learning: 'primary',
  needsPractice: 'warning',
  mastered: 'success',
};

/**
 * SKILL MATRIX - stage 06 (master).
 *
 * Proficiency comes from demonstrated performance only: real module completion
 * plus real graded accuracy per domain (`lib/skills` holds the published rule,
 * and the rule is printed under the matrix so nothing about a label is a
 * mystery). XP and streaks live elsewhere on this page and are deliberately
 * never inputs here. An empty profile renders as "not started" rows, not as a
 * fabricated 0% score.
 */
function SkillMatrix({ stats }: { stats: StatsPayload }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const rows = sortForMatrix(stats.domains ?? []);
  const trend = stats.trend;

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="skills-h" className="mt-6">
      <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1">
        <h2 id="skills-h" className="text-base font-bold tracking-tight text-text-primary">
          {tr('skillsMatrixTitle')}
        </h2>
        <span className="text-[0.6875rem] text-text-muted">{tr('skillsMatrixHint')}</span>
      </div>

      {/* Improvement over time - hidden when either 7-day window has too few
          graded answers, because a number off two answers is noise. */}
      <div className="mb-2.5 rounded-lg border border-border bg-surface-900 px-3.5 py-2.5">
        <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-text-muted">
          {tr('trendTitle')}
        </p>
        {trend ? (
          <p className="num mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span className={`font-bold ${trend.delta > 0 ? 'text-success' : trend.delta < 0 ? 'text-danger' : 'text-text-primary'}`}>
              {trend.delta > 0 ? '+' : ''}
              {trend.delta}
            </span>
            <span>
              {tr('trendRecent')}: <span className="font-bold text-text-primary">{trend.recent_accuracy}%</span>
            </span>
            <span aria-hidden="true" className="text-text-muted">
              ·
            </span>
            <span>
              {tr('trendPrev')}:{' '}
              <span className="font-bold text-text-primary">{trend.previous_accuracy}%</span>
            </span>
          </p>
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{tr('trendNone')}</p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface-900 shadow-card edge-light">
        <ul className="divide-y divide-border/60">
          {rows.map(s => {
            const level = proficiency(s);
            const acc = accuracyOf(s);
            const pct =
              s.modules_total > 0
                ? Math.round((s.modules_completed / s.modules_total) * 100)
                : 0;
            return (
              <li key={s.slug} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                <span aria-hidden="true" className="shrink-0 text-cyan-300">
                  <DomainIcon slug={s.slug} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{s.title}</p>
                  <p className="num mt-1 flex items-center gap-2 text-[0.6875rem] text-text-muted">
                    <span>
                      {s.modules_completed}/{s.modules_total} {tr('modulesDone')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {tr('accuracy')} {acc === null ? '-' : `${acc}%`}
                    </span>
                  </p>
                  <span aria-hidden="true" className="mt-1.5 flex h-1 w-full overflow-hidden rounded-full bg-surface-800">
                    <span className="block h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
                  </span>
                </div>
                <Badge tone={PROF_TONE[level]} className="shrink-0">
                  {tr(PROF_KEY[level])}
                </Badge>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-1.5 px-1 text-[0.6875rem] leading-relaxed text-text-muted">
        {tr('skillsRuleBody')}
      </p>
    </section>
  );
}

/**
 * `dd.MM · HH:mm`, formatted by hand rather than through `Intl`.
 * Both uz and ru read day-first dates, and the ICU data behind an Uzbek locale
 * tag varies by build - a fixed numeric shape is the same everywhere and never
 * degrades into a raw key or a Cyrillic month name.
 */
function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * The learner's own graded-attempt timeline, read from GET /users/me/attempts.
 *
 * Fetched here rather than folded into `fetchStats` so the profile does not
 * pay for a full history on every visit, and so paging stays independent of the
 * stats cache. Rows are strictly this account's - the endpoint takes no user id.
 */
function HistoryCard({ lang }: { lang: Lang }) {
  const tr = makeT(lang);
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [totals, setTotals] = useState({ correct: 0, wrong: 0 });
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultParam = (f: HistoryFilter) => (f === 'all' ? undefined : f);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchAttempts({ lang, limit: HISTORY_PAGE, result: resultParam(filter) })
      .then(p => {
        if (!alive) return;
        setRows(p.attempts);
        setTotals({ correct: p.correct_total, wrong: p.wrong_total });
        setHasMore(p.has_more);
      })
      .catch(err => {
        if (alive) setError((err as ApiError).message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [lang, filter]);

  const loadMore = () => {
    setLoadingMore(true);
    fetchAttempts({ lang, limit: HISTORY_PAGE, offset: rows.length, result: resultParam(filter) })
      .then(p => {
        setRows(prev => [...prev, ...p.attempts]);
        setHasMore(p.has_more);
      })
      .catch(err => setError((err as ApiError).message))
      .finally(() => setLoadingMore(false));
  };

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-4 pt-3">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">{tr('historyTitle')}</p>
        <p className="num text-xs text-text-muted">
          {tr('historyCorrect')}: {totals.correct} · {tr('historyWrong')}: {totals.wrong}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pt-2.5" role="group" aria-label={tr('historyTitle')}>
        {(['all', 'correct', 'wrong'] as HistoryFilter[]).map(f => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === f
                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                : 'border-border bg-surface-950/60 text-text-secondary hover:border-cyan-500/40 hover:text-text-primary'
            }`}
          >
            {tr(f === 'all' ? 'historyFilterAll' : f === 'correct' ? 'historyFilterCorrect' : 'historyFilterWrong')}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 pt-3">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2 px-4 py-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      ) : rows.length === 0 ? (
        <div className="px-4 pb-4 pt-3">
          <p className="text-sm font-semibold text-text-primary">
            {filter === 'all' ? tr('historyEmptyTitle') : tr('historyEmptyFilteredTitle')}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {filter === 'all' ? tr('historyEmptyBody') : tr('historyEmptyFilteredBody')}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(a => (
            <li key={a.id} className="flex items-start gap-3 px-4 py-2.5">
              <span className={`mt-0.5 shrink-0 ${a.correct ? 'text-success' : 'text-danger'}`}>
                {a.correct ? <CheckIcon size={16} /> : <CloseIcon size={16} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-text-primary">
                  {a.question || tr('historyNoQuestion')}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                  {a.domain_slug && <DomainIcon slug={a.domain_slug} size={13} />}
                  <span className="truncate">{a.module_title}</span>
                  <span className="num shrink-0">· {formatWhen(a.answered_at)}</span>
                </span>
              </span>
              {/* Icons are decorative; the verdict needs a text equivalent. */}
              <span className="sr-only">{a.correct ? tr('historyCorrect') : tr('historyWrong')}</span>
            </li>
          ))}
        </ul>
      )}

      {!loading && hasMore && (
        <div className="px-4 py-3">
          <Button variant="ghost" size="sm" className="w-full" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? tr('historyLoading') : tr('historyLoadMore')}
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ── Permanent account deletion ─────────────────────────────────────────────── */
function DeleteAccount({ lang }: { lang: Lang }) {
  const tr = makeT(lang);
  const { logout } = useApp();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await deleteAccount(password);
      logout();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-4 w-full text-center text-xs font-semibold text-text-muted underline-offset-2 hover:text-danger hover:underline">
        {tr('deleteAccount')}
      </button>
    );
  }
  return (
    <Card className="mt-4 border-danger/40 p-4">
      <p className="text-sm text-text-secondary">{tr('deleteAccountWarn')}</p>
      <label className="mt-3 block text-xs font-semibold text-text-secondary" htmlFor="delete-password">
        {tr('deleteConfirmPassword')}
      </label>
      <input
        id="delete-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="input-base mt-1.5"
      />
      {failed && <p role="alert" className="mt-2 text-xs font-semibold text-danger">{tr('deleteAccountFailed')}</p>}
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" onClick={() => { setOpen(false); setPassword(''); setFailed(false); }}>
          {tr('cancelAction')}
        </Button>
        <Button onClick={confirm} disabled={busy || !password}>
          {tr('deleteAccountConfirm')}
        </Button>
      </div>
    </Card>
  );
}

type Tab = 'overview' | 'skills' | 'history' | 'settings';
const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'tabOverview' },
  { key: 'skills', label: 'tabSkills' },
  { key: 'history', label: 'tabHistory' },
  { key: 'settings', label: 'tabSettings' },
];
const isTab = (v: string | null): v is Tab => TABS.some(t => t.key === v);

/** One bordered strip of key numbers instead of a stack of separate cards. */
function KpiStrip({ stats }: { stats: StatsPayload }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const items = [
    { Icon: BoltIcon, label: tr('totalXp'), value: stats.profile.total_xp, sub: `${stats.week_xp} / ${tr('weekShort')}`, tone: 'text-warning' },
    { Icon: FlameIcon, label: tr('streak'), value: stats.profile.current_streak ?? 0, sub: `${tr('bestStreak')}: ${stats.profile.longest_streak ?? 0}`, tone: 'text-text-primary' },
    { Icon: BookIcon, label: tr('lessonsShort'), value: stats.profile.modules_completed ?? 0, sub: undefined, tone: 'text-text-primary' },
    { Icon: CheckIcon, label: tr('statsTitle'), value: stats.accuracy === null ? '-' : `${stats.accuracy}%`, sub: `${stats.answers_correct + stats.answers_wrong} ${tr('answersTotal').toLowerCase()}`, tone: 'text-success' },
  ];
  return (
    <dl className="grid grid-cols-2 divide-border overflow-hidden rounded-lg border border-border bg-surface-900 sm:grid-cols-4 sm:divide-x [&>div]:border-border max-sm:[&>div:nth-child(n+3)]:border-t max-sm:[&>div:nth-child(even)]:border-l">
      {items.map(({ Icon, label, value, sub, tone }) => (
        <div key={label} className="p-4">
          <dt className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-text-muted">
            <Icon size={14} /> {label}
          </dt>
          <dd className={`num mt-1.5 text-2xl font-bold ${tone}`}>{value}</dd>
          {sub && <p className="num mt-0.5 text-xs text-text-muted">{sub}</p>}
        </div>
      ))}
    </dl>
  );
}

/** Tracks table: where each track stands (lessons done, demonstrated mastery). */
function TracksTable({ tracks }: { tracks: Track[] }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const stateKey = { not_started: 'masteryNotStarted', practising: 'masteryPractising', mastered: 'masteryMastered' } as const;
  return (
    <Card className="overflow-hidden">
      <div className="hidden grid-cols-[minmax(0,1fr)_7rem_11rem_7rem] gap-3 border-b border-border/60 bg-surface-950/40 px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-wider text-text-muted md:grid">
        <span>{tr('colTrack')}</span>
        <span>{tr('colLessons')}</span>
        <span>{tr('colMastery')}</span>
        <span />
      </div>
      <ul className="divide-y divide-border/60">
        {tracks.map(t => {
          const st = t.mastery?.state ?? 'not_started';
          return (
            <li key={t.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 md:grid-cols-[minmax(0,1fr)_7rem_11rem_7rem]">
              <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text-primary">
                <ContentIcon name={t.icon} size={18} className="shrink-0 text-cyan-300" />
                <span className="truncate">{t.title}</span>
              </p>
              <p className="num order-3 text-xs text-text-secondary md:order-none md:text-sm">
                {t.completion.completed}/{t.completion.total}
              </p>
              <p className="order-4 flex flex-wrap items-center gap-2 md:order-none">
                <Badge tone={st === 'mastered' ? 'success' : st === 'practising' ? 'primary' : 'neutral'}>{tr(stateKey[st])}</Badge>
                {t.mastery && t.mastery.distinct > 0 && (
                  <span className="num text-xs text-text-muted">{t.mastery.distinct} / {t.mastery.accuracy ?? 0}%</span>
                )}
              </p>
              <div className="row-start-1 col-start-2 justify-self-end md:row-start-auto md:col-start-auto">
                {t.next ? (
                  <Link
                    href={`/modules/${t.next.slug}`}
                    className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-800"
                  >
                    {t.completion.completed > 0 ? tr('trackContinue') : tr('trackStart')}
                  </Link>
                ) : (
                  <Badge tone="success">{tr('trackCompleted')}</Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default function ProfilePage() {
  const { lang, user, setUser, logout, ready } = useApp();
  const tr = makeT(lang);

  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [activity, setActivity] = useState<ActivityDay[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Remember the tab in the URL (?tab=) so a reload or shared link lands on it.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (isTab(t)) setTab(t);
  }, []);
  const selectTab = (t: Tab) => {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.replaceState(null, '', url);
  };

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchStats(lang).then(s => alive && setStats(s)).catch(e => alive && setError(e as ApiError));
    fetchTracks(lang).then(d => alive && setTracks(d.tracks)).catch(() => alive && setTracks([]));
    fetchActivity(84).then(d => alive && setActivity(d.activity)).catch(() => alive && setActivity([]));
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  const patch = async (p: { display_name?: string; daily_goal_xp?: number; show_on_leaderboard?: boolean }) => {
    try {
      const updated = await updateMe(p);
      setUser(updated);
      setSavedAt(new Date().toISOString());
      setTimeout(() => setSavedAt(null), 1600);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-text-secondary">{tr('signInToAnswer')}</p>
        <div className="mt-4 flex justify-center gap-2">
          <ButtonLink href="/auth">{tr('login')}</ButtonLink>
        </div>
      </Card>
    );
  }

  const level = levelFromXp(user.total_xp);
  const tier = tr(tierKey(tierIndex(level.level)));
  const goal = stats?.profile.daily_goal_xp ?? user.daily_goal_xp ?? 20;

  // "Next up": the started-but-unfinished track closest to done, else the first track with a lesson to take.
  const next =
    tracks
      ?.filter(t => t.next && t.completion.completed > 0)
      .sort((a, b) => b.completion.completed / b.completion.total - a.completion.completed / a.completion.total)[0] ??
    tracks?.find(t => t.next) ??
    null;

  return (
    <div>
      {/* Identity + level */}
      <header className="flex flex-wrap items-center gap-4">
        <Avatar name={user.display_name} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight text-text-primary">{user.display_name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge>{tier}</Badge>
            <span className="num font-mono text-xs text-text-muted">Lv.{level.level}</span>
            <span className="num font-mono text-xs text-text-muted">{level.intoLevel}/{level.toNext} XP</span>
          </div>
          <div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-sm bg-surface-700" aria-hidden="true">
            <div className="fill-x h-full bg-cyan-400" style={{ transform: `scaleX(${level.intoLevel / level.toNext})`, transformOrigin: 'left' }} />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div role="tablist" aria-label={tr('navProgress')} className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => selectTab(t.key)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t.key ? 'border-cyan-400 text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tr(t.label)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorNote>{error.message}</ErrorNote>
        </div>
      )}

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {tab === 'overview' && (
          <div className="flex flex-col gap-6">
            {!stats ? <Skeleton className="h-24 w-full" /> : <KpiStrip stats={stats} />}

            <Card className="p-4">
              <h2 className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">{tr('activityTitle')}</h2>
              {activity ? <ActivityMap activity={activity} today={appDayKey()} /> : <Skeleton className="h-24 w-full" />}
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="flex flex-col p-4">
                <h2 className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">{tr('nextUpTitle')}</h2>
                {!tracks ? (
                  <Skeleton className="h-16 w-full" />
                ) : next && next.next ? (
                  <>
                    <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                      <ContentIcon name={next.icon} size={18} className="text-cyan-300" /> {next.title}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">{next.next.title}</p>
                    <p className="num mt-1 text-xs text-text-muted">{next.completion.completed}/{next.completion.total} {tr('trackLessons').toLowerCase()}</p>
                    <div className="mt-auto pt-4">
                      <ButtonLink href={`/modules/${next.next.slug}`} size="sm">
                        {next.completion.completed > 0 ? tr('trackContinue') : tr('trackStart')}
                      </ButtonLink>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-text-muted">{tr('nextUpDone')}</p>
                )}
              </Card>

              <Card className="flex flex-col p-4">
                <h2 className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">{tr('sharpenTitle')}</h2>
                {!stats ? (
                  <Skeleton className="h-16 w-full" />
                ) : stats.weak_topics.length > 0 ? (
                  <>
                    <ul className="divide-y divide-border/60">
                      {stats.weak_topics.slice(0, 3).map(t => (
                        <li key={t.slug} className="flex items-center gap-2.5 py-2">
                          <DomainIcon slug={t.slug} size={16} className="text-cyan-300" />
                          <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{t.title}</span>
                          <span className="num text-xs font-bold text-danger">{t.accuracy}%</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-4">
                      <ButtonLink href="/review" variant="secondary" size="sm">
                        <RefreshIcon size={14} /> {tr('pathReviewAction')}
                      </ButtonLink>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-text-muted">{tr('sharpenNone')}</p>
                )}
              </Card>
            </div>

            <Card className="overflow-hidden">
              <h2 className="px-4 pt-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">{tr('achievements')}</h2>
              {!stats || stats.achievements.length === 0 ? (
                <p className="px-4 pb-4 pt-2 text-sm text-text-muted">{tr('achievementsEmpty')}</p>
              ) : (
                <ul className="grid grid-cols-2 gap-2 px-4 pb-4 pt-3 sm:grid-cols-3 lg:grid-cols-4">
                  {stats.achievements.map(a => {
                    const meta = achievementMeta(a.key, lang, tr);
                    return (
                      <li key={a.key} className="flex items-center gap-2.5 rounded-md border border-border bg-surface-950/60 px-3 py-2">
                        <ContentIcon name={meta?.icon ?? 'medal'} size={20} className="shrink-0 text-warning" />
                        <span className="text-xs font-semibold text-text-primary">{meta?.title ?? a.key}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        )}

        {tab === 'skills' && (
          <div className="flex flex-col gap-6">
            {!tracks ? <Skeleton className="h-48 w-full" /> : <TracksTable tracks={tracks} />}
            <p className="text-xs text-text-muted">{tr('masteryRule')}</p>
            {stats && <SkillMatrix stats={stats} />}
            <ChallengeStats />
          </div>
        )}

        {tab === 'history' && <HistoryCard lang={lang} />}

        {tab === 'settings' && (
          <div className="flex max-w-xl flex-col gap-6">
            <Card className="flex flex-col gap-5 p-4">
              <div>
                <p className="mb-2 text-sm font-bold text-text-primary">{tr('dailyGoal')}</p>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={tr('dailyGoal')}>
                  {GOALS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => patch({ daily_goal_xp: g })}
                      aria-pressed={goal === g}
                      className={`rounded-md border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                        goal === g ? 'border-cyan-400 bg-cyan-500/15 text-text-primary' : 'border-border bg-surface-900 text-text-secondary hover:border-border-light'
                      }`}
                    >
                      <span className="num">{g}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-500"
                  checked={user.show_on_leaderboard !== false}
                  onChange={e => patch({ show_on_leaderboard: e.target.checked })}
                />
                {tr('showOnLeaderboard')}
              </label>
              {savedAt && (
                <p role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                  <CheckIcon size={14} /> {tr('nameSaved')}
                </p>
              )}
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/leaderboard" variant="secondary" size="sm" className="justify-center">{tr('leaderboard')}</ButtonLink>
              <ButtonLink href="/review" variant="secondary" size="sm" className="justify-center">{tr('reviewSession')}</ButtonLink>
            </div>

            <div>
              <Button variant="secondary" className="w-full justify-center" onClick={logout}>{tr('logout')}</Button>
              <DeleteAccount lang={lang} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
