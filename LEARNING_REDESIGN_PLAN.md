# CyberQalqon — Learning Experience Redesign Plan

_Created before implementation. Live HackerRank references and the full local
codebase were inspected first; findings below come from those sources, not from
assumptions._

---

## 0. Reference research (what was actually inspected)

Two research passes were run against the live HackerRank property.

**Successfully read:**

- <https://www.hackerrank.com/learn>
- <https://www.hackerrank.com/skills-directory> (+ `python_basic`, `react_basic`,
  `cissp`, `problem_solving_advanced` detail pages)
- <https://www.hackerrank.com/challenges/two-strings/problem>,
  <https://www.hackerrank.com/challenges/java-if-else/problem>,
  <https://www.hackerrank.com/challenges/tutorial-intro/problem>
- <https://www.hackerrank.com/domains/algorithms>, `/domains/data-structures`,
  `/domains/security`
- <https://www.hackerrank.com/skills-verification>, <https://www.hackerrank.com/scoring>
- SkillUp support docs: get-started-with-learn, get-started-with-certify,
  skillup licenses, April 2025 release notes, "understanding errors in
  post-assessment reports", "defining test cases", "hidden test cases".

**Could not be inspected (reported as a limitation, not guessed):**

- Any authenticated learner screen (live lesson pages, live path pages, mobile
  layout of the workspace). The accessible pages are marketing/catalogue pages;
  signed-in Learn/SkillUp screens required a login we do not have.
- <https://www.hackerrank.com/pricing> redirected to `/work/pricing` and was
  blocked by a cookie wall — no pricing/entitlement facts were taken from it.

**Product principles extracted (learning-relevant only — HackerRank also runs a
hiring/assessment business, which is explicitly out of scope):**

1. **Two complementary discovery entry points** — a skill catalogue (domain →
   skill → level: Basic/Intermediate/Advanced, each with named *key
   competencies*) and a guided track. Discovery shows the capability map
   before the learner enters a course.
2. **Track structure** — `skill → proficiency track (Foundational /
   Intermediate / Expert) → lesson → challenge`. Challenges are untimed and
   reattemptable; finishing a track earns a badge that is *not* the same thing
   as a measured certification.
3. **Task contract legibility** — problem statement, task, constraints,
   samples, explanation, difficulty and tags are all visible up front;
   sample cases are public, hidden cases are not.
4. **Failure must be actionable** — distinguish failed check / runtime error /
   timeout, and always give a next step (revise and retry).
5. **Gated solutions** — editorial/solutions are a separate reveal decision,
   and HackerRank documents that *unlocking the editorial then solving* removes
   the score from track progress. Implication for us: answer disclosure is a
   scored decision, not a default.
6. **Difficulty + domain as the two practice axes** — Easy/Medium/Hard plus
   subdomain taxonomy; a guided sequence (warm-up → core topics) sits on top of
   free filtering.
7. **Proficiency ≠ points** — HackerRank separates practice badges/points,
   skill-level proficiency (Foundational/Intermediate/Expert, plus a
   "Beginner" bucket for a failed proficiency assessment) and role
   certifications. XP/stars are activity; proficiency is demonstrated
   performance.
8. **No evidence found** of spaced-repetition or adaptive review in the public
   community product — review was not invented on that basis.

No HackerRank branding, logo, proprietary text, exact page layout or visual
asset is used anywhere in this redesign.

---

## 1. Audit of the current platform (verified in code, not in docs)

### 1.1 Stack and constraints

| Piece | Fact (verified) |
|---|---|
| Frontend | Next.js 14 App Router, **`output: 'export'`** static export to GitHub Pages (`frontend/next.config.js`), Tailwind, framer-motion, react-markdown |
| Backend | Express on Render (`backend/index.js`), Postgres, JWT auth, helmet, rate limits |
| Dynamic routes | Only `/modules/[slug]` — enumerated at build time (`generateStaticParams` calls `GET /v1/modules`) |
| i18n | `frontend/src/lib/i18n.ts`, `uz` + `ru` dictionaries, key-parity enforced by `frontend/src/lib/i18n.test.ts` |
| Tests | Frontend: `node --test "src/**/*.test.ts"` (6 files). Backend: `node --test` (6 files, 1 DB-gated and skipped without `TEST_DATABASE_URL`) |
| Curriculum | 2 paths · 12 domains · 80 modules · 329 exercises, 6 types (`mc, tf, match, multi, input, order`), every exercise has bilingual `q` + `explain` |

### 1.2 Routes and navigation (current)

