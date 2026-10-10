'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, fetchLeaderboard, LeaderboardEntry } from '@/lib/api';
import { Avatar, Button, Card, EmptyState, Skeleton } from '@/components/ui';

type Period = 'week' | 'all';

function SegmentedTabs({ period, setPeriod }: { period: Period; setPeriod: (p: Period) => void }) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const tabs: { id: Period; label: string }[] = [
    { id: 'week', label: tr('weeklyLeague') },
    { id: 'all', label: tr('allTime') },
  ];
  return (
    <div role="tablist" aria-label="leaderboard period" className="grid grid-cols-2 gap-1 rounded-md border border-border bg-surface-900 p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          id={`lb-tab-${t.id}`}
          aria-selected={period === t.id}
          aria-controls="lb-panel"
          onClick={() => setPeriod(t.id)}
          className={`rounded-[0.3125rem] px-3 py-1.5 text-sm font-semibold transition-colors ${
            period === t.id ? 'bg-cyan-500 text-text-inverse' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { lang, user } = useApp();
  const tr = makeT(lang);

  const [period, setPeriod] = useState<Period>('week');
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setRows(null);
    setError(null);
    fetchLeaderboard(period, 50)
      .then(d => {
        setRows(d.leaderboard);
        setMyRank(d.my_rank);
      })
      .catch((err: ApiError) => setError(err.isOffline ? tr('networkError') : tr('loadError')));
    // `tr` is derived from `lang` (and now a stable reference), so depend on the
    // primitive directly to keep the effect from re-running needlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, attempt, lang, user?.id]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="display">{tr('leaderboard')}</h1>
        <p className="mt-1 text-[0.8125rem] text-slate-500">
          {period === 'week' ? tr('weeklySubtitle') : tr('lbSubtitle')}
        </p>
      </header>

      <SegmentedTabs period={period} setPeriod={setPeriod} />

      {myRank !== null && user && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-cyan-500/35 bg-cyan-500/[0.07] px-4 py-3">
          <span className="text-[0.8125rem] font-medium text-cyan-400">
            {period === 'week' ? tr('yourRank') : tr('allTime')}
          </span>
          <span className="num text-lg font-bold text-white">#{myRank}</span>
        </div>
      )}
      {myRank === null && user && (
        <div className="rounded-lg border border-border bg-surface-900 px-4 py-3 text-[0.8125rem] text-slate-500">
          {period === 'week' ? tr('notRanked') : tr('notRankedBody')}
        </div>
      )}

      <div id="lb-panel" role="tabpanel" aria-labelledby={`lb-tab-${period}`}>
        {error ? (
          <Card>
            <EmptyState
              emoji="📡"
              title={tr('loadError')}
              body={error}
              action={<Button onClick={() => setAttempt(a => a + 1)} size="sm">{tr('retry')}</Button>}
            />
          </Card>
        ) : !rows ? (
          <ul className="space-y-2">
            {[0, 1, 2, 3, 4].map(i => (
              <li key={i}>
                <Skeleton className="h-16 rounded-lg" />
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <Card>
            <EmptyState emoji="🏁" title={tr('emptyLeaderboardTitle')} body={tr('emptyLeaderboardBody')} />
          </Card>
        ) : (
          <ol className="stagger space-y-2">
            {rows.map(entry => {
              const isMe = user?.id === entry.user_id;
              return (
                <li key={entry.user_id}>
                  <div
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      isMe
                        ? 'border-cyan-500/40 bg-cyan-500/[0.06]'
                        : entry.rank <= 3
                          ? 'border-warning/20 bg-warning/[0.03]'
                          : 'border-border bg-surface-900 shadow-card'
                    }`}
                  >
                    <span
                      className={`num grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-bold ${
                        entry.rank === 1
                          ? 'bg-warning/15 text-warning'
                          : entry.rank === 2
                            ? 'bg-slate-300/15 text-slate-200'
                            : entry.rank === 3
                              ? 'bg-success/15 text-success'
                              : 'text-slate-500'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <Avatar emoji={entry.avatar_emoji} name={entry.display_name} size="sm" ring={isMe} />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${isMe ? 'text-cyan-400' : 'text-slate-100'}`}>
                        {entry.display_name}
                        {isMe && <span className="ml-1.5 text-[0.6875rem] text-slate-400">({tr('you')})</span>}
                      </p>
                      <p className="num text-[0.6875rem] text-slate-500">
                        {entry.modules_completed} {tr('modulesDone')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-sm font-bold text-warning">{entry.total_xp}</p>
                      <p className="text-[0.625rem] font-semibold text-slate-600">XP</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}