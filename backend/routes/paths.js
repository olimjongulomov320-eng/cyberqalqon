const { Router } = require('express');
const pool = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

/**
 * GET /paths — the whole learning map in one call:
 * paths → domains → modules, each module carrying a progression state
 * (done | current | open | locked) plus a `continue` shortcut for the
 * dashboard's primary CTA.
 *
 * Progression rule: modules unlock sequentially inside a domain
 * (a domain's first module is always open). Domains themselves are
 * always browsable — we inform, we don't gate.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const lang = ['uz', 'ru'].includes(req.query.lang) ? req.query.lang : 'uz';
    const userId = req.user?.id ?? null;

    const [paths, domains, mods, done] = await Promise.all([
      pool.query(`SELECT slug, icon, order_index, title_uz, title_ru, description_uz, description_ru
                    FROM paths ORDER BY order_index`),
      pool.query(`SELECT id, slug, path_slug, icon, order_index, title_uz, title_ru, description_uz, description_ru
                    FROM domains ORDER BY path_slug, order_index`),
      pool.query(
        `SELECT m.id, m.slug, m.kind, m.xp_reward, m.order_index, m.domain_id,
                m.title_${lang} AS title,
                jsonb_array_length(m.exercises) AS exercise_count
           FROM modules m
          WHERE m.is_published AND m.domain_id IS NOT NULL
          ORDER BY m.domain_id, m.order_index`
      ),
      pool.query(
        `SELECT module_id FROM user_progress
          WHERE user_id = $1::uuid AND is_completed`,
        [userId]
      ),
    ]);

    const doneSet = new Set(done.rows.map(r => r.module_id));

    // Sequential unlock inside each domain.
    const byDomain = new Map();
    for (const m of mods.rows) {
      if (!byDomain.has(m.domain_id)) byDomain.set(m.domain_id, []);
      byDomain.get(m.domain_id).push(m);
    }
    const state = new Map(); // module id → state
    for (const list of byDomain.values()) {
      let prevDone = true;
      for (const m of list) {
        const isDone = doneSet.has(m.id);
        const s = isDone ? 'done' : prevDone ? 'current' : 'locked';
        state.set(m.id, s);
        prevDone = isDone;
      }
    }

    // Build the tree.
    const domainSlugById = new Map(domains.rows.map(d => [d.id, d.slug]));
    const modsByDomainSlug = new Map();
    for (const m of mods.rows) {
      const slug = domainSlugById.get(m.domain_id);
      if (!slug) continue;
      if (!modsByDomainSlug.has(slug)) modsByDomainSlug.set(slug, []);
      modsByDomainSlug.get(slug).push(m);
    }

    const tree = paths.rows.map(p => ({
      slug: p.slug,
      icon: p.icon,
      title: p[`title_${lang}`],
      description: p[`description_${lang}`],
      domains: domains.rows
        .filter(d => d.path_slug === p.slug)
        .map(d => {
          const list = modsByDomainSlug.get(d.slug) ?? [];
          return {
            slug: d.slug,
            icon: d.icon,
            title: d[`title_${lang}`],
            description: d[`description_${lang}`],
            completed: list.filter(m => state.get(m.id) === 'done').length,
            total: list.length,
            modules: list.map(m => ({
              slug: m.slug,
              title: m.title,
              kind: m.kind,
              xp_reward: m.xp_reward,
              exercise_count: m.exercise_count,
              state: state.get(m.id),
            })),
          };
        }),
    }));

    // Continue target: first non-done module that is unlocked, in path order.
    let cont = null;
    outer: for (const p of tree) {
      for (const d of p.domains) {
        for (const m of d.modules) {
          if (m.state === 'current') {
            cont = {
              slug: m.slug,
              title: m.title,
              kind: m.kind,
              domain_slug: d.slug,
              domain_title: d.title,
              domain_icon: d.icon,
              path_slug: p.slug,
              position: d.modules.indexOf(m) + 1,
              total: d.modules.length,
            };
            break outer;
          }
        }
      }
    }

    res.json({ paths: tree, continue: cont });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
