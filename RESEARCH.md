# Competitor research and product improvements

**Scope:** HackerRank, KEP.uz, RoboContest, cp.uz — compared with the current
CyberQalqon implementation. Prepared as evidence for the improvements shipped in
this change set.

**Method (and its limits).** Observations below come only from public pages that
could be fetched without an account: marketing pages, public problem/task lists,
public APIs, a public `llms.txt`, public sitemaps and the public application
bundle (HTML/JS served to guests). **No authenticated screen, private contest,
paid feature or personal data was inspected.** Where a platform is a
single-page app, the route manifest and public API shape were read from the
public bundle; that is evidence that a surface exists, not evidence of how it
behaves when signed in. Items marked *Hypothesis* are inference, not verified.

---

## 1. Platform profiles

### 1.1 HackerRank — <https://www.hackerrank.com/>

**Verified**

- Positioning has moved to hiring for the "agentic era" (Chakra interviewer,
  Interview, Screen). The developer-practice surface still exists.
  <https://www.hackerrank.com/>
- **Algorithms track** is organised by difficulty (`Easy`, `Medium`, `Hard`),
  by *skill* (`Problem Solving (Basic)`, `(Intermediate)`, `(Advanced)`) and by
  *subdomain* (Warmup, Implementation, Strings, Sorting, Search, Graph Theory,
  Greedy, Dynamic Programming, Constructive Algorithms, Bit Manipulation,
  Recursion, Game Theory, NP Complete, Debugging).
  <https://www.hackerrank.com/domains/algorithms>
- Each problem row exposes **Max Score**, **Success Rate** and a
  **Solved/Unsolved** state. <https://www.hackerrank.com/domains/algorithms>
- A public problem page exposes **Problem / Submissions / Leaderboard /
  Discussions / Editorial** tabs, difficulty, max score, submission count,
  downloadable problem statement and **sample test cases**, plus a translation
  selector (English, Russian).
  <https://www.hackerrank.com/challenges/solve-me-first/problem>
- **Contests** are split into Active, Upcoming and Archived, each with a
  registration window and a "View Challenges" archive entry.
  <https://www.hackerrank.com/contests>

**Not verified:** the signed-in code editor, judge verdicts, plagiarism checks,
certification mechanics, or any private employer content.

**Hypothesis:** the learning value for a beginner comes from the combination of
(a) explicit difficulty + skill labels, (b) editorial explanations and
discussion, and (c) sample test cases. The hiring-oriented framing is not
relevant to CyberQalqon.

**Localization:** problem statements offer English/Russian translations; no
Uzbek surface was found on the public pages inspected.

---

### 1.2 KEP.uz — <https://kep.uz/>

**Verified** (public API + public bundle; the site is a Vue SPA)

- The public route manifest exposes these surfaces:
  `/learn/courses`, `/learn/courses/course/:id/lesson/1`, `/practice/problems`,
  `/practice/problems/problem/:id`, `/practice/problems/study-plan/:id`,
  `/practice/challenges`, `/practice/duels`, `/practice/projects`,
  `/practice/tests`, `/competitions/contests`, `/competitions/arena`,
  `/competitions/tournaments`, `/competitions/hackathons`,
  `/users/:username/achievements`, `/users/:username/ratings`,
  `/learn/lugavar` (dictionary).
- **Problem catalogue** is real and large: `GET /api/categories/` returns 12
  categories with exact public counts, including *Competitive Programming* 971,
  *Python* 595, *Basic Programming* 576, *Math* 915, *Database* 28 and *CTF* 33.
  <https://kep.uz/api/categories/>
- **Difficulty is explicit and bilingual**: problems carry `difficulty` (1–7), a
  `problemRating` (e.g. 2700) and a localised `difficultyTitle` such as
  `"Juda qiyin"` / `"Qiyin"`. <https://kep.uz/api/problems/?limit=2>
- Problem records also expose `solved`, `attemptsCount`, `hasChecker`,
  `hasSolution`, `likesCount`, `dislikesCount`, `userInfo.{hasSolved,
  hasAttempted,isFavorite}` and Uzbek topic tags (`"Dinamik dasturlash"`,
  `"Graflar nazariyasi"`, `"Ma'lumotlar tuzilmasi"`).
  <https://kep.uz/api/problems/?limit=2>
- Contest surfaces include registrants, standings, rating changes, questions,
  statistics and virtual contests (route + API manifest).
- Interface strings in the public bundle are shipped in **Uzbek, Russian and
  English** (`uz:"Uzbek"`, `ru:"Russian"`, `en:"English"`).
- Analytics named in the bundle: accuracy by difficulty, topic and challenge
  format; head-to-head results; rating history.

