import type { Lang } from './i18n';

/** XP needed to advance one level. */
export const XP_PER_LEVEL = 100;

export interface LevelInfo {
  level: number;
  intoLevel: number;
  needed: number;
  toNext: number;
}

/** Level from a lifetime XP total. Shared by every XP meter in the app. */
export function levelFromXp(totalXp: number): LevelInfo {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const intoLevel = totalXp % XP_PER_LEVEL;
  return { level, intoLevel, needed: XP_PER_LEVEL - intoLevel, toNext: XP_PER_LEVEL };
}

/** Display rank (tier) — grows every two levels so progress stays visible. */
export function tierIndex(level: number) {
  return Math.min(Math.floor((level - 1) / 2), 5);
}

export function tierKey(tier: number): string {
  return `tier${tier}`;
}

/** Achievement catalogue. Keys mirror backend xp_events achievement codes. */
export interface AchievementMeta {
  /** Key into CONTENT_ICONS (components/icons.tsx). */
  icon: string;
  titleKey: string;
  descKey: string;
}

export const ACHIEVEMENTS: Record<string, AchievementMeta> = {
  first_lesson: { icon: 'plant', titleKey: 'ach_first_lesson_t', descKey: 'ach_first_lesson_d' },
  five_lessons: { icon: 'rocket-launch', titleKey: 'ach_five_lessons_t', descKey: 'ach_five_lessons_d' },
  ten_lessons: { icon: 'medal', titleKey: 'ach_ten_lessons_t', descKey: 'ach_ten_lessons_d' },
  perfect_lesson: { icon: 'diamond', titleKey: 'ach_perfect_lesson_t', descKey: 'ach_perfect_lesson_d' },
  streak_7: { icon: 'flame', titleKey: 'ach_streak_7_t', descKey: 'ach_streak_7_d' },
  xp_500: { icon: 'coins', titleKey: 'ach_xp_500_t', descKey: 'ach_xp_500_d' },
  xp_2000: { icon: 'crown', titleKey: 'ach_xp_2000_t', descKey: 'ach_xp_2000_d' },
  reviewer: { icon: 'books', titleKey: 'ach_reviewer_t', descKey: 'ach_reviewer_d' },
  checkpoint: { icon: 'flag-checkered', titleKey: 'ach_checkpoint_t', descKey: 'ach_checkpoint_d' },
  assessment_pass: { icon: 'graduation-cap', titleKey: 'ach_assessment_pass_t', descKey: 'ach_assessment_pass_d' },
  network_explorer: { icon: 'globe', titleKey: 'ach_network_explorer_t', descKey: 'ach_network_explorer_d' },
  linux_penguin: { icon: 'terminal-window', titleKey: 'ach_linux_penguin_t', descKey: 'ach_linux_penguin_d' },
  web_defender: { icon: 'shield-check', titleKey: 'ach_web_defender_t', descKey: 'ach_web_defender_d' },
};

export function achievementMeta(key: string, lang: Lang, t: (k: string) => string) {
  const meta = ACHIEVEMENTS[key];
  if (!meta) return null;
  return { icon: meta.icon, title: t(meta.titleKey), desc: t(meta.descKey) };
}