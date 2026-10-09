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
  emoji: string;
  titleKey: string;
  descKey: string;
}

export const ACHIEVEMENTS: Record<string, AchievementMeta> = {
  first_lesson: { emoji: '🌱', titleKey: 'ach_first_lesson_t', descKey: 'ach_first_lesson_d' },
  five_lessons: { emoji: '🚀', titleKey: 'ach_five_lessons_t', descKey: 'ach_five_lessons_d' },
  ten_lessons: { emoji: '🏅', titleKey: 'ach_ten_lessons_t', descKey: 'ach_ten_lessons_d' },
  perfect_lesson: { emoji: '💎', titleKey: 'ach_perfect_lesson_t', descKey: 'ach_perfect_lesson_d' },
  streak_7: { emoji: '🔥', titleKey: 'ach_streak_7_t', descKey: 'ach_streak_7_d' },
  xp_500: { emoji: '🪙', titleKey: 'ach_xp_500_t', descKey: 'ach_xp_500_d' },
  xp_2000: { emoji: '👑', titleKey: 'ach_xp_2000_t', descKey: 'ach_xp_2000_d' },
  reviewer: { emoji: '📚', titleKey: 'ach_reviewer_t', descKey: 'ach_reviewer_d' },
  checkpoint: { emoji: '🏁', titleKey: 'ach_checkpoint_t', descKey: 'ach_checkpoint_d' },
  network_explorer: { emoji: '🌐', titleKey: 'ach_network_explorer_t', descKey: 'ach_network_explorer_d' },
  linux_penguin: { emoji: '🐧', titleKey: 'ach_linux_penguin_t', descKey: 'ach_linux_penguin_d' },
  web_defender: { emoji: '🛡️', titleKey: 'ach_web_defender_t', descKey: 'ach_web_defender_d' },
};

export function achievementMeta(key: string, lang: Lang, t: (k: string) => string) {
  const meta = ACHIEVEMENTS[key];
  if (!meta) return null;
  return { emoji: meta.emoji, title: t(meta.titleKey), desc: t(meta.descKey) };
}