/**
 * Curriculum registry — single source of truth for paths, domains, modules.
 *
 *   PATH (learning path) → DOMAIN (e.g. Networking) → MODULE (a lesson node)
 *   A module's `exercises` array holds the interactive steps.
 *
 * Adding a course = drop a new file into ./ , register it in FILES below,
 * add its domain to DOMAINS and (optionally) a new path to PATHS. No page
 * code changes required — the UI renders whatever this registry returns.
 */

const FILES = [
  { file: 'fundamentals', domain: 'fundamentals' },
  { file: 'networking', domain: 'networking' },
  { file: 'linux', domain: 'linux' },
  { file: 'web-security', domain: 'web-security' },
  // it-and-crypto.js carries modules for several domains (see `domain` field)
  { file: 'it-and-crypto', domain: null },
];

const PATHS = [
  {
    slug: 'cybersecurity',
    icon: '🛡️',
    order_index: 1,
    title: { uz: 'Kiber xavfsizlik', ru: 'Кибербезопасность' },
    description: {
      uz: 'Himoyalanish, aniqlash va xavfsiz ishlash san\'ati — noldan boshlang.',
      ru: 'Защита, обнаружение и безопасная работа — с нуля.',
    },
  },
  {
    slug: 'it-fundamentals',
    icon: '💻',
    order_index: 2,
    title: { uz: 'IT asoslari', ru: 'IT основы' },
    description: {
      uz: 'Kompyuter, ma\'lumotlar bazasi va versiya nazorati — IT fundamenti.',
      ru: 'Компьютеры, базы данных и контроль версий — фундамент IT.',
    },
  },
];

const DOMAINS = [
  { slug: 'fundamentals', path: 'cybersecurity', icon: '🧠', order_index: 1,
    title: { uz: 'Kiber xavfsizlik asoslari', ru: 'Основы кибербезопасности' },
    description: { uz: 'Xavfsizlikning uch ustuni, tahdidlar va zararli dasturlar.', ru: 'Три столпа безопасности, угрозы и вредоносное ПО.' } },
  { slug: 'networking', path: 'cybersecurity', icon: '🌐', order_index: 2,
    title: { uz: 'Tarmoqlar', ru: 'Сети' },
    description: { uz: 'IP, DNS, TCP/UDP, HTTP va tarmoq himoyasi.', ru: 'IP, DNS, TCP/UDP, HTTP и защита сети.' } },
  { slug: 'linux', path: 'cybersecurity', icon: '🐧', order_index: 3,
    title: { uz: 'Linux', ru: 'Linux' },
    description: { uz: 'Terminal, ruxsatlar va xavfsiz sozlamalar.', ru: 'Терминал, права и безопасные настройки.' } },
  { slug: 'web-security', path: 'cybersecurity', icon: '🔐', order_index: 4,
    title: { uz: 'Veb xavfsizlik', ru: 'Веб-безопасность' },
    description: { uz: 'SQL injection, XSS va phishing\'dan himoya.', ru: 'Защита от SQL-инъекций, XSS и фишинга.' } },
  { slug: 'crypto', path: 'cybersecurity', icon: '🔏', order_index: 5,
    title: { uz: 'Kriptografiya', ru: 'Криптография' },
    description: { uz: 'Hash, shifr va kalitlar qanday ishlaydi.', ru: 'Как работают хеши, шифры и ключи.' } },
  { slug: 'it-basics', path: 'it-fundamentals', icon: '⚙️', order_index: 1,
    title: { uz: 'Kompyuter va tizimlar', ru: 'Компьютер и системы' },
    description: { uz: 'Uskuna, operatsion tizim va ularning vazifasi.', ru: 'Железо, операционные системы и их роль.' } },
  { slug: 'databases', path: 'it-fundamentals', icon: '🗄️', order_index: 2,
    title: { uz: 'Ma\'lumotlar bazasi', ru: 'Базы данных' },
    description: { uz: 'Jadvallar, SQL va ma\'lumot xavfsizligi.', ru: 'Таблицы, SQL и безопасность данных.' } },
  { slug: 'git', path: 'it-fundamentals', icon: '🌿', order_index: 3,
    title: { uz: 'Git va versiyalar', ru: 'Git и версии' },
    description: { uz: 'Commit, branch va jamoada ishlash.', ru: 'Коммиты, ветки и работа в команде.' } },
];

/** All curriculum files flattened, each module tagged with its domain slug. */
function loadModules() {
  const out = [];
  const seen = new Set();
  for (const { file, domain } of FILES) {
    let mods;
    try {
      mods = require(`./${file}`);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && String(e.message).includes(file)) continue; // not authored yet
      throw e;
    }
    for (const m of mods) {
      const d = m.domain ?? domain;
      if (!d) throw new Error(`curriculum/${file}: module ${m.slug} has no domain`);
      if (seen.has(m.slug)) throw new Error(`duplicate module slug: ${m.slug}`);
      seen.add(m.slug);
      const { domain: _ignored, ...rest } = m;
      out.push({ ...rest, domain: d });
    }
  }
  return out;
}

/** Learning order inside a domain = array order (×10 leaves insert room). */
function seedData() {
  const modules = loadModules();
  const perDomain = new Map();
  for (const m of modules) {
    if (!perDomain.has(m.domain)) perDomain.set(m.domain, []);
    perDomain.get(m.domain).push(m);
  }
  return {
    paths: PATHS,
    domains: DOMAINS,
    modules: modules.map(m => ({
      ...m,
      order_index: (perDomain.get(m.domain).indexOf(m) + 1) * 10,
    })),
  };
}

module.exports = { PATHS, DOMAINS, seedData, loadModules };
