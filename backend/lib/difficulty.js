/**
 * Difficulty labels derived from a module's position inside its domain.
 *
 * Why derived, not authored: the curriculum has 80 modules and no hand-written
 * difficulty field, and inventing 80 editorial labels would be a content
 * decision hidden in code. Position inside a learning sequence is a property
 * the curriculum already guarantees (modules unlock sequentially), so it is a
 * defensible, deterministic signal — and it is documented as a heuristic in
 * `RESEARCH.md`, not presented as an official rating.
 *
 * Banding:
 *   - 1 module  → beginner
 *   - 2 modules → beginner, intermediate
 *   - 3+        → ~40% beginner, ~40% intermediate, ~20% advanced
 *                 (at least one module in every band)
 *   - checkpoints are bumped one level: they test a whole domain, so a
 *     mid-domain checkpoint reads intermediate rather than beginner.
 */

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const RANK = { beginner: 0, intermediate: 1, advanced: 2 };

/**
 * @param {{kind?: string, position: number, total: number}} input
 *   `position` is 1-based inside the domain; `total` is the domain's module count.
 * @returns {'beginner'|'intermediate'|'advanced'}
 */
function difficultyForModule({ kind = 'lesson', position, total } = {}) {
  const n = Math.max(1, Number(total) || 1);
  const pos = Math.min(n, Math.max(1, Number(position) || 1));

  let level;
  if (n === 1) {
    level = 0;
  } else if (n === 2) {
    level = pos === 1 ? 0 : 1;
  } else {
    const beginner = Math.max(1, Math.round(n * 0.4));
    const advanced = Math.max(1, Math.round(n * 0.2));
    if (pos <= beginner) level = 0;
    else if (pos <= n - advanced) level = 1;
    else level = 2;
  }

  if (kind === 'checkpoint') level = Math.min(RANK.advanced, level + 1);
  return DIFFICULTIES[level];
}

const isDifficulty = v => DIFFICULTIES.includes(v);

module.exports = { DIFFICULTIES, RANK, difficultyForModule, isDifficulty };
