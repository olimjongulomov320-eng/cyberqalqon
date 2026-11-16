'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Markdown from '@/components/Markdown';
import CountUp from '@/components/CountUp';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { fetchInterviewSession, InterviewReport, InterviewReviewItem } from '@/lib/api';
import { DIMS, LETTERS, ROUND_LABEL, VERDICT, clock, scoreText, scoreTone, when } from '@/lib/interview';
import { BackLink, ButtonLink, ErrorNote, Skeleton } from '@/components/ui';
import { AlertIcon, BookIcon, CheckIcon, ChevronRightIcon, CloseIcon, TimerIcon } from '@/components/icons';

function ReviewItem({ item, n, tr }: { item: InterviewReviewItem; n: number; tr: (k: string) => string }) {
  const answered = item.chosen !== null;
  return (
    <li className="border-t border-border py-4 first:border-t-0">
      <div className="flex gap-3">
        <span
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
            item.correct ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
          }`}
          aria-label={item.correct ? tr('ivCorrectCount') : tr('ivFocus')}
        >
          {item.correct ? <CheckIcon size={13} /> : <CloseIcon size={13} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex gap-1.5 text-[0.9375rem] font-semibold leading-snug text-text-primary [&_code]:font-mono">
            <span className="num text-text-muted">{n}.</span>
            <div className="min-w-0">
              <Markdown>{item.q}</Markdown>
            </div>
          </div>
          <dl className="mt-2 grid gap-1 text-sm">
            <div className="flex gap-2">
              <dt className="shrink-0 text-text-muted">{tr('ivYourAnswer')}:</dt>
              <dd className={item.correct ? 'text-success' : 'text-danger'}>
                {answered ? `${LETTERS[item.chosen!]}. ${item.options[item.chosen!]}` : tr('ivNoAnswer')}
              </dd>
            </div>
            {!item.correct && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-text-muted">{tr('ivCorrectAnswer')}:</dt>
                <dd className="text-text-primary">{LETTERS[item.answer]}. {item.options[item.answer]}</dd>
              </div>
            )}
          </dl>
          <p className="mt-2 rounded-md bg-surface-800/70 px-3 py-2 text-sm leading-relaxed text-text-secondary">{item.why}</p>
        </div>
      </div>
    </li>
  );
}

export default function InterviewReportPage() {
  const { lang } = useApp();
  const tr = makeT(lang);
  const id = useMemo(() => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('id') ?? ''), []);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState(false);
  const [showCase, setShowCase] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!id) return setError(true);
    fetchInterviewSession(id, lang)
      .then(d => {
        if (!alive) return;
        if (d.report) setReport(d.report);
        else setError(true);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [id, lang]);

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <ErrorNote>{tr('ivSessionLost')}</ErrorNote>
        <Link href="/interviews" className="text-sm font-semibold text-cyan-300 hover:underline">{tr('ivAllInterviews')}</Link>
      </div>
    );
  }
  if (!report) return <Skeleton className="h-[36rem] w-full" />;

  const v = VERDICT[report.verdict];
  const [concepts, scenario, coding] = report.rounds;
  const focus = report.skills.filter(s => s.status === 'focus');
  const date = when(report.finished_at, lang);

  return (
    <div className="page-enter">
      <BackLink href="/interviews">{tr('ivAllInterviews')}</BackLink>

      {/* Verdict: the sentence leads, the number backs it up. */}
      <header className="mt-4 grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface-900 p-6 shadow-card edge-light sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className="text-sm text-text-muted">
            {tr('ivReportTitle')} · <span className="text-text-secondary">{report.role.title}</span>
          </p>
          <h1 className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${v.tone}`}>{tr(v.label)}</h1>
          <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-text-secondary">{tr(v.long)}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <span>{date}</span>
            <span className="flex items-center gap-1">
              <TimerIcon size={13} /> {tr('ivDuration')}: <span className="num font-semibold text-text-secondary">{clock(report.duration_s)}</span>
            </span>
            {report.late && (
              <span className="flex items-center gap-1 text-warning">
                <AlertIcon size={13} /> {tr('ivLate')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-end gap-1 lg:flex-col lg:items-end lg:justify-center">
          <p className={`num text-6xl font-extrabold leading-none tracking-tight sm:text-7xl ${scoreText(report.overall)}`}>
            <CountUp value={report.overall} />
          </p>
          <p className="pb-1 text-sm font-semibold text-text-muted lg:pb-0">/100 · {tr('ivOverall')}</p>
        </div>

        {/* Four dimensions as one measured row, not a wall of cards. */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-4 lg:col-span-2">
          {DIMS.map((d, i) => {
            const n = report.dims[d.key] ?? 0;
            return (
              <div key={d.key}>
                <dt className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-text-primary">{tr(d.label)}</span>
                  <span className={`num text-sm font-bold ${scoreText(n)}`}>{n}</span>
                </dt>
                <dd>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-700">
                    <div
                      className={`h-full origin-left rounded-full ${scoreTone(n)}`}
                      style={{ width: `${n}%`, animation: 'cq-fill 0.8s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${150 + i * 90}ms` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-snug text-text-muted">{tr(d.hint)}</p>
                </dd>
              </div>
            );
          })}
        </dl>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {/* Concepts */}
          <section aria-labelledby="iv-r1" className="rounded-lg border border-border bg-surface-900 px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="iv-r1" className="text-base font-bold text-text-primary">{tr(ROUND_LABEL.concepts)}</h2>
              <p className="text-xs text-text-muted">
                <span className="num font-semibold text-text-secondary">{concepts.items.filter(i => i.correct).length}/{concepts.items.length}</span> {tr('ivCorrectCount')} ·{' '}
                <span className={concepts.seconds <= concepts.limit_s + 15 ? '' : 'text-warning'}>
                  {clock(concepts.seconds)} / {clock(concepts.limit_s)}
                </span>
              </p>
            </div>
            <ol className="mt-1">
              {concepts.items.map((it, i) => <ReviewItem key={i} item={it} n={i + 1} tr={tr} />)}
            </ol>
          </section>

          {/* Scenario */}
          <section aria-labelledby="iv-r2" className="mt-5 rounded-lg border border-border bg-surface-900 px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="iv-r2" className="text-base font-bold text-text-primary">
                {tr(ROUND_LABEL.scenario)}: <span className="font-semibold text-text-secondary">{scenario.title}</span>
              </h2>
              <p className="shrink-0 text-xs text-text-muted">
                <span className="num font-semibold text-text-secondary">{scenario.items.filter(i => i.correct).length}/{scenario.items.length}</span> {tr('ivCorrectCount')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCase(s => !s)}
              aria-expanded={showCase}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline"
            >
              <ChevronRightIcon size={13} className={`transition-transform ${showCase ? 'rotate-90' : ''}`} /> {tr('ivCaseFile')}
            </button>
            {showCase && (
              <div className="lesson rise-in mt-2 rounded-md border border-border bg-surface-950/60 px-4 py-3 text-sm [&_pre]:whitespace-pre-wrap [&_pre]:break-all">
                <Markdown>{scenario.context}</Markdown>
              </div>
            )}
            <ol className="mt-1">
              {scenario.items.map((it, i) => <ReviewItem key={i} item={it} n={i + 1} tr={tr} />)}
            </ol>
          </section>

          {/* Coding */}
          <section aria-labelledby="iv-r3" className="mt-5 rounded-lg border border-border bg-surface-900 px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="iv-r3" className="text-base font-bold text-text-primary">
                {tr(ROUND_LABEL.coding)}: <span className="font-semibold text-text-secondary">{coding.title}</span>
              </h2>
              <p className={`num shrink-0 text-sm font-bold ${scoreText(coding.total ? (coding.passed / coding.total) * 100 : 0)}`}>
                {coding.passed}/{coding.total}
              </p>
            </div>
            {coding.attempted ? (
              <>
                <p className="mt-1 text-xs text-text-muted">{coding.passed}/{coding.total} {tr('ivTestsPassed')} · {tr('ivSelfReported')}</p>
                <p className="mt-3 text-xs font-semibold text-text-muted">{tr('ivYourCode')}</p>
                <pre className="mt-1.5 max-h-72 overflow-auto rounded-md border border-border bg-surface-950 p-3 font-mono text-xs leading-relaxed text-text-secondary">
                  {coding.code}
                </pre>
              </>
            ) : (
              <p className="mt-2 text-sm text-text-muted">{tr('ivNotAttempted')}</p>
            )}
          </section>
        </div>

        {/* Skill map + next steps */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          <section aria-labelledby="iv-skills" className="rounded-lg border border-border bg-surface-900 p-5 shadow-card edge-light">
            <h2 id="iv-skills" className="text-sm font-bold text-text-primary">{tr('ivSkillMap')}</h2>
            <ul className="mt-3 flex flex-col gap-3.5">
              {report.skills.map(s => (
                <li key={s.key}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate text-text-secondary">{s.label}</span>
                    <span
                      className={`shrink-0 text-[0.6875rem] font-semibold ${
                        s.status === 'strong' ? 'text-success' : s.status === 'ok' ? 'text-warning' : 'text-danger'
                      }`}
                    >
                      {tr(s.status === 'strong' ? 'ivStrong' : s.status === 'ok' ? 'ivOk' : 'ivFocus')}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-700">
                      <div className={`h-full rounded-full ${scoreTone(s.score)}`} style={{ width: `${Math.max(4, s.score)}%` }} />
                    </div>
                    <span className="num w-10 text-right text-[0.6875rem] text-text-muted">
                      {s.ok}/{s.total}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {focus.length > 0 && (
            <section aria-labelledby="iv-next" className="rounded-lg border border-border bg-surface-900 p-5">
              <h2 id="iv-next" className="text-sm font-bold text-text-primary">{tr('ivStudy')}</h2>
              <ul className="mt-2">
                {focus.flatMap(s => s.modules).filter((m, i, all) => all.findIndex(x => x.slug === m.slug) === i).slice(0, 5).map(m => (
                  <li key={m.slug}>
                    <Link href={`/modules/${m.slug}`} className="flex items-center gap-2 border-b border-border/60 py-2 text-sm text-text-secondary transition-colors last:border-0 hover:text-cyan-300">
                      <BookIcon size={15} className="shrink-0 text-text-muted" />
                      <span className="truncate">{m.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex gap-2">
            <ButtonLink href={`/interviews/role?slug=${report.role.slug}`} variant="secondary" className="flex-1">
              {tr('ivPrepare')}
            </ButtonLink>
            <ButtonLink href={`/interviews/room?role=${report.role.slug}`} className="flex-1">
              {tr('ivRetake')}
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
