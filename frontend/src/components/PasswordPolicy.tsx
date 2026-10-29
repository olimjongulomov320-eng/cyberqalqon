'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import type { PwnedResult } from '@/lib/pwned';
import { CheckIcon, CloseIcon } from '@/components/icons';

export interface PolicyCheck {
  key: string;
  ok: boolean;
}

/** The registration rule, itemised. Mirrors backend/routes/auth.js. */
export function passwordChecks(pw: string): PolicyCheck[] {
  return [
    { key: 'polLen', ok: pw.length >= 8 },
    { key: 'polUpper', ok: /[A-Z]/.test(pw) },
    { key: 'polLower', ok: /[a-z]/.test(pw) },
    { key: 'polDigit', ok: /\d/.test(pw) },
  ];
}

/**
 * Live password policy: each rule shows met / not met as the learner types, then
 * a separate line reports the breach lookup. The lookup is advice backed by a
 * public breach corpus, only a 5-character hash prefix is sent (see lib/pwned).
 */
export default function PasswordPolicy({
  password,
  breach,
}: {
  password: string;
  breach: PwnedResult | 'checking' | null;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);
  const checks = passwordChecks(password);

  return (
    <div className="rounded-md border border-border bg-surface-950/50 p-3" aria-live="polite">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {checks.map(c => (
          <li key={c.key} className={`flex items-center gap-1.5 font-mono text-[0.6875rem] ${c.ok ? 'text-success' : 'text-text-muted'}`}>
            {c.ok ? <CheckIcon size={13} /> : <CloseIcon size={13} />}
            {tr(c.key)}
          </li>
        ))}
      </ul>

      <p
        className={`mt-2.5 border-t border-border/60 pt-2 font-mono text-[0.6875rem] ${
          breach && breach !== 'checking' && breach.status === 'pwned'
            ? 'font-semibold text-danger'
            : breach && breach !== 'checking' && breach.status === 'safe'
              ? 'text-success'
              : 'text-text-muted'
        }`}
      >
        {breach === 'checking'
          ? tr('pwnedChecking')
          : breach?.status === 'pwned'
            ? `${tr('pwnedFound')} ${breach.count.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}`
            : breach?.status === 'safe'
              ? tr('pwnedSafe')
              : breach?.status === 'unknown'
                ? tr('pwnedUnknown')
                : tr('pwnedIdle')}
      </p>
      <p className="mt-1 text-[0.6875rem] leading-snug text-text-muted">{tr('pwnedPrivacy')}</p>
    </div>
  );
}
