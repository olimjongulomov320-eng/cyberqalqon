import type { Lang } from './i18n';

/** Russian picks one of three noun forms by the number: 1 вопрос, 2-4 вопроса,
 *  5+ вопросов (11-14 always take the third). Uzbek keeps the singular after a
 *  number ("4 savol"), so it has one form. */
export function ruForm(n: number, [one, few, many]: readonly [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

/** "4 вопроса" / "4 savol". */
export function questionCount(n: number, lang: Lang): string {
  return `${n} ${lang === 'ru' ? ruForm(n, ['вопрос', 'вопроса', 'вопросов']) : 'savol'}`;
}

/** "6 dars qoldi" / "Осталось 6 уроков": what still stands between the
 *  learner and a locked assessment. */
export function lessonsLeft(n: number, lang: Lang): string {
  return lang === 'ru'
    ? `Осталось ${n} ${ruForm(n, ['урок', 'урока', 'уроков'])}`
    : `${n} dars qoldi`;
}
