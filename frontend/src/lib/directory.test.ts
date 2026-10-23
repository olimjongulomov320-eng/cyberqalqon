import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultOpenDomain,
  domainStatus,
  filterDirectory,
  nextCheckpoint,
  pathTotals,
} from './directory.ts';
import type { LearningPath, PathModule } from './api.ts';

function mod(overrides: Partial<PathModule> & { slug: string }): PathModule {
  return {
    title: overrides.slug,
    kind: 'lesson',
    xp_reward: 15,
    exercise_count: 4,
    state: 'open',
    difficulty: 'beginner',
    prerequisite: null,
    ...overrides,
  };
}

const path: LearningPath = {
  slug: 'cybersecurity',
  icon: '🛡️',
  title: 'Kiber xavfsizlik',
  description: 'Himoya san’ati',
  domains: [
    {
      slug: 'networking',
      icon: '🌐',
      title: 'Tarmoqlar',
      description: 'IP, DNS, TCP/UDP',
      completed: 1,
      total: 3,
      modules: [
        mod({ slug: 'ip-basics', state: 'done', title: 'IP asoslari' }),
        mod({ slug: 'dns-deep', state: 'current', title: 'DNS' }),
        mod({ slug: 'tcp-udp', state: 'locked', title: 'TCP/UDP' }),
      ],
    },
    {
      slug: 'linux',
      icon: '🐧',
      title: 'Linux',
      description: 'Terminal va ruxsatlar',
      completed: 0,
      total: 2,
      modules: [
        mod({ slug: 'shell-basics', state: 'open', title: 'Terminal asoslari' }),
        mod({ slug: 'permissions', state: 'locked', title: 'Ruxsatlar' }),
      ],
    },
    {
      slug: 'web-security',
      icon: '🔐',
      title: 'Veb xavfsizlik',
      description: 'SQL injection, XSS',
      completed: 2,
      total: 2,
      modules: [
        mod({ slug: 'sql-injection', state: 'done', title: 'SQL injection' }),
        mod({ slug: 'xss-basics', state: 'done', title: 'XSS asoslari' }),
      ],
    },
  ],
};

test('no filters keeps every module of every domain', () => {
  const { domains, moduleCount } = filterDirectory(path, { filter: 'all', query: '' });
  assert.equal(domains.length, 3);
  assert.equal(moduleCount, 7);
});

test('status chips narrow modules and drop empty domains', () => {
  const todo = filterDirectory(path, { filter: 'todo', query: '' });
  assert.deepEqual(
    todo.domains.map(d => d.slug),
    ['networking', 'linux']
  );
  // networking: dns-deep (current) · linux: shell-basics (open) — the
  // completed and locked ones drop out.
  assert.equal(todo.moduleCount, 2);

  const done = filterDirectory(path, { filter: 'done', query: '' });
  assert.deepEqual(
    done.domains.map(d => d.slug),
    ['networking', 'web-security']
  );
  assert.equal(done.moduleCount, 3);

  const locked = filterDirectory(path, { filter: 'locked', query: '' });
  assert.equal(locked.moduleCount, 2);
});

test('search matches module titles and keeps only those modules', () => {
  const { domains, moduleCount } = filterDirectory(path, { filter: 'all', query: 'dns' });
  assert.equal(domains.length, 1);
  assert.equal(domains[0].slug, 'networking');
  assert.deepEqual(
    domains[0].modules.map(m => m.slug),
    ['dns-deep']
  );
  assert.equal(moduleCount, 1);
});

test('a domain-level search shows the whole domain', () => {
  const { domains } = filterDirectory(path, { filter: 'all', query: 'linux' });
  assert.equal(domains.length, 1);
  assert.equal(domains[0].modules.length, 2);
});

test('search respects the status filter at the same time', () => {
  const { domains } = filterDirectory(path, { filter: 'done', query: 'linux' });
  assert.equal(domains.length, 0);
});

test('a query with no hits yields an empty directory, not everything', () => {
  const { domains, moduleCount } = filterDirectory(path, { filter: 'all', query: 'zzz' });
  assert.equal(domains.length, 0);
  assert.equal(moduleCount, 0);
});

test('default open domain follows the continue target', () => {
  assert.equal(defaultOpenDomain([path], 'dns-deep'), 'networking');
  assert.equal(defaultOpenDomain([path], 'permissions'), 'linux');
  assert.equal(defaultOpenDomain([path], null), null);
  assert.equal(defaultOpenDomain([path], 'nope'), null);
});

test('next checkpoint prefers an unlocked assessment and skips locked ones', () => {
  const withCp: LearningPath = {
    ...path,
    domains: [
      {
        ...path.domains[0],
        modules: [
          ...path.domains[0].modules,
          mod({ slug: 'net-check', state: 'locked', kind: 'checkpoint' }),
        ],
      },
      {
        ...path.domains[1],
        modules: [...path.domains[1].modules, mod({ slug: 'linux-check', state: 'current', kind: 'checkpoint' })],
      },
    ],
  };
  assert.deepEqual(nextCheckpoint([withCp]), { slug: 'linux-check', domainTitle: 'Linux' });
  assert.equal(nextCheckpoint([path]), null);
});

test('domain status is derived from module states', () => {
  assert.equal(domainStatus(path.domains[0]), 'active'); // has a current module
  assert.equal(domainStatus(path.domains[2]), 'done');
  assert.equal(domainStatus({ modules: [mod({ slug: 'a', state: 'locked' })] }), 'locked');
  assert.equal(domainStatus({ modules: [mod({ slug: 'a', state: 'open' })] }), 'available');
});

test('path totals count real states', () => {
  assert.deepEqual(pathTotals(path), { done: 3, total: 7, pct: 43 });
  assert.deepEqual(pathTotals({ ...path, domains: [] }), { done: 0, total: 0, pct: 0 });
});
