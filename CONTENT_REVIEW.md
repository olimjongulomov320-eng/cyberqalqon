# Content awaiting native-speaker review

The Uzbek and Russian text below was **drafted** (by an AI assistant) for
beginners. It has **not** been verified by a proficient native speaker and must
be reviewed before production release. It does not block the architecture or
the practice features; the modules are flagged `needs_review: true` in code and
the API reports the flag.

Reviewer checklist: terminology consistent with existing lessons, natural
phrasing (not literal translation), no ambiguity in answer options, explanations
correct, all names/addresses fictional (`example.*` only).

## New modules (draft)

| Module | File | Notes |
|---|---|---|
| `read-the-message` | `backend/curriculum/phishing.js` | uz + ru |
| `social-engineering-tactics` | `backend/curriculum/phishing.js` | uz + ru |
| `links-and-attachments` | `backend/curriculum/phishing.js` | uz + ru |
| `checkpoint-phishing` | `backend/curriculum/phishing.js` | uz + ru |
| `personal-data-basics` | `backend/curriculum/privacy.js` | uz + ru |
| `sharing-and-privacy-settings` | `backend/curriculum/privacy.js` | uz + ru |
| `data-breach-what-to-do` | `backend/curriculum/privacy.js` | uz + ru |
| `checkpoint-privacy` | `backend/curriculum/privacy.js` | uz + ru |

## Age-group paths (draft)

Four new paths, one per age group (1-4 for parents, 5-7, 8-12, 13-17), plus the
group names and descriptions in `backend/curriculum/ageGroups.js` and the
age-picker strings in `frontend/src/lib/i18n.ts`. Children's content needs a
reviewer who works with that age group, not only a language check.

| Module | File | Notes |
|---|---|---|
| `screens-at-1-4` | `backend/curriculum/age-parents-1-4.js` | uz + ru, for parents; screen-time figures follow WHO 2019 guidance as understood by the author - an early-years specialist must confirm |
| `safe-device-for-child` | `backend/curriculum/age-parents-1-4.js` | uz + ru, for parents; screen-time figures follow WHO 2019 guidance as understood by the author - an early-years specialist must confirm |
| `child-data-and-photos` | `backend/curriculum/age-parents-1-4.js` | uz + ru, for parents; screen-time figures follow WHO 2019 guidance as understood by the author - an early-years specialist must confirm |
| `first-safety-rules` | `backend/curriculum/age-parents-1-4.js` | uz + ru, for parents; screen-time figures follow WHO 2019 guidance as understood by the author - an early-years specialist must confirm |
| `secret-words` | `backend/curriculum/age-kids-5-7.js` | uz + ru, read with a grown-up; needs an early-years educator |
| `ask-a-grown-up` | `backend/curriculum/age-kids-5-7.js` | uz + ru, read with a grown-up; needs an early-years educator |
| `what-to-say` | `backend/curriculum/age-kids-5-7.js` | uz + ru, read with a grown-up; needs an early-years educator |
| `be-kind-online` | `backend/curriculum/age-kids-5-7.js` | uz + ru, read with a grown-up; needs an early-years educator |
| `strong-passwords-kids` | `backend/curriculum/age-kids-8-12.js` | uz + ru; needs a child-safety educator |
| `fake-messages-and-offers` | `backend/curriculum/age-kids-8-12.js` | uz + ru; needs a child-safety educator |
| `game-chat-safety` | `backend/curriculum/age-kids-8-12.js` | uz + ru; needs a child-safety educator |
| `when-someone-is-mean` | `backend/curriculum/age-kids-8-12.js` | uz + ru; needs a child-safety educator |
| `safe-downloads-kids` | `backend/curriculum/age-kids-8-12.js` | uz + ru; needs a child-safety educator |
| `digital-footprint` | `backend/curriculum/age-teens-13-17.js` | uz + ru; `pressure-and-blackmail` names no hotline: the project owner must add verified local contacts |
| `protect-your-accounts` | `backend/curriculum/age-teens-13-17.js` | uz + ru; `pressure-and-blackmail` names no hotline: the project owner must add verified local contacts |
| `scams-aimed-at-teens` | `backend/curriculum/age-teens-13-17.js` | uz + ru; `pressure-and-blackmail` names no hotline: the project owner must add verified local contacts |
| `pressure-and-blackmail` | `backend/curriculum/age-teens-13-17.js` | uz + ru; `pressure-and-blackmail` names no hotline: the project owner must add verified local contacts |
| `ethical-hacking-intro` | `backend/curriculum/age-teens-13-17.js` | uz + ru; `pressure-and-blackmail` names no hotline: the project owner must add verified local contacts |

## Track copy (draft)

Titles, descriptions and learning objectives for all eight tracks in
`backend/curriculum/tracks.js` (`needs_review: true`), and the new interface
strings for Dashboard, Assessments, tracks and mastery in
`frontend/src/lib/i18n.ts`.
