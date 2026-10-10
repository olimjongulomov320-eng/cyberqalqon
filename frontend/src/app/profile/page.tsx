'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, StatsPayload, fetchStats, updateMe } from '@/lib/api';
import { achievementMeta, tierIndex, tierKey, levelFromXp } from '@/lib/gamification';
import { RingProgress } from '@/components/game';
import { Avatar, Badge, Button, ButtonLink, Card, EmptyState, ErrorNote, Skeleton } from '@/components/ui';

const GOALS = [10, 20, 30, 50];
const AVATARS = ['🦊', '🦉', '🐺', '🦁', '🐼', '🦅', '🐯', '🐸'];

const ACTIVITY_LABEL: Record<string, string> = {
  lesson: 'activityLesson',
  correct: 'activityCorrect',
  review: 'activityReview',
};

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

  const patch = async (p: { display_name?: string; avatar_emoji?: string; daily_goal_xp?: number }) => {
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

  return (
    <div>
      <div className="stagger flex flex-col gap-4">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <Avatar emoji={user.avatar_emoji} name={user.display_name} size="lg" ring />
          </div>
          <div>
            <h1 className="display">{user.display_name}</h1>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <Badge>{tier}</Badge>
              <span className="num text-xs text-slate-500">Lv.{level.level}</span>
            </div>
          </div>
        </header>

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
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{tr('levelProgress')}</span>
                <span className="num text-xs text-slate-500">
                  {level.intoLevel}/{level.toNext} XP
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
                <div
                  className="fill-x h-full rounded-full bg-cyan-500"
                  style={{ transform: `scaleX(${level.intoLevel / level.toNext})`, transformOrigin: 'left' }}
                />
              </div>
            </Card>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['⚡', tr('totalXp'), stats.profile.total_xp],
                ['🔥', tr('streak'), stats.profile.current_streak ?? 0],
                ['🥇', tr('bestStreak'), stats.profile.longest_streak ?? 0],
                ['📘', tr('lessonsShort'), stats.profile.modules_completed ?? 0],
              ].map(([e, label, v]) => (
                <Card key={String(label)} className="flex flex-col items-center gap-1 p-3 text-center">
                  <span aria-hidden="true" className="text-lg">{e}</span>
                  <span className="num text-xl font-extrabold text-white">{String(v)}</span>
                  <span className="text-[0.6875rem] text-slate-500">{label}</span>
                </Card>
              ))}
            </div>

            {/* Accuracy */}
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-white">{tr('statsTitle')}</span>
                  <p className="num mt-1 text-xs text-slate-400">
                    {tr('answersTotal')}: {stats.answers_correct + stats.answers_wrong}
                  </p>
                  <p className="num text-xs text-slate-500">
                    ✓ {stats.answers_correct} · ✗ {stats.answers_wrong}
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

            {/* Strong / weak topics */}
            {(stats.strong_topics.length > 0 || stats.weak_topics.length > 0) ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {stats.strong_topics.length > 0 && (
                  <Card>
                    <p className="mb-2 px-4 pt-3 text-xs font-bold uppercase tracking-wider text-success">{tr('strongest')}</p>
                    <ul className="divide-y divide-border">
                      {stats.strong_topics.slice(0, 4).map(t => (
                        <li key={t.slug} className="flex items-center gap-2.5 px-4 py-2.5">
                          <span aria-hidden="true" className="text-base">{t.icon}</span>
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{t.title}</span>
                          <span className="num text-xs font-bold text-success">{t.accuracy}%</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {stats.weak_topics.length > 0 && (
                  <Card>
                    <p className="mb-2 px-4 pt-3 text-xs font-bold uppercase tracking-wider text-danger">{tr('weakTopics')}</p>
                    <ul className="divide-y divide-border">
                      {stats.weak_topics.slice(0, 4).map(t => (
                        <li key={t.slug} className="flex items-center gap-2.5 px-4 py-2.5">
                          <span aria-hidden="true" className="text-base">{t.icon}</span>
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{t.title}</span>
                          <span className="num text-xs font-bold text-danger">{t.accuracy}%</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <EmptyState emoji="📊" title={tr('noStatsYet')} body={tr('noStatsBody')} />
              </Card>
            )}

            {/* Recent activity */}
            {stats.recent.length > 0 && (
              <Card>
                <p className="mb-2 px-4 pt-3 text-xs font-bold uppercase tracking-wider text-slate-400">{tr('recentActivity')}</p>
                <ul className="divide-y divide-border">
                  {stats.recent.slice(0, 5).map((r, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <span aria-hidden="true" className="text-base">{r.kind === 'lesson' ? '📘' : r.kind === 'review' ? '🔁' : '🎯'}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                        {tr(ACTIVITY_LABEL[r.kind] ?? 'activityLesson')}
                        {r.module_title ? ` · ${r.module_title}` : ''}
                      </span>
                      <span className="num shrink-0 text-xs font-bold text-warning">+{r.amount}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Achievements */}
            <Card>
              <p className="mb-2 px-4 pt-3 text-xs font-bold uppercase tracking-wider text-warning">{tr('achievements')}</p>
              {stats.achievements.length === 0 ? (
                <p className="px-4 pb-4 text-sm text-slate-500">{tr('achievementsEmpty')}</p>
              ) : (
                <ul className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3">
                  {stats.achievements.map(a => {
                    const meta = achievementMeta(a.key, lang, tr);
                    return (
                      <li key={a.key} className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface-900 px-2 py-3 text-center">
                        <span aria-hidden="true" className="text-2xl">{meta?.emoji ?? '🏅'}</span>
                        <span className="text-xs font-bold text-slate-200">{meta?.title ?? a.key}</span>
                        <span className="text-[0.625rem] text-slate-500">{tr('achievedOn')}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Settings: avatar + daily goal */}
            <Card className="p-4">
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
                        className={`grid h-10 w-10 place-items-center rounded-md border text-xl transition-colors ${
                          user.avatar_emoji === a
                            ? 'border-cyan-500 bg-cyan-500/15'
                            : 'border-border bg-surface-900 hover:border-border-light'
                        }`}
                      >
                        <span aria-hidden="true">{a}</span>
                        <span className="sr-only">{a}</span>
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
                          goal === g ? 'border-cyan-500 bg-cyan-500/15 text-white' : 'border-border bg-surface-900 text-slate-300 hover:border-border-light'
                        }`}
                      >
                        <span className="num">{g}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {savedAt && (
                  <p role="status" aria-live="polite" className="text-xs font-semibold text-success">
                    ✓ {tr('nameSaved')}
                  </p>
                )}
              </div>
            </Card>

            <Button variant="secondary" className="w-full justify-center" onClick={logout}>
              {tr('logout')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}