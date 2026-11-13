'use client';
import { ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoMark from '@/components/LogoMark';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { ApiError, authLogin, authRegister } from '@/lib/api';
import { safeNextPath } from '@/lib/redirect';
import { safeStorage } from '@/lib/safeStorage';
import { PwnedResult, checkPwned } from '@/lib/pwned';
import { passwordChecks } from '@/components/PasswordPolicy';
import { AGE_GROUPS } from '@/lib/ageGroups';
import { ErrorNote } from '@/components/ui';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { ArrowLeftIcon, CheckIcon, EyeIcon, EyeOffIcon } from '@/components/icons';

type Mode = 'login' | 'register';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the backend rule (backend/routes/auth.js): 8+ chars with an
 *  uppercase letter, a lowercase letter and a digit. */
const isStrongPassword = (pw: string) => passwordChecks(pw).every(c => c.ok);

/** 0-4: drives the bar inside the password field. */
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const BAR_COLOR = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

/** "olim.gulomov+cq@mail.uz" -> "olim_gulomov": a valid username from the email,
 *  or '' when the local part is too short to be one. */
function suggestUsername(email: string): string {
  const local = email.split('@')[0] ?? '';
  const s = local.split('+')[0].toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
  return USERNAME_RE.test(s) ? s : '';
}

/* ── Collapsible row: register-only fields open and close in place ─────────── */
function Reveal({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
      inert={!open}
    >
      {/* -mx-1/px-1 and the grandchild's pt-1 leave room for the focus ring. */}
      <div className="-mx-1 min-h-0 overflow-hidden px-1">
        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
}

/* ── Floating-label input ──────────────────────────────────────────────────── */
function FloatField({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  mono,
  error,
  hint,
  ok,
  trailing,
  footer,
  onKeyUp,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  autoComplete: string;
  mono?: boolean;
  error?: string;
  hint?: string;
  /** Shows the pop-in tick once the value is valid. */
  ok?: boolean;
  trailing?: ReactNode;
  footer?: ReactNode;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className="pb-3">
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          placeholder=" "
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || hint ? msgId : undefined}
          className={`peer input-base h-14 pb-2 pt-6 ${trailing || ok ? 'pr-11' : ''} ${mono ? 'font-mono' : ''} ${
            error ? 'input-error' : ''
          }`}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2 text-sm text-text-muted transition-all duration-200 ease-out
                     peer-focus:top-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-cyan-300
                     peer-[:not(:placeholder-shown)]:top-[1.15rem] peer-[:not(:placeholder-shown)]:scale-[0.8]
                     peer-autofill:top-[1.15rem] peer-autofill:scale-[0.8]"
        >
          {label}
        </label>
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
          {trailing ??
            (ok && (
              <span className="pop-in mr-2.5 grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success" aria-hidden="true">
                <CheckIcon size={13} />
              </span>
            ))}
        </div>
        {footer}
      </div>
      {error ? (
        <p id={msgId} role="alert" className="form-error rise-in">{error}</p>
      ) : hint ? (
        <p id={msgId} className="form-hint rise-in text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export default function AuthPage() {
  const { lang, setUser, ageGroup, setAgeGroup } = useApp();
  const tr = makeT(lang);
  const router = useRouter();
  // Read `?next=` lazily on the client only (nothing rendered depends on it).
  // `safeNextPath` only allows same-origin relative paths.
  const next = useMemo(
    () => (typeof window === 'undefined' ? '/' : safeNextPath(new URLSearchParams(window.location.search).get('next'))),
    []
  );

  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [caps, setCaps] = useState(false);
  const [breach, setBreach] = useState<PwnedResult | 'checking' | null>(null);

  const isRegister = mode === 'register';

  // Breach lookup: only while registering, only once the policy is met, debounced.
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

  const pwned = breach && breach !== 'checking' && breach.status === 'pwned';
  const checks = passwordChecks(form.password);
  const score = scorePassword(form.password);

  const valid = {
    email: EMAIL_RE.test(form.email),
    username: isRegister ? USERNAME_RE.test(form.username) : Boolean(form.username.trim()),
    password: isRegister ? isStrongPassword(form.password) && !pwned : Boolean(form.password),
  };
  const formValid = valid.username && valid.password && (!isRegister || valid.email);

  const errors = {
    email: isRegister && touched.email && !valid.email ? tr('emailInvalid') : undefined,
    username: touched.username && !valid.username ? tr(isRegister ? 'usernameHint' : 'loginIdentifierHint') : undefined,
    password:
      touched.password && !valid.password && !(isRegister && form.password && !pwned)
        ? tr(isRegister ? 'passwordHint' : 'passwordRequired')
        : undefined,
  };

  const usernameSuggested = isRegister && !usernameEdited && Boolean(form.username) && form.username === suggestUsername(form.email);

  function setEmail(v: string) {
    setForm(f => {
      const nextForm = { ...f, email: v };
      // Keep the username in step with the email until the learner edits it.
      if (!usernameEdited && (f.username === '' || f.username === suggestUsername(f.email))) {
        nextForm.username = suggestUsername(v);
      }
      return nextForm;
    });
  }

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setError('');
    setTouched({});
    setUsernameEdited(form.username !== '');
  }

  function fail() {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== 'idle') return;
    setTouched({ email: true, username: true, password: true });
    if (!formValid) return fail();

    setError('');
    setStatus('loading');
    try {
      const res = isRegister
        ? await authRegister({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
            // The name shown on the profile starts as the username; it can be
            // changed in the profile at any time.
            display_name: form.username.trim(),
            lang,
            ...(ageGroup ? { age_group: ageGroup } : {}),
          })
        : await authLogin({ identifier: form.username.trim(), password: form.password });

      safeStorage.set('cq_token', res.token);
      setStatus('done');
      // Let the tick land before the page changes.
      window.setTimeout(() => {
        setUser(res.user);
        router.replace(next);
      }, 550);
    } catch (err) {
      setStatus('idle');
      setError(err instanceof ApiError ? err.message : tr('networkError'));
      fail();
    }
  }

  const selectedAge = AGE_GROUPS.find(g => g.slug === ageGroup);

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

      <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-2 sm:py-6 lg:max-w-none">
        <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Keyed on mode: the mark redraws itself on every switch. */}
          <span key={mode} className="mb-4 grid h-14 w-14 place-items-center rounded-lg border border-border bg-surface-900 shadow-card edge-light lg:hidden">
            <LogoMark size={32} />
          </span>
          <div key={`h-${mode}`} className="rise-in">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              {isRegister ? tr('createAccount') : tr('welcomeBack')}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">{isRegister ? tr('registerSubtitle') : tr('loginSubtitle')}</p>
          </div>
        </div>

        {/* Mode switch with a sliding indicator */}
        <div role="tablist" aria-label={tr('login')} className="relative mb-5 grid grid-cols-2 rounded-md border border-border bg-surface-900 p-1">
          <span
            aria-hidden="true"
            className={`absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-sm bg-cyan-500/15 shadow-[inset_0_0_0_1px_rgb(var(--cyan-500)/0.35)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRegister ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`relative z-10 rounded-sm py-2.5 text-sm font-semibold transition-colors duration-200 ${
                mode === m ? 'text-cyan-300' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {m === 'login' ? tr('login') : tr('register')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className={shake ? 'shake' : ''} onAnimationEnd={e => e.target === e.currentTarget && setShake(false)}>
          <Reveal open={isRegister}>
            <FloatField
              label={tr('email')}
              type="email"
              value={form.email}
              onChange={setEmail}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              autoComplete="email"
              mono
              ok={valid.email}
              error={errors.email}
            />
          </Reveal>

          <div className="pt-1">
            <FloatField
              label={isRegister ? tr('username') : tr('loginIdentifier')}
              value={form.username}
              onChange={v => {
                setUsernameEdited(true);
                setForm(f => ({ ...f, username: v }));
              }}
              onBlur={() => setTouched(t => ({ ...t, username: true }))}
              autoComplete="username"
              mono
              ok={isRegister && valid.username}
              error={errors.username}
              hint={usernameSuggested ? tr('usernameSuggested') : undefined}
            />

            <FloatField
              label={tr('password')}
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={v => setForm(f => ({ ...f, password: v }))}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              onKeyUp={e => setCaps(e.getModifierState('CapsLock'))}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              mono
              error={errors.password}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={tr(showPw ? 'hidePassword' : 'showPassword')}
                  aria-pressed={showPw}
                  className="grid h-10 w-10 place-items-center rounded-lg text-text-muted transition-colors hover:text-text-primary"
                >
                  {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              }
              footer={
                isRegister && (
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 overflow-hidden rounded-full">
                    <span
                      className={`block h-full origin-left rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${BAR_COLOR[score]}`}
                      style={{ transform: `scaleX(${score / 4})` }}
                    />
                  </span>
                )
              }
            />
          </div>

          {caps && (
            <p role="status" className="rise-in -mt-1.5 mb-2 font-mono text-[0.6875rem] font-semibold text-warning">
              {tr('capsOn')}
            </p>
          )}

          {/* Login: forgot link. Register: rule pills + breach line. */}
          <div className="-mt-1 mb-3 min-h-[1.5rem]">
            {isRegister ? (
              <div key="rules" className="rise-in" aria-live="polite">
                <ul className="flex flex-wrap gap-1.5">
                  {checks.map(c => (
                    <li
                      key={c.key}
                      title={tr(c.key)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[0.6875rem] font-semibold transition-colors duration-300 ${
                        c.ok ? 'border-success/40 bg-success/10 text-success' : 'border-border text-text-muted'
                      }`}
                    >
                      {c.ok && <CheckIcon size={11} className="pop-in" />}
                      <span className="sr-only">{tr(c.key)}: </span>
                      {{ polLen: '8+', polUpper: 'A-Z', polLower: 'a-z', polDigit: '0-9' }[c.key]}
                    </li>
                  ))}
                </ul>
                {breach && (
                  <p
                    className={`rise-in mt-2 font-mono text-[0.6875rem] ${
                      pwned ? 'font-semibold text-danger' : breach !== 'checking' && breach.status === 'safe' ? 'text-success' : 'text-text-muted'
                    }`}
                  >
                    {breach === 'checking'
                      ? tr('pwnedChecking')
                      : breach.status === 'pwned'
                        ? `${tr('pwnedFound')} ${breach.count.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}`
                        : breach.status === 'safe'
                          ? tr('pwnedSafe')
                          : tr('pwnedUnknown')}
                  </p>
                )}
              </div>
            ) : (
              <p key="forgot" className="rise-in text-right text-xs">
                <Link href="/auth/reset" className="font-semibold text-cyan-300 hover:underline">
                  {tr('forgotPassword')}
                </Link>
              </p>
            )}
          </div>

          <Reveal open={isRegister}>
            <div className="pb-4" role="group" aria-label={tr('ageChipsLabel')}>
              <p className="form-label">{tr('ageChipsLabel')}</p>
              <div className="grid grid-cols-5 gap-1.5">
                {AGE_GROUPS.map(g => {
                  const on = ageGroup === g.slug;
                  return (
                    <button
                      key={g.slug}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${g.title[lang]} - ${g.who[lang]}`}
                      onClick={() => setAgeGroup(g.slug)}
                      className={`rounded-md border py-2 font-mono text-xs font-semibold transition-[color,background-color,border-color,transform] duration-200 active:scale-95 ${
                        on
                          ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-300'
                          : 'border-border bg-surface-800 text-text-secondary hover:border-surface-500 hover:text-text-primary'
                      }`}
                    >
                      {g.slug}
                    </button>
                  );
                })}
              </div>
              <p key={selectedAge?.slug ?? 'none'} className="rise-in mt-1.5 text-xs text-text-muted">
                {selectedAge ? `${selectedAge.title[lang]} · ${selectedAge.who[lang]}` : tr('agePickSubtitle')}
              </p>
            </div>
          </Reveal>

          {error && (
            <div className="mb-3 rise-in">
              <ErrorNote>{error}</ErrorNote>
            </div>
          )}

          <button
            type="submit"
            disabled={status !== 'idle'}
            className={`relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-bold transition-[background-color,transform,box-shadow] duration-300 active:scale-[0.98] disabled:cursor-default ${
              status === 'done' ? 'bg-success text-text-inverse' : 'bg-cyan-400 text-text-inverse hover:bg-cyan-300'
            } ${formValid && status === 'idle' ? 'shadow-[0_6px_20px_-8px_rgb(var(--cyan-400)/0.7)]' : ''}`}
          >
            {status === 'loading' ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-text-inverse/30 border-t-text-inverse" aria-label={tr('loading')} />
            ) : status === 'done' ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-label={tr(isRegister ? 'registerSuccess' : 'loginSuccess')}>
                <path pathLength={1} className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span key={mode} className="rise-in">{isRegister ? tr('createAccountBtn') : tr('loginBtn')}</span>
            )}
          </button>

          <Reveal open={isRegister}>
            <p className="pt-3 text-center text-xs leading-relaxed text-text-muted">
              {tr('agreeLead')}{' '}
              <Link href="/terms" className="font-medium text-text-secondary underline underline-offset-2 hover:text-cyan-300">
                {tr('terms')}
              </Link>{' '}
              {tr('and')}{' '}
              <Link href="/privacy" className="font-medium text-text-secondary underline underline-offset-2 hover:text-cyan-300">
                {tr('privacy')}
              </Link>
            </p>
          </Reveal>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          <Link href="/" className="inline-flex items-center gap-1.5 py-2 transition-colors hover:text-text-secondary">
            <ArrowLeftIcon size={14} />
            {tr('backToHome')}
          </Link>
        </p>
      </div>
    </div>
  );
}
