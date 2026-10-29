/**
 * Learning tracks — a thin grouping layer over the existing curriculum.
 *
 * A track references modules by slug. It never moves, renames or re-orders a
 * module: domains, module slugs, sequential unlock, progress rows and XP all
 * stay exactly as they were. A module belongs to at most one track (enforced by
 * test); modules in no track (crypto, cloud, ethical testing, IT basics…) stay
 * reachable through Learn.
 *
 * `prerequisites` are RECOMMENDATIONS shown to the learner, not locks — the
 * existing domain-level sequential unlock remains the only gate.
 *
 * `completion.rule = 'all_modules'`: a track is complete when every listed
 * module is completed. Completion is activity, not mastery; mastery is
 * computed separately (lib/mastery.js).
 *
 * `needs_review`: titles/objectives were drafted in Uzbek and Russian without
 * native-speaker verification (see CONTENT_REVIEW.md).
 */
const T = (uz, ru) => ({ uz, ru });

const TRACKS = [
  {
    slug: 'fundamentals',
    icon: '🧠',
    order: 1,
    level: 'beginner',
    title: T('Kiber xavfsizlik asoslari', 'Основы кибербезопасности'),
    description: T('Xavfsizlikning asosiy tushunchalari, tahdidlar va himoya.', 'Базовые понятия безопасности, угрозы и защита.'),
    objectives: {
      uz: ['Maxfiylik, butunlik va mavjudlik tamoyilini tushuntirish', 'Keng tarqalgan tahdid va zararli dastur turlarini farqlash', 'Qatlamli himoya g‘oyasini izohlash'],
      ru: ['Объяснить принципы конфиденциальности, целостности и доступности', 'Различать распространённые угрозы и виды вредоносного ПО', 'Описать идею многоуровневой защиты'],
    },
    prerequisites: [],
    modules: ['what-is-cybersecurity', 'cia-triad', 'threats-and-risks', 'malware-basics', 'common-attacks', 'defense-in-depth', 'checkpoint-fundamentals'],
    needs_review: true,
  },
  {
    slug: 'accounts-and-authentication',
    icon: '🔑',
    order: 2,
    title: T('Hisob va autentifikatsiya xavfsizligi', 'Безопасность аккаунтов и аутентификация'),
    description: T('Parollar, ikki bosqichli tasdiq, sessiyalar va kirish huquqlari.', 'Пароли, двухэтапная защита, сессии и права доступа.'),
    objectives: {
      uz: ['Kuchli parol va 2FA ning ahamiyatini izohlash', 'Parol qanday saqlanishini (xesh) tushunish', 'Sessiya va kirish nazoratidagi xatolarni aniqlash'],
      ru: ['Объяснить значение надёжных паролей и 2FA', 'Понимать, как хранятся пароли (хеширование)', 'Находить ошибки в сессиях и контроле доступа'],
    },
    prerequisites: ['fundamentals'],
    modules: ['passwords-and-mfa', 'password-hashing', 'authentication-and-sessions', 'broken-access-control', 'cloud-identity-and-access'],
    needs_review: true,
  },
  {
    slug: 'phishing-and-social-engineering',
    icon: '🎣',
    order: 3,
    level: 'beginner',
    title: T('Phishing va ijtimoiy muhandislik', 'Фишинг и социальная инженерия'),
    description: T('Aldov xabarlarini taniysiz va to‘g‘ri harakat qilasiz.', 'Вы распознаёте обманные сообщения и действуете правильно.'),
    objectives: {
      uz: ['Shubhali xabarni bosqichma-bosqich tekshirish', 'Ijtimoiy muhandislik usullarini nomlash', 'Havola va fayllar bilan xavfsiz ishlash'],
      ru: ['Пошагово проверять подозрительное сообщение', 'Называть приёмы социальной инженерии', 'Безопасно работать со ссылками и файлами'],
    },
    prerequisites: [],
    modules: ['phishing-basics', 'read-the-message', 'social-engineering-tactics', 'links-and-attachments', 'checkpoint-phishing'],
    needs_review: true,
  },
  {
    slug: 'web-security',
    icon: '🔐',
    order: 4,
    title: T('Veb xavfsizlik asoslari', 'Основы веб-безопасности'),
    description: T('Veb-ilovalardagi keng tarqalgan zaifliklar va himoya.', 'Распространённые уязвимости веб-приложений и защита.'),
    objectives: {
      uz: ['SQL injection va XSS ning ishlash mantig‘ini tushuntirish', 'Kiruvchi ma’lumotni tekshirish va CSRF himoyasini qo‘llash', 'Xavfsizlik sarlavhalarining vazifasini bilish'],
      ru: ['Объяснить логику SQL-инъекций и XSS', 'Применять проверку входных данных и защиту от CSRF', 'Знать назначение заголовков безопасности'],
    },
    prerequisites: ['fundamentals'],
    modules: ['what-is-sql-injection', 'xss-basics', 'input-validation', 'csrf', 'security-headers', 'checkpoint-web-security'],
    needs_review: true,
  },
  {
    slug: 'network-security',
    icon: '🌐',
    order: 5,
    title: T('Tarmoq xavfsizligi asoslari', 'Основы сетевой безопасности'),
    description: T('Tarmoq qanday ishlaydi va uni qanday himoya qilish kerak.', 'Как работает сеть и как её защищать.'),
    objectives: {
      uz: ['IP, DNS, TCP/UDP va HTTP(S) ishlashini tushuntirish', 'Firewall, VPN va NAT vazifasini ajratish', 'Tarmoq va qurilma himoyasini baholash'],
      ru: ['Объяснить работу IP, DNS, TCP/UDP и HTTP(S)', 'Различать роли firewall, VPN и NAT', 'Оценивать защиту сети и устройств'],
    },
    prerequisites: ['fundamentals'],
    modules: [
      'intro-to-networking', 'ip-addresses', 'subnetting-basics', 'mac-arp-switching', 'dns-basics', 'tcp-and-udp',
      'osi-and-tcp-ip-models', 'http-and-https', 'tls-certificates', 'routing-and-nat', 'what-is-a-firewall', 'vpn-and-proxy',
      'network-and-endpoint-defense', 'checkpoint-networking',
    ],
    needs_review: true,
  },
  {
    slug: 'linux-security',
    icon: '🐧',
    order: 6,
    title: T('Linux va buyruq qatori xavfsizligi', 'Безопасность Linux и командной строки'),
    description: T('Terminal, ruxsatlar, foydalanuvchilar va xavfsiz sozlamalar.', 'Терминал, права, пользователи и безопасные настройки.'),
    objectives: {
      uz: ['Asosiy buyruqlar bilan fayl tizimida ishlash', 'Ruxsatlar va foydalanuvchilarni to‘g‘ri sozlash', 'Jurnal va xizmatlar orqali tizim holatini tekshirish'],
      ru: ['Работать с файловой системой через основные команды', 'Правильно настраивать права и пользователей', 'Проверять состояние системы по журналам и службам'],
    },
    prerequisites: ['fundamentals'],
    modules: [
      'linux-basics', 'linux-command-line', 'linux-filesystem', 'linux-permissions', 'linux-users-groups',
      'linux-processes-services', 'linux-packages-logs', 'linux-security-basics', 'checkpoint-linux',
    ],
    needs_review: true,
  },
  {
    slug: 'privacy-and-data-protection',
    icon: '🛡️',
    order: 7,
    level: 'beginner',
    title: T('Maxfiylik va ma’lumotlarni himoya qilish', 'Приватность и защита данных'),
    description: T('Shaxsiy ma’lumotni asrash, ulashish va sizib chiqishga javob.', 'Защита персональных данных, публикации и реакция на утечки.'),
    objectives: {
      uz: ['Shaxsiy va sezgir ma’lumotni farqlash', 'Maxfiylik sozlamalari va ruxsatlarni boshqarish', 'Ma’lumot sizib chiqqanda to‘g‘ri harakat qilish'],
      ru: ['Различать персональные и чувствительные данные', 'Управлять настройками приватности и разрешениями', 'Правильно действовать при утечке данных'],
    },
    prerequisites: [],
    modules: [
      'backups-and-data-protection', 'cloud-storage-security', 'hashing-vs-encryption',
      'personal-data-basics', 'sharing-and-privacy-settings', 'data-breach-what-to-do', 'checkpoint-privacy',
    ],
    needs_review: true,
  },
  {
    slug: 'incident-response',
    icon: '🚨',
    order: 8,
    title: T('Hodisalarni aniqlash va javob', 'Распознавание инцидентов и реагирование'),
    description: T('Monitoring, ogohlantirish, zaifliklar va hodisaga javob bosqichlari.', 'Мониторинг, оповещения, уязвимости и этапы реагирования.'),
    objectives: {
      uz: ['Jurnal va SIEM ogohlantirishlarini o‘qish', 'Zaifliklarni xavfga qarab tartiblash', 'Hodisaga javob bosqichlarini bajarish'],
      ru: ['Читать журналы и оповещения SIEM', 'Приоритизировать уязвимости по риску', 'Выполнять этапы реагирования на инцидент'],
    },
    prerequisites: ['fundamentals'],
    modules: [
      'logging-and-monitoring', 'siem-and-alerts', 'hardening-and-patching', 'vulnerability-management',
      'incident-response', 'checkpoint-defensive-security',
    ],
    needs_review: true,
  },
];

const bySlug = new Map(TRACKS.map(t => [t.slug, t]));

/** module slug → track slug (a module belongs to at most one track). */
function trackOfModule() {
  const map = new Map();
  for (const t of TRACKS) for (const m of t.modules) if (!map.has(m)) map.set(m, t.slug);
  return map;
}

module.exports = { TRACKS, bySlug, trackOfModule };
