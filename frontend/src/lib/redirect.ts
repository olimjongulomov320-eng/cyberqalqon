/**
 * Post-login redirect hardening (AUD-11).
 *
 * The auth screen reads `?next=` and hands it to `router.replace`. Without a
 * guard, an attacker could craft a link that lands the user on an external
 * origin after login. Only same-origin, root-relative paths are allowed;
 * everything else falls back to the home route.
 *
 * Rejected on purpose:
 *   - absolute URLs      https://evil.com, javascript:alert(1), data:…
 *   - protocol-relative  //evil.com, ///evil.com
 *   - backslash tricks   /\evil.com  (some parsers treat \ as /)
 *   - control characters /%00, embedded newlines
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return '/';
  if (raw.length > 1024) return '/';
  if (/[\u0000-\u001f\u007f]/.test(raw)) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  if (raw.includes('\\')) return '/';
  return raw;
}
