'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { journeyStages, stageForPath, type JourneySources, type StageKey } from '@/lib/journey';

/**
 * The six-stage learning journey as a slim navigation strip.
 *
 * It exists so every learning route says where it sits in
 * discover → learn → practice → apply → review → master, and so each stage has
 * one real destination instead of five hand-built navs. `sources` carries the
 * learner's actual position (from `GET /v1/paths`); without it, "learn" and
 * "apply" fall back to routes that always exist rather than inventing a target.
 *
 * Rendering is deliberately quiet: a numeral, a word, a hairline connector.
 * The active stage is marked with colour *and* `aria-current`, never colour
 * alone; on narrow screens the strip scrolls horizontally instead of wrapping
 * into three rows.
 */
export default function Journey({
  sources,
  stage,
  className = '',
}: {
  sources?: JourneySources;
  /** Override the stage derived from the pathname (e.g. a checkpoint lesson). */
  stage?: StageKey | null;
  className?: string;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const pathname = usePathname() ?? '';

  const active = stage === undefined ? stageForPath(pathname) : stage;
  const stages = journeyStages(sources ?? {});

  return (
    <nav aria-label={tr('journeyLabel')} className={className}>
      <ol className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1 pb-1">
        {stages.map((s, i) => {
          const isActive = s.key === active;
          return (
            <li key={s.key} className="flex shrink-0 items-center">
              <Link
                href={s.href}
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300'
                    : 'text-text-muted hover:bg-surface-900 hover:text-text-secondary'
                }`}
              >
                <span className="num opacity-70">{String(s.index).padStart(2, '0')}</span>
                <span className="whitespace-nowrap">{tr(s.labelKey)}</span>
              </Link>
              {i < stages.length - 1 && (
                <span aria-hidden="true" className="h-px w-2 shrink-0 bg-border" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
