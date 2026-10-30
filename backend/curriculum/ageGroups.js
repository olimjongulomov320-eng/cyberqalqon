/**
 * Age groups. A learner (or a parent choosing for a child) picks one group; it
 * decides which learning path is offered first. Nobody is locked out of the
 * other paths: this is guidance, not access control.
 *
 * No date of birth is ever collected. A group is a self-selected band.
 *
 * `minor` groups get extra protection, enforced server-side (see
 * routes/users.js, routes/leaderboard.js, routes/challenges.js): never on the
 * public leaderboard, and no code challenges for children under 13.
 *
 * Group 1-4 is written for the PARENT. A child that age cannot read or answer
 * questions, so that path is guidance for the adult (audience: 'parent').
 *
 * All age-group content is draft and flagged needs_review: it must be checked
 * by a native speaker and, for the youngest groups, by an early-years
 * educator before release (see CONTENT_REVIEW.md).
 */
const T = (uz, ru) => ({ uz, ru });

const AGE_GROUPS = [
  {
    slug: '1-4',
    icon: 'baby',
    minor: true,
    under13: true,
    audience: 'parent',
    path: 'parents-1-4',
    title: T('1-4 yosh', '1-4 года'),
    who: T('Ota-onalar uchun', 'Для родителей'),
    description: T(
      'Kichkintoy bilan raqamli dunyoga xavfsiz qadam: ekran vaqti, qurilma va rasmlar.',
      'Безопасные первые шаги малыша в цифровом мире: экран, устройство и фотографии.'
    ),
  },
  {
    slug: '5-7',
    icon: 'smiley',
    minor: true,
    under13: true,
    audience: 'child',
    path: 'kids-5-7',
    title: T('5-7 yosh', '5-7 лет'),
    who: T('Kattalar bilan birga', 'Вместе со взрослым'),
    description: T(
      'Qisqa va oddiy qoidalar: maxfiy so‘z, kattalardan so‘rash va mehribonlik.',
      'Короткие простые правила: секретное слово, спросить взрослого и быть добрым.'
    ),
  },
  {
    slug: '8-12',
    icon: 'backpack',
    minor: true,
    under13: true,
    audience: 'child',
    path: 'kids-8-12',
    title: T('8-12 yosh', '8-12 лет'),
    who: T('Maktab o‘quvchisi', 'Школьник'),
    description: T(
      'Parollar, yolg‘on xabarlar, o‘yin chatlari va internetda o‘zini himoya qilish.',
      'Пароли, обманные сообщения, игровые чаты и как защитить себя в интернете.'
    ),
  },
  {
    slug: '13-17',
    icon: 'student',
    minor: true,
    under13: false,
    audience: 'teen',
    path: 'teens-13-17',
    title: T('13-17 yosh', '13-17 лет'),
    who: T('O‘smir', 'Подросток'),
    description: T(
      'Raqamli iz, hisobni himoya qilish, firibgarlik va bosimga qarshi harakatlar.',
      'Цифровой след, защита аккаунтов, мошенничество и что делать при давлении.'
    ),
  },
  {
    slug: '18+',
    icon: 'shield-check',
    minor: false,
    under13: false,
    audience: 'adult',
    path: 'cybersecurity',
    title: T('18+ yosh', '18+ лет'),
    who: T('Kattalar', 'Взрослые'),
    description: T(
      'To‘liq kiber xavfsizlik kursi: asoslardan etik testgacha.',
      'Полный курс кибербезопасности: от основ до этичного тестирования.'
    ),
  },
];

const SLUGS = AGE_GROUPS.map(g => g.slug);
const DEFAULT_GROUP = '18+';

const isAgeGroup = v => typeof v === 'string' && SLUGS.includes(v);
const byslug = new Map(AGE_GROUPS.map(g => [g.slug, g]));
const isMinor = slug => byslug.get(slug)?.minor === true;
const isUnder13 = slug => byslug.get(slug)?.under13 === true;

module.exports = { AGE_GROUPS, SLUGS, DEFAULT_GROUP, isAgeGroup, isMinor, isUnder13 };
