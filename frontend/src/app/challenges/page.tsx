'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ChallengeDifficulty, ChallengeList, ChallengeStatus, fetchChallenges } from '@/lib/api';
import PracticeTabs from '@/components/PracticeTabs';
import { Badge, Card, EmptyState, ErrorNote, Skeleton } from '@/components/ui';
import { CodeIcon } from '@/components/icons';

const DIFF_TONE = { easy: 'success', medium: 'warning', hard: 'danger' } as const;
const DIFF_KEY = { easy: 'chEasy', medium: 'chMedium', hard: 'chHard' } as const;
const STATUS_KEY = { new: 'statusNew', attempted: 'statusAttempted', solved: 'statusSolved' } as const;

export default function ChallengesPage() {
  const { lang, user } = useApp();
  const tr = makeT(lang);

  const [difficulty, setDifficulty] = useState<'' | ChallengeDifficulty>('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState<'' | ChallengeStatus>('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<ChallengeList | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user && status) setStatus('');
  }, [user, status]);

  const params = useMemo(
    () => ({
      lang,
      difficulty: difficulty || undefined,
      tag: tag || undefined,
      status: status || undefined,
      q: search.trim() || undefined,
    }),
    [lang, difficulty, tag, status, search]
  );

  useEffect(() => {
    let alive = true;
    setFailed(false);
    const t = window.setTimeout(() => {
      fetchChallenges(params)
        .then(d => alive && setData(d))
        .catch(() => alive && setFailed(true));
    }, 200);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [params, user?.id]);

  return (
    <div>
      <PracticeTabs />
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">{tr('chTitle')}</h1>
      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">{tr('chIntro')}</p>

      {data?.summary && (
        <p className="num mt-4 text-sm text-text-secondary">
          <span className="font-bold text-text-primary">
            {data.summary.solved}/{data.summary.total}
          </span>{' '}
          {tr('chSolved')} · <span className="font-bold text-warning">{data.summary.points}</span> {tr('chPoints')}
          <span className="ml-2 text-xs text-text-muted">({tr('chUnverified')})</span>
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="block sm:col-span-2">
          <span className="form-label">{tr('problemSearch')}</span>
          <input className="input-base" value={search} onChange={e => setSearch(e.target.value)} placeholder={tr('problemSearchPlaceholder')} />
        </label>
        <label className="block">
          <span className="form-label">{tr('difficultyLabel')}</span>
          <select className="input-base" value={difficulty} onChange={e => setDifficulty(e.target.value as '' | ChallengeDifficulty)}>
            <option value="">{tr('filterAll')}</option>
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <option key={d} value={d}>
                {tr(DIFF_KEY[d])} ({data?.facets.difficulties.find(x => x.key === d)?.count ?? 0})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="form-label">{tr('chTopic')}</span>
          <select className="input-base" value={tag} onChange={e => setTag(e.target.value)}>
            <option value="">{tr('filterAll')}</option>
            {data?.facets.tags.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        {user && (
          <label className="block sm:col-span-2">
            <span className="form-label">{tr('filterStatus')}</span>
            <select className="input-base" value={status} onChange={e => setStatus(e.target.value as '' | ChallengeStatus)}>
              <option value="">{tr('filterAll')}</option>
              {(['new', 'attempted', 'solved'] as const).map(s => (
                <option key={s} value={s}>{tr(STATUS_KEY[s])}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-6">
        {failed ? (
          <ErrorNote>{tr('networkError')}</ErrorNote>
        ) : !data ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : data.challenges.length === 0 ? (
          <Card>
            <EmptyState icon={<CodeIcon size={26} className="text-text-muted" />} title={tr('chEmpty')} body="" />
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.challenges.map(c => (
              <li key={c.slug}>
                <Link href={`/challenges/solve?slug=${c.slug}`} className="block h-full">
                  <Card hover className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-bold leading-snug text-text-primary">{c.title}</h2>
                      {c.status === 'solved' && <Badge tone="success">{tr('statusSolved')}</Badge>}
                      {c.status === 'attempted' && <Badge tone="neutral">{tr('statusAttempted')}</Badge>}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                      <Badge tone={DIFF_TONE[c.difficulty]}>{tr(DIFF_KEY[c.difficulty])}</Badge>
                      <span className="num font-semibold text-warning">{c.points} {tr('chPoints')}</span>
                      {c.tags.map(t => (
                        <span key={t} className="rounded-md bg-surface-800 px-2 py-0.5 text-text-secondary">#{t}</span>
                      ))}
                      {c.needs_review && <Badge tone="warning">{tr('trackDraft')}</Badge>}
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
