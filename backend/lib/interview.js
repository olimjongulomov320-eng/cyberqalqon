/**
 * Mock interviews: paper selection, public shaping (answers never leave the
 * server), grading and the scorecard.
 *
 * Trust model: concept and scenario answers are graded here against keys the
 * client never sees. The coding round runs in the learner's browser (same as
 * code challenges, see lib/challenges.js), so its pass count is self-reported.
 */
const { ROLES, SKILLS, FORMAT } = require('../curriculum/interviews');
const { loadModules } = require('../curriculum');

const bySlug = new Map(ROLES.map(r => [r.slug, r]));
const pickLang = q => (q === 'ru' ? 'ru' : 'uz');
const MAX_CODE_BYTES = 12_000;
/** Seconds of slack on top of the format's total before a session counts as late. */
const GRACE_S = 180;
const TOTAL_S = FORMAT.reduce((n, r) => n + r.minutes * 60, 0);

let moduleTitles = null;
function moduleTitle(slug, lang) {
  if (!moduleTitles) moduleTitles = new Map(loadModules().map(m => [m.slug, m.title]));
  return moduleTitles.get(slug)?.[lang] ?? null;
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A fresh paper: which concept questions (in order) and which scenario. */
function makePlan(role) {
  const concepts = FORMAT.find(r => r.kind === 'concepts');
  return {
    concepts: shuffle(role.concepts).slice(0, concepts.pick).map(q => q.id),
    scenario: role.scenarios[Math.floor(Math.random() * role.scenarios.length)].id,
  };
}

const skillLabel = (key, lang) => SKILLS[key]?.[lang] ?? key;

/** List row for a role. */
function roleSummary(role, lang) {
  return {
    slug: role.slug,
    icon: role.icon,
    level: role.level,
    title: role.title[lang],
    summary: role.summary[lang],
    skills: role.skills.map(k => ({ key: k, label: skillLabel(k, lang) })),
    minutes: TOTAL_S / 60,
    rounds: FORMAT.map(r => ({ kind: r.kind, minutes: r.minutes })),
    needs_review: Boolean(role.needs_review),
  };
}

/** Prep page: the summary plus the study briefs and the bank sizes. */
function roleDetail(role, lang) {
  return {
    ...roleSummary(role, lang),
    brief: role.brief.map(b => ({ title: b.title[lang], body: b.body[lang] })),
    bank: { concepts: role.concepts.length, scenarios: role.scenarios.length },
    modules: [...new Set(role.skills.flatMap(k => SKILLS[k]?.modules ?? []))]
      .map(slug => ({ slug, title: moduleTitle(slug, lang) }))
      .filter(m => m.title),
  };
}

/** The paper the client renders. No answers, no explanations. */
function paper(role, plan, lang) {
  const byId = new Map(role.concepts.map(q => [q.id, q]));
  const scenario = role.scenarios.find(s => s.id === plan.scenario);
  const t = role.task;
  return {
    role: roleSummary(role, lang),
    rounds: FORMAT.map(r => {
      if (r.kind === 'concepts') {
        return {
          kind: r.kind,
          minutes: r.minutes,
          questions: plan.concepts.map(id => {
            const q = byId.get(id);
            return { id: q.id, skill: q.skill, q: q.q[lang], options: q.options[lang] };
          }),
        };
      }
      if (r.kind === 'scenario') {
        return {
          kind: r.kind,
          minutes: r.minutes,
          scenario: {
            id: scenario.id,
            title: scenario.title[lang],
            context: scenario.context[lang],
            steps: scenario.steps.map(s => ({ skill: s.skill, q: s.q[lang], options: s.options[lang] })),
          },
        };
      }
      return {
        kind: r.kind,
        minutes: r.minutes,
        task: {
          slug: t.slug,
          entry: t.entry,
          title: t.title[lang],
          statement: t.statement[lang],
          constraints: t.constraints[lang],
          starter: t.starter,
          // The browser runner needs every case (see the trust model above).
          tests: t.tests.map(c => ({ args: c.args, expected: c.expected, hidden: c.hidden })),
        },
      };
    }),
  };
}

const isChoice = v => v === null || (Number.isInteger(v) && v >= 0 && v < 8);

/** Validate a finish payload against the session's plan. */
function validateAnswers(role, plan, body) {
  const { concepts, scenario, coding, round_seconds: secs } = body ?? {};
  if (!concepts || typeof concepts !== 'object' || Array.isArray(concepts)) return 'concepts must be an object';
  for (const [id, v] of Object.entries(concepts)) {
    if (!plan.concepts.includes(id)) return `unknown question ${id}`;
    if (!isChoice(v)) return 'concept answers must be option indexes or null';
  }
  const steps = role.scenarios.find(s => s.id === plan.scenario).steps.length;
  if (!Array.isArray(scenario) || scenario.length > steps || !scenario.every(isChoice)) return 'scenario must be a list of option indexes';
  if (coding !== null && coding !== undefined) {
    const total = role.task.tests.length;
    if (!Number.isInteger(coding.passed) || coding.total !== total || coding.passed < 0 || coding.passed > total) return 'coding result out of range';
    if (typeof coding.code !== 'string' || Buffer.byteLength(coding.code, 'utf8') > MAX_CODE_BYTES) return 'code is missing or too long';
  }
  if (!Array.isArray(secs) || secs.length !== FORMAT.length || !secs.every(n => Number.isInteger(n) && n >= 0 && n <= 4 * 3600)) {
    return 'round_seconds must list whole seconds per round';
  }
  return null;
}

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

/** Scores from stored answers. Language-free, so it is computed once at finish. */
function score(role, plan, answers) {
  const byId = new Map(role.concepts.map(q => [q.id, q]));
  const conceptOk = plan.concepts.filter(id => answers.concepts[id] === byId.get(id).answer).length;
  const steps = role.scenarios.find(s => s.id === plan.scenario).steps;
  const scenarioOk = steps.filter((s, i) => answers.scenario[i] === s.answer).length;
  const coding = answers.coding;
  const onTime = FORMAT.filter((r, i) => answers.round_seconds[i] <= r.minutes * 60 + 15).length;

  const dims = {
    knowledge: pct(conceptOk, plan.concepts.length),
    analysis: pct(scenarioOk, steps.length),
    practical: coding ? pct(coding.passed, coding.total) : 0,
    time: pct(onTime, FORMAT.length),
  };
  const overall = Math.round(dims.knowledge * 0.35 + dims.analysis * 0.35 + dims.practical * 0.3);
  return { overall, dims };
}

const verdictOf = overall => (overall >= 80 ? 'ready' : overall >= 60 ? 'close' : 'notyet');

/** The full scorecard for a finished session, in the requested language. */
function report(row, lang) {
  const role = bySlug.get(row.role_slug);
  const { plan, answers } = row;
  const byId = new Map(role.concepts.map(q => [q.id, q]));
  const scenario = role.scenarios.find(s => s.id === plan.scenario);

  const review = (q, chosen) => ({
    q: q.q[lang],
    options: q.options[lang],
    chosen: chosen ?? null,
    answer: q.answer,
    correct: chosen === q.answer,
    why: q.why[lang],
    skill: q.skill,
  });
  const conceptItems = plan.concepts.map(id => review(byId.get(id), answers.concepts[id]));
  const scenarioItems = scenario.steps.map((s, i) => review(s, answers.scenario[i]));

  // Per-skill tally across both graded rounds, plus the coding task as Python.
  const tally = new Map();
  const add = (key, ok, total) => {
    const t = tally.get(key) ?? { ok: 0, total: 0 };
    tally.set(key, { ok: t.ok + ok, total: t.total + total });
  };
  for (const it of [...conceptItems, ...scenarioItems]) add(it.skill, it.correct ? 1 : 0, 1);
  if (answers.coding) add('python', answers.coding.passed, answers.coding.total);
  else add('python', 0, role.task.tests.length);

  const skills = [...tally.entries()]
    .map(([key, t]) => {
      const ratio = t.total ? t.ok / t.total : 0;
      return {
        key,
        label: skillLabel(key, lang),
        ok: t.ok,
        total: t.total,
        score: Math.round(ratio * 100),
        status: ratio >= 0.75 ? 'strong' : ratio >= 0.5 ? 'ok' : 'focus',
        modules: (SKILLS[key]?.modules ?? [])
          .map(slug => ({ slug, title: moduleTitle(slug, lang) }))
          .filter(m => m.title)
          .slice(0, 2),
      };
    })
    .sort((a, b) => a.score - b.score);

  const elapsed = answers.round_seconds.reduce((n, s) => n + s, 0);
  return {
    id: row.id,
    role: roleSummary(role, lang),
    started_at: row.started_at,
    finished_at: row.finished_at,
    duration_s: elapsed,
    late: Boolean(row.late),
    overall: row.score,
    verdict: verdictOf(row.score),
    dims: row.dims,
    rounds: [
      { kind: 'concepts', seconds: answers.round_seconds[0], limit_s: FORMAT[0].minutes * 60, items: conceptItems },
      { kind: 'scenario', seconds: answers.round_seconds[1], limit_s: FORMAT[1].minutes * 60, title: scenario.title[lang], context: scenario.context[lang], items: scenarioItems },
      {
        kind: 'coding',
        seconds: answers.round_seconds[2],
        limit_s: FORMAT[2].minutes * 60,
        title: role.task.title[lang],
        passed: answers.coding?.passed ?? 0,
        total: role.task.tests.length,
        attempted: Boolean(answers.coding),
        code: answers.coding?.code ?? '',
        verified: false,
      },
    ],
    skills,
  };
}

module.exports = { ROLES, FORMAT, TOTAL_S, GRACE_S, bySlug, pickLang, makePlan, roleSummary, roleDetail, paper, validateAnswers, score, verdictOf, report };