- `/` landing (signed out) / gamified dashboard (signed in)
- `/learn` learning path, `/modules/[slug]` lesson runner
- `/practice` review session, `/problems` Problem Arena
- `/leaderboard`, `/profile`, `/auth`, `/privacy`, `/terms`
- Nav: `NavBar` (top, 6 links, `/problems` hidden below `lg`) + `BottomNav`
  (5 tabs, `sm:hidden` — **no Arena tab on mobile**)

### 1.3 What already works and must be preserved

- Auth (register/login/JWT/bcrypt), `optionalAuth` on public reads.
- `GET /paths` — full tree with per-module state `done|current|open|locked`,
  derived difficulty (`backend/lib/difficulty.js`), named prerequisite, and a
  `continue` target.
- `POST /modules/:slug/check` (records attempt + XP, returns `reveal` +
  `explain`), `/practice` (stateless), `/complete` (server re-grades, XP once,
  next-module pointer), idempotent `POST /review/submit`.
- Problem Arena: faceted filters over the **real** 329 exercises, per-learner
  status, split-pane solver, mission brief, `AnswerFeedback`.
- `GET /users/me/stats` (weak/strong topics, achievements, recent),
  `/me/progress`, `/me/attempts` (paged, filterable attempt history).
- Hearts, streaks, XP, levels, 12 achievements, weekly + all-time leaderboards.
- 6 exercise renderers, keyboard answering (1–9, Enter), focus-trapped exit
  dialog, `aria-live` feedback, reduced-motion support.

### 1.4 The actual problems (why this redesign)

| # | Problem | Evidence |
|---|---|---|
| P1 | **Card-heavy learning navigation.** `/learn` renders a `rounded-2xl` card per domain, and inside every card every module is a bordered row-card: ~92 cards are painted at once on first paint; nothing is condensed, filtered or found by search. | `frontend/src/app/learn/page.tsx` (`DomainRow`, `ModuleRow`) |
| P2 | **No discovery layer.** No path switch, no search, no status filter, no skill-level entry: the learner scrolls one long page to find a topic. The 6-stage journey (discover→master) is not visible anywhere. | same file; `NavBar`/`BottomNav` |
| P3 | **Lesson is a single narrow column with no sequence context.** During an exercise the learner cannot see where they are in the domain sequence, what comes next, or revisit the lesson text without exiting. | `lesson-client.tsx` |
| P4 | **No hints.** Nothing in the curriculum or API exposes hints; a stuck learner gets either nothing or the full reveal after a wrong answer. | `grep -rn "hint" backend/curriculum/*` → 0 hits |
| P5 | **No retry in lesson or arena.** After a graded answer the arena locks the problem permanently for that visit (no "try again"), and the lesson moves on. | `problems/page.tsx` (`result ? …next…`), `lesson-client.tsx` |
| P6 | **Review is thin.** `/practice` shows weak domains + one generated session. It does not surface *which questions* were missed (the data exists in `exercise_attempts`), and there is no "ready for a harder challenge" signal or explained fallback. | `practice/page.tsx`, `routes/review.js` |
| P7 | **No mastery view.** `/profile` shows XP/streak/accuracy/achievements, but no per-skill proficiency, no completion per domain, no improvement-over-time measure — the brief's "don't confuse XP with mastery" case. | `profile/page.tsx`, `routes/users.js` |
| P8 | **Apply has no home.** Checkpoint modules (`kind: 'checkpoint'`, end-of-domain assessments) and advanced mixed practice exist in data but are not presented as a distinct "apply/assess" stage. | `curriculum/index.js`, `difficulty.js` |
| P9 | **Mobile can't reach the Arena directly** (`BottomNav` has no `/problems` tab; the top nav hides it below `lg`). | `BottomNav.tsx`, `NavBar.tsx` |
| P10 | Copy is occasionally promotional rather than instructional (`missionObjectiveBody` is generic). | `i18n.ts` |

Explicitly **out of scope for removal**: dashboard cards, leaderboard rows,
filter panels, achievement badges, history rows — these are legitimate tools or
data displays, not learning navigation. The redesign targets the *learning
surface*: `/learn`, `/modules/[slug]`, `/problems`, `/practice`, plus a mastery
section on `/profile`.

---

## 2. Proposed information architecture

The six stages are made explicit and each gets a real destination:

