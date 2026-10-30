'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { isMinor, isUnder13 } from '@/lib/ageGroups';
import { ButtonLink, EmptyState } from '@/components/ui';
import { ShieldIcon } from '@/components/icons';

/**
 * Keeps a page away from age groups it is not meant for. The API enforces the
 * same rules (leaderboard, code challenges), so this only spares a child a page
 * that would be refused. Until a group is chosen nothing is hidden.
 */
export default function AgeGate({ rule, children }: { rule: 'no-code' | 'no-board'; children: React.ReactNode }) {
  const { lang, ageGroup } = useApp();
  const tr = makeT(lang);
  const blocked = rule === 'no-code' ? isUnder13(ageGroup) : isMinor(ageGroup);
  if (!blocked) return <>{children}</>;
  return (
    <EmptyState
      icon={<ShieldIcon size={26} className="text-text-muted" />}
      title={tr(rule === 'no-code' ? 'ageNoCode' : 'ageMinorBoard')}
      body={tr('ageGateHint')}
      action={<ButtonLink href="/learn">{tr('navLearn')}</ButtonLink>}
    />
  );
}
