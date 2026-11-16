'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Markdown from '@/components/Markdown';
import RoundTimeline from '@/components/RoundTimeline';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { fetchInterviewRole, InterviewRoleDetail } from '@/lib/api';
import { PyRunner } from '@/lib/pyRunner';
import { fill } from '@/lib/interview';
import { Badge, BackLink, ButtonLink, ErrorNote, Skeleton } from '@/components/ui';
import { BookIcon, CheckIcon, ChevronRightIcon, ContentIcon, TimerIcon } from '@/components/icons';

export default function InterviewRolePage() {
  const { lang, user } = useApp();
  const tr = makeT(lang);
  const slug = useMemo(
    () => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('slug') ?? ''),
    []
  );
  const [role, setRole] = useState<InterviewRoleDetail | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(0);
  const [engine, setEngine] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    if (!slug) return setError(true);
    fetchInterviewRole(slug, lang)
      .then(d => alive && setRole(d.role))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [slug, lang]);

  // Pre-flight: load Python now so its files are cached before the room opens.
  useEffect(() => {
    const r = new PyRunner();
    r.warm().then(() => setEngine('ready')).catch(() => setEngine('error'));
    return () => r.stop();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <ErrorNote>{tr('loadError')}</ErrorNote>
        <Link href="/interviews" className="text-sm font-semibold text-cyan-300 hover:underline">{tr('ivAllInterviews')}</Link>
      </div>
    );
  }
  if (!role) return <Skeleton className="h-96 w-full" />;

  const checks = [
    { ok: true, text: fill(tr('ivCheckTime'), { m: role.minutes }) },
    { ok: true, text: tr('ivCheckQuiet') },
    {
      ok: engine === 'ready',
      busy: engine === 'loading',
      text: tr(engine === 'ready' ? 'ivCheckEngineReady' : engine === 'error' ? 'ivCheckEngineError' : 'ivCheckEngineLoading'),
    },
  ];

  return (
    <div className="page-enter">
      <BackLink href="/interviews">{tr('ivAllInterviews')}</BackLink>

      <header className="mt-3 flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-cyan-400/25 bg-cyan-500/10 text-cyan-300">
          <ContentIcon name={role.icon} size={28} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">{role.title}</h1>
            <Badge tone="primary">{tr(role.level === 'junior' ? 'ivLevelJunior' : 'ivLevelMiddle')}</Badge>
            {role.needs_review && <Badge tone="warning">{tr('trackDraft')}</Badge>}
          </div>
          <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-text-secondary">{role.summary}</p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Study briefs: the learning content the questions are drawn from. */}
        <section aria-labelledby="iv-brief">
          <h2 id="iv-brief" className="text-lg font-bold tracking-tight text-text-primary">{tr('ivBriefTitle')}</h2>
          <p className="mt-1 text-sm text-text-muted">{tr('ivBriefSub')}</p>
          <ol className="mt-4 flex flex-col gap-2">
            {role.brief.map((b, i) => {
              const isOpen = open === i;
              return (
                <li key={b.title} className={`overflow-hidden rounded-lg border bg-surface-900 transition-colors ${isOpen ? 'border-cyan-400/30' : 'border-border'}`}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800"
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-xs font-bold ${isOpen ? 'border-cyan-400/50 text-cyan-300' : 'border-border text-text-muted'}`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-text-primary">{b.title}</span>
                      <ChevronRightIcon size={16} className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                  </h3>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`} inert={!isOpen}>
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-border px-4 py-4 sm:px-5">
                        <div className="lesson text-[0.9375rem] leading-relaxed">
                          <Markdown>{b.body}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {role.modules.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-bold text-text-primary">{tr('ivRelatedLessons')}</h2>
              <ul className="mt-3 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                {role.modules.map(m => (
                  <li key={m.slug}>
                    <Link href={`/modules/${m.slug}`} className="flex items-center gap-2 border-b border-border/60 py-2 text-sm text-text-secondary transition-colors hover:text-cyan-300">
                      <BookIcon size={15} className="shrink-0 text-text-muted" />
                      <span className="truncate">{m.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Format, rules and pre-flight, sticky beside the reading. */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-border bg-surface-900 p-5 shadow-card edge-light">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary">{tr('ivFormatTitle')}</h2>
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <TimerIcon size={14} /> <span className="num font-semibold text-text-secondary">{role.minutes}</span> {tr('ivMin')}
              </span>
            </div>
            <RoundTimeline rounds={role.rounds} tr={tr} className="mt-3" />
            <p className="mt-4 text-xs leading-relaxed text-text-muted">{fill(tr('ivBankNote'), { c: role.bank.concepts, s: role.bank.scenarios })}</p>

            <h2 className="mt-5 text-sm font-bold text-text-primary">{tr('ivRulesTitle')}</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {['ivRule1', 'ivRule2', 'ivRule3', 'ivRule4'].map(k => (
                <li key={k} className="flex gap-2 text-xs leading-relaxed text-text-secondary">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                  {tr(k)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-surface-900 p-5 shadow-card edge-light">
            <h2 className="text-sm font-bold text-text-primary">{tr('ivBeforeStart')}</h2>
            <ul className="mt-3 flex flex-col gap-2.5" aria-live="polite">
              {checks.map(c => (
                <li key={c.text} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      c.ok ? 'bg-success/15 text-success' : c.busy ? 'border-2 border-surface-600 border-t-cyan-400 animate-spin' : 'bg-warning/15 text-warning'
                    }`}
                  >
                    {c.ok && <CheckIcon size={12} className="pop-in" />}
                  </span>
                  {c.text}
                </li>
              ))}
            </ul>
            {user ? (
              <ButtonLink href={`/interviews/room?role=${role.slug}`} size="lg" className="mt-5 w-full">
                {tr('ivStart')}
              </ButtonLink>
            ) : (
              <ButtonLink href={`/auth?next=${encodeURIComponent(`/interviews/role?slug=${role.slug}`)}`} size="lg" className="mt-5 w-full">
                {tr('ivSignInToStart')}
              </ButtonLink>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