| Stage | Meaning in CyberQalqon | Home | Real data behind it |
|---|---|---|---|
| **01 Discover** | Explore skills, choose a path, see the capability map | `/learn` (directory) | `GET /paths` tree |
| **02 Learn** | Read a short lesson, answer comprehension checks | `/modules/[slug]` | module `content` + exercises |
| **03 Practice** | Drill by skill/difficulty with instant grading | `/problems` | `/v1/problems` facets + attempts |
| **04 Apply** | End-of-domain checkpoint assessments + advanced mixed sets | checkpoint module, reachable from every stage | `kind:'checkpoint'`, derived difficulty |
| **05 Review** | Revisit what you actually got wrong | `/practice` | `exercise_attempts`, `mistakes`, `/review` |
| **06 Master** | Skill proficiency from demonstrated performance | `/profile` (skill matrix) | per-domain accuracy + completion + trend |

### 2.1 `/learn` — Discover (rewritten)

- Slim **journey strip** (shared component) at the top: `01 Discover … 06
  Master`, current stage marked, other stages are real links.
- **Path switcher** (segmented control: Kiber xavfsizlik / IT asoslari) +
  **status filter chips** (All / In progress / Locked / Completed) + **search**
  over domain and module titles.
- **Skill directory**: one bordered container, domains as **dense rows**
  separated by dividers (not a card per domain). Each row: domain icon, title,
  description, `done/total`, a thin progress bar, difficulty of the current
  module, and an expand control.
- **Progressive disclosure**: expanding a domain reveals its module sequence as
  a compact numbered rail (state node + title + exercise count + XP +
  difficulty), not a stack of cards. The domain containing `continue` is open
  by default; `?domain=` deep-links an open domain.
- **Right rail (sticky, `lg`+; stacked on top on mobile)**: Continue target,
  Review recommendation (real `weak_topics`, with an honest empty state), next
  unlocked **checkpoint** (= Apply entry), and the Arena shortcut. Compact
  blocks, not decorative cards.

### 2.2 `/modules/[slug]` — Learn workspace

- Desktop: **split pane** — left context rail (sticky) + main challenge area.
  Rail = domain, position `n/m` in the domain sequence, the sibling sequence
  with real states (fetched from `/paths`), the lesson text ("Lesson notes",
  collapsible) and hearts/progress. Mobile: rail collapses above the task; the
  exercise, feedback and action row stay first-class.
- **Graduated hints** (new, see §3.2): `Hint 1` = strategy for the exercise
  type (client dictionary, no request); `Hint 2` = a server-derived narrowing
  that never contains the answer.
- Intro and celebration phases keep their current jobs (brief before, mistakes
  review + single clear next action after).

### 2.3 `/problems` — Practice workspace

- Deep links: `?domain=`, `?difficulty=`, `?status=`, `?module=`, `?exercise=`
  so Review/Profile recommendations land on a specific task or filtered set.
- Detail pane gains: **what counts as correct** (derived from the exercise
  type, real semantics), the **hint ladder**, and a **Try again** action that
  clears a graded result so the learner can re-attempt (server-side XP rules
  are unchanged: XP only on the first-ever correct answer).

### 2.4 `/practice` — Review hub

Sections, all data-backed with explicit fallbacks:

1. Recommended session (existing weak-module session).
2. **Missed questions** — last wrong attempts from `GET /users/me/attempts?result=wrong`,
   each linking to the arena solver for that exact exercise.
3. **Weak domains** — existing `topics` with accuracy and an arena link filtered
   to that domain.
4. **Ready for a harder challenge** — rule: a domain with ≥8 graded answers and
   ≥80% accuracy is suggested at `advanced` difficulty in the arena. The rule is
   written on screen; when no domain qualifies, the section says so instead of
   inventing one.

### 2.5 `/profile` — Master

- New **Skill matrix**: every published domain with modules completed/total,
  graded accuracy, and a proficiency label by a rule published in the UI:
  - `not started` — no modules completed and no graded answers;
  - `learning` — some modules completed or attempted, not all;
  - `needs practice` — all modules completed but accuracy < 80%;
  - `mastered` — all modules completed **and** accuracy ≥ 80%.
- **Improvement over time**: accuracy of the last 7 days vs the previous
  7 days (hidden with an honest message when either window has <5 answers).
- XP, streaks, achievements and submission history remain and stay labelled as
  activity, not mastery.

---

## 3. Implementation

### 3.1 Backend (additive only — no schema change, no migration)

| Change | Why it is necessary | File |
|---|---|---|
| `POST /v1/modules/:slug/hint` (auth, 30/min limiter) | The client must never hold answers; only the server can narrow an answer without revealing it. Level 2 hints are derived from the stored answer by a pure function. | **new** `backend/routes/hints.js`, **new** `backend/lib/hints.js`, mount in `backend/index.js` |
| `GET /users/me/stats` gains `domains[]` and `trend` | The mastery matrix and the trend line need per-domain completion+accuracy for *all* domains and a 7-day/7-day comparison; the endpoint currently returns only top-3 strong and top-3 weak topics. Additive fields — every existing consumer keeps working. | `backend/routes/users.js` |

