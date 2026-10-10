'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, authLogin, authRegister } from '@/lib/api';
import { Button, Field, ErrorNote, SuccessNote } from '@/components/ui';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';

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
}) {
  return (
    <Field label={label} error={error} hint={hint} required>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          className={`input-base pr-11 ${invalid ? 'input-error' : ''}`}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-text-muted transition-colors hover:text-text-primary"
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <path d="M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
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
  // it never causes a hydration mismatch — and avoiding `useSearchParams` keeps
  // the form server-rendered instead of flashing a Suspense fallback.
  const next = useMemo(
    () => (typeof window === 'undefined' ? '/' : new URLSearchParams(window.location.search).get('next') || '/'),
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

  const isRegister = mode === 'register';

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
            terms
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
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
      <AuthBrandPanel
        headline={isRegister ? tr('authHeadlineRegister') : tr('authHeadlineLogin')}
        body={isRegister ? tr('authBodyRegister') : tr('authBodyLogin')}
      >
        <ul className="mt-8 space-y-3">
          {[tr('authPoint1'), tr('authPoint2'), tr('authPoint3')].map((p, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 text-sm text-slate-300"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[0.625rem] font-bold text-accent-400">
                ✓
              </span>
              {p}
            </motion.li>
          ))}
        </ul>
      </AuthBrandPanel>

      <div className="flex flex-col justify-center py-2 sm:py-6">
        {/* mobile brand mark */}
        <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 shadow-[0_10px_30px_-10px_rgb(124_58_237_/_0.8)] lg:hidden"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6L12 2.5Z" fill="white" fillOpacity="0.95" />
              <path d="M8.6 12.2 11 14.6l4.6-4.8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary lg:mt-0">
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
          className="relative mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-900 p-1"
        >
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className="relative z-10 rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-tab"
                  className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 shadow-[0_4px_16px_-6px_rgb(124_58_237_/_0.7)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={mode === m ? 'text-white' : 'text-text-muted hover:text-text-secondary'}>
                {m === 'login' ? tr('login') : tr('register')}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
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
                className={`input-base ${submitted && errors.username ? 'input-error' : ''}`}
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
                  className={`input-base ${submitted && errors.email ? 'input-error' : ''}`}
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
              hint={isRegister ? tr('passwordHint') : undefined}
            />

            {isRegister && (
              <>
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
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-surface-800 text-primary-500 focus:ring-primary-500/30"
                  />
                  <span className="text-xs leading-relaxed text-text-secondary">
                    {tr('termsIAccept')}{' '}
                    <Link href="/terms" className="font-medium text-primary-400 underline underline-offset-2 hover:text-primary-300">
                      {tr('terms')}
                    </Link>{' '}
                    {tr('and')}{' '}
                    <Link href="/privacy" className="font-medium text-primary-400 underline underline-offset-2 hover:text-primary-300">
                      {tr('privacy')}
                    </Link>
                  </span>
                </label>
              </>
            )}

            {!isRegister && (
              <div className="flex justify-end">
                <span className="text-xs font-medium text-text-muted" title={tr('forgotPasswordUnavailable')}>
                  {tr('forgotPassword')}
                </span>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ErrorNote>{error}</ErrorNote>
                </motion.div>
              )}
              {success && !error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <SuccessNote>{success}</SuccessNote>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              size="lg"
              disabled={loading || (submitted && !valid)}
              className="w-full"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                  {tr('loading')}
                </>
              ) : isRegister ? (
                tr('createAccountBtn')
              ) : (
                tr('loginBtn')
              )}
            </Button>
          </motion.form>
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {isRegister ? tr('alreadyAccount') : tr('noAccount')}{' '}
          <button
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
            className="font-semibold text-primary-400 transition-colors hover:text-primary-300"
          >
            {isRegister ? tr('login') : tr('register')}
          </button>
        </p>

        <p className="mt-6 text-center text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-text-secondary">
            ← {tr('backToHome')}
          </Link>
        </p>
      </div>
    </div>
  );
}
