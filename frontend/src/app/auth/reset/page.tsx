'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, authForgot, authReset } from '@/lib/api';
import { Button, Card, ErrorNote, Field, SuccessNote } from '@/components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isStrongPassword(pw: string): boolean {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);
}

/**
 * One page, two steps. Without `?token=` it asks for an email and requests a
 * reset link; with a token (from the emailed link) it sets the new password.
 * The token is read on the client only, so the static export stays a plain page.
 */
export default function ResetPage() {
  const { lang } = useApp();
  const tr = makeT(lang);
  const token = useMemo(
    () => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('token') ?? ''),
    []
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError(tr('emailInvalid'));
    setBusy(true);
    setError('');
    try {
      await authForgot(email.trim());
      setDone(tr('forgotSent'));
    } catch (err) {
      setError(err instanceof ApiError && err.status === 503 ? tr('forgotUnavailable') : tr('networkError'));
    } finally {
      setBusy(false);
    }
  }

  async function saveNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isStrongPassword(password)) return setError(tr('passwordHint'));
    setBusy(true);
    setError('');
    try {
      await authReset(token, password);
      setDone(tr('resetDone'));
    } catch (err) {
      setError(err instanceof ApiError && err.code === 'INVALID_TOKEN' ? tr('resetInvalid') : tr('networkError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <Card className="p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
          {token ? tr('resetTitle') : tr('forgotTitle')}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{token ? tr('resetSubtitle') : tr('forgotSubtitle')}</p>

        {done ? (
          <div className="mt-5">
            <SuccessNote>{done}</SuccessNote>
          </div>
        ) : (
          <form onSubmit={token ? saveNewPassword : requestLink} noValidate className="mt-5 space-y-4">
            {token ? (
              <Field label={tr('password')} hint={tr('passwordHint')} required>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-base"
                />
              </Field>
            ) : (
              <Field label="Email" required>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-base"
                />
              </Field>
            )}
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" disabled={busy} className="w-full justify-center">
              {token ? tr('resetSave') : tr('forgotSend')}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm">
          <Link href="/auth" className="font-semibold text-cyan-300 hover:underline">
            {tr('backToLogin')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
