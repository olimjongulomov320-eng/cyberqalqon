/**
 * Curriculum integrity check — run: node scripts/validate-curriculum.js
 * Exits non-zero on any structural or grading-shape error.
 */
const path = require('path');
const { validateExercise } = require('../lib/grade');

const DOMAINS = process.env.ONLY
  ? process.env.ONLY.split(',').map(s => s.trim())
  : [
  'fundamentals',
  'networking',
  'linux',
  'web-security',
  'it-and-crypto',
];

const MODULE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const errors = [];
const warnings = [];
const slugs = new Set();

for (const domain of DOMAINS) {
  let mod;
  try {
    mod = require(path.join(__dirname, '..', 'curriculum', `${domain}.js`));
  } catch (e) {
    errors.push(`${domain}: cannot require file — ${e.message}`);
    continue;
  }
  if (!Array.isArray(mod)) {
    errors.push(`${domain}: module.exports must be an array`);
    continue;
  }

  mod.forEach((m, i) => {
    const where = `${domain}[${i}] ${m?.slug ?? '?'}`;
    if (!m.slug || !MODULE_RE.test(m.slug)) errors.push(`${where}: bad slug`);
    if (slugs.has(m.slug)) errors.push(`${where}: duplicate slug across curriculum`);
    slugs.add(m.slug);
    if (!['lesson', 'checkpoint'].includes(m.kind)) errors.push(`${where}: kind must be lesson|checkpoint`);
    if (!(Number.isInteger(m.xp_reward) && m.xp_reward > 0)) errors.push(`${where}: xp_reward must be > 0`);
    for (const l of ['uz', 'ru']) {
      if (typeof m.title?.[l] !== 'string' || !m.title[l].trim()) errors.push(`${where}: title.${l} missing`);
      if (typeof m.content?.[l] !== 'string' || m.content[l].trim().length < 80)
        errors.push(`${where}: content.${l} missing or too short (<80 chars)`);
    }
    if (!Array.isArray(m.exercises) || m.exercises.length < (m.kind === 'checkpoint' ? 4 : 3)) {
      errors.push(`${where}: needs >=${m.kind === 'checkpoint' ? 4 : 3} exercises`);
      return;
    }
    const ids = new Set();
    for (const ex of m.exercises) {
      if (ids.has(ex.id)) errors.push(`${where}: duplicate exercise id ${ex.id}`);
      ids.add(ex.id);
      errors.push(...validateExercise(ex, `${where}/${ex.id}`));
      if (ex.q?.uz?.length < 10) warnings.push(`${where}/${ex.id}: unusually short q.uz`);
    }
    if (!m.exercises.some(e => e.type === 'order' || e.type === 'match' || e.type === 'multi'))
      warnings.push(`${where}: only simple types (mc/tf/input) — add variety`);
  });
}

warnings.forEach(w => console.warn(`⚠  ${w}`));
if (errors.length) {
  errors.forEach(e => console.error(`✗ ${e}`));
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log(`✓ curriculum OK (${slugs.size} modules across ${DOMAINS.length} domains)`);
