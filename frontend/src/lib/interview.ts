import type { InterviewDims, InterviewRoundKind, InterviewVerdict } from './api';

/** "{n} ta savol" + {n: 6} -> "6 ta savol". */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export const ROUND_LABEL: Record<InterviewRoundKind, string> = {
  concepts: 'ivRoundConcepts',
  scenario: 'ivRoundScenario',
  coding: 'ivRoundCoding',
};

export const VERDICT: Record<InterviewVerdict, { label: string; long: string; tone: string; bar: string }> = {
  ready: { label: 'ivVerdictReady', long: 'ivVerdictReadyLong', tone: 'text-success', bar: 'bg-success' },
  close: { label: 'ivVerdictClose', long: 'ivVerdictCloseLong', tone: 'text-warning', bar: 'bg-warning' },
  notyet: { label: 'ivVerdictNotyet', long: 'ivVerdictNotyetLong', tone: 'text-danger', bar: 'bg-danger' },
};

export const DIMS: { key: keyof InterviewDims; label: string; hint: string }[] = [
  { key: 'knowledge', label: 'ivDimKnowledge', hint: 'ivDimKnowledgeHint' },
  { key: 'analysis', label: 'ivDimAnalysis', hint: 'ivDimAnalysisHint' },
  { key: 'practical', label: 'ivDimPractical', hint: 'ivDimPracticalHint' },
  { key: 'time', label: 'ivDimTime', hint: 'ivDimTimeHint' },
];

/** Colour for a 0-100 score, in step with the verdict bands. */
export const scoreTone = (n: number) => (n >= 80 ? 'bg-success' : n >= 60 ? 'bg-warning' : 'bg-danger');
export const scoreText = (n: number) => (n >= 80 ? 'text-success' : n >= 60 ? 'text-warning' : 'text-danger');

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const MONTHS: Record<'uz' | 'ru', string[]> = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
};

/** "16-noyabr, 09:32" / "16 ноября, 09:32". Built by hand: browsers ship no Uzbek month names. */
export function when(iso: string, lang: string): string {
  const d = new Date(iso);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const m = MONTHS[lang === 'ru' ? 'ru' : 'uz'][d.getMonth()];
  return lang === 'ru' ? `${d.getDate()} ${m}, ${hm}` : `${d.getDate()}-${m}, ${hm}`;
}
