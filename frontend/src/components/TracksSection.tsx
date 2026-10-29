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
    <Card hover className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <ContentIcon name={track.icon} size={26} className="shrink-0 text-cyan-300" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-snug text-text-primary">{track.title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{track.description}</p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-text-secondary">{tr('trackLessons')}</span>
          <span className="num font-semibold text-text-primary">
            {completion.completed}/{completion.total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={track.title}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-800"
        >
          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-text-secondary">{tr('trackMastery')}</span>
        <Badge tone={state === 'mastered' ? 'success' : state === 'practising' ? 'primary' : 'neutral'}>{stateLabel}</Badge>
        {mastery && mastery.distinct > 0 && (
          <span className="num text-text-muted">
            {mastery.distinct} {tr('masteryExercises')} · {mastery.accuracy ?? 0}%
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {track.next ? (
          <ButtonLink href={`/modules/${track.next.slug}`} size="sm">
            {completion.completed > 0 ? tr('trackContinue') : tr('trackStart')}
          </ButtonLink>
        ) : (
          <Badge tone="success">{tr('trackCompleted')}</Badge>
        )}
        <Link href={`/problems?track=${track.slug}`} className="text-xs font-semibold text-cyan-300 hover:underline">
          {tr('trackPractice')}
        </Link>
        {track.needs_review && <Badge tone="warning">{tr('trackDraft')}</Badge>}
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
