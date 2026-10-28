# HackerRank-Inspired Skill-Based Learning Plan for CyberQalqon

## What Was Inspected
- **Repo**: 7e7aa6d (pushed), working tree has only `LEARNING_REDESIGN_PLAN.md` untracked
- **Docs**: README, CONCEPT, RESEARCH, CODE_JUDGE, ERD all reviewed
- **Curriculum**: 80 modules, 329 exercises, 9 domains, 2 paths, 6 exercise types (mc/tf/match/multi/order/input). 0 hints exist in curriculum.
- **Routes**: `/learn`, `/modules/[slug]` (lessons), `/problems` (arena), `/practice`, `/profile`, `/leaderboard`
- **APIs**: `/v1/paths`, `/v1/problems`, `/v1/modules`, `/v1/users/me/stats`, `/v1/users/me/attempts`, `/v1/users/me/progress`
- **Tests**: Frontend 19/19 pass, Backend 26/27 pass (1 skip), TSC clean, Build OK
- **i18n**: uz/ru full parity (788 lines in i18n.ts), language persisted, backend accepts lang
- **Security**: Answers never exposed in public listings, server grades all answers, XP awarded only on first correct, duplicate protection in place, no code execution
- **Gamification**: XP, streaks, achievements, hearts, daily goals, review session
- **HackerRank patterns observed** (from RESEARCH): skill-based tracks, difficulty labels, solved/attempted status, problem catalog with filters by domain/difficulty/type, editorial/explain pattern, sample-style feedback, progress indicators

## HackerRank Educational Patterns Selected & Why They Fit
1. **Structured skill tracks with clear progression** - HackerRank organizes by Skills/Tracks; CyberQalqon has paths→domains→modules. Already has skill path on /learn (just improved). Fits perfectly.
2. **Problem discovery by skill/domain/difficulty/type/status** - HackerRank's problem list is filterable by these. /problems already has filters; we can make them more discoverable and add "learning vs practice" distinction.
3. **Hint system** - HackerRank provides hints without giving away answers. Currently no hints exist in curriculum (0/329 have hints). Adding optional hint UI (client-side) that can show hints if present in exercise data, with curriculum extensible for future hints.
4. **Editorial/meaningful feedback** - HackerRank shows explanations. Already have `AnswerFeedback` component with explain/reveal. Good.
5. **Worked examples / guided practice** - HackerRank's "Learn" sections show examples before challenges. Lessons have content + exercises; we can add "example walkthrough" for some exercises.
6. **Mastery checks separate from completion** - HackerRank uses skill certifications/checkpoints. We have checkpoints; need to make mastery more explicit.
7. **Spaced/revisit weak areas** - Already have review session from weak topics. Can make it more prominent.
8. **Honest proficiency indicators** - Distinguish XP/streaks (engagement) from mastery. Profile already shows stats; need clearer separation.

## Gap Analysis
- **Hints**: No hint field in exercise schema, no UI for hints. Need to add support (backward compatible) - exercise can optionally have `hint` (bilingual).
- **Guided practice vs independent challenge distinction**: Not explicit. Lessons are mixed; arena is independent.
- **"Learn objective" per module**: Modules have content but no explicit learning objective shown separately.
- **Mastery indicator**: No explicit mastery score beyond completion + accuracy. Can compute from attempt history (mastery of a skill = completed module + good accuracy on its exercises).
- **Next-step recommendations**: Present but could be more actionable.
- **Scenario/contextual framing**: Some exercises have scenarios; could be enhanced where natural.
- **Distinction between learning material and practice**: /learn vs /problems both exist but not clearly labeled.

## Plan - Highest Value Improvements (Focused, No DB Migrations)

### Phase 1: Hint System (Client-side, backward compatible)
- Add `hint` to Exercise type in frontend (optional, bilingual {uz,ru})
- Update publicExercise to pass through hint if present
- Add hint UI in exercises component - "Show hint" button, reveals on click, distinct from answer
- Update i18n with hint keys
- Curriculum can add hints later without code changes

### Phase 2: Exercise Workspace Improvements
- Add "hint" button to exercise screens in lesson and arena
- Show learning objective / module context in lesson
- Improve feedback with "why alternatives fail" where possible (use explain content)
- Add "Review this concept" link more prominently

### Phase 3: /learn - Clearer Skill Path with Objectives
- Show "What you'll learn" from module content summary or domain description
- Make "next useful action" more prominent
- Better distinction of lesson vs checkpoint
- Add mastery indicator per domain (from stats)

### Phase 4: /problems - Better Discovery
- Make filters more prominent/organized
- Add "Learning vs Practice" distinction header
- Show skill/domain clearly
- Improve empty states
- Keep all existing filters working

### Phase 5: /profile - Honest Proficiency View
- Separate "Engagement" (XP, streak) from "Proficiency" (mastery, accuracy)
- Show mastery per domain/skill
- Better weak topics with action
- Recent activity clearer

### Phase 6: i18n, Testing, Verification
- Add all new keys to both uz and ru
- Run all tests
- Browser verification

## Files to Modify
**Frontend:**
- `frontend/src/lib/api.ts` - add hint to Exercise
- `frontend/src/components/exercises.tsx` - hint UI
- `frontend/src/lib/i18n.ts` - new keys
- `frontend/src/app/learn/page.tsx` - objectives, mastery
- `frontend/src/app/problems/page.tsx` - discovery improvements
- `frontend/src/app/modules/[slug]/lesson-client.tsx` - workspace improvements
- `frontend/src/app/profile/page.tsx` - proficiency separation
- `frontend/src/components/feedback.tsx` - minor enhancements

**Backend:**
- `backend/lib/grade.js` - publicExercise to include hint if present
- No schema changes, no new dependencies

## Constraints Respected
- All 329 exercises preserved, no modifications to exercise data
- API contracts preserved
- No DB migrations
- No code execution
- Answers never exposed before submission
- Server is authority for grading/XP
- uz/ru parity maintained
- No AI tutor added
- No production deployment
