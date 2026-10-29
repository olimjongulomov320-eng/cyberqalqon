'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lang, makeT } from '@/lib/i18n';
import { ApiError, AttemptRow, StatsPayload, deleteAccount, fetchAttempts, fetchStats, updateMe } from '@/lib/api';
import { accuracyOf, proficiency, sortForMatrix, type Proficiency } from '@/lib/skills';
import { achievementMeta, tierIndex, tierKey, levelFromXp } from '@/lib/gamification';
import { RingProgress } from '@/components/game';
import Journey from '@/components/Journey';
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
const AVATARS = ['🦊', '🦉', '🐺', '🦁', '🐼', '🦅', '🐯', '🐸'];

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
 * SKILL MATRIX — stage 06 (master).
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

      {/* Improvement over time — hidden when either 7-day window has too few
          graded answers, because a number off two answers is noise. */}
      <div className="mb-2.5 rounded-xl border border-border bg-surface-900 px-3.5 py-2.5">
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

      <div className="overflow-hidden rounded-xl border border-border bg-surface-900 shadow-card edge-light">
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
                      {tr('accuracy')} {acc === null ? '—' : `${acc}%`}
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
 * tag varies by build — a fixed numeric shape is the same everywhere and never
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
 * stats cache. Rows are strictly this account's — the endpoint takes no user id.
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
                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200'
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

