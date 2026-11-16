'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { fetchInterviews, InterviewHistoryRow, InterviewRole } from '@/lib/api';
import { DIMS, VERDICT, scoreText, when } from '@/lib/interview';
import RoundTimeline from '@/components/RoundTimeline';
import { Badge, ButtonLink, ErrorNote, SectionHeading, Skeleton } from '@/components/ui';
import { ContentIcon, ChatIcon, ChevronRightIcon } from '@/components/icons';

type Row = InterviewRole & { mine: { best: number; attempts: number } | null };

export default function InterviewsPage() {
  const { lang, user } = useApp();
  const tr = makeT(lang);
  const [data, setData] = useState<{ roles: Row[]; history: InterviewHistoryRow[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setError(false);
    fetchInterviews(lang)
      .then(d => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  const steps = ['ivHow1', 'ivHow2', 'ivHow3', 'ivHow4', 'ivHow5'];

  return (
    <div className="page-enter">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">{tr('ivTitle')}</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary">{tr('ivSubtitle')}</p>
      </header>

      {/* How it works: a connected sequence, so the order carries meaning. */}
      <section aria-labelledby="iv-how" className="mb-10">
        <h2 id="iv-how" className="sr-only">{tr('ivHowTitle')}</h2>
        <ol className="relative grid grid-cols-1 gap-3 sm:grid-cols-5 sm:gap-4">
          <span aria-hidden="true" className="absolute left-[0.9375rem] top-4 bottom-4 w-px bg-border sm:left-4 sm:right-4 sm:top-[0.9375rem] sm:bottom-auto sm:h-px sm:w-auto" />
          {steps.map((k, i) => (
            <li key={k} className="stagger-item relative flex items-start gap-3 sm:flex-col sm:gap-2.5" style={{ ['--i' as string]: i }}>
              <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cyan-400/40 bg-bg font-mono text-xs font-bold text-cyan-300">
                {i + 1}
              </span>
              <span className="pt-1.5 text-sm leading-snug text-text-secondary sm:pt-0">{tr(k)}</span>
            </li>
          ))}
        </ol>
      </section>

      {error && <ErrorNote className="mb-6">{tr('loadError')}</ErrorNote>}

      <section aria-label={tr('ivTitle')} className="flex flex-col gap-4">
        {!data && !error
          ? [0, 1, 2].map(i => <Skeleton key={i} className="h-44 w-full" />)
          : data?.roles.map((r, i) => (
              <article
                key={r.slug}
                className="stagger-item group relative grid grid-cols-1 gap-5 rounded-lg border border-border bg-surface-900 p-5 shadow-card edge-light transition-colors hover:border-surface-500 sm:p-6 lg:grid-cols-[minmax(0,1fr)_16rem]"
                style={{ ['--i' as string]: i }}
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan-400/25 bg-cyan-500/10 text-cyan-300">
                      <ContentIcon name={r.icon} size={24} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold tracking-tight text-text-primary">
                          <Link href={`/interviews/role?slug=${r.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                            {r.title}
                          </Link>
                        </h2>
                        <Badge tone="primary">{tr(r.level === 'junior' ? 'ivLevelJunior' : 'ivLevelMiddle')}</Badge>
                        <span className="num text-xs text-text-muted">{r.minutes} {tr('ivMin')}</span>
                      </div>
                      <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-text-secondary">{r.summary}</p>
                    </div>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={tr('ivSkillsAssessed')}>
                    {r.skills.map(s => (
                      <li key={s.key} className="rounded-sm border border-border bg-surface-800 px-2 py-0.5 text-xs text-text-secondary">
                        {s.label}
                      </li>
                    ))}
                  </ul>
                  <RoundTimeline rounds={r.rounds} tr={tr} className="mt-5 max-w-xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-between gap-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div>
                    {r.mine ? (
                      <>
                        <p className="text-xs text-text-muted">{tr('ivBest')}</p>
                        <p className={`num mt-0.5 text-3xl font-extrabold tracking-tight ${scoreText(r.mine.best)}`}>
                          {r.mine.best}
                          <span className="text-base font-semibold text-text-muted">/100</span>
                        </p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {tr('ivAttempts')}: <span className="num font-semibold text-text-secondary">{r.mine.attempts}</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-text-muted">{tr('ivNotTaken')}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <ButtonLink href={`/interviews/role?slug=${r.slug}`} variant="secondary" size="sm" className="flex-1">
                      {tr('ivPrepare')}
                    </ButtonLink>
                    <ButtonLink href={`/interviews/room?role=${r.slug}`} size="sm" className="flex-1">
                      {tr('ivStartNow')}
                    </ButtonLink>
                  </div>
                </div>
              </article>
            ))}
      </section>

      {user && data && (
        <section className="mt-12" aria-labelledby="iv-history">
          <SectionHeading>
            <span id="iv-history">{tr('ivHistory')}</span>
          </SectionHeading>
          {data.history.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-5 text-sm text-text-muted">
              <ChatIcon size={18} /> {tr('ivHistoryEmpty')}
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-900">
              {data.history.map(h => (
                <li key={h.id}>
                  <Link
                    href={`/interviews/report?id=${h.id}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-surface-800 sm:grid-cols-[minmax(0,1fr)_9rem_12rem_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-text-primary">{h.title}</span>
                      <span className="text-xs text-text-muted">
                        {when(h.finished_at, lang)}
                      </span>
                    </span>
                    <span className={`hidden text-xs font-semibold sm:block ${VERDICT[h.verdict].tone}`}>{tr(VERDICT[h.verdict].label)}</span>
                    <span className="hidden gap-3 sm:flex" aria-hidden="true">
                      {DIMS.slice(0, 3).map(d => (
                        <span key={d.key} className="text-[0.6875rem] text-text-muted">
                          {tr(d.label).slice(0, 1)} <span className="num font-semibold text-text-secondary">{h.dims?.[d.key] ?? 0}</span>
                        </span>
                      ))}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`num text-lg font-extrabold ${scoreText(h.score)}`}>{h.score}</span>
                      <ChevronRightIcon size={16} className="text-text-muted" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
