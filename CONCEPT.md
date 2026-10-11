# CyberQalqon — Product Concept

> **One line:** CyberQalqon is a bilingual (Uzbek / Russian) cybersecurity learning
> app that teaches real, practical security skills through short interactive
> lessons, gamified with XP, streaks, hearts, achievements and leaderboards —
> without ever punishing the learner into quitting.

> **Name:** *Qalqon* means **shield** in Uzbek. The shield is both the brand
> (`🛡️`) and the product's promise: the skills you learn here are your digital
> shield.

---

## 1. Vision

**Cybersecurity is one of the most valuable skills on earth — and one of the
least accessible.** Most material is either academic (dense, in English,
written for practitioners) or buzzwordy (doesn't teach anything). For
Uzbek- and Russian-speaking beginners there is almost nothing interactive and
structured.

**CyberQalqon's vision:** make learning cybersecurity feel like a game you can
win in 5 minutes a day. A learner opens the app, answers a few interactive
questions, earns XP, keeps a streak, reviews their weak topics when the system
reminds them, and gradually builds a genuinely durable mental model of
networking, Linux, web security and cryptography — in their own language.

**The promise we make in the UI (from `heroBody`):**
"Qisqa interaktiv darslar, XP, seriyalar va reytinglar. Har kuni 5 daqiqa —
real mahorat." / "Короткие интерактивные уроки, XP, серии и рейтинги.
5 минут в день — реальный навык."

---

## 2. Problem & audience

### Problem
- Cybersecurity learning is **fragmented, English-first, and text-heavy**.
- Beginners **lose motivation** without structure, progress feedback or a social
  loop; hard paywalls and harsh failure states make them quit.
- Central Asia's tech talent pool needs hands-on security fundamentals in
  **native languages (uz, ru)**.

### Audience
1. **Primary:** students and junior IT folks in Uzbekistan (and the broader
   ru-speaking region) who want a security career but don't know where to start.
2. **Adjacent:** developers entering tech who need security basics; anyone doing
   everyday online safety.
3. **Future:** school programs and IT academies looking for a structured,
   measurable first course.

---

## 3. The core product loop

```
       ┌───────────────────────────────────────────────────────────────┐
       │                                                               │
       ▼                                                               │
  Open app ──▶ Daily goal + streak reset ──▶ Continue (resume last     │
  (5 min)         reminds & motivates          lesson automatically)  │
       │                                                              │
       │   ┌──────────────────────────────────────────────────┐       │
       │   │         One lesson session (2–4 min)              │       │
       │   │  Read (markdown prose, code snippets)             │       │
       │   │  → Answer interactive exercises (MC, T/F, match,  │       │
       │   │    order, typed command input)                    │       │
       │   │  → Instant per-question feedback + explanation     │       │
       │   │  → Lesson XP on completion, level-up celebration   │       │
       │   └──────────────────────────────────────────────────┘       │
       │                                                               │
       ▼                                                               │
  Weak spots → Review sessions (spaced practice)  ─────────────────────┘
       │
       ▼
  XP / streak / achievements / weekly league  ──▶ identity + competition
```

### 2.1 Learning content model (as shipped)
- **2 learning paths:** *Cybersecurity* (`cybersecurity`) and
  *IT Fundamentals* (`it-fundamentals`).
- **8 knowledge domains**, 29 modules total:

| Domain | Modules | Focus |
|---|---|---|
| 🧠 Fundamentals | 5 | core security concepts |
| 🌐 Networking | 7 | networks, protocols, addressing |
| 🐧 Linux | 4 | OS & command line |
| 🔐 Web security | 4 | web app threats & defenses |
| 🔏 Cryptography | 3 | ciphers, hashes, PKI basics |
| ⚙️ IT basics | 2 | computers & systems |
| 🗄️ Databases | 2 | data storage concepts |
| 🌿 Git | 2 | version control |

- **121 interactive exercises** across 6 types: multiple-choice (`mc`, 36),
  multi-select (`multi`, 19), true/false (`tf`, 21), matching (`match`, 21),
  ordering (`order`, 10) and typed command input (`input`, 14).
- Each module = markdown reading (`content`) + ordered `exercises[]`, with an
  `xp_reward`; lessons are authored as plain data (see `backend/curriculum/`),
  so adding a course is **content-only — no page code changes**.

### 2.2 Gamification engine (shipment truth)
- **XP is server-authoritative** and always flows through an `xp_events` table
  (the single source of truth; a DB trigger sums it into `users.total_xp`).
  - `lesson` — first completion of a module (worth the module's `xp_reward`)
  - `correct` — first correct answer on an exercise (**+3**)
  - `review` — correct answer in a review session (**+4**, capped at **30/day**
    so review can't be farmed)
- **Levels:** 100 XP per level (`levelFromXp`), displayed with tabular numerals.
- **Tiers (display ranks):** a tier every 2 levels, capped at tier 5 — progress
  stays visible long after level numbers blur together.
- **12 achievements:** first / 5 / 10 lessons, perfect lesson, 7-day streak,
  XP 500 / 2000, reviewer, checkpoint, and per-domain completion
  (Networking / Linux / Web-security). Copy lives in i18n; codes are the
  backend contract.
- **Daily goal** (default 20 XP) + **streaks** (current & best) anchor the
  "every day, 5 minutes" habit.

### 2.3 Forgiveness design (the product's soul)
- **Hearts (5 max):** one heart lost per wrong answer, refilled every new day.
  Crucially, hearts **never hard-block learning** — at zero, the lesson shows a
  "restore a heart" practice card instead of a wall.
- **Instant, non-shaming feedback:** correct answers pop green with a short
  explanation; wrong answers shake once and reveal the right answer *before*
  advancing. Failure is a teaching moment, not a punishment.
- **Weak-topic review:** the system tracks per-exercise mistakes and turns
  them into short review sessions (`/practice`) with their own XP cadence.
  This is the real "spaced repetition" value — the app tells you *what to
  redo*, which is the part learners never manage on their own.
- **No paywalls on progression** — everything is about steady skill, not
  monetizing frustration.

### 2.4 Social & status loop
- **Leaderboards:** weekly league and all-time, with your rank pinned at the
  top of the list; podiums (top 3) are visually emphasized.
- **Achievement badges** on the profile, plus a compact dashboard preview of
  the week's race.

---

## 3. Experience & design language

**Mood:** premium, dark, quietly confident — a "Duolingo meets security
console" aesthetic that respects the seriousness of the subject without being
scary.

- **Surface:** deep navy family, toast-dark backgrounds, hairlines and
  subtle violet/cobalt radial washes, film-grain overlay, soft violet-tinted
  card shadows.
- **Color roles:** cyan is the single **interactive** color (yes, actions,
  focus); success/warning/danger are reserved for meaning; the electric-violet
  and cobalt brand colors stay **decorative** (hero/auth only) so the UI never
  competes with itself.
- **Type:** Manrope (geometric, semi-condensed, cyrillic-complete for ru) +
  JetBrains Mono for code/numbers; tabular numerals for all XP/rank readouts.
- **Motion system** (`lib/motion.ts`): one easing + duration token set, shared
  variants (fade-up, stagger, card hover, correct-pop, wrong-shake, dialog),
  page-level route transitions, and a universal `prefers-reduced-motion`
  downgrade (transforms off, quick fades only). Motion is garnish, never
  obstruction.
- **Accessibility:** single `<main>` landmark per route with a skip link,
  keyboard-only focus rings, semantic roles for tabs/radiogroups/switches,
  `aria-live` on feedback, `aria-pressed`/labels on toggles, and visible
  error/empty/loading states with skeletons.
- **Performance & bandwidth:** low-bandwidth mode (drops decorative assets),
  PWA manifest + service worker (session cache on, aggressive nav caching off,
  reload-on-online), lazily-loaded fonts.

**Two deliberate non-goals:** no neon-glow-everywhere glassmorphism overload,
and no dark-hacker clichés — the product should feel like a serious learning
tool that happens to look great, not like a movie prop.

---

## 4. Multilingual — first-class, not afterthought

- **Full first-class locales:** `uz` and `ru` dictionaries in
  `frontend/src/lib/i18n.ts` (UI chrome, achievements, exercise feedback,
  validation messages, error states, legal pages).
- Language is instant (client-side toggle in the nav) and **persisted**; the
  lesson content itself is re-fetched in the selected language (including
  mid-lesson, per the F1 fix).
- Backend APIs accept `lang` and return localized titles/content/exercise text;
  the backend locale whitelist is `uz | ru` (matching what the UI ships).
- **English is the natural next locale** — the dictionaries are structured to
  make adding `en` a data-entry task, not a refactor.

---

## 5. Platform & architecture

```
┌─────────────── Netlify ───────────────┐        ┌───────── Render ─────────┐
│ Next.js 14 (App Router)               │  HTTPS │ Express API (/v1/*)      │
│ TypeScript + Tailwind + Framer Motion │ ─────▶ │ auth · paths · modules    │
│ PWA (next-pwa)                        │        │ review · leaderboard ·    │
│ i18n uz/ru · low-bandwidth mode       │        │ users                     │
└───────────────────────────────────────┘        │ PostgreSQL (pgcrypto,     │
                                                 │  xp_events, achievements, │
                                                 │  streaks)                 │
                                                 │ helmet · CORS · ratelimit │
                                                 │ trust-proxy · JWT (30d)   │
                                                 └───────────────────────────┘
```

### 5.1 Frontend
- Next.js 14 App Router, all routes client-rendered with per-route metadata
  in `layout.tsx` files; typed API client in `lib/api.ts` with offline-aware
  errors (`NETWORK` vs server errors).
- State: `AppContext` (user, language, low-bandwidth, session restore) +
  React state per page; shared primitives in `components/ui.tsx` and
  gamification widgets in `components/game.tsx`.

### 5.2 Backend
- Express + PostgreSQL. Trust model: **the server is the authority** — it
  computes `done/current/open/locked` path states, grades answers, awards XP,
  issues achievements and maintains streaks. The client only renders.
- Security: bcrypt-12 password hashing, 30-day JWTs, rate limiting on auth +
  grade endpoints, helmet, CORS locked to the deployed origin, 16kb JSON
  body cap, optional Telegram Web App `initData` signature verification
  (mini-app heritage kept alive).
- Schema is bootstrapped by an idempotent `setup.js` (migrations + curriculum
  seed) and the curriculum registry is validated at startup
  (`scripts/validate-curriculum.js`).

### 5.3 Deployment
- `netlify.toml` builds `frontend/` with the Next plugin; API base defaults to
  the Render URL in production and is overridable via `NEXT_PUBLIC_API_URL`.
- `render.yaml` provisions the API + free Postgres together; CORS origin and
  `JWT_SECRET` are injected there.
- Local dev is documented in `README.md` (backend :3001 ↔ frontend defaults
  to the same port).

---

## 6. Identity & heritage

- CyberQalqon started with a Telegram Mini App lineage: the backend still
  carries `verifyTelegramInitData` for Web App login, and the product is
  deliberately **mobile-first mobile-web** (bottom nav, safe-area insets,
  thumb-friendly targets) while scaling to desktop.
- The visual identity upgrade (this phase) preserved the orange/mono legacy
  personality: dark shield brand, the `🛡️` mark, and a deep-navy surfaces
  family adapted from the original system.

---

## 7. What CyberQalqon is NOT (scope boundaries)

- **Not a cert-prep farm** — it teaches understanding, not exam dumps
  (no certification content is planned or implied).
- **Not a CTF/exploitation playground** — no real exploitation exercises;
  content is curriculum-prose + safe interactive questions.
- **Not community content** — one curated progression, authored in-repo.
- **Not a social network** — leaderboards are summary stats, not chat/feeds.
- **Not content-mill AI output** — every lesson is authored, reviewed and
  validated by the curriculum pipeline.

---

## 8. Product principles (operating guardrails)

1. **Server is the source of truth** for progression; the client is a renderer.
2. **Never punish the learner** — hearts never hard-block; wrong answers teach.
3. **Every change is additive-first**: preserve identity and working features;
   delete only dead code with verification.
4. **Motion and distraction are garnish**: reduced-motion first; performance
   and loading states are part of the design.
5. **No fabricated claims**: no invented stats, testimonials, or feature
   promises in the UI or docs.
6. **Content stays data**: curriculum is registry-driven so courses can grow
   without code changes.

---

## 9. Roadmap ideas (proposals — not shipped)

> These are product directions, listed to record the concept's horizon. None
> are implemented.

1. **English locale** — unlock a much larger audience (data-entry task in the
   existing dictionary structure).
2. **Daily habit extras** — a lightweight "daily quiz" and review-badge
   nudges (notifications/PWA push) to protect streaks.
3. **Spaced repetition v2** — per-exercise SM-2-style scheduling instead of
   current weak-topic sessions.
4. **Full history timelines** — XP/streak charts on the profile.
5. **Community leaderboards** — country/city filters behind the free tier.
6. **Institutional packs** — educator dashboards for IT academies.
7. **More content** — new domains (OSINT, cloud security, incident
   response) via the existing registry pipeline.

---

## 10. Metrics the concept should be judged on

- **Retention:** daily-active streak survival (e.g., % of users with ≥7-day
  streaks) over raw signups.
- **Completion:** lessons per active user / module completion rate.
- **Learning:** review-session completion and re-test accuracy on previously
  weak exercises.
- **Localization:** share of ru-speakers completing vs uz — both must feel
  equally native.

---

## 11. Quick file map (concept → code)

| Concept | Where |
|---|---|
| Curriculum registry (paths/domains/modules) | `backend/curriculum/index.js` + content files |
| Exercise types | `frontend/src/lib/api.ts` (`Exercise` union), `frontend/src/components/exercises.tsx` |
| XP events / achievements / streaks | `backend/lib/gamification.js`, `backend/routes/*.js` |
| Levels & tiers | `frontend/src/lib/gamification.ts` |
| Hearts | `frontend/src/lib/hearts.ts` |
| i18n uz/ru | `frontend/src/lib/i18n.ts` |
| Design tokens & motion | `frontend/tailwind.config.js`, `frontend/src/app/globals.css`, `frontend/src/lib/motion.ts` |
| App shell & navigation | `frontend/src/components/AppShell.tsx` |
| Deploy | `netlify.toml`, `render.yaml` |
| Local dev | `README.md` + `frontend/.env.example` + `backend/.env.example` |