export default function ProfilePage() {
  const { lang, user, setUser, logout, ready } = useApp();
  const tr = makeT(lang);

  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = async () => {
    try {
      setStats(await fetchStats(lang));
    } catch (err) {
      setError(err as ApiError);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, user?.id]);

  const patch = async (p: { display_name?: string; avatar_emoji?: string; daily_goal_xp?: number; show_on_leaderboard?: boolean }) => {
    try {
      setSaving(p.avatar_emoji ? p.avatar_emoji : p.daily_goal_xp ? String(p.daily_goal_xp) : 'name');
      const updated = await updateMe(p);
      setUser(updated);
      setSavedAt(new Date().toISOString());
      setTimeout(() => setSavedAt(null), 1600);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setSaving(null);
    }
  };

  if (!ready) {
    return (
      <div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Card className="p-6 text-center">
          <p className="text-sm text-text-secondary">{tr('signInToAnswer')}</p>
          <div className="mt-4 flex justify-center gap-2">
            <ButtonLink href="/auth">{tr('login')}</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  const level = levelFromXp(user.total_xp);
  const tier = tr(tierKey(tierIndex(level.level)));
  const goal = stats?.profile.daily_goal_xp ?? user.daily_goal_xp ?? 20;

  const stats_ = [
    { Icon: BoltIcon, label: tr('totalXp'), value: stats?.profile.total_xp, tone: 'text-warning' },
    { Icon: FlameIcon, label: tr('streak'), value: stats?.profile.current_streak ?? 0, tone: 'text-danger' },
    { Icon: TrophyBadgeIcon, label: tr('bestStreak'), value: stats?.profile.longest_streak ?? 0, tone: 'text-cyan-300' },
    { Icon: BookIcon, label: tr('lessonsShort'), value: stats?.profile.modules_completed ?? 0, tone: 'text-text-secondary' },
  ];

  return (
    <div>
      <div className="flex flex-col">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <Avatar emoji={user.avatar_emoji} name={user.display_name} size="lg" ring />
          </div>
          <div>
            <h1 className="display">{user.display_name}</h1>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <Badge>{tier}</Badge>
              <span className="num text-xs text-text-muted">Lv.{level.level}</span>
            </div>
          </div>
        </header>

        <Journey className="mt-3" />

        {error && (
          <Card>
            <ErrorNote>{error.message}</ErrorNote>
          </Card>
        )}

        {!stats ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Level progress */}
            <Card className="mt-5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{tr('levelProgress')}</span>
                <span className="num text-xs text-text-muted">
                  {level.intoLevel}/{level.toNext} XP
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
                <div
                  className="fill-x h-full rounded-full bg-cyan-400"
                  style={{ transform: `scaleX(${level.intoLevel / level.toNext})`, transformOrigin: 'left' }}
                />
              </div>
            </Card>

            {/* Stat cards */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {stats_.map(({ Icon, label, value, tone }) => (
                <Card key={label} className="flex flex-col items-center gap-1.5 p-3 text-center">
                  <Icon size={18} className={tone} />
                  <span className="num text-xl font-extrabold text-white">{value}</span>
                  <span className="text-[0.6875rem] text-text-muted">{label}</span>
                </Card>
              ))}
            </div>

            {/* Accuracy */}
            <Card className="mt-3 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-white">{tr('statsTitle')}</span>
                  <p className="num mt-1 text-xs text-text-secondary">
                    {tr('answersTotal')}: {stats.answers_correct + stats.answers_wrong}
                  </p>
                  <p className="num mt-0.5 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckIcon size={13} /> {stats.answers_correct}
                    </span>
                    <span className="inline-flex items-center gap-1 text-danger">
                      <CloseIcon size={13} /> {stats.answers_wrong}
                    </span>
                  </p>
                </div>
                <RingProgress
                  value={stats.accuracy ?? 0}
                  max={100}
                  size={54}
                  label={<span className="num text-sm font-extrabold text-white">{stats.accuracy ?? 0}%</span>}
                />
              </div>
            </Card>

            {/* Skill matrix — the Master view: proficiency from demonstrated
                performance, printed rule, honest "not started" rows. */}
            <SkillMatrix stats={stats} />

            {/* Strong / weak topics */}
            {stats.strong_topics.length > 0 || stats.weak_topics.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {stats.strong_topics.length > 0 && (
                  <Card className="overflow-hidden">
                    <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wider text-success">{tr('strongest')}</p>
                    <ul className="divide-y divide-border">
                      {stats.strong_topics.slice(0, 4).map(t => (
                        <li key={t.slug} className="flex items-center gap-2.5 px-4 py-2.5">
                          <span aria-hidden="true" className="text-cyan-300"><DomainIcon slug={t.slug} size={16} /></span>
                          <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{t.title}</span>
                          <span className="num text-xs font-bold text-success">{t.accuracy}%</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {stats.weak_topics.length > 0 && (
                  <Card className="overflow-hidden">
                    <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wider text-danger">{tr('weakTopics')}</p>
                    <ul className="divide-y divide-border">
                      {stats.weak_topics.slice(0, 4).map(t => (
                        <li key={t.slug} className="flex items-center gap-2.5 px-4 py-2.5">
                          <span aria-hidden="true" className="text-cyan-300"><DomainIcon slug={t.slug} size={16} /></span>
                          <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{t.title}</span>
                          <span className="num text-xs font-bold text-danger">{t.accuracy}%</span>
                        </li>
                      ))}
                    </ul>
                    {/* Weak topics are only useful if they lead somewhere: the
                        review session already builds a drill from real mistakes. */}
                    <div className="px-4 pb-4 pt-1">
                      <ButtonLink href="/review" variant="secondary" size="sm" className="w-full justify-center">
                        <RefreshIcon size={14} />
                        {tr('pathReviewAction')}
                      </ButtonLink>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="mt-6">
                <EmptyState
                  icon={<ChartIcon size={26} className="text-text-muted" />}
                  title={tr('noStatsYet')}
                  body={tr('noStatsBody')}
                />
              </Card>
            )}

            {/* Recent activity */}
            {stats.recent.length > 0 && (
              <Card className="mt-6 overflow-hidden">
                <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wider text-text-secondary">{tr('recentActivity')}</p>
                <ul className="divide-y divide-border">
                  {stats.recent.slice(0, 5).map((r, i) => {
                    const ActivityIcon = r.kind === 'review' ? RefreshIcon : r.kind === 'correct' ? TargetIcon : BookIcon;
                    return (
                      <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <ActivityIcon size={16} className="shrink-0 text-text-muted" />
                        <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                          {tr(ACTIVITY_LABEL[r.kind] ?? 'activityLesson')}
                          {r.module_title ? ` · ${r.module_title}` : ''}
                        </span>
                        <span className="num shrink-0 text-xs font-bold text-warning">+{r.amount}</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}

            {/* Submission history — this account's graded attempts, newest first. */}
            <HistoryCard lang={lang} />

            {/* Achievements */}
            <Card className="mt-6 overflow-hidden">
              <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wider text-warning">{tr('achievements')}</p>
              {stats.achievements.length === 0 ? (
                <p className="px-4 pb-4 pt-1 text-sm text-text-muted">{tr('achievementsEmpty')}</p>
              ) : (
                <ul className="grid grid-cols-2 gap-2 px-4 pb-4 pt-2 sm:grid-cols-3">
                  {stats.achievements.map(a => {
                    const meta = achievementMeta(a.key, lang, tr);
                    return (
                      <li key={a.key} className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface-950/60 px-2 py-3 text-center">
                        <span aria-hidden="true" className="text-2xl">{meta?.emoji ?? '🏅'}</span>
                        <span className="text-xs font-bold text-text-primary">{meta?.title ?? a.key}</span>
                        <span className="text-[0.625rem] text-text-muted">{tr('achievedOn')}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Settings: avatar + daily goal */}
            <Card className="mt-8 p-4">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="mb-2 text-sm font-bold text-white">{tr('changeAvatar')}</p>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={tr('changeAvatar')}>
                    {AVATARS.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => patch({ avatar_emoji: a })}
                        aria-pressed={user.avatar_emoji === a}
                        aria-label={a}
                        className={`grid h-10 w-10 place-items-center rounded-md border text-xl transition-colors ${
                          user.avatar_emoji === a
                            ? 'border-cyan-400 bg-cyan-500/15'
                            : 'border-border bg-surface-900 hover:border-border-light'
                        }`}
                      >
                        <span aria-hidden="true">{a}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-white">{tr('dailyGoal')}</p>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={tr('dailyGoal')}>
                    {GOALS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => patch({ daily_goal_xp: g })}
                        aria-pressed={goal === g}
                        className={`rounded-md border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                          goal === g
                            ? 'border-cyan-400 bg-cyan-500/15 text-white'
                            : 'border-border bg-surface-900 text-text-secondary hover:border-border-light'
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
              </div>
            </Card>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <ButtonLink href="/leaderboard" variant="secondary" size="sm" className="justify-center">
                {tr('leaderboard')}
              </ButtonLink>
              <ButtonLink href="/review" variant="secondary" size="sm" className="justify-center">
                {tr('reviewSession')}
              </ButtonLink>
            </div>

            <Button variant="secondary" className="mt-3 w-full justify-center" onClick={logout}>
              {tr('logout')}
            </Button>
            <DeleteAccount lang={lang} />
          </>
        )}
      </div>
    </div>
  );
}
