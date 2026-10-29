# CyberQalqon — Status

_Last reviewed: 2026-10-13_

A concise, current snapshot. For the full product story (vision, audience,
core loop, design language, architecture) see **[CONCEPT.md](CONCEPT.md)**.

## Shipped

| Area | State |
|---|---|
| Curriculum | 2 paths · 12 domains · **80 modules · 329 exercises** |
| Exercise types | 6 — `mc`, `tf`, `match`, `multi`, `input`, `order` |
| Locales | `uz` + `ru` (full UI chrome and lesson content) |
| Auth | email + username register/login, 30-day JWT, bcrypt-12, optional Telegram `initData` |
| Gamification | server-authoritative XP via `xp_events`, levels, tiers, 12 achievements, streaks |
| Hearts | 5 max, daily refill, never hard-block progression |
| Review | weak-topic sessions at `/practice`, review XP capped at 30/day |
| Leaderboards | weekly league + all-time |
| Motion | shared tokens in `lib/motion.ts`, `prefers-reduced-motion` aware |
| PWA | web manifest + service worker (balanced caching) |

## Deploy

| Piece | Host | Config |
|---|---|---|
| Frontend | GitHub Pages, project site under `/cyberqalqon/` | `.github/workflows/deploy-pages.yml` |
| API | Render | `render.yaml` |
| Database | Render Postgres (provisioned with the API) | `render.yaml` |

- Live: <https://olimjongulomov320-eng.github.io/cyberqalqon/>
- API: <https://cyberqalqon-api.onrender.com>

> **Deploy order matters:** deploy the API first (it reseeds the curriculum on
> start), then rebuild the frontend. The module list is fetched at build time,
> so a frontend rebuild before the API update freezes a stale module list.

## Verification

- Backend: `npm test` → **34 pass / 0 fail** (1 DB-gated test skipped without
  `TEST_DATABASE_URL`). CI (`.github/workflows/ci.yml`) now runs backend tests,
  curriculum validation, frontend `tsc` and frontend tests on every push/PR.
- Frontend: `tsc --noEmit` clean, 19 tests pass. `npm audit`: backend 0
  vulnerabilities; frontend retains `next` (needs a major upgrade) and
  build-time `next-pwa`/workbox advisories.
- Curriculum: `node scripts/validate-curriculum.js` → **OK (80 modules)**.
- Frontend: static export build succeeds; all **80/80** module pages return 200
  on the live site.

## Not done / needs a human

- **Rendering is not visually verified in CI** — no browser/screenshot tooling
  is installed, so layout/motion is checked only by build + tests, not by eye.
- `netlify.toml` is a leftover from the earlier Netlify host and is now unused.
- `backend/routes/auth.js` still accepts a stray `en` in its `lang` whitelist,
  which the UI never sends (unknown values fall back to `uz`).

## Learning tracks (Stage 1)

- `backend/curriculum/tracks.js` groups existing modules into 8 tracks without
  moving any module, domain or slug. `GET /v1/tracks` returns each track with
  **completion** (lessons finished) and **mastery** (computed server-side from
  the first attempt on each distinct exercise: >= 5 exercises and >= 80%
  correct; see `backend/lib/mastery.js`). Retries never change mastery.
- Two new draft domains (`phishing-awareness`, `privacy-data`, 8 modules) fill
  the thin tracks. Their uz/ru text is **unreviewed** — see `CONTENT_REVIEW.md`.
- Navigation: Home, Learn, Practice (`/problems`, now with a track filter),
  Assessments, Progress. Mistake review moved to `/review` (`/practice`
  redirects there); the leaderboard is linked from Progress.
- Topic checkpoints are still graded like lessons. Track assessments (Stage 2)
  are scored on the server — see below.

## Scored assessments (Stage 2)

- One assessment per track (`backend/curriculum/assessments.js`): 10 questions
  drawn by the server from the track's own exercises, 20-minute limit, 70% pass
  mark, +40 XP on the first pass only (unique index). Opens once every lesson of
  the track is completed.
- `GET /v1/assessments`, `POST /v1/assessments/:slug/start`,
  `GET /v1/assessments/attempts/:id`, `POST /v1/assessments/attempts/:id/submit`.
  The client never sees answers before submitting; the server owns the clock
  (30 s submit grace), grades once and replays the stored result on a repeat.
- While a paper is open, `/check`, `/practice`, `/hint` and `/review/submit`
  refuse the drawn exercises (HTTP 423).
- Limitation: lessons reveal answers, so this is a self-check, not a proctored
  certificate, and the UI says so. Assessment results do not feed mastery yet.

## Redesign & coding challenges

- Design tokens are CSS variables (light + dark, AA-checked by `contrast.test.ts`);
  3D buttons; theme toggle. The learning path is a winding trail of lesson nodes.
- Coding challenges: 13 Python drafts, CodeMirror editor, Pyodide worker. Results are
  browser-run and self-reported (not XP). See `CONTENT_GUIDE.md`.
- Server now enforces lesson unlock order (403 `MODULE_LOCKED`).

## Lesson model (practice-problem style)

- Lesson page = concept + task workspace. Wrong answers get a verdict only; the
  solution is shown once solved or on request after 2 failed attempts
  (`POST /v1/modules/:slug/solution`). `/complete` takes no answers and requires every
  task to be solved (422 `NOT_SOLVED`). Hearts are not part of the lesson any more.

