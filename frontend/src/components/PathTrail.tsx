'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import type { Difficulty, PathModule } from '@/lib/api';
import { justUnlocked, readSeen, trailOffset, writeSeen } from '@/lib/path';
import { Badge } from '@/components/ui';
import { CheckIcon, FlagIcon, LockIcon, PlayIcon } from '@/components/icons';

const DIFF_KEY: Record<Difficulty, string> = {
  beginner: 'difficultyBeginner',
  intermediate: 'difficultyIntermediate',
  advanced: 'difficultyAdvanced',
};

// Chunky 3D node per state; the edge colour comes from the shared design tokens.
const NODE: Record<PathModule['state'], string> = {
  done: 'btn-3d [--edge:var(--edge-success)] bg-success text-text-inverse',
  current: 'btn-3d [--edge:var(--edge-primary)] bg-cyan-400 text-text-inverse',
  open: 'btn-3d [--edge:var(--edge-secondary)] bg-surface-700 text-text-primary border border-border-light',
  locked: 'bg-surface-800 text-text-muted border border-border shadow-none',
};

/**
 * A domain as a winding path of big round lesson nodes (Duolingo-style): done
 * nodes are green, the next one pulses, locked ones are greyed and not
 * focusable-as-links. When the learner has finished a lesson since their last
 * visit, the newly opened node pops in once. Honors prefers-reduced-motion.
 */
export default function PathTrail({
  domainSlug,
  modules,
  completed,
  all,
}: {
  domainSlug: string;
  /** The (possibly filtered) modules to draw. */
  modules: PathModule[];
  completed: number;
  /** The unfiltered module list, so numbering stays stable under a filter. */
  all: PathModule[];
}) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const reduce = useReducedMotion();
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setCelebrate(justUnlocked(readSeen(domainSlug), completed));
    writeSeen(domainSlug, completed);
  }, [domainSlug, completed]);

  return (
    <ol className="relative border-t border-border/60 bg-surface-950/40 px-4 py-5">
      {modules.map((m, i) => {
        const locked = m.state === 'locked';
        const index = all.indexOf(m);
        const isCheckpoint = m.kind === 'checkpoint';
        const popIn = celebrate && m.state === 'current' && !reduce;
        const size = isCheckpoint ? 'h-[4.5rem] w-[4.5rem]' : 'h-16 w-16';

        const circle = (
          <motion.span
            aria-hidden="true"
            initial={popIn ? { scale: 0.4, opacity: 0 } : false}
            animate={popIn ? { scale: 1, opacity: 1 } : undefined}
            transition={{ type: 'spring', stiffness: 380, damping: 18, duration: 0.35 }}
            className={`relative grid ${size} shrink-0 place-items-center rounded-full ${NODE[m.state]}`}
          >
            {m.state === 'current' && !reduce && (
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/30" style={{ animationDuration: '2s' }} />
            )}
            <span className="relative">
              {m.state === 'done' ? <CheckIcon size={26} /> : locked ? <LockIcon size={22} /> : isCheckpoint ? <FlagIcon size={26} /> : m.state === 'current' ? <PlayIcon size={26} /> : <span className="num text-lg font-extrabold">{index + 1}</span>}
            </span>
          </motion.span>
        );

        const label = (
          <span className="min-w-0 max-w-[11rem] text-left">
            <span className={`block text-sm font-bold leading-snug ${locked ? 'text-text-muted' : 'text-text-primary'}`}>{m.title}</span>
            <span className="num mt-0.5 block text-[0.6875rem] text-text-muted">
              {m.exercise_count} {tr('challenge').toLowerCase()} · {m.xp_reward} XP · {tr(DIFF_KEY[m.difficulty])}
            </span>
            {isCheckpoint && <Badge tone="warning">{tr('checkpoint')}</Badge>}
            {locked && m.prerequisite && (
              <span className="mt-1 block text-[0.6875rem] text-text-muted">
                {tr('prereqNeeded')} <span className="text-text-secondary">«{m.prerequisite.title}»</span>
              </span>
            )}
          </span>
        );

        const row = 'flex items-center gap-3';
        return (
          <li
            key={m.slug}
            className="relative flex justify-center py-2"
            style={{ transform: `translateX(${trailOffset(i)}px)` }}
          >
            {locked ? (
              <div aria-disabled="true" className={`${row} cursor-not-allowed opacity-80`}>
                {circle}
                {label}
              </div>
            ) : (
              <Link
                href={`/modules/${m.slug}`}
                aria-label={`${m.title}${m.state === 'done' ? ` — ${tr('stateDone')}` : m.state === 'current' ? ` — ${tr('stateCurrent')}` : ''}`}
                className={`${row} rounded-2xl`}
              >
                {circle}
                {label}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
