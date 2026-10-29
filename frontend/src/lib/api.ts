import { performFetch, isAbortError, REQUEST_TIMEOUT_MS } from './http';
import { createInFlight } from './inflight';
import type { DomainSkillStat, SkillTrend } from './skills';

const BASE = process.env.NEXT_PUBLIC_API_URL + '/v1';

/** Fired on `window` when an authenticated request is answered with 401. */
export const UNAUTHORIZED_EVENT = 'cq:unauthorized';

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
  /** True when the request exceeded the client deadline. The server may or may
   *  not have processed it, so callers must retry explicitly, never silently. */
  get isTimeout() {
    return this.code === 'TIMEOUT';
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cq_token');
}

async function rawRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await performFetch(
      fetch,
      BASE + path,
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      },
      REQUEST_TIMEOUT_MS
    );
  } catch (err) {
    if (isAbortError(err)) {
      // We hit our own deadline. We cannot tell a waking host from a dead one,
      // so the copy stays honest ("did not respond") rather than guessing.
      throw new ApiError('Request timed out', 'TIMEOUT');
    }
    throw new ApiError('Network unreachable', 'NETWORK');
  }

  // 204 and empty bodies are legitimate; do not force them through JSON.parse.
  const text = await res.text();
  const data = text ? safeParse(text) : {};

  if (!res.ok) {
    // The server rejected our token (expired or invalid). Tell the app shell so
    // it can sign the user out cleanly; a network failure never reaches here.
    if (res.status === 401 && token && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(
      (data as ErrorBody)?.error?.message ?? `Request failed (${res.status})`,
      (data as ErrorBody)?.error?.code ?? 'UNKNOWN',
      res.status
    );
  }
  return data as T;
}

// Identical mutations fired concurrently (double taps, racing effects) share a
// single request. GET/HEAD are left alone: they are safe and often legitimately
// repeated with different cache timing.
const inFlight = createInFlight();

function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') return rawRequest<T>(path, options);

  const key = `${method} ${path} ${typeof options.body === 'string' ? options.body : ''}`;
  return inFlight(key, () => rawRequest<T>(path, options));
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

