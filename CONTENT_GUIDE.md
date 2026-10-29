# Adding content

Everything learners see is **data in `backend/curriculum/`**, not component code.

## A lesson (module)

1. Add an object to a curriculum file (e.g. `backend/curriculum/linux.js`), or a new
   file registered in `FILES` in `curriculum/index.js` with its domain in `DOMAINS`.
2. Fields: `slug`, `kind` (`lesson` | `checkpoint`), `xp_reward`, `title{uz,ru}`,
   `content{uz,ru}` (markdown), `exercises[]`.
3. Exercise types: `mc`, `tf`, `multi`, `match`, `order`, `input` (see `lib/grade.js`
   for the exact shape). Every exercise needs `q{uz,ru}` and `explain{uz,ru}`.
   Mark unreviewed translations `needs_review: true` and list them in `CONTENT_REVIEW.md`.
4. Optionally list the slug in a track in `curriculum/tracks.js` (a module can be in one track).
5. `cd backend && node scripts/validate-curriculum.js && npm test`, then regenerate
   `frontend/src/lib/module-slugs.json` (a test tells you when it is stale).

Lessons unlock in order inside a domain; the server enforces it.

**How a lesson plays.** The concept (`content`) sits on the left and the `exercises` are
tasks on the right, like a practice problem set. A wrong answer returns a verdict only;
the explanation and answer appear once the task is solved, or on request ("Show
solution") after two failed attempts, which never counts as solving. A lesson is complete
when every task is solved (enforced by the server from its own attempt records).

## A coding challenge

Add an object to `backend/curriculum/challenges.js`:

```js
{
  slug: 'reverse-string', difficulty: 'easy' | 'medium' | 'hard', points: 10,
  tags: ['strings'], language: 'python', entry: 'solve', module: '<lesson slug>',
  needs_review: true,
  title: { uz, ru }, statement: { uz, ru } /* markdown */, constraints: { uz, ru },
  starter: 'def solve(s):\n    pass',
  reference: '...a correct solution...',        // never sent to clients
  examples: [{ args: ['abc'], expected: 'cba' }],
  tests: [{ args: ['abc'], expected: 'cba', hidden: false }, /* >= 2 visible, >= 3 hidden */],
}
```

`npm test` runs every `reference` through `python3` against its tests and checks the
`starter` does not already pass. Tests are function calls: `args` are passed to
`solve(*args)` and the JSON-serialised result must equal `expected`.

**Trust model:** challenges run in the learner's browser (Pyodide). The server cannot
verify a "solved" claim and hidden tests are delivered to the client, so challenge
points are self-reported and are kept out of XP and the leaderboard. A server-side
judge (e.g. Judge0) would be needed to change that.

## Icons

Icons are never emoji and never hand-drawn. Paths, domains, tracks and achievements
carry an **icon key** (for example `'shield-check'`, `'terminal-window'`). Keys are the
names in `CONTENT_ICONS` in `frontend/src/components/icons.tsx` (Phosphor, one weight).
To use a new glyph, import it from `@phosphor-icons/react/dist/ssr` and add one line to
that registry; a backend test fails if curriculum data uses a key that is not registered.

## Switches

- `NEXT_PUBLIC_HEARTS_ENABLED=true` (frontend build env) turns hearts on; they are off by default.
- Theme: light / dark / system toggle in the header; tokens live in `frontend/src/app/globals.css`. The look is a security console: near-black surfaces, one signal-green accent (the token keeps its old name `cyan-*`, the values are green), monospace labels, tight corners. Change the accent by editing the `--cyan-*` variables.