Hint payload per type (level 2, **never the full answer**):

- `mc` → one incorrect option id to eliminate;
- `multi` → how many options must be selected;
- `order` → the correct **first** item id;
- `match` → one correct left→right pair;
- `input` → the shape of the answer (word count, character range);
- `tf` → `available:false` (with 2 options any narrowing *is* the answer), the
  UI then points the learner back to the lesson text.

### 3.2 Frontend

| Change | Files |
|---|---|
| Journey strip (shared, `stage` prop, real destinations, `aria-current`) | **new** `src/components/Journey.tsx`, **new** `src/lib/journey.ts` |
| Discover: directory + path switch + filters + search + rail | `src/app/learn/page.tsx` (rewrite), **new** `src/lib/directory.ts` (pure filtering/derivation) |
| Learn: split workspace, sibling rail, lesson notes, hint ladder | `src/app/modules/[slug]/lesson-client.tsx`, **new** `src/components/HintLadder.tsx` |
| Practice: deep links, retry, hint ladder, correctness line, mobile Arena tab | `src/app/problems/page.tsx`, `src/components/BottomNav.tsx`, `src/components/ui.tsx` (only if a shared primitive is missing) |
| Review hub: missed questions, harder-challenge rule, explained fallbacks | `src/app/practice/page.tsx`, **new** `src/lib/recommend.ts` |
| Master: skill matrix + trend | `src/app/profile/page.tsx`, **new** `src/lib/skills.ts` |
| API client for the two new/changed calls | `src/lib/api.ts` |
| All new strings in both locales | `src/lib/i18n.ts` |
| Tests for every new pure module | **new** `src/lib/journey.test.ts`, `directory.test.ts`, `recommend.test.ts`, `skills.test.ts`; backend `test/hints.test.js` |

No new runtime dependency is added (design or otherwise).

### 3.3 Phases

1. **Plan** — this document (before any code change).
2. **Backend foundation** — `lib/hints.js` + route + stats additions + tests.
3. **Shared primitives** — journey, directory, recommend, skills libs + tests.
4. **Discover** (`/learn`) rewrite.
5. **Learn workspace** (`/modules/[slug]`) incl. hints.
6. **Practice** (`/problems`) incl. deep links, retry, hints.
7. **Review** (`/practice`) hub.
8. **Master** (`/profile`) skill matrix.
9. **i18n pass**, then verification (§5).

### 3.4 Risks

| Risk | Mitigation |
|---|---|
| Static export: no server rendering of query params / new dynamic routes | No new dynamic routes; query params read client-side in `useEffect` (avoids the `useSearchParams` Suspense build failure) |
| Build-time API is a sleeping free-tier Render service | `generateStaticParams` already retries with backoff; we do not add new build-time fetches beyond what exists |
| Hint endpoint leaking answers | Server-side derivation in a pure, unit-tested function; assertions that the payload never contains the correct option/answer; rate-limited like other lesson routes |
| Stats SQL changes breaking existing dashboard/profile/home consumers | Only *added* fields; existing keys untouched; unit tests unchanged and re-run |
| Hint/retry affecting XP or attempt records | XP rules untouched: `check` still awards only first-ever correct, `practice`/`hint` record nothing; retry only clears local UI state |
| Over-replacing cards with cards | Directory rows are divider-separated inside one container; the rail uses compact blocks; audit table above defines what stays |
| Localization drift | Existing key-parity test covers every new key; both dictionaries updated in the same change |
| No local Postgres (no root, no docker socket) | DB-gated test stays skipped (as in CI); DB-dependent behaviour verified by unit tests of the pure helpers + code review of SQL; **reported as unverified** if it cannot be run |

---

## 5. Testable acceptance criteria

1. `/learn` first paint contains **no per-domain card grid**: domains render as
   directory rows in one container; expanding a domain shows its module
   sequence; searching `xss` filters to matching domains/modules; status chips
   filter correctly; `?domain=` opens that domain.
2. The journey strip is present on `/learn`, `/modules/[slug]`, `/problems`,
   `/practice`, `/profile`, marks the right stage, and its links resolve.
3. In a lesson, the rail shows the correct position `n/m` for the open module
   and lists siblings with `done/current/locked` states.
4. Hint level 1 renders strategy text with **no network call**; level 2 calls
   the hint endpoint and never displays the full correct answer; `tf` level 2
   offers the lesson-text fallback instead.
