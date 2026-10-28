import type { SVGProps } from 'react';

/**
 * First-party icon set — one family, one stroke weight, one grid.
 *
 * Why hand-rolled instead of an icon package: the redesign brief forbids adding
 * dependencies without explicit approval, and the app ships to low-bandwidth
 * Uzbek/Russian users where a tree-shaken icon package still costs more than
 * the ~20 glyphs this UI actually needs. Every path below is a simple geometric
 * stroke on a 24×24 grid at a consistent 1.75 stroke, so the set reads as one
 * family rather than a collage.
 *
 * NOT for content emoji: avatars, achievement badges and module/topic icons are
 * data from the API and stay as emoji. These icons are UI chrome only.
 */

const STROKE = 1.75;

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ── Navigation ───────────────────────────────────────────────────────────── */
export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 11 12 4l8.5 7" />
    <path d="M5.75 9.8V19a1.25 1.25 0 0 0 1.25 1.25h10A1.25 1.25 0 0 0 18.25 19V9.8" />
    <path d="M9.75 20.25V14.5h4.5v5.75" />
  </Base>
);

export const BookIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6.6C10.6 5.2 8.7 4.6 6.2 4.6c-.9 0-1.8.13-2.7.4v12.4c.9-.27 1.8-.4 2.7-.4 2.5 0 4.4.6 5.8 2 1.4-1.4 3.3-2 5.8-2 .9 0 1.8.13 2.7.4V5c-.9-.27-1.8-.4-2.7-.4-2.5 0-4.4.6-5.8 2Z" />
    <path d="M12 6.6v13" />
  </Base>
);

export const TargetIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="4.4" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </Base>
);

export const TrophyIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7.5 4h9v4.4a4.5 4.5 0 0 1-9 0Z" />
    <path d="M7.5 5H4.8v1.4A3.2 3.2 0 0 0 7.8 9.6" />
    <path d="M16.5 5h2.7v1.4a3.2 3.2 0 0 1-3 3.2" />
    <path d="M12 12.9v3.6" />
    <path d="M8.6 20.25h6.8l-.7-3.05h-5.4Z" />
  </Base>
);

export const UserIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8.4" r="3.7" />
    <path d="M4.75 20a7.25 7.25 0 0 1 14.5 0" />
  </Base>
);

/* ── Gamification ─────────────────────────────────────────────────────────── */
export const FlameIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12.2 3.4c.5 2.5-.6 4-2.1 5.5C8.5 10.5 7.3 12 7.3 14.2a4.7 4.7 0 0 0 9.4 0c0-1.3-.5-2.4-1.3-3.4-.4 1-1 1.6-1.9 1.9.5-2.5-.5-6.1-1.3-9.3Z" />
  </Base>
);

export const HeartIcon = ({ filled = false, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.2c-1.1-.7-7.3-4.7-7.3-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.3 3.2c0 4.9-6.2 8.9-7.3 9.6Z" />
  </Base>
);

export const BoltIcon = ({ filled = false, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M13.2 3 5.6 13.3h5.1l-1 7.7 7.7-10.6h-5.1Z" />
  </Base>
);

export const SparkleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M11 3.8l1.5 4.1 4.1 1.5-4.1 1.5L11 15l-1.5-4.1L5.4 9.4l4.1-1.5Z" />
    <path d="M17.8 14.6l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8Z" />
  </Base>
);

export const TrophyBadgeIcon = TrophyIcon;

/* ── Controls / status ────────────────────────────────────────────────────── */
export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.75 12.5 9.5 17.25 19.25 6.75" />
  </Base>
);

export const LightbulbIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.25 5.5 15.75 12l-6.5 6.5" />
  </Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.75 5.5 8.25 12l6.5 6.5" />
  </Base>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19.5 12H4.5" />
    <path d="M10.5 6 4.5 12l6 6" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 12h15" />
    <path d="M13.5 6l6 6-6 6" />
  </Base>
);

export const PlayIcon = ({ filled = true, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M8.5 5.6v12.8L19 12Z" />
  </Base>
);

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="5.25" y="10.5" width="13.5" height="9.25" rx="2" />
    <path d="M8.25 10.5V8a3.75 3.75 0 0 1 7.5 0v2.5" />
  </Base>
);

export const CompassIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M15.6 8.4 13.7 13.7 8.4 15.6l1.9-5.3Z" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.4 5.25 6.1v5.5c0 4.3 2.9 7.7 6.75 9.2 3.85-1.5 6.75-4.9 6.75-9.2V6.1Z" />
    <path d="M9 12.2l2.1 2.1 4-4.2" />
  </Base>
);

export const RefreshIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19.5 11.2A7.5 7.5 0 1 0 18 16.3" />
    <path d="M20 5.3v6h-6" />
  </Base>
);

export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4.2 3.4 19.4h17.2Z" />
    <path d="M12 10v4.4" />
    <circle cx="12" cy="17.1" r="0.7" fill="currentColor" stroke="none" />
  </Base>
);

export const ChartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 4.5v15h15" />
    <path d="M8 16.5v-5" />
    <path d="M12.5 16.5V8" />
    <path d="M17 16.5v-3" />
  </Base>
);

export const FlagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 20.5V4.2" />
    <path d="M6 5h11.3l-2.1 3.6 2.1 3.6H6" />
  </Base>
);

