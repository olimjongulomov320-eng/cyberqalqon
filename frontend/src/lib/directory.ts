/**
 * The Discover directory's derivation — pure, so filtering, the default-open
 * domain and a domain's status label are unit-testable instead of buried in
 * render code.
 */

import type { Domain, LearningPath, PathModule } from './api';

/** Status chips on the directory. `todo` = unlocked and not yet done. */
export type DirectoryFilter = 'all' | 'todo' | 'done' | 'locked';

export interface DirectoryQuery {
  filter: DirectoryFilter;
  /** Free text; matched case-insensitively against domains and modules. */
  query: string;
}

/** A domain as the directory renders it: modules narrowed by the query. */
export interface DirectoryDomain extends Domain {
  modules: PathModule[];
}

export type DomainRowStatus = 'done' | 'active' | 'available' | 'locked';

function stateMatches(state: PathModule['state'], filter: DirectoryFilter): boolean {
  switch (filter) {
    case 'todo':
      return state === 'current' || state === 'open';
    case 'done':
      return state === 'done';
    case 'locked':
      return state === 'locked';
    default:
      return true;
  }
}

const hasText = (text: string | undefined, q: string) =>
  Boolean(q) && (text ?? '').toLowerCase().includes(q);

/**
 * Filter one path's domains.
 *
 * - No query: a domain survives if the status filter leaves it any modules.
 * - Module-level hits win: a query that names specific tasks shows only those.
 * - Otherwise a domain-level hit (title/description/slug) shows the whole
 *   domain, narrowed only by the status filter.
 */
export function filterDirectory(path: LearningPath, { filter, query }: DirectoryQuery): {
  domains: DirectoryDomain[];
  /** Modules currently visible, for the "showing n of m" line. */
  moduleCount: number;
} {
  const q = query.trim().toLowerCase();
  const domains: DirectoryDomain[] = [];
  let moduleCount = 0;

  for (const d of path.domains) {
    const open = d.modules.filter(m => stateMatches(m.state, filter));
    if (open.length === 0) continue;

    let modules = open;
    if (q) {
      const moduleHits = open.filter(m => hasText(m.title, q) || hasText(m.slug, q));
      const domainHit =
        hasText(d.title, q) || hasText(d.description, q) || hasText(d.slug, q);
      if (moduleHits.length > 0) modules = moduleHits;
      else if (!domainHit) continue;
    }

    domains.push({ ...d, modules });
    moduleCount += modules.length;
  }

  return { domains, moduleCount };
}

/** Domains of every path, flattened — handy for counts and lookups. */
export function allDomains(paths: LearningPath[]): Domain[] {
  return paths.flatMap(p => p.domains);
}

/** The domain holding the learner's continue target (opens by default). */
export function defaultOpenDomain(paths: LearningPath[], continueSlug?: string | null): string | null {
  if (!continueSlug) return null;
  for (const p of paths) {
    for (const d of p.domains) {
      if (d.modules.some(m => m.slug === continueSlug)) return d.slug;
    }
  }
  return null;
}

/** The next checkpoint that is actually reachable (not locked), if any. */
export function nextCheckpoint(paths: LearningPath[]): { slug: string; domainTitle: string } | null {
  for (const p of paths) {
    for (const d of p.domains) {
      const cp = d.modules.find(m => m.kind === 'checkpoint' && m.state !== 'locked');
      if (cp) return { slug: cp.slug, domainTitle: d.title };
    }
  }
  return null;
}

/** Row status for a domain, from its own module states — never invented. */
export function domainStatus(d: Pick<Domain, 'modules'>): DomainRowStatus {
  const { modules } = d;
  if (modules.length === 0) return 'available';
  if (modules.every(m => m.state === 'done')) return 'done';
  if (modules.some(m => m.state === 'current')) return 'active';
  if (modules.every(m => m.state === 'locked')) return 'locked';
  if (modules.some(m => m.state === 'done')) return 'active';
  return 'available';
}

/** Whole-path totals counted from real module states. */
export function pathTotals(path: LearningPath): { done: number; total: number; pct: number } {
  const all = path.domains.flatMap(d => d.modules);
  const done = all.filter(m => m.state === 'done').length;
  const total = all.length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}
