import Link from 'next/link';
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { ArrowLeftIcon, AlertIcon, CheckIcon } from '@/components/icons';

/* ── Card ────────────────────────────────────────────────────────────────────── */
export type CardProps = {
  children: ReactNode;
  as?: 'div' | 'article' | 'section' | 'aside' | 'ul' | 'ol' | 'li';
  className?: string;
  hover?: boolean;
  bordered?: boolean;
} & HTMLAttributes<HTMLElement>;

export function Card({
  children,
  as: Tag = 'div',
  className = '',
  hover = false,
  bordered = true,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`
        rounded-lg ${bordered ? 'border border-border' : ''} bg-surface-900 shadow-card edge-light
        ${hover ? 'transition-[transform,border-color,box-shadow] duration-200 ease-spring hover:-translate-y-0.5 hover:border-border-light hover:shadow-card-hover' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ── Button ──────────────────────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-cyan-400';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  // Solid, single-accent fills. No gradients - the old cyan→cyan gradient
  // buttons were the loudest generic tell in the shell.
  primary: 'bg-cyan-400 text-text-inverse hover:bg-cyan-300',
  secondary: 'bg-surface-800 text-text-primary border border-border hover:bg-surface-700 hover:border-border-light',
  success: 'bg-success text-text-inverse hover:bg-success-light',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-800',
  danger: 'bg-danger-dark text-onaccent hover:bg-danger focus-visible:ring-danger',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href={href} className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

/* ── Section Heading ─────────────────────────────────────────────────────────── */
export function SectionHeading({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      {/* A real heading step (17px) above the 15px body - the old `text-sm`
          (13px) heading sat *below* body size, so every section read as a
          caption instead of a landmark. Weight + white carry the rest. */}
      <h2 className="text-lg font-bold tracking-tight text-text-primary before:mr-2 before:font-mono before:text-cyan-400 before:content-['>']">{children}</h2>
      {action}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────────────────────── */
type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'xp' | 'danger';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border border-border bg-surface-800 text-text-muted',
  primary: 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  success: 'border border-success/30 bg-success/10 text-success',
  warning: 'border border-warning/30 bg-warning/10 text-warning',
  xp: 'border border-warning/30 bg-warning/10 text-warning',
  danger: 'border border-danger/30 bg-danger/10 text-danger',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider ${BADGE_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

/* ── Difficulty (severity meter) ─────────────────────────────────────────────── */
const LEVEL_OF = { easy: 1, beginner: 1, medium: 2, intermediate: 2, hard: 3, advanced: 3 } as const;
export type DifficultyLevel = keyof typeof LEVEL_OF;

/**
 * Difficulty as a three-bar severity meter (like a signal or risk gauge): one
 * bar and green for the easiest, three bars and red for the hardest. The label
 * stays as text, so colour is never the only cue.
 */
export function DifficultyTag({ level, label, className = '' }: { level: DifficultyLevel; label: string; className?: string }) {
  const n = LEVEL_OF[level];
  const fill = n === 1 ? 'bg-success' : n === 2 ? 'bg-warning' : 'bg-danger';
  const text = n === 1 ? 'text-success' : n === 2 ? 'text-warning' : 'text-danger';
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider ${text} ${className}`}>
      <span aria-hidden="true" className="flex items-end gap-px">
        {[1, 2, 3].map(i => (
          <span key={i} className={`w-[3px] rounded-[1px] ${i <= n ? fill : 'bg-border-light'}`} style={{ height: 4 + i * 3 }} />
        ))}
      </span>
      {label}
    </span>
  );
}

/* ── Progress Bar ────────────────────────────────────────────────────────────── */
type ProgressTone = 'primary' | 'success' | 'warning' | 'xp';

const PROGRESS_TONES: Record<ProgressTone, string> = {
  primary: 'bg-cyan-400',
  success: 'bg-success',
  warning: 'bg-warning',
  xp: 'bg-warning',
};

