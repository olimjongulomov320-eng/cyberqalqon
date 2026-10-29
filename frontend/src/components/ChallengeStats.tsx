'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ChallengeList, fetchChallenges } from '@/lib/api';
import { Card } from '@/components/ui';

/** Solved coding challenges. Browser-run and self-reported, so never part of XP. */
export default function ChallengeStats() {
  const { lang, user } = useApp();
  const tr = makeT(lang);
  const [data, setData] = useState<ChallengeList | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchChallenges({ lang }).then(d => alive && setData(d)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [lang, user]);

  if (!data?.summary) return null;
  const s = data.summary;
  return (
    <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="label">{tr('tabChallenges')}</p>
        <p className="num mt-1 text-lg font-extrabold text-text-primary">
          {s.solved}/{s.total} <span className="text-sm font-semibold text-text-secondary">{tr('chSolved')}</span>
          <span className="ml-3 text-sm font-bold text-warning">{s.points} {tr('chPoints')}</span>
        </p>
        <p className="mt-0.5 text-xs text-text-muted">{tr('chUnverified')}</p>
      </div>
      <Link href="/challenges" className="text-sm font-semibold text-cyan-300 hover:underline">{tr('tabChallenges')} →</Link>
    </Card>
  );
}
