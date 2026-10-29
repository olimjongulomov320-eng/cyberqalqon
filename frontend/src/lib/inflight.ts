/**
 * Coalesce identical in-flight async operations.
 *
 * While a key is running, further calls with the same key share its promise
 * instead of firing a second task. This is the client-side guard against
 * duplicate mutations - a double-tapped "Check" or "Finish", or two effects
 * racing on mount, collapse into one request.
 *
 * A key is released as soon as the task settles, so an explicit, user-driven
 * retry always runs afresh. It never hides or replays a completed mutation.
 */
export function createInFlight() {
  const active = new Map<string, Promise<unknown>>();

  return function run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const existing = active.get(key);
    if (existing) return existing as Promise<T>;

    const started = task();
    active.set(key, started);

    const release = () => {
      if (active.get(key) === started) active.delete(key);
    };
    // Attach handlers (not `.finally`) so the derived promise never rejects
    // unhandled while the original still rejects to the caller.
    started.then(release, release);

    return started;
  };
}