**Not verified:** submission verdicts, checker internals, paid Kepcoin features,
or arena/duel behaviour (all behind auth).

**Hypothesis:** KEP.uz is the closest analogue to the "beginner → competitive
programming" path CyberQalqon wants. Its strongest reusable ideas are numeric
problem difficulty with a localised label, topic tags, and per-user
solved/attempted state.

---

### 1.3 RoboContest — <https://robocontest.uz/>

**Verified** (public HTML + embedded page props)

- Live public counters on the home page: **204,738 users**, **1,477 available
  tasks**, **306 official contests** (plus 3,251 private), 16,876 attempts in
  24 h, 2,654 solved today. <https://robocontest.uz/>
  *Captured 2026-10-20 from the embedded `liveCounters` payload. These are live
  figures that move: re-checked the same day and the user total had drifted to
  204,748 and attempts to 17,029, while tasks (1,477) and contests (306 / 3,251)
  were unchanged. Treat the volatile ones as an order of magnitude, not a
  citation.*
- **Task list** exposes per-task `number`, `title`, `complexity` (e.g. 1–35),
  `difficulty` (`easy`, `medium`), `rating` (e.g. 3.4), and stats
  `{solved_users, accepted, total, percentage}`, category (`"Oson"`),
  `has_solution`, and per-user `done`/`failed`/`favorite` state.
  <https://robocontest.uz/tasks>
- **Contest list** exposes up to three buckets (next / current / old) with
  `name`, `startTime`, `endTime`, `participantsCount`, `tasksCount`, privacy and
  registration state. <https://robocontest.uz/contests>
- Home page also exposes a **daily challenge**, **featured tasks**, **top movers**
  (all-time rating leaderboard) and a news feed.
- **Uzbek-first UI** (`locale: "uz"`, Uzbek contest names and categories).
- The early-load script applies **accessibility preferences** before paint:
  `data-text-scale`, `data-font`, `data-grayscale`, plus a light/dark theme.
  <https://robocontest.uz/>
- Task pages expose a **solution** link where one exists
  (`/tasks/:number/solution`).

**Not verified:** judge verdicts, submission code, editor, standings detail,
or any private contest.

**Hypothesis:** the rating number and "solved users / total attempts" percentage
are the trust signals that make a problem list feel real; both are cheap to
compute from real data.

---

### 1.4 cp.uz — <https://cp.uz/>

**Verified** (public `llms.txt` + sitemap)

- cp.uz is an **Uzbek-language knowledge base**, not a judge. Its own
  `llms.txt` states: it does not run contests, does not accept or judge
  submissions, and does not maintain a participant rating; "Reyting" on a task
  page means *estimated problem difficulty*.
  <https://cp.uz/llms.txt>
- Main sections: **Algorithms** (lessons), **Olympiad problems** (archived
  statements + links to external judges such as KEP.uz or OJ.uz), **Olympiad
  seasons** (calendars, medal results, placements), **Learning roadmap**,
  **Dictionary**.
- Sitemap scale: **174** algorithm lesson pages, **104** task pages, **74**
  season pages, 1 roadmap, 1 dictionary.
  <https://cp.uz/sitemap.xml>
