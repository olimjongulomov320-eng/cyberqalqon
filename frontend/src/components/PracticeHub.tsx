'use client';
import CountUp from '@/components/CountUp';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ChallengeSummary, StatsPayload, fetchChallenges, fetchProblems, fetchStats } from '@/lib/api';
import { DifficultyTag, Skeleton } from '@/components/ui';
import { ArrowRightIcon, DomainIcon } from '@/components/icons';

interface Hub {
  qSolved: number;
  qTotal: number;
  cSolved: number;
  cTotal: number;
  points: number;
  accuracy: number | null;
  weak: StatsPayload['weak_topics'][number] | null;
  nextChallenge: ChallengeSummary | null;
}

const DIFF_KEY = { easy: 'chEasy', medium: 'chMedium', hard: 'chHard' } as const;

/**
 * Shown above both Practice tabs for a signed-in learner: where they stand and
 * the three most useful next actions. Everything comes from the same endpoints
 * as the catalogues below (nothing is estimated), and a failed request simply
 * hides the hub; the catalogues stand on their own.
 */
export default function PracticeHub() {
  const { lang, user, ageGroup } = useApp();
  const tr = makeT(lang);
  const [hub, setHub] = useState<Hub | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    Promise.all([fetchProblems({ lang, limit: 1, age: ageGroup }), fetchChallenges({ lang }), fetchStats(lang)])
      .then(([p, c, s]) => {
        if (!alive) return;
        const order = { easy: 0, medium: 1, hard: 2 } as const;
        const next =
          [...c.challenges].filter(x => x.status !== 'solved').sort((a, b) => order[a.difficulty] - order[b.difficulty])[0] ?? null;
        setHub({
          qSolved: p.solved_total,
          qTotal: p.catalogue_total,
          cSolved: c.summary?.solved ?? 0,
          cTotal: c.summary?.total ?? c.challenges.length,
          points: c.summary?.points ?? 0,
          accuracy: s.accuracy,
          // Only suggest a topic that genuinely needs work (under 80%), not any with a miss.
          weak: s.weak_topics.find(t => t.accuracy < 80) ?? null,
          nextChallenge: next,
        });
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [lang, user?.id, ageGroup]);

  if (!user || failed) return null;
  if (!hub) return <Skeleton className="mb-6 h-28 w-full" />;

  const kpis = [
    { label: tr('hubQuestions'), value: hub.qSolved, of: hub.qTotal, suffix: '' },
    { label: tr('hubChallenges'), value: hub.cSolved, of: hub.cTotal, suffix: '', sub: `${hub.points} ${tr('chPoints')}` },
    { label: tr('accuracy'), value: hub.accuracy, of: null as number | null, suffix: '%' },
  ];

  return (
    <section aria-label={tr('hubTitle')} className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
      <dl className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-surface-900">
        {kpis.map(k => (
          <div key={k.label} className="p-3.5">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-wider text-text-muted">{k.label}</dt>
            <dd className="num mt-1 text-xl font-bold text-text-primary">
              {k.value === null ? '-' : <CountUp value={k.value} suffix={k.suffix} />}
              {k.of !== null && <span className="text-text-muted">/{k.of}</span>}
            </dd>
            {k.sub && <dd className="num mt-0.5 text-[0.6875rem] text-warning">{k.sub}</dd>}
          </div>
        ))}
      </dl>

      <div className="rounded-lg border border-border bg-surface-900">
        <h2 className="border-b border-border/60 px-4 py-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">
          {tr('hubNext')}
        </h2>
        <ul className="divide-y divide-border/60">
          {hub.weak && (
            <li>
              <Link href={`/problems?domain=${hub.weak.slug}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-800/70">
                <DomainIcon slug={hub.weak.slug} size={16} className="shrink-0 text-cyan-300" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary">{hub.weak.title}</span>
                  <span className="block text-xs text-text-muted">
                    {tr('hubWeak')} <span className="num">{hub.weak.accuracy}%</span>
                  </span>
                </span>
                <ArrowRightIcon size={14} className="shrink-0 text-text-muted" />
              </Link>
            </li>
          )}
          {hub.nextChallenge && (
            <li>
              <Link href={`/challenges/solve?slug=${hub.nextChallenge.slug}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-800/70">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary">{hub.nextChallenge.title}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                    <DifficultyTag level={hub.nextChallenge.difficulty} label={tr(DIFF_KEY[hub.nextChallenge.difficulty])} />
                    <span className="num">{hub.nextChallenge.points} {tr('chPoints')}</span>
                  </span>
                </span>
                <ArrowRightIcon size={14} className="shrink-0 text-text-muted" />
              </Link>
            </li>
          )}
          <li>
            <Link href="/review" className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-800/70">
              <span className="min-w-0 flex-1 text-sm font-semibold text-text-primary">{tr('reviewSession')}</span>
              <ArrowRightIcon size={14} className="shrink-0 text-text-muted" />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
