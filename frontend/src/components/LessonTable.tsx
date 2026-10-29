import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import type { Difficulty, PathModule } from '@/lib/api';
import { Badge } from '@/components/ui';
import { CheckIcon, LockIcon } from '@/components/icons';

const DIFF_KEY: Record<Difficulty, string> = {
  beginner: 'difficultyBeginner',
  intermediate: 'difficultyIntermediate',
  advanced: 'difficultyAdvanced',
};
const DIFF_COLOR: Record<Difficulty, string> = {
  beginner: 'text-success',
  intermediate: 'text-warning',
  advanced: 'text-danger',
};

const COLS = 'md:grid-cols-[1.5rem_minmax(0,1fr)_7.5rem_4.5rem_6.5rem]';

/** Status marker: a filled check when done, a ring when it is the next item, a lock when closed. */
function Status({ state }: { state: PathModule['state'] }) {
  if (state === 'done') return <CheckIcon size={18} className="text-success" />;
  if (state === 'locked') return <LockIcon size={16} className="text-text-muted" />;
  return (
    <span
      aria-hidden="true"
      className={`block h-3.5 w-3.5 rounded-full border-2 ${state === 'current' ? 'border-cyan-400' : 'border-border-light'}`}
    />
  );
}

/**
 * A domain as a challenge list: one dense row per lesson with status, name,
 * difficulty, points and a single action, like a practice problem set. Locked
 * rows say which lesson unlocks them. No decoration beyond the data.
 */
export default function LessonTable({ modules, all }: { modules: PathModule[]; all: PathModule[] }) {
  const { lang } = useApp();
  const tr = makeT(lang);

  return (
    <div className="border-t border-border/60">
      <div
        aria-hidden="true"
        className={`hidden gap-3 border-b border-border/60 bg-surface-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted md:grid ${COLS}`}
      >
        <span />
        <span>{tr('colTitle')}</span>
        <span>{tr('difficultyLabel')}</span>
        <span>{tr('colPoints')}</span>
        <span />
      </div>
      <ol className="divide-y divide-border/60">
        {modules.map(m => {
          const locked = m.state === 'locked';
          const number = all.indexOf(m) + 1;
          const action =
            m.state === 'done' ? tr('rowReview') : tr('startLesson');
          return (
            <li key={m.slug} className={`grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 ${COLS} ${locked ? 'opacity-70' : ''}`}>
              <span className="grid place-items-center">
                <Status state={m.state} />
              </span>

              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-primary">
                  <span className="num text-text-muted">{number}.</span>
                  <span className="min-w-0 break-words">{m.title}</span>
                  {m.kind === 'checkpoint' && <Badge tone="warning">{tr('checkpoint')}</Badge>}
                </p>
                <p className="num mt-0.5 text-xs text-text-muted">
                  {m.exercise_count} {tr('challenge').toLowerCase()}
                  <span className="md:hidden">
                    {' | '}
                    <span className={DIFF_COLOR[m.difficulty]}>{tr(DIFF_KEY[m.difficulty])}</span>
                    {' | '}
                    {m.xp_reward} XP
                  </span>
                </p>
                {locked && m.prerequisite && (
                  <p className="mt-1 text-xs text-text-muted">
                    {tr('prereqNeeded')} <span className="text-text-secondary">{m.prerequisite.title}</span>
                  </p>
                )}
              </div>

              <span className={`hidden text-sm font-medium md:block ${DIFF_COLOR[m.difficulty]}`}>{tr(DIFF_KEY[m.difficulty])}</span>
              <span className="num hidden text-sm text-text-secondary md:block">{m.xp_reward} XP</span>

              <div className="justify-self-end">
                {locked ? (
                  <span className="text-xs font-medium text-text-muted">{tr('stateLocked')}</span>
                ) : (
                  <Link
                    href={`/modules/${m.slug}`}
                    aria-label={`${action}: ${m.title}`}
                    className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold transition-colors ${
                      m.state === 'current'
                        ? 'bg-cyan-400 text-text-inverse hover:bg-cyan-300'
                        : 'border border-border text-text-primary hover:bg-surface-800'
                    }`}
                  >
                    {action}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
