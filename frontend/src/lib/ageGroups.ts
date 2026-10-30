/**
 * Age groups, mirrored from backend/curriculum/ageGroups.js (a test compares
 * them). A group is a self-selected band, never a date of birth. It decides
 * which learning path comes first; nobody is locked out of the others.
 *
 * Minors are never shown on the public leaderboard, and children under 13 do
 * not get the code challenges - both enforced by the API, hidden here so nobody
 * is offered something that will be refused.
 */
import type { Lang } from './i18n';

export const AGE_SLUGS = ['1-4', '5-7', '8-12', '13-17', '18+'] as const;
export type AgeGroup = (typeof AGE_SLUGS)[number];
export const DEFAULT_AGE: AgeGroup = '18+';

type Text = Record<Lang, string>;

export interface AgeGroupInfo {
  slug: AgeGroup;
  icon: string;
  minor: boolean;
  under13: boolean;
  /** Who the lessons address: the parent of a toddler, a child, a teen, an adult. */
  audience: 'parent' | 'child' | 'teen' | 'adult';
  title: Text;
  who: Text;
  description: Text;
}

export const AGE_GROUPS: AgeGroupInfo[] = [
  {
    slug: '1-4', icon: 'baby', minor: true, under13: true, audience: 'parent',
    title: { uz: '1-4 yosh', ru: '1-4 года' },
    who: { uz: 'Ota-onalar uchun', ru: 'Для родителей' },
    description: {
      uz: 'Kichkintoy bilan raqamli dunyoga xavfsiz qadam: ekran vaqti, qurilma va rasmlar.',
      ru: 'Безопасные первые шаги малыша в цифровом мире: экран, устройство и фотографии.',
    },
  },
  {
    slug: '5-7', icon: 'smiley', minor: true, under13: true, audience: 'child',
    title: { uz: '5-7 yosh', ru: '5-7 лет' },
    who: { uz: 'Kattalar bilan birga', ru: 'Вместе со взрослым' },
    description: {
      uz: 'Qisqa va oddiy qoidalar: maxfiy so‘z, kattalardan so‘rash va mehribonlik.',
      ru: 'Короткие простые правила: секретное слово, спросить взрослого и быть добрым.',
    },
  },
  {
    slug: '8-12', icon: 'backpack', minor: true, under13: true, audience: 'child',
    title: { uz: '8-12 yosh', ru: '8-12 лет' },
    who: { uz: 'Maktab o‘quvchisi', ru: 'Школьник' },
    description: {
      uz: 'Parollar, yolg‘on xabarlar, o‘yin chatlari va internetda o‘zini himoya qilish.',
      ru: 'Пароли, обманные сообщения, игровые чаты и как защитить себя в интернете.',
    },
  },
  {
    slug: '13-17', icon: 'student', minor: true, under13: false, audience: 'teen',
    title: { uz: '13-17 yosh', ru: '13-17 лет' },
    who: { uz: 'O‘smir', ru: 'Подросток' },
    description: {
      uz: 'Raqamli iz, hisobni himoya qilish, firibgarlik va bosimga qarshi harakatlar.',
      ru: 'Цифровой след, защита аккаунтов, мошенничество и что делать при давлении.',
    },
  },
  {
    slug: '18+', icon: 'shield-check', minor: false, under13: false, audience: 'adult',
    title: { uz: '18+ yosh', ru: '18+ лет' },
    who: { uz: 'Kattalar', ru: 'Взрослые' },
    description: {
      uz: 'To‘liq kiber xavfsizlik kursi: asoslardan etik testgacha.',
      ru: 'Полный курс кибербезопасности: от основ до этичного тестирования.',
    },
  },
];

export const isAgeGroup = (v: unknown): v is AgeGroup => typeof v === 'string' && (AGE_SLUGS as readonly string[]).includes(v);
export const ageInfo = (slug: string | null | undefined): AgeGroupInfo =>
  AGE_GROUPS.find(g => g.slug === slug) ?? AGE_GROUPS[AGE_GROUPS.length - 1];
export const isMinor = (slug: string | null | undefined) => AGE_GROUPS.find(g => g.slug === slug)?.minor === true;
export const isUnder13 = (slug: string | null | undefined) => AGE_GROUPS.find(g => g.slug === slug)?.under13 === true;

/**
 * The paths to offer for an age group: that group's paths, or everything when
 * the learner asked to see all ages. Falls back to everything if the group has
 * no path, so a page is never empty.
 */
export function scopePaths<T extends { age_group?: string }>(paths: T[], age: AgeGroup | null, showAll: boolean): T[] {
  if (showAll) return paths;
  const mine = paths.filter(p => (p.age_group ?? DEFAULT_AGE) === (age ?? DEFAULT_AGE));
  return mine.length ? mine : paths;
}
