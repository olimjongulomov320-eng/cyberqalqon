/**
 * Fetch with a hard client-side deadline.
 *
 * A request that never settles (a sleeping free-tier host, a dropped mobile
 * connection) would otherwise leave the UI stuck on a spinner forever. The
 * timeout aborts the request and surfaces an error so the user gets an explicit
 * retry, instead of an endless loading state.
 *
 * The `fetchImpl` is injectable so the behaviour can be unit-tested without a
 * real network.
 */

/** 30s: long enough to ride out a cold start, short enough to not feel hung. */
export const REQUEST_TIMEOUT_MS = 30_000;

export function isAbortError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: unknown }).name === 'AbortError'
  );
}

export async function performFetch(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();

  // Honour a caller-supplied signal too (e.g. a component that unmounts).
  const callerSignal = init.signal;
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
