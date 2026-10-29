'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, authLogin, authRegister } from '@/lib/api';
import { safeNextPath } from '@/lib/redirect';
import { PwnedResult, checkPwned } from '@/lib/pwned';
import PasswordPolicy from '@/components/PasswordPolicy';
import { Button, Field, ErrorNote, SuccessNote } from '@/components/ui';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { ArrowLeftIcon, CheckIcon, EyeIcon, EyeOffIcon } from '@/components/icons';

type Mode = 'login' | 'register';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the backend rule (see backend/routes/auth.js): 8+ chars with an
 *  uppercase letter, a lowercase letter and a digit. Kept in one place so the
 *  inline validation and the submit gate can never drift apart. */
function isStrongPassword(pw: string): boolean {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);
}

/* ── Password strength ──────────────────────────────────────────────────────── */
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_META = [
  { key: 'passwordWeak', color: 'bg-danger', text: 'text-danger' },
  { key: 'passwordWeak', color: 'bg-danger', text: 'text-danger' },
  { key: 'passwordMedium', color: 'bg-warning', text: 'text-warning' },
  { key: 'passwordStrong', color: 'bg-success', text: 'text-success' },
  { key: 'passwordStrong', color: 'bg-success', text: 'text-success' },
] as const;

function PasswordStrength({ password, tr }: { password: string; tr: (k: string) => string }) {
  const score = scorePassword(password);
  if (!password) return null;
  const meta = STRENGTH_META[score];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? meta.color : 'bg-surface-700'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${meta.text}`}>{tr(meta.key)}</p>
    </div>
  );
}

/* ── Password input with visibility toggle ──────────────────────────────────── */
function PasswordInput({
  value,
  onChange,
  onBlur,
  autoComplete,
  placeholder,
  invalid,
  show,
  toggle,
  label,
  error,
  hint,
  onCaps,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  autoComplete: string;
  placeholder?: string;
  invalid?: boolean;
  show: boolean;
  toggle: () => void;
  label: string;
  error?: string;
  hint?: string;
  /** Reports Caps Lock state so the form can warn before a mistyped password. */
  onCaps?: (on: boolean) => void;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);
  return (
    <Field label={label} error={error} hint={hint} required>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyUp={e => onCaps?.(e.getModifierState('CapsLock'))}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          className={`input-base pr-11 font-mono ${invalid ? 'input-error' : ''}`}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={tr(show ? 'hidePassword' : 'showPassword')}
          aria-pressed={show}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-text-muted transition-colors hover:text-text-primary"
        >
          {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
    </Field>
  );
}

export default function AuthPage() {
  const { lang, setUser } = useApp();
  const tr = makeT(lang);
  const router = useRouter();
  // Read `?next=` lazily on the client only. Nothing rendered depends on it, so
  // it never causes a hydration mismatch - and avoiding `useSearchParams` keeps
  // the form server-rendered instead of flashing a Suspense fallback.
  // `safeNextPath` only allows same-origin relative paths, so a crafted link
  // cannot redirect a freshly signed-in user to an external origin.
  const next = useMemo(
    () =>
      typeof window === 'undefined'
        ? '/'
        : safeNextPath(new URLSearchParams(window.location.search).get('next')),
    []
  );

  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({
    display_name: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [caps, setCaps] = useState(false);
  const [breach, setBreach] = useState<PwnedResult | 'checking' | null>(null);

  const isRegister = mode === 'register';

  // Breach lookup: only while registering and only once the policy is met, and
  // debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    if (!isRegister || !isStrongPassword(form.password)) {
      setBreach(null);
      return;
    }
    let alive = true;
    setBreach('checking');
    const t = window.setTimeout(() => {
      checkPwned(form.password).then(r => alive && setBreach(r));
    }, 600);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [isRegister, form.password]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (isRegister) {
      if (!form.display_name.trim()) e.display_name = tr('displayNameHint');
      if (!USERNAME_RE.test(form.username)) e.username = tr('usernameHint');
      if (!EMAIL_RE.test(form.email)) e.email = tr('emailInvalid');
      if (!isStrongPassword(form.password)) e.password = tr('passwordHint');
      if (form.confirm && form.confirm !== form.password) e.confirm = tr('passwordMismatch');
    } else {
      if (!form.username.trim()) e.username = tr('loginIdentifierHint');
      if (!form.password) e.password = tr('passwordRequired');
    }
    return e;
  }, [form, isRegister, tr]);

  const valid =
    isRegister
      ? Boolean(
          form.display_name.trim() &&
            USERNAME_RE.test(form.username) &&
            EMAIL_RE.test(form.email) &&
            isStrongPassword(form.password) &&
            form.confirm === form.password &&
            terms &&
            !(breach && breach !== 'checking' && breach.status === 'pwned')
        )
      : Boolean(form.username.trim() && form.password);

  function set<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
    setSuccess('');
    setTouched({});
    setSubmitted(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ display_name: true, username: true, email: true, password: true, confirm: true });
    setSubmitted(true);
    if (!valid) return;

    setError('');
    setLoading(true);
    try {
      const res = isRegister
        ? await authRegister({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
            display_name: form.display_name.trim(),
            lang,
          })
        : await authLogin({ identifier: form.username.trim(), password: form.password });

      localStorage.setItem('cq_token', res.token);
      setUser(res.user);
      setSuccess(isRegister ? tr('registerSuccess') : tr('loginSuccess'));
      router.replace(next);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : tr('networkError');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <AuthBrandPanel
        headline={isRegister ? tr('authHeadlineRegister') : tr('authHeadlineLogin')}
        body={isRegister ? tr('authBodyRegister') : tr('authBodyLogin')}
      >
        <div className="mt-8 rounded-md border border-border bg-surface-950/50">
          <p className="border-b border-border px-4 py-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-widest text-text-muted">
            {tr('secPanelTitle')}
          </p>
          <ul className="divide-y divide-border/60">
            {['secFact1', 'secFact2', 'secFact3', 'secFact4'].map(k => (
              <li key={k} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary">
                <CheckIcon size={15} className="shrink-0 text-success" />
                {tr(k)}
              </li>
            ))}
          </ul>
        </div>
      </AuthBrandPanel>

      <div className="flex flex-col justify-center py-2 sm:py-6">
        {/* mobile brand mark */}
        <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="grid h-14 w-14 place-items-center rounded-lg border border-border bg-surface-900 shadow-card edge-light lg:hidden">
            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.svg`} alt="" width={32} height={32} priority />
          </span>
          <p className="label mt-4 text-cyan-400 lg:mt-0">{tr('authSecureLabel')}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary">
            {isRegister ? tr('createAccount') : tr('welcomeBack')}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            {isRegister ? tr('registerSubtitle') : tr('loginSubtitle')}
          </p>
        </div>

        {/* mode tabs */}
        <div
          role="tablist"
          aria-label={tr('login')}
          className="mb-6 grid grid-cols-2 gap-1 rounded-md border border-border bg-surface-900 p-1"
        >
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`rounded-sm py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                mode === m ? 'bg-cyan-400 text-text-inverse' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {m === 'login' ? tr('login') : tr('register')}
            </button>
          ))}
        </div>

        <form key={mode} onSubmit={handleSubmit} noValidate className="space-y-4">
          {isRegister && (
            <Field label={tr('displayName')} error={touched.display_name ? errors.display_name : undefined} required>
              <input
                type="text"
                value={form.display_name}
                onChange={set('display_name')}
                onBlur={() => setTouched(t => ({ ...t, display_name: true }))}
                autoComplete="name"
                placeholder={tr('displayNamePlaceholder')}
                aria-invalid={submitted && Boolean(errors.display_name) || undefined}
                className={`input-base ${submitted && errors.display_name ? 'input-error' : ''}`}
              />
            </Field>
          )}

          <Field
            label={isRegister ? tr('username') : tr('loginIdentifier')}
            error={touched.username ? errors.username : undefined}
            hint={isRegister ? tr('usernameHint') : undefined}
            required
          >
            <input
              type={isRegister ? 'text' : 'text'}
              value={form.username}
              onChange={set('username')}
              onBlur={() => setTouched(t => ({ ...t, username: true }))}
              autoComplete={isRegister ? 'username' : 'username'}
              autoCapitalize="none"
              spellCheck={false}
              placeholder={isRegister ? tr('usernamePlaceholder') : tr('loginIdentifierPlaceholder')}
              aria-invalid={submitted && Boolean(errors.username) || undefined}
              className={`input-base font-mono ${submitted && errors.username ? 'input-error' : ''}`}
            />
          </Field>

          {isRegister && (
            <Field label={tr('email')} error={touched.email ? errors.email : undefined} hint={tr('emailHint')} required>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={tr('emailPlaceholder')}
                aria-invalid={submitted && Boolean(errors.email) || undefined}
                className={`input-base font-mono ${submitted && errors.email ? 'input-error' : ''}`}
              />
            </Field>
          )}

          <PasswordInput
            label={tr('password')}
            value={form.password}
            onChange={set('password')}
            onBlur={() => setTouched(t => ({ ...t, password: true }))}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder={tr('passwordPlaceholder')}
            invalid={submitted && Boolean(errors.password)}
            show={showPw}
            toggle={() => setShowPw(v => !v)}
            error={touched.password ? errors.password : undefined}
            onCaps={setCaps}
          />

          {caps && (
            <p role="status" className="-mt-2 font-mono text-[0.6875rem] font-semibold text-warning">
              {tr('capsOn')}
            </p>
          )}

          {!isRegister && (
            <p className="-mt-1 text-right text-xs">
              <Link href="/auth/reset" className="font-semibold text-cyan-300 hover:underline">
                {tr('forgotPassword')}
              </Link>
            </p>
          )}

          {isRegister && (
            <>
              <PasswordPolicy password={form.password} breach={breach} />
              <PasswordStrength password={form.password} tr={tr} />
              <PasswordInput
                label={tr('confirmPassword')}
                value={form.confirm}
                onChange={set('confirm')}
                onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                autoComplete="new-password"
                placeholder={tr('confirmPasswordPlaceholder')}
                invalid={submitted && Boolean(errors.confirm)}
                show={showConfirm}
                toggle={() => setShowConfirm(v => !v)}
                error={touched.confirm ? errors.confirm : undefined}
              />
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={e => setTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-surface-800 text-cyan-400 focus:ring-cyan-400/30"
                />
                <span className="text-xs leading-relaxed text-text-secondary">
                  {tr('termsIAccept')}{' '}
                  <Link href="/terms" className="font-medium text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
                    {tr('terms')}
                  </Link>{' '}
                  {tr('and')}{' '}
                  <Link href="/privacy" className="font-medium text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
                    {tr('privacy')}
                  </Link>
                </span>
              </label>
            </>
          )}

          {error && <ErrorNote>{error}</ErrorNote>}
          {success && !error && <SuccessNote>{success}</SuccessNote>}

          <Button
            type="submit"
            size="lg"
            disabled={loading || (submitted && !valid)}
            className="w-full"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-inverse/30 border-t-text-inverse" aria-hidden="true" />
                {tr('loading')}
              </>
            ) : isRegister ? (
              tr('createAccountBtn')
            ) : (
              tr('loginBtn')
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {isRegister ? tr('alreadyAccount') : tr('noAccount')}{' '}
          <button
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
            className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            {isRegister ? tr('login') : tr('register')}
          </button>
        </p>

        <p className="mt-6 text-center text-xs text-text-muted">
          <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-text-secondary">
            <ArrowLeftIcon size={14} />
            {tr('backToHome')}
          </Link>
        </p>
      </div>
    </div>
  );
}