export function Progress({
  value,
  max = 100,
  tone = 'primary',
  label,
  className = '',
  showLabel = false,
}: {
  value: number;
  max?: number;
  tone?: ProgressTone;
  label: string;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`progress-base ${className}`}
    >
      <div
        className={`progress-fill fill-x ${PROGRESS_TONES[tone]}`}
        style={{ transform: `scaleX(${pct / 100})` }}
      />
      {showLabel && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────────── */
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Avatars show the learner's initials on a neutral tile. They used to render a
// chosen emoji; initials read as a professional account marker and carry no
// cartoon character into the interface.
const AVATAR_SIZES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[0.625rem] rounded-md',
  sm: 'h-8 w-8 text-xs rounded-md',
  md: 'h-10 w-10 text-sm rounded-lg',
  lg: 'h-12 w-12 text-base rounded-lg',
  xl: 'h-16 w-16 text-xl rounded-lg',
  '2xl': 'h-24 w-24 text-3xl rounded-lg',
};

/** Up to two initials from a display name. Never empty. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.length === 1 ? Array.from(parts[0]).slice(0, 2) : [Array.from(parts[0])[0], Array.from(parts[parts.length - 1])[0]];
  return letters.join('').toUpperCase();
}

export function Avatar({
  name,
  size = 'md',
  ring = false,
  className = '',
  announce = false,
}: {
  /** Ignored. Kept so older call sites compile; initials are used instead. */
  emoji?: string;
  /** The user's display name. Exposed as the avatar's accessible name only
   *  when `announce` is set: every current call site already renders the name
   *  as adjacent visible text, so announcing it here too would duplicate it.
   *  Set `announce` for an avatar that has no adjacent visible name. */
  name: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
  announce?: boolean;
}) {
  return (
    <span
      role={announce ? 'img' : undefined}
      aria-label={announce ? name : undefined}
      aria-hidden={announce ? undefined : true}
      className={`avatar-base border border-border text-text-primary ${AVATAR_SIZES[size]} ${
        ring ? 'ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-bg' : ''
      } ${className}`}
    >
      <span aria-hidden="true" className="font-bold tracking-tight">{initialsOf(name)}</span>
    </span>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-lg ${className}`} />;
}

/* ── Empty State ─────────────────────────────────────────────────────────────── */
export function EmptyState({
  emoji,
  icon,
  title,
  body,
  action,
  className = '',
}: {
  emoji?: string;
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-4 px-6 py-12 text-center ${className}`}>
      <div className="grid h-16 w-16 place-items-center rounded-lg border border-border bg-surface-800 text-3xl shadow-card edge-light">
        {icon ?? <span aria-hidden="true" className="opt-center">{emoji}</span>}
      </div>
      <p className="text-base font-semibold text-text-primary">{title}</p>
      {body && <p className="max-w-[38ch] text-sm leading-relaxed text-text-secondary">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ── Error Note ──────────────────────────────────────────────────────────────── */
export function ErrorNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm leading-relaxed text-danger ${className}`}
    >
      <AlertIcon size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* ── Success Note ────────────────────────────────────────────────────────────── */
export function SuccessNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-lg border border-success/30 bg-success/[0.06] px-4 py-3 text-sm leading-relaxed text-success ${className}`}
    >
      <CheckIcon size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* ── Back Link ───────────────────────────────────────────────────────────────── */
export function BackLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`-ml-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary ${className}`}
    >
      <ArrowLeftIcon size={16} />
      {children}
    </Link>
  );
}

/* ── Input Field Wrapper ─────────────────────────────────────────────────────── */
export function Field({
  label,
  error,
  hint,
  children,
  required = false,
  className = '',
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="form-label !mb-0">{label}</span>
        {required && <span className="text-danger" aria-hidden="true">*</span>}
      </div>
      {children}
      {error && <span className="form-error" role="alert">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </label>
  );
}
