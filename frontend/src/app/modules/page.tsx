'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Kept as a route for URL compatibility. A server `redirect()` is not available
// under `output: 'export'`, so the hop happens on the client.
export default function ModulesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/learn');
  }, [router]);

  return null;
}