export const SignalOnIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 20V16.2" />
    <path d="M9.6 20V12" />
    <path d="M14.2 20V7.8" />
    <path d="M18.8 20V3.6" />
  </Base>
);

export const SignalOffIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 20V16.2" />
    <path d="M9.6 20v-5" />
    <path d="M14.2 20v-2.4" />
    <path d="M3.5 3.8l17 16.4" />
  </Base>
);

export const EyeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const EyeOffIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6.5 0 9.5 6.5 9.5 6.5a17.4 17.4 0 0 1-2.9 3.9" />
    <path d="M6.5 7A17.5 17.5 0 0 0 2.5 12S5.5 18.5 12 18.5a9.4 9.4 0 0 0 4.2-.95" />
    <path d="M10.2 10.2a3 3 0 0 0 4 4" />
    <path d="M4 4l16 16" />
  </Base>
);

/* ── Domain / category glyphs ────────────────────────────────────────────────
   These replace the emoji badges the API ships for learning paths and domains
   (`icon` on /paths and /stats). Emoji rendered as interface chrome is not a
   designed icon: it varies by OS font, ignores the stroke grid and reads as
   decoration. The curriculum keeps its emoji data untouched (that is content),
   but the UI now draws the badge from this one family, keyed by the stable
   `slug`. Unknown slugs fall back to the shield. */

export const NetworkIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="5" r="2.2" />
    <circle cx="5.4" cy="18" r="2.2" />
    <circle cx="18.6" cy="18" r="2.2" />
    <path d="M10.6 6.9 6.7 15.8" />
    <path d="M13.4 6.9 17.3 15.8" />
    <path d="M7.6 18h8.8" />
  </Base>
);

export const TerminalIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.6" y="5" width="16.8" height="14" rx="2.2" />
    <path d="M7.2 9.8 9.8 12l-2.6 2.2" />
    <path d="M12.4 14.4h3.8" />
  </Base>
);

export const GlobeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.7 12h16.6" />
    <path d="M12 3.6c2.2 2.4 3.4 5.3 3.4 8.4S14.2 18 12 20.4C9.8 18 8.6 15.1 8.6 12S9.8 6 12 3.6Z" />
  </Base>
);

export const KeyIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8.4" cy="12" r="4.1" />
    <path d="M12.5 12h7.2" />
    <path d="M16.9 12v2.8" />
    <path d="M19.7 12v1.9" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10.6" cy="10.6" r="6" />
    <path d="M15 15l4.6 4.6" />
  </Base>
);

export const CloudIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7.4 18.5h9.6a3.85 3.85 0 0 0 .5-7.6 5.4 5.4 0 0 0-10.4-1.4 4.2 4.2 0 0 0 .3 9Z" />
  </Base>
);

export const CogIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M12 3.6v3.1M12 17.3v3.1M20.4 12h-3.1M6.7 12H3.6" />
    <path d="m17.9 6.1-2.1 2.1M8.2 15.8l-2.1 2.1M17.9 17.9l-2.1-2.1M8.2 8.2 6.1 6.1" />
  </Base>
);

export const DatabaseIcon = (p: IconProps) => (
  <Base {...p}>
    <ellipse cx="12" cy="6.1" rx="7.3" ry="2.9" />
    <path d="M4.7 6.1v11.8c0 1.6 3.3 2.9 7.3 2.9s7.3-1.3 7.3-2.9V6.1" />
    <path d="M4.7 12c0 1.6 3.3 2.9 7.3 2.9s7.3-1.3 7.3-2.9" />
  </Base>
);

export const GitBranchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="7" cy="6" r="2.3" />
    <circle cx="7" cy="18" r="2.3" />
    <circle cx="17" cy="9" r="2.3" />
    <path d="M7 8.3v7.4" />
    <path d="M9.2 6h5.4a1 1 0 0 1 1 1v0.7" />
  </Base>
);

export const CodeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m8.6 7.4-5 4.6 5 4.6" />
    <path d="m15.4 7.4 5 4.6-5 4.6" />
  </Base>
);

export const LaptopIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4.6" y="5.2" width="14.8" height="10.1" rx="1.6" />
    <path d="M2.8 18.8h18.4" />
  </Base>
);

/** slug → glyph. Keys mirror `backend/curriculum/index.js` (paths + domains). */
const DOMAIN_ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  // learning paths
  cybersecurity: ShieldIcon,
  'it-fundamentals': LaptopIcon,
  // cybersecurity domains
  fundamentals: BookIcon,
  networking: NetworkIcon,
  linux: TerminalIcon,
  'web-security': GlobeIcon,
  crypto: KeyIcon,
  'defensive-security': SearchIcon,
  'cloud-security': CloudIcon,
  'ethical-testing': TargetIcon,
  // IT-fundamentals domains
  'it-basics': CogIcon,
  databases: DatabaseIcon,
  git: GitBranchIcon,
  programming: CodeIcon,
};

/**
 * Renders the badge for a curriculum path/domain. Pass the entity's `slug`.
 * Decorative by default (the adjacent title carries the meaning), so it is
 * `aria-hidden` like every other glyph in this file.
 */
export function DomainIcon({ slug, ...p }: IconProps & { slug?: string }) {
  const Glyph = (slug && DOMAIN_ICONS[slug]) || ShieldIcon;
  return <Glyph {...p} />;
}
