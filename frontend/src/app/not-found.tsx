'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ButtonLink, Card, EmptyState } from '@/components/ui';

export default function NotFound() {
  const { lang } = useApp();
  const tr = makeT(lang);

  return (
    <Card className="mt-8">
      <EmptyState
        emoji="🧭"
        title={tr('notFoundTitle')}
        body={tr('notFoundBody')}
        action={<ButtonLink href="/">{tr('goHome')}</ButtonLink>}
      />
    </Card>
  );
}