- Primary language is **Uzbek, Latin script**; content is open source
  (<https://github.com/cp-uz/cp-uz>).

**Not verified:** individual lesson quality, task statements, or season data
(SPA payloads were not enumerated beyond the sitemap and `llms.txt`).

**Hypothesis:** the **learning roadmap** and **dictionary** are the two pieces
most worth emulating for Uzbek beginners: a suggested topic order, and short
definitions of algorithmic terms in the learner's language.

---

## 2. Comparison matrix

Legend: ✅ present and verified · ◐ partial / implicit · ✗ not present in the
public surface inspected · — not applicable.

| Capability | HackerRank | KEP.uz | RoboContest | cp.uz | CyberQalqon (before this change) |
|---|---|---|---|---|---|
| Core purpose | Hiring + developer practice | Learn → practice → compete | Competitive programming judge | Uzbek CP knowledge base | Gamified cybersecurity lessons |
| Target audience | Employers, developers | Learners, olympiad students | Competitive programmers | Uzbek CP community | Uzbek/Russian beginners |
| Learning paths | Skill + subdomain grouping | Courses → chapters → lessons; study plans | ✗ (task categories only) | Roadmap + algorithm lessons | ✅ 2 paths → 12 domains → 80 modules |
| Topic organisation | Subdomains (14) | Categories + Uzbek tags | Categories (`Oson`, …) | Algorithm sections | Domains (12) |
| Problem catalogue | ✅ Algorithms domain | ✅ 2,101+ problems | ✅ 1,477 public tasks | ◐ 104 archived statements | ◐ 329 exercises, **only inside lessons** |
| Difficulty labels | ✅ Easy/Medium/Hard + skill level | ✅ 1–7 + localised title + rating | ✅ complexity + easy/medium + rating | ◐ estimated "Reyting" | ✗ |
| Code editor | ✅ (signed in) | ✅ (signed in) | ✅ (signed in) | ✗ (links out) | ✗ |
| Automatic judging | ✅ | ✅ | ✅ | ✗ | ✗ (interactive answer grading only) |
| Feedback on wrong answer | ◐ editorial/discussion | ✅ explain + verdicts | ◐ verdict + solution link | ✗ | ✅ per-exercise `explain` after grading |
| Hints | ✗ (editorials instead) | ◐ solutions/tags | ◐ solution link | ✗ | ✗ |
| Contests | ✅ active/upcoming/archived | ✅ contests, arena, tournaments, hackathons, duels | ✅ official/private contests, rounds | ✗ (archive only) | ✗ |
| Rankings | ✅ leaderboards | ✅ contest/global ratings | ✅ rating + top movers | ✗ (explicitly none) | ✅ weekly + all-time league |
| Progress tracking | ◐ solved/unsolved | ✅ attempts, accuracy by topic/difficulty | ✅ done/failed/favorite | ✗ | ✅ XP, streak, hearts, achievements, per-topic accuracy |
| Submission history | ✅ submissions tab | ✅ attempts list | ✅ attempts | ✗ | ✗ (aggregate counts only) |
| Uzbek UI | ✗ (EN/RU statements) | ✅ (uz/ru/en) | ✅ (uz-first) | ✅ (uz-Latn) | ✅ (uz/ru) |
| Russian UI | ✅ (translation selector) | ✅ | ◐ | ✗ | ✅ |
| Mobile / a11y | ◐ | ◐ | ✅ text scale, font, grayscale, theme | ◐ | ✅ responsive, skip link, reduced-motion, pinch-zoom allowed |
| Design language | Corporate, dense | Product dashboard | Dense judge UI | Editorial knowledge base | Dark cybersecurity, single accent, squircle cards |
| Reusable idea for CyberQalqon | Difficulty + skill labels, sample tests, editorial | Numeric difficulty + localised labels, study plans | Rating + solve-rate trust signals, contest buckets | Roadmap + dictionary, Uzbek-first prose | — |

---

## 3. Audit of the existing CyberQalqon implementation

Measured from the repository, not estimated:

- **Curriculum registry** (`backend/curriculum/index.js` + 9 content files):
  2 paths, 12 domains, **80 modules** (71 lessons, 9 checkpoints), **329
  exercises** — `mc` 89, `tf` 70, `multi` 54, `match` 64, `input` 27,
  `order` 25.
- **Progression**: modules unlock sequentially inside a domain
  (`backend/routes/paths.js`), with `done | current | open | locked` states and
  a `continue` target. Domains are always browsable.
- **Grading**: six exercise types, server-authoritative (`backend/lib/grade.js`);
  answers are stripped from every fetch (`publicExercise`), and `explain` is
  only returned after grading. Per-exercise attempts are recorded in `mistakes`;
  XP flows through `xp_events`; completion is validated against the curriculum
  (`validateLessonSubmission`).
- **Gamification**: XP (lesson + first-correct + review), streaks, hearts,
  13 achievements, daily goal, weekly and all-time leaderboards.
- **Localization**: `frontend/src/lib/i18n.ts` ships uz + ru dictionaries with a
  key-parity unit test; curriculum content is bilingual (`*_uz`, `*_ru`).
- **Auth / data**: JWT + bcrypt, Postgres (`users`, `modules`, `user_progress`,
  `paths`, `domains`, `xp_events`, `mistakes`, `user_achievements`,
  `idempotency_keys`), idempotent review submissions.
- **Frontend**: Next.js 14 static export, 5-tab mobile nav, design-token based
  Tailwind theme, first-party icon set, loading/empty/error states, reduced
  motion support.
- **Tests**: 19 frontend unit tests, 17 backend tests + 1 DB-gated integration
  test (skipped without `TEST_DATABASE_URL`).

**Verified gaps**

1. There is no problem-level browsing surface: the 329 exercises are only
   reachable through their parent lesson, so a learner cannot practise "all
   beginner Linux questions" or see difficulty.
2. No difficulty metadata exists anywhere in the schema or curriculum.
3. Locked modules say only `"Yopiq"`; the prerequisite module is not named.
4. No hints; only post-answer explanations.
5. No contests, seasons, or contest leaderboards (weekly league only).
6. No submission/attempt history (only aggregate `wrong_count` /
   `correct_count` per exercise).
7. No code execution or judge of any kind — which is the correct state until a
   safe sandbox exists.

---

## 4. Prioritised roadmap

| Priority | Improvement | Reference evidence | Effort | Status |
|---|---|---|---|---|
| **P0** | **Problem Arena** (`/problems`): filter 329 real exercises by domain, difficulty, type and solved state; solve in place with real server grading | HackerRank difficulty/skills; KEP categories + difficulty; RoboContest task list | M | **Shipped** |
| **P0** | **Derived difficulty labels** (`beginner` / `intermediate` / `advanced`) on every module and problem | HackerRank Easy/Medium/Hard; KEP 1–7 + `difficultyTitle` | S | **Shipped** |
| **P0** | **Named prerequisites** on locked path nodes | Sequential unlocking already implemented; label was missing | S | **Shipped** |
| **P0** | **Honest discovery links** to the arena from Learn + Practice + desktop nav | KEP/HackerRank practice entry points | S | **Shipped** |
| **P1** | **Safe code judge** design + integration plan (no execution in this app) | HackerRank/KEP/RoboContest judges | L | **Design shipped** (`CODE_JUDGE.md`) |
| **P1** | Authored hints per exercise (mechanism + content) | KEP solutions/tags | M | Not shipped |
| **P1** | **Submission history**: append-only `exercise_attempts` + `GET /v1/users/me/attempts` + a filterable timeline on Profile | HackerRank Submissions; KEP attempts; RoboContest attempts | M | **Shipped** |
| **P2** | Real contests (scheduled, registered, scored) with transparent rules | RoboContest contest buckets; KEP standings | L | Not shipped — **no fake contests added** |
| **P2** | Uzbek CP dictionary + roadmap page | cp.uz roadmap + dictionary | M | Not shipped |
| **P2** | Topic tags per exercise (beyond domain) | KEP Uzbek tags | M | Not shipped |

**Explicitly rejected:** fabricated contests, seeded fake participants,
hardcoded production rankings, and any "judge" that pretends to execute code.

---

## 5. Implementation notes (shipped items)

### 5.1 Submission history

**Write path.** One append-only table, `exercise_attempts (id, user_id,
module_id, exercise_id, correct, answered_at)`, written inside `recordAttempt`
(`backend/lib/gamification.js`) — the single function both `/modules/:slug/check`
and `/review/submit` already go through for the `mistakes` aggregates. The
history row is issued on the **same connection as the caller's transaction**, so
a timeline row and its counter increment commit or roll back together; the two
can never disagree. Practice attempts are deliberately absent, matching the
existing rule that `/practice` records nothing.

**Read path.** `GET /v1/users/me/attempts?lang&limit&offset&result`. Session-scoped
by construction — there is no user id parameter, so an account cannot read
another's history. `limit` clamps to 1–50; the question text is resolved in SQL
from the module's `exercises` JSONB, so no per-row fetch is needed.

**Two counting rules the UI depends on.** `total` and `has_more` follow the
requested `result` filter; `correct_total` / `wrong_total` are always the
whole-history split, so the profile's balance never hides behind an active
filter. (The first version of this route applied the filter to the rows but not
to the totals — paging under a filter ran off the end. Caught by the API test
harness, not by review.)

**Ordering.** Rows carry a `seq` supplied by the writer, and the page orders by
`(answered_at DESC, seq DESC, id DESC)`. A review submission grades several
exercises inside one transaction, where `now()` is constant, so without `seq`
the order of a single session changed with the client's page size. The `seq`
argument defaults to 0, so the single-answer lesson path is unaffected.

**Honest limitations.**

- History begins when the table does. Attempts made before it shipped have no
  rows; the card says "no history yet" rather than reconstructing a past.
- XP is still awarded only when the **first ever** attempt on an exercise is
  correct (`first_correct = correct_count = 1 AND wrong_count = 0`). That rule
  predates this change and applies identically in the lesson flow; the arena
  inherits it rather than duplicating it.
- The timeline stores the verdict, not the submitted value, for two reasons: the
  submitted value is user input that would need escaping into a text surface
  with no benefit to a beginner, and for choice exercises it would leak which
  options a learner picked alongside the already-withheld answer key.

### 5.2 Mobile overflow in the Problem Arena (fix)

The arena's list used an implicit `auto` grid track. Its content-based minimum
refused to shrink below the rows' min-content, so at a 360px viewport the column
resolved to **400px** and the page scrolled horizontally. Both grids now declare
`grid-cols-1` (Tailwind's `repeat(1, minmax(0, 1fr))`), which lets the track
shrink and leaves the row's own `truncate` / `line-clamp` to do the clipping.
Verified at 320/360/390 px: `scrollWidth - clientWidth === 0`, no clipped text.
