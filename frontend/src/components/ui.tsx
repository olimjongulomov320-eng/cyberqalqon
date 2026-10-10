import Link from 'next/link';
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, HTMLAttributes } from 'react';

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
        rounded-2xl ${bordered ? 'border border-border' : ''} bg-surface-900/80 backdrop-blur-sm shadow-card
        ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:border-border-light' : ''}
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

const BUTTON_BASE = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 ease-spring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-text-inverse shadow-[0_4px_16px_-4px_rgb(6_182_212_/_0.45)] hover:from-cyan-300 hover:to-cyan-400 hover:shadow-[0_8px_24px_-8px_rgb(6_182_212_/_0.55)]',
  secondary: 'bg-surface-800 text-text-primary border border-border hover:bg-surface-700 hover:border-border-light',
  success: 'bg-gradient-to-r from-success to-success-dark text-white shadow-[0_4px_16px_-4px_rgb(34_197_94_/_0.4)] hover:shadow-[0_8px_24px_-8px_rgb(34_197_94_/_0.5)]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-800',
  danger: 'bg-gradient-to-r from-danger to-danger-dark text-white shadow-[0_4px_16px_-4px_rgb(239_68_68_/_0.4)] hover:shadow-[0_8px_24px_-8px_rgb(239_68_68_/_0.5)]',
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
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="label">{children}</h2>
      {action}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────────────────────── */
type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'xp' | 'danger';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border border-border bg-surface-800 text-text-muted',
  primary: 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
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
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${BADGE_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

/* ── Progress Bar ────────────────────────────────────────────────────────────── */
type ProgressTone = 'primary' | 'success' | 'warning' | 'xp';

const PROGRESS_TONES: Record<ProgressTone, string> = {
  primary: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
  success: 'bg-gradient-to-r from-success to-success-light',
  warning: 'bg-gradient-to-r from-warning to-warning-light',
  xp: 'bg-gradient-to-r from-warning to-success',
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
        className={`progress-fill ${PROGRESS_TONES[tone]}`}
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

const AVATAR_SIZES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs rounded-md',
  sm: 'h-8 w-8 text-sm rounded-lg',
  md: 'h-10 w-10 text-base rounded-lg',
  lg: 'h-12 w-12 text-xl rounded-xl',
  xl: 'h-16 w-16 text-2xl rounded-xl',
  '2xl': 'h-24 w-24 text-4xl rounded-2xl',
};

export function Avatar({
  emoji,
  name,
  size = 'md',
  ring = false,
  className = '',
}: {
  emoji: string;
  name: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`avatar-base shrink-0 ${AVATAR_SIZES[size]} ${ring ? 'ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-bg' : ''} ${className}`}
    >
      <span className="opt-center">{emoji}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />;
}

/* ── Empty State ─────────────────────────────────────────────────────────────── */
export function EmptyState({
  emoji,
  title,
  body,
  action,
  className = '',
}: {
  emoji: string;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-4 px-6 py-12 text-center ${className}`}>
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-border bg-surface-800 text-3xl shadow-card">
        <span className="opt-center">{emoji}</span>
      </div>
      <p className="text-base font-semibold text-text-primary">{title}</p>
      {body && <p className="max-w-[34ch] text-sm leading-relaxed text-text-secondary">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ── Error Note ──────────────────────────────────────────────────────────────── */
export function ErrorNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm leading-relaxed text-danger ${className}`}
    >
      <span aria-hidden="true" className="shrink-0 font-semibold">!</span>
      <span>{children}</span>
    </p>
  );
}

/* ── Success Note ────────────────────────────────────────────────────────────── */
export function SuccessNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-xl border border-success/30 bg-success/[0.06] px-4 py-3 text-sm leading-relaxed text-success ${className}`}
    >
      <span aria-hidden="true" className="shrink-0 font-semibold">✓</span>
      <span>{children}</span>
    </p>
  );
}

/* ── Info Note ───────────────────────────────────────────────────────────────── */
export function InfoNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.06] px-4 py-3 text-sm leading-relaxed text-cyan-400 ${className}`}
    >
      <span aria-hidden="true" className="shrink-0 font-semibold">i</span>
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
      <span aria-hidden="true">←</span>
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
      <div className="flex items-center gap-1.5 mb-2">
        <span className="form-label">{label}</span>
        {required && <span className="text-danger" aria-hidden="true">*</span>}
      </div>
      {children}
      {error && <span className="form-error" role="alert">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </label>
  );
}

/* ── Toast ───────────────────────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info' | 'warning';

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-success/30',
  error: 'border-danger/30',
  info: 'border-cyan-500/30',
  warning: 'border-warning/30',
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '!',
  info: 'i',
  warning: '⚠',
};

export function Toast({
  type = 'info',
  title,
  message,
  action,
  onClose,
}: {
  type?: ToastType;
  title: string;
  message?: string;
  action?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      role="alert"
      className={`toast-base ${TOAST_STYLES[type]}`}
    >
      <span className="shrink-0 text-lg">{TOAST_ICONS[type]}</span>
      <div className="flex-1">
        <p className="font-semibold text-text-primary">{title}</p>
        {message && <p className="text-sm text-text-secondary">{message}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-surface-800 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────────── */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`modal-content ${className}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <h2 id="modal-title" className="text-xl font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-surface-800 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────────────────────────── */
export function Divider({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-border" />
      {children && <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{children}</span>}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ── Tooltip ─────────────────────────────────────────────────────────────────── */
export function Tooltip({
  content,
  children,
  position = 'top',
}: {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" tabIndex={0}>
      {children}
      <div
        className={`absolute ${positions[position]} z-20 w-max px-2.5 py-1.5 rounded-lg bg-surface-950 text-xs font-medium text-text-primary shadow-card-hover border border-border animate-fade-in whitespace-nowrap`}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
}

/* ── Separator ───────────────────────────────────────────────────────────────── */
export function Separator({ className = '' }: { className?: string }) {
  return <hr className={`border-border ${className}`} />;
}