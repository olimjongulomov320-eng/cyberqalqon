import type { ComponentType } from 'react';
import type { IconProps as PhosphorProps } from '@phosphor-icons/react/dist/lib/types';
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  Books,
  Brain,
  BookOpenText,
  CaretLeft,
  CaretRight,
  ChartBar,
  Check,
  Cloud,
  Code,
  Coins,
  Compass,
  Crown,
  Database,
  Desktop,
  Diamond,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  Flag,
  FlagCheckered,
  Flame,
  Gear,
  SignOut,
  GitBranch,
  Globe,
  GraduationCap,
  Heart,
  House,
  Key,
  Laptop,
  Lightbulb,
  Lightning,
  Lock,
  LockKey,
  MagnifyingGlass,
  Medal,
  Moon,
  Plant,
  Play,
  RocketLaunch,
  ShieldCheck,
  Siren,
  Sparkle,
  Sun,
  Target,
  TerminalWindow,
  TreeStructure,
  Trophy,
  UserCircle,
  Warning,
  WifiHigh,
  WifiSlash,
  X,
} from '@phosphor-icons/react/dist/ssr';

/**
 * Icon set: Phosphor, one family, one weight.
 *
 * Every glyph in the product comes from this file, so the weight, size default
 * and accessibility behaviour are decided in exactly one place. Nothing here is
 * hand-drawn. Content that used to carry an emoji (tracks, domains,
 * achievements) now carries a key that `ContentIcon` resolves; unknown keys
 * fall back to rendering the string, so older stored data still displays.
 *
 * NOT for user-chosen avatars, which are the learner's own content.
 */

export type IconProps = Omit<PhosphorProps, 'weight'> & { size?: number };

const WEIGHT = 'regular' as const;

function make(Glyph: ComponentType<PhosphorProps>) {
  const Icon = ({ size = 20, ...p }: IconProps) => (
    <Glyph weight={WEIGHT} size={size} aria-hidden="true" focusable="false" {...p} />
  );
  return Icon;
}

/* ── Interface glyphs (names kept stable for existing call sites) ─────────── */
export const HomeIcon = make(House);
export const BookIcon = make(BookOpenText);
export const TargetIcon = make(Target);
export const TrophyIcon = make(Trophy);
export const UserIcon = make(UserCircle);
export const FlameIcon = make(Flame);
export const SparkleIcon = make(Sparkle);
export const TrophyBadgeIcon = make(Medal);
export const CheckIcon = make(Check);
export const LightbulbIcon = make(Lightbulb);
export const CloseIcon = make(X);
export const ChevronRightIcon = make(CaretRight);
export const ChevronLeftIcon = make(CaretLeft);
export const ArrowLeftIcon = make(ArrowLeft);
export const ArrowRightIcon = make(ArrowRight);
export const PlayIcon = make(Play);
export const LockIcon = make(Lock);
export const CompassIcon = make(Compass);
export const ShieldIcon = make(ShieldCheck);
export const RefreshIcon = make(ArrowClockwise);
export const AlertIcon = make(Warning);
export const ChartIcon = make(ChartBar);
export const FlagIcon = make(Flag);
export const SignalOnIcon = make(WifiHigh);
export const SignalOffIcon = make(WifiSlash);
export const EyeIcon = make(Eye);
export const EyeOffIcon = make(EyeSlash);
export const NetworkIcon = make(TreeStructure);
export const TerminalIcon = make(TerminalWindow);
export const GlobeIcon = make(Globe);
export const KeyIcon = make(Key);
export const SearchIcon = make(MagnifyingGlass);
export const CloudIcon = make(Cloud);
export const CogIcon = make(Gear);
export const DatabaseIcon = make(Database);
export const GitBranchIcon = make(GitBranch);
export const CodeIcon = make(Code);
export const LaptopIcon = make(Laptop);

const HeartBase = make(Heart);
const BoltBase = make(Lightning);
export const HeartIcon = ({ filled = false, ...p }: IconProps & { filled?: boolean }) =>
  filled ? <Heart weight="fill" size={p.size ?? 20} aria-hidden="true" focusable="false" {...p} /> : <HeartBase {...p} />;
export const BoltIcon = ({ filled = false, ...p }: IconProps & { filled?: boolean }) =>
  filled ? <Lightning weight="fill" size={p.size ?? 20} aria-hidden="true" focusable="false" {...p} /> : <BoltBase {...p} />;

export const SignOutIcon = make(SignOut);
export const SunIcon = make(Sun);
export const MoonIcon = make(Moon);
export const SystemIcon = make(Desktop);

/* ── Content icons: stable string keys stored in curriculum data ─────────── */

/** key → glyph. Keys are what `backend/curriculum/*` and the API carry. */
export const CONTENT_ICONS: Record<string, ComponentType<PhosphorProps>> = {
  'shield-check': ShieldCheck,
  brain: Brain,
  key: Key,
  'envelope-simple': EnvelopeSimple,
  globe: Globe,
  'tree-structure': TreeStructure,
  'terminal-window': TerminalWindow,
  'lock-key': LockKey,
  siren: Siren,
  'magnifying-glass': MagnifyingGlass,
  cloud: Cloud,
  target: Target,
  laptop: Laptop,
  gear: Gear,
  database: Database,
  'git-branch': GitBranch,
  code: Code,
  book: BookOpenText,
  // achievements
  plant: Plant,
  'rocket-launch': RocketLaunch,
  medal: Medal,
  diamond: Diamond,
  flame: Flame,
  coins: Coins,
  crown: Crown,
  books: Books,
  'flag-checkered': FlagCheckered,
  'graduation-cap': GraduationCap,
};

export function hasContentIcon(name: string | null | undefined): boolean {
  return Boolean(name && CONTENT_ICONS[name]);
}

/**
 * Renders a content icon by key. A value that is not a known key (for example
 * an emoji stored before this change) is shown as text rather than dropped.
 */
export function ContentIcon({ name, size = 20, className = '' }: { name?: string | null; size?: number; className?: string }) {
  if (!name) return null;
  const Glyph = CONTENT_ICONS[name];
  if (Glyph) return <Glyph weight={WEIGHT} size={size} aria-hidden="true" focusable="false" className={className} />;
  return (
    <span aria-hidden="true" className={className} style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

/** slug → glyph. Keys mirror `backend/curriculum/index.js` (paths + domains). */
const DOMAIN_ICONS: Record<string, ComponentType<PhosphorProps>> = {
  cybersecurity: ShieldCheck,
  'it-fundamentals': Laptop,
  fundamentals: BookOpenText,
  networking: TreeStructure,
  linux: TerminalWindow,
  'web-security': Globe,
  crypto: Key,
  'defensive-security': MagnifyingGlass,
  'cloud-security': Cloud,
  'ethical-testing': Target,
  'phishing-awareness': EnvelopeSimple,
  'privacy-data': LockKey,
  'it-basics': Gear,
  databases: Database,
  git: GitBranch,
  programming: Code,
};

/** Badge for a curriculum path/domain by `slug`. Decorative: the title carries the meaning. */
export function DomainIcon({ slug, size = 20, className = '' }: { slug?: string; size?: number; className?: string }) {
  const Glyph = (slug && DOMAIN_ICONS[slug]) || ShieldCheck;
  return <Glyph weight={WEIGHT} size={size} aria-hidden="true" focusable="false" className={className} />;
}
