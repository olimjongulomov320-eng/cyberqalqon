'use client';
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { Button, ButtonLink, Card, EmptyState } from '@/components/ui';

/**
 * Route-level error boundary. Catches render/runtime errors in any page below
 * the root layout so a single failure degrades to a retry card instead of a
 * blank screen. Recovery runs in place via `reset()` (no full reload).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);

  useEffect(() => {
    // Keep the details in the console for debugging; the user sees friendly copy.
    console.error(error);
  }, [error]);

  return (
    <Card className="mt-8">
      <EmptyState
        emoji="⚠️"
        title={tr('loadError')}
        body={tr('networkError')}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={reset} size="sm">
              {tr('retry')}
            </Button>
            <ButtonLink href="/" variant="secondary" size="sm">
              {tr('goHome')}
            </ButtonLink>
          </div>
        }
      />
    </Card>
  );
}
