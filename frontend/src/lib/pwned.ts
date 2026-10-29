/**
 * Breached-password check using the Have I Been Pwned "range" API (k-anonymity).
 *
 * The password never leaves the browser. Its SHA-1 is computed locally and only
 * the first 5 hex characters are sent; the service returns every known hash
 * suffix sharing that prefix and the match is made here. `Add-Padding` hides how
 * many real entries a prefix has. If the service cannot be reached the result is
 * "unknown" and registration continues: this is advice, not a gate that an
 * outage can close.
 */

const RANGE_URL = 'https://api.pwnedpasswords.com/range/';

export type PwnedResult =
  | { status: 'safe' }
  | { status: 'pwned'; count: number }
  | { status: 'unknown' };

export async function sha1Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Occurrences of `suffix` in a range response ("SUFFIX:COUNT" lines), 0 if absent or padding. */
export function countInRange(body: string, suffix: string): number {
  const want = suffix.toUpperCase();
  for (const line of body.split(/\r?\n/)) {
    const [s, n] = line.trim().split(':');
    if (s && s.toUpperCase() === want) {
      const count = Number.parseInt(n ?? '0', 10);
      return Number.isFinite(count) && count > 0 ? count : 0;
    }
  }
  return 0;
}

export async function checkPwned(
  password: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 4000
): Promise<PwnedResult> {
  if (!password) return { status: 'unknown' };
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(RANGE_URL + prefix, {
        headers: { 'Add-Padding': 'true' },
        signal: controller.signal,
      });
      if (!res.ok) return { status: 'unknown' };
      const count = countInRange(await res.text(), suffix);
      return count > 0 ? { status: 'pwned', count } : { status: 'safe' };
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return { status: 'unknown' };
  }
}