5. After a wrong answer in the arena, **Try again** clears the result and
   allows a second graded attempt; XP is not re-awarded (server rule).
6. `/problems?domain=web-security&difficulty=advanced` pre-applies both
   filters; `?module=x&exercise=y` opens that task.
7. `/practice` shows missed questions **only** from the real attempt history,
   and the "harder challenge" section either links to a qualifying domain or
   shows the honest empty state.
8. `/profile` skill matrix shows every published domain with real
   `completed/total` and accuracy, labels by the published rule, and hides the
   trend when data is insufficient (no fabricated numbers).
9. `uz` and `ru` key sets are identical (existing test) and every new string
   appears in both.
10. `backend: npm test` and `node scripts/validate-curriculum.js` pass;
    `frontend: npm test`, `npx tsc --noEmit` and `npm run build` pass.
11. Desktop (≥1024px) and mobile (≤420px) layouts of every changed route are
    checked for overflow and console errors **if browser tooling is available**;
    otherwise reported as unverified.
12. Git: work stays local, no remote push, no history rewrite; final status
    reported.

## 6. Explicit non-goals

- No AI tutor, no paid API, no new dependency.
- No database reset, no destructive migration, no removal of user data.
- No change to auth, API contracts (existing fields), XP/streak/achievement
  rules, leaderboard, admin or deployment configuration.
- No real-world attack automation; all practice stays inside the existing
  curriculum's controlled exercises.
- No copying of HackerRank branding, text, layouts or assets.

## 7. Implementation status (as built)

Everything in sections 3–4 shipped. This section records what differs from the
plan as written, and the evidence behind the acceptance criteria in §5.

### Delivered

| Piece | Files |
| --- | --- |
| Six-stage journey strip (01 Discover → 06 Master) | `frontend/src/components/Journey.tsx`, `lib/journey.ts` |
| Discover as one dense directory (paths → domains → module sequence) | `app/learn/page.tsx`, `lib/directory.ts` |
| Split-pane lesson workspace, one question at a time, sequence rail | `app/modules/[slug]/lesson-client.tsx` |
| Graduated hint ladder (level 1 local, level 2 server-graded) | `components/HintLadder.tsx`, `backend/lib/hints.js`, `backend/routes/hints.js` |
| Practice: deep links, retry, hints, arena tab on mobile | `app/practice/page.tsx`, `app/problems/page.tsx`, `components/BottomNav.tsx` |
| Review: missed questions + harder-challenge rule from real attempts | `app/practice/page.tsx`, `lib/recommend.ts` |
| Master: per-domain skill matrix + 7d/7d trend with honest fallback | `app/profile/page.tsx`, `lib/skills.ts`, `lib/stats.js` (server), `routes/users.js` |
| Bilingual strings, both locales | `lib/i18n.ts` |

### Deviations from the plan

1. **Mobile rail compaction.** The plan put the whole action rail above the
   directory on phones. Browser measurement showed that pushed the directory
   ~820px down — more than a full screen. The three secondary rail blocks
   (practice / apply / review) keep their label, action and status on phones but
   drop their supporting paragraph until `lg`. Directory now starts within the
   first screen; nothing was removed, only re-flowed.
2. **No new dependencies.** The trend and skill maths live in
   `backend/lib/stats.js` and `frontend/src/lib/skills.ts` rather than a chart
   library.
3. **Hint endpoint is separate** (`POST /v1/modules/:slug/hint`) from answer
   submission, so asking for help can never be graded or counted as an attempt.

### Verification actually run

- `frontend`: `npx tsc --noEmit` clean; `npm test` 43/43; `npm run build`
  (static export, 95 pages) against a live local API.
- `backend`: `npm test` 41/41 with `TEST_DATABASE_URL` pointing at a real
  Postgres 18 instance — including the previously DB-gated idempotency test.
- End-to-end API exercise of the new endpoints (hint, stats, review) on the same
  instance; XP/streak confirmed unchanged (`+3`, streak 1 on a first-try correct).
- Playwright against the real static export + real API: 74/74 checks at 1440×900
  and 390×844 — no horizontal overflow, no console/page errors, journey stage
  correct per route, directory search/expand, hint ladder levels 1 and 2, wrong
  answer verdict + explanation + retry, practice deep links, review empty states,
  skill matrix, uz/ru rendering, keyboard-focusable journey links.

### Not verified

- HackerRank itself: the FAQ page returned an error for most sections, and public
  challenge pages do not expose pane geometry or mobile behaviour, so the
  reference study covers product principles and public page structure only.
- Real mobile devices / Safari; only Chromium at two viewport sizes was driven.
- Production deployment configuration was not exercised.
