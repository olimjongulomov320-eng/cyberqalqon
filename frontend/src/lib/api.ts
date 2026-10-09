const BASE = process.env.NEXT_PUBLIC_API_URL + '/v1';

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code = 'UNKNOWN', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
  /** True when the request never reached the server, so a retry may work. */
  get isOffline() {
    return this.code === 'NETWORK';
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cq_token');
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Network unreachable', 'NETWORK');
  }

  // 204 and empty bodies are legitimate; do not force them through JSON.parse.
  const text = await res.text();
  const data = text ? safeParse(text) : {};

  if (!res.ok) {
    throw new ApiError(
      (data as ErrorBody)?.error?.message ?? `Request failed (${res.status})`,
      (data as ErrorBody)?.error?.code ?? 'UNKNOWN',
      res.status
    );
  }
  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export function authRegister(body: {
  username: string;
  email: string;
  password: string;
  display_name: string;
  lang: string;
}) {
  return req<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function authLogin(body: { identifier: string; password: string }) {
  return req<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Learning map ──────────────────────────────────────────────────────────────
export function fetchPaths(lang: string) {
  return req<{ paths: LearningPath[]; continue: ContinueTarget | null }>(
    `/paths?lang=${lang}`
  );
}

// ── Modules / lessons ─────────────────────────────────────────────────────────
export function fetchModules(lang: string, domain?: string) {
  const q = new URLSearchParams({ lang });
  if (domain) q.set('domain', domain);
  return req<{ modules: ModuleSummary[] }>(`/modules?${q}`);
}

export function fetchModule(slug: string, lang: string) {
  return req<{ module: ModuleDetail; exercises: Exercise[]; progress: ModuleProgress | null }>(
    `/modules/${encodeURIComponent(slug)}?lang=${lang}`
  );
}

/** Grade one exercise. Returns correctness + revealed answer + live totals. */
export function checkAnswer(
  slug: string,
  body: { exercise_id: string; value: AnswerValue },
  lang: string
) {
  return req<CheckResult>(`/modules/${encodeURIComponent(slug)}/check?lang=${lang}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Grade one exercise STATELESSLY (hearts practice). Never records attempts or XP. */
export function practiceAnswer(
  slug: string,
  body: { exercise_id: string; value: AnswerValue },
  lang: string
) {
  return req<{ correct: boolean; explain: string; reveal: Reveal }>(
    `/modules/${encodeURIComponent(slug)}/practice?lang=${lang}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

/** Finish the lesson. Server re-grades everything; response drives the celebration. */
export function completeModule(
  slug: string,
  body: { answers: { id: string; value: AnswerValue }[] },
  lang: string
) {
  return req<CompleteResult>(`/modules/${encodeURIComponent(slug)}/complete?lang=${lang}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Review ────────────────────────────────────────────────────────────────────
export function fetchReview(lang: string) {
  return req<ReviewPayload>(`/review?lang=${lang}`);
}

export function submitReview(
  body: { module_slug: string; answers: { id: string; value: AnswerValue }[] },
  lang: string
) {
  return req<ReviewResult>(`/review/submit?lang=${lang}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export function fetchLeaderboard(period: 'week' | 'all' = 'week', limit = 50) {
  return req<{ leaderboard: LeaderboardEntry[]; my_rank: number | null; period: string }>(
    `/leaderboard?period=${period}&limit=${limit}`
  );
}

// ── Me ────────────────────────────────────────────────────────────────────────
export function fetchMe() {
  return req<User>('/users/me');
}

export function updateMe(
  patch: Partial<Pick<User, 'lang' | 'low_bandwidth_mode' | 'display_name' | 'avatar_emoji' | 'daily_goal_xp'>>
) {
  return req<User>('/users/me', { method: 'PATCH', body: JSON.stringify(patch) });
}

export function fetchStats(lang: string) {
  return req<StatsPayload>(`/users/me/stats?lang=${lang}`);
}

export function fetchMyProgress() {
  return req<{ progress: ProgressRow[] }>('/users/me/progress');
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  display_name: string;
  avatar_emoji: string;
  total_xp: number;
  lang: string;
  low_bandwidth_mode: boolean;
  email: string;
  modules_completed?: number;
  current_streak?: number;
  longest_streak?: number;
  daily_goal_xp?: number;
}

/** What the server reveals AFTER grading — never on fetch. */
export interface Reveal {
  answer?: string;
  answers?: string[];
  match_answer?: Record<string, string>;
  order?: string[];
}

export type ExerciseType = 'mc' | 'tf' | 'multi' | 'match' | 'order' | 'input';

export type AnswerValue = string | string[] | Record<string, string> | null;

export interface ChoiceOption {
  id: string;
  text: string;
}
export interface MatchPair {
  id: string;
  left: string;
  right: string;
}
export interface OrderItem {
  id: string;
  text: string;
}

/** An exercise as delivered to the client — answers stripped, text localised.
 *  `explain` is absent on fetch; it arrives with the graded /check result. */
export type Exercise =
  | { id: string; type: 'mc' | 'multi'; q: string; explain?: string; code?: string; options: ChoiceOption[] }
  | { id: string; type: 'tf'; q: string; explain?: string; code?: string }
  | { id: string; type: 'match'; q: string; explain?: string; code?: string; pairs: MatchPair[] }
  | { id: string; type: 'order'; q: string; explain?: string; code?: string; items: OrderItem[] }
  | { id: string; type: 'input'; q: string; explain?: string; code?: string };

export interface ModuleSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  order_index: number;
  xp_reward: number;
  completed: boolean;
}

export interface ModuleDetail {
  slug: string;
  kind: 'lesson' | 'checkpoint';
  xp_reward: number;
  title: string;
  content: string;
  domain_slug: string | null;
  domain_icon: string | null;
  domain_title: string | null;
}

export interface ModuleProgress {
  is_completed: boolean;
  attempts: number;
}

export type ModuleState = 'done' | 'current' | 'open' | 'locked';

export interface PathModule {
  slug: string;
  title: string;
  kind: 'lesson' | 'checkpoint';
  xp_reward: number;
  exercise_count: number;
  state: ModuleState;
}

export interface Domain {
  slug: string;
  icon: string;
  title: string;
  description: string;
  completed: number;
  total: number;
  modules: PathModule[];
}

export interface LearningPath {
  slug: string;
  icon: string;
  title: string;
  description: string;
  domains: Domain[];
}

export interface ContinueTarget {
  slug: string;
  title: string;
  kind: 'lesson' | 'checkpoint';
  domain_slug: string;
  domain_title: string;
  domain_icon: string;
  path_slug: string;
  position: number;
  total: number;
}

/** Shared totals the lesson UI renders live after every graded step. */
export interface LiveTotals {
  total_xp: number;
  streak: number;
  longest_streak: number;
  daily_xp: number;
  daily_goal: number;
}

export interface CheckResult extends LiveTotals {
  correct: boolean;
  xp_earned: number;
  explain: string;
  reveal: Reveal;
  new_achievements: string[];
}

export interface CompleteResult extends LiveTotals {
  results: (Reveal & { id: string; correct: boolean; explain: string })[];
  accuracy: number;
  xp_earned: number;
  new_achievements: string[];
  is_checkpoint: boolean;
  perfect: boolean;
  first_time: boolean;
  next_module_slug: string | null;
  next_module_title: string | null;
}

export interface TopicStat {
  slug: string;
  icon: string;
  title: string;
  wrong: number;
  accuracy: number;
  correct?: number;
}

export interface ReviewPayload {
  topics: TopicStat[];
  session: {
    module_slug: string;
    module_title: string;
    exercises: Exercise[];
  } | null;
}

export interface ReviewResult extends LiveTotals {
  results: (Reveal & { id: string; correct: boolean; explain: string })[];
  xp_earned: number;
  new_achievements: string[];
}

export interface StatsPayload {
  profile: User;
  daily_xp: number;
  week_xp: number;
  accuracy: number | null;
  answers_correct: number;
  answers_wrong: number;
  achievements: { key: string; unlocked_at: string }[];
  strong_topics: TopicStat[];
  weak_topics: TopicStat[];
  recent: { kind: string; amount: number; created_at: string; module_title: string | null }[];
}

export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  display_name: string;
  avatar_emoji: string;
  total_xp: number;
  modules_completed: number;
}

export interface ProgressRow {
  module_slug: string;
  category: string;
  order_index: number;
  is_completed: boolean;
  xp_earned: number;
  attempts: number;
  completed_at: string | null;
}
