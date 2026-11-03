'use client';
import { stagger } from '@/lib/motion';
import { ContentIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { Track, TracksPayload, fetchTracks } from '@/lib/api';
import { Badge, ButtonLink, Card, SectionHeading, Skeleton } from '@/components/ui';

/**
 * Learning tracks with two separate measures per track: completion (lessons
 * finished - activity) and mastery (demonstrated correctness - see
 * backend/lib/mastery.js). They are shown side by side so one is never
 * mistaken for the other.
 */
function TrackCard({ track, tr }: { track: Track; tr: (k: string) => string }) {
  const { completion, mastery } = track;
  const pct = completion.total ? Math.round((completion.completed / completion.total) * 100) : 0;
  const state = mastery?.state ?? 'not_started';
  const stateLabel =
    state === 'mastered' ? tr('masteryMastered') : state === 'practising' ? tr('masteryPractising') : tr('masteryNotStarted');

  return (
    <Card hover className="group/track flex h-full flex-col p-3.5 sm:p-4">
      <div className="flex items-start gap-3">
        {/* Icon on its own tile: gives every card the same anchor point. */}
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-500/25 bg-cyan-500/[0.08] text-cyan-300 transition-colors group-hover/track:border-cyan-500/45"
        >
          <ContentIcon name={track.icon} size={21} />
        </span>
        <div className="min-w-0 flex-1">
          {/* Badge sits under the title on phones so it never squeezes the
              title into three lines; beside it from sm up. */}
          <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-2">
            <h3 className="text-[0.9375rem] font-bold leading-snug text-text-primary">{track.title}</h3>
            {track.needs_review && <Badge tone="warning" className="shrink-0 sm:mt-0.5">{tr('trackDraft')}</Badge>}
          </div>
          {/* Hidden on phones: eight descriptions made the dashboard a very long scroll. */}
          <p className="mt-1 hidden text-xs leading-relaxed text-text-secondary sm:block">{track.description}</p>
        </div>
      </div>

      {/* The two measures side by side, each in its own column, so completion
          and mastery are read as separate numbers. */}
      <div className="mt-3.5 grid grid-cols-2 gap-4 rounded-md border border-border bg-surface-950/40 px-3 py-2.5">
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="label">{tr('trackLessons')}</span>
            <span className="num text-xs font-semibold text-text-primary">
              {completion.completed}/{completion.total}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={track.title}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-800"
          >
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="min-w-0 border-l border-border pl-4">
          <span className="label block">{tr('trackMastery')}</span>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Badge tone={state === 'mastered' ? 'success' : state === 'practising' ? 'primary' : 'neutral'}>{stateLabel}</Badge>
            {mastery && mastery.distinct > 0 && (
              <span className="num text-[0.6875rem] text-text-muted">
                {mastery.distinct} {tr('masteryExercises')} · {mastery.accuracy ?? 0}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3.5">
        {track.next ? (
          <ButtonLink href={`/modules/${track.next.slug}`} size="sm">
            {completion.completed > 0 ? tr('trackContinue') : tr('trackStart')}
          </ButtonLink>
        ) : (
          <Badge tone="success">{tr('trackCompleted')}</Badge>
        )}
        <Link href={`/problems?track=${track.slug}`} className="inline-flex h-9 items-center rounded-md px-3 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/10">
          {tr('trackPractice')}
        </Link>
      </div>
    </Card>
  );
}

export default function TracksSection() {
  const { lang, user } = useApp();
  const tr = makeT(lang);
  const [data, setData] = useState<TracksPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    fetchTracks(lang)
      .then(d => alive && setData(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [lang, user?.id]);

  if (failed) return null; // the rest of the dashboard stands on its own

  return (
    <section aria-labelledby="tracks-h" className="mt-8">
      <SectionHeading>
        <span id="tracks-h">{tr('tracksTitle')}</span>
      </SectionHeading>
      <p className="-mt-1 mb-3 text-xs text-text-muted">{tr('masteryRule')}</p>
      {!data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.tracks.map((t, i) => (
            <li key={t.slug} className="stagger-item" style={stagger(i)}>
              <TrackCard track={t} tr={tr} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