/** Ask for a password-reset email. Always succeeds for well-formed input. */
export function authForgot(email: string) {
  return req<{ ok: true }>('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) });
}

export function authReset(token: string, password: string) {
  return req<{ ok: true }>('/auth/reset', { method: 'POST', body: JSON.stringify({ token, password }) });
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

/**
 * Level-2 hint for one exercise. Records no attempt, awards no XP. The server
 * derives a partial narrowing from the stored answer — the full answer never
 * travels in this payload.
 */
export function fetchHint(slug: string, exerciseId: string) {
  return req<HintResult>(`/modules/${encodeURIComponent(slug)}/hint`, {
    method: 'POST',
    body: JSON.stringify({ exercise_id: exerciseId }),
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

// ── Problems (answer-grading arena over the existing curriculum) ──────────────
export function fetchProblems(params: {
  lang: string;
  domain?: string;
  track?: string;
  difficulty?: Difficulty;
  type?: ExerciseType;
  status?: ProblemStatus;
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const q = new URLSearchParams({ lang: params.lang });
  if (params.domain) q.set('domain', params.domain);
  if (params.track) q.set('track', params.track);
  if (params.difficulty) q.set('difficulty', params.difficulty);
  if (params.type) q.set('type', params.type);
  if (params.status) q.set('status', params.status);
  if (params.q) q.set('q', params.q);
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.offset != null) q.set('offset', String(params.offset));
  return req<ProblemsPayload>(`/problems?${q}`);
}

/** One problem, answers stripped. Grading still goes through checkAnswer. */
export function fetchProblem(moduleSlug: string, exerciseId: string, lang: string) {
  return req<{ problem: ProblemDetail }>(
    `/problems/${encodeURIComponent(moduleSlug)}/${encodeURIComponent(exerciseId)}?lang=${lang}`
  );
}

// ── Review ────────────────────────────────────────────────────────────────────
export function fetchReview(lang: string) {
  return req<ReviewPayload>(`/review?lang=${lang}`);
}

export function submitReview(
  body: {
    module_slug: string;
    answers: { id: string; value: AnswerValue }[];
    /** Stable per-attempt key, reused on retry so the server dedupes. */
    idempotency_key?: string;
  },
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
  patch: Partial<Pick<User, 'lang' | 'low_bandwidth_mode' | 'display_name' | 'avatar_emoji' | 'daily_goal_xp' | 'show_on_leaderboard'>>
) {
  return req<User>('/users/me', { method: 'PATCH', body: JSON.stringify(patch) });
}

/** Permanently delete the signed-in account (password accounts must confirm). */
export function deleteAccount(password: string) {
  return req<Record<string, never>>('/users/me', { method: 'DELETE', body: JSON.stringify({ password }) });
}

export function fetchStats(lang: string) {
  return req<StatsPayload>(`/users/me/stats?lang=${lang}`);
}

export function fetchMyProgress() {
  return req<{ progress: ProgressRow[] }>('/users/me/progress');
}

/** Paged graded-attempt timeline. `result` narrows to one verdict. */
export function fetchAttempts(params: {
  lang: string;
  limit?: number;
  offset?: number;
  result?: 'correct' | 'wrong';
}) {
  const q = new URLSearchParams({ lang: params.lang });
  if (params.limit) q.set('limit', String(params.limit));
  if (params.offset) q.set('offset', String(params.offset));
  if (params.result) q.set('result', params.result);
  return req<AttemptsPayload>(`/users/me/attempts?${q.toString()}`);
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
  show_on_leaderboard?: boolean;
}

/** What the server reveals AFTER grading — never on fetch. */
export interface Reveal {
  answer?: string;
  answers?: string[];
  match_answer?: Record<string, string>;
  order?: string[];
}

export type ExerciseType = 'mc' | 'tf' | 'multi' | 'match' | 'order' | 'input';

/** Derived from the module's position inside its domain — see backend/lib/difficulty.js. */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/** Per-learner state for one exercise, from the `mistakes` aggregate. */
export type ProblemStatus = 'new' | 'attempted' | 'solved';

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
 *  `explain` is absent on fetch; it arrives with the graded /check result.
 *  `hint` is optional, bilingual guidance that does not reveal the answer. */
export type Exercise =
  | { id: string; type: 'mc' | 'multi'; q: string; explain?: string; hint?: string; code?: string; options: ChoiceOption[] }
  | { id: string; type: 'tf'; q: string; explain?: string; hint?: string; code?: string }
  | { id: string; type: 'match'; q: string; explain?: string; hint?: string; code?: string; pairs: MatchPair[] }
  | { id: string; type: 'order'; q: string; explain?: string; hint?: string; code?: string; items: OrderItem[] }
  | { id: string; type: 'input'; q: string; explain?: string; hint?: string; code?: string };

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
  difficulty: Difficulty;
  /** The module whose completion unlocks this one. Null unless `state` is locked. */
  prerequisite: { slug: string; title: string } | null;
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
  /** Every published domain with this learner's real accuracy + completion. */
  domains: DomainSkillStat[];
  /** Last-7-days vs previous-7-days accuracy; null when either window is thin. */
  trend: SkillTrend | null;
}

/** Level-2 hint payload. `available:false` means no honest narrowing exists. */
export type HintResult =
  | { available: false }
  | { available: true; kind: 'eliminate'; ids: string[] }
  | { available: true; kind: 'count'; count: number }
  | { available: true; kind: 'first'; id: string }
  | { available: true; kind: 'pair'; left_id: string; right_id: string }
  | { available: true; kind: 'shape'; words: number; length: 'short' | 'medium' | 'long' };

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

/** One graded attempt from the learner's own submission history. */
export interface AttemptRow {
  id: number;
  exercise_id: string;
  correct: boolean;
  answered_at: string;
  /** '' when the exercise text is missing from the curriculum record. */
  question: string;
  module_slug: string;
  module_title: string;
  domain_slug: string | null;
  domain_icon: string | null;
}

export interface AttemptsPayload {
  attempts: AttemptRow[];
  /** Row count matching the requested `result` filter. */
  total: number;
  /** Whole-history split — independent of the filter, for the summary line. */
  correct_total: number;
  wrong_total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/** A problem-arena row: one real curriculum exercise plus derived metadata. */
export interface ProblemSummary {
  module_slug: string;
  exercise_id: string;
  type: ExerciseType;
  question: string;
  domain_slug: string;
  domain_title: string;
  domain_icon: string;
  track_slug: string | null;
  path_slug: string;
  path_title: string;
  module_title: string;
  module_kind: 'lesson' | 'checkpoint';
  difficulty: Difficulty;
  status: ProblemStatus;
  solved: boolean;
  attempted: boolean;
}

export interface ProblemDetail {
  module_slug: string;
  exercise_id: string;
  type: ExerciseType;
  difficulty: Difficulty;
  domain_slug: string;
  domain_title: string;
  domain_icon: string;
  path_slug: string;
  path_title: string;
  module_title: string;
  module_kind: 'lesson' | 'checkpoint';
  status: ProblemStatus;
  solved: boolean;
  attempted: boolean;
  exercise: Exercise;
}

export interface ProblemsPayload {
  problems: ProblemSummary[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  catalogue_total: number;
  solved_total: number;
  facets: {
    domains: { slug: string; title: string; icon: string; count: number }[];
    tracks: { slug: string; title: string; icon: string; count: number }[];
    difficulties: { key: Difficulty; count: number }[];
    types: { key: ExerciseType; count: number }[];
    /** Empty when signed out — status is per-learner, never global. */
    statuses: { key: ProblemStatus; count: number }[];
  };
}

// ── Learning tracks ───────────────────────────────────────────────────────────
export type MasteryState = 'not_started' | 'practising' | 'mastered';

export interface TrackModule {
  slug: string;
  title: string;
  kind: 'lesson' | 'checkpoint';
  xp_reward: number;
  exercise_count: number;
  completed: boolean;
  needs_review: boolean;
}

export interface Track {
  slug: string;
  icon: string;
  order: number;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  prerequisites_type: 'recommended';
  needs_review: boolean;
  completion: { rule: 'all_modules'; completed: number; total: number; done: boolean };
  exercise_total: number;
  /** null when signed out. Computed on the server from first attempts. */
  mastery: { state: MasteryState; distinct: number; correct: number; accuracy: number | null; needed: number } | null;
  next: { slug: string; title: string; kind: 'lesson' | 'checkpoint' } | null;
  modules: TrackModule[];
}

export interface TracksPayload {
  tracks: Track[];
  mastery_rule: { min_exercises: number; min_accuracy: number; basis: 'first_attempt_per_exercise' };
}

export function fetchTracks(lang: string) {
  return req<TracksPayload>(`/tracks?lang=${lang}`);
}

// ── Scored assessments (server draws, times and grades) ───────────────────────
export interface AssessmentSummary {
  slug: string;
  track_slug: string;
  icon: string;
  title: string;
  question_count: number;
  pass_mark: number;
  time_limit_minutes: number;
  xp: number;
  needs_review: boolean;
  lessons_required: number;
  lessons_completed: number;
  eligible: boolean;
  in_progress: { attempt_id: string; expires_at: string } | null;
  attempts: number;
  best_percent: number | null;
  passed: boolean;
  last_at: string | null;
}

export type AssessmentQuestion = Exercise & { n: number };

export interface AssessmentPaper {
  attempt_id: string;
  assessment: string;
  title: string;
  expires_at: string;
  pass_mark: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentResultItem {
  n: number;
  module_slug: string;
  question: string;
  answered: boolean;
  correct: boolean;
  explain: string;
  reveal: Reveal;
  exercise: AssessmentQuestion | null;
}

export interface AssessmentResult {
  attempt_id: string;
  assessment: string;
  status: 'submitted';
  score: number;
  total: number;
  percent: number;
  pass_mark: number;
  passed: boolean;
  per_module: Record<string, { correct: number; total: number }>;
  items: AssessmentResultItem[];
  replayed?: boolean;
  xp_earned?: number;
  new_achievements?: string[];
}

export function fetchAssessments(lang: string) {
  return req<{ assessments: AssessmentSummary[] }>(`/assessments?lang=${lang}`);
}

export function startAssessment(slug: string, lang: string) {
  return req<AssessmentPaper>(`/assessments/${encodeURIComponent(slug)}/start?lang=${lang}`, {
    method: 'POST',
    body: '{}',
  });
}

export function fetchAttempt(id: string, lang: string) {
  return req<AssessmentPaper | AssessmentResult>(`/assessments/attempts/${encodeURIComponent(id)}?lang=${lang}`);
}

export function submitAssessment(id: string, answers: { n: number; value: AnswerValue }[], lang: string) {
  return req<AssessmentResult>(`/assessments/attempts/${encodeURIComponent(id)}/submit?lang=${lang}`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

// ── Coding challenges (run in the browser; results are self-reported) ─────────
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'new' | 'attempted' | 'solved';

export interface ChallengeSummary {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  points: number;
  tags: string[];
  language: 'python';
  module: string;
  needs_review: boolean;
  tests_total: number;
  status: ChallengeStatus;
}

export interface ChallengeList {
  challenges: ChallengeSummary[];
  total: number;
  facets: { difficulties: { key: ChallengeDifficulty; count: number }[]; tags: string[] };
  /** null when signed out. Self-reported, so `verified` is always false. */
  summary: { solved: number; total: number; points: number; verified: false } | null;
}

export interface ChallengeDetail extends Omit<ChallengeSummary, 'status'> {
  statement: string;
  constraints: string;
  starter: string;
  entry: string;
  examples: { args: unknown[]; expected: unknown }[];
  tests: { args: unknown[]; expected: unknown; hidden: boolean }[];
}

export function fetchChallenges(params: {
  lang: string;
  difficulty?: ChallengeDifficulty;
  tag?: string;
  status?: ChallengeStatus;
  q?: string;
}) {
  const q = new URLSearchParams({ lang: params.lang });
  if (params.difficulty) q.set('difficulty', params.difficulty);
  if (params.tag) q.set('tag', params.tag);
  if (params.status) q.set('status', params.status);
  if (params.q) q.set('q', params.q);
  return req<ChallengeList>(`/challenges?${q}`);
}

export function fetchChallenge(slug: string, lang: string) {
  return req<{
    challenge: ChallengeDetail;
    progress: { status: ChallengeStatus; best_passed: number; attempts: number } | null;
  }>(`/challenges/${encodeURIComponent(slug)}?lang=${lang}`);
}

export function submitChallenge(slug: string, body: { passed: number; total: number; code: string }) {
  return req<{ solved: boolean; best_passed: number; attempts: number; total: number; points: number; verified: false }>(
    `/challenges/${encodeURIComponent(slug)}/submit`,
    { method: 'POST', body: JSON.stringify(body) }
  );
}
