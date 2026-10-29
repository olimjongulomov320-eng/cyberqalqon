/**
 * Privacy & data protection - DRAFT CONTENT (needs_review: true).
 *
 * Uzbek and Russian text is a beginner-level draft that has NOT been checked by
 * a proficient native speaker; review it before production release (see
 * ../../CONTENT_REVIEW.md). All people, accounts and numbers are fictional.
 *
 * Complements `backups-and-data-protection`, `cloud-storage-security` and
 * `hashing-vs-encryption`, which cover backups, storage and encryption; these
 * lessons cover what personal data is, how it is shared, and what to do after a
 * leak.
 */
module.exports = [
  {
    slug: 'personal-data-basics',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 25,
    title: { uz: 'Shaxsiy ma’lumot nima?', ru: 'Что такое персональные данные' },
    content: {
      uz: `## Sizni aniqlaydigan har qanday ma'lumot

**Shaxsiy ma'lumot** - shaxsni aniqlashga yordam beradigan axborot: ism, telefon, manzil, pasport raqami, joylashuv, fotosurat.

Ayrim ma'lumotlar **sezgir**: sog'liq, moliyaviy holat, biometrika. Ular sizib chiqsa, zarar kattaroq.

**Minimallik tamoyili:** faqat kerakli ma'lumotni bering. Kimdir «ro'yxatdan o'tish uchun» pasport rasmini so'rasa, nima uchun ekanini so'rang.

Ma'lumotlaringiz qancha ko'p joyda tursa, hujum yuzasi shuncha katta.`,
      ru: `## Любые данные, по которым можно узнать человека

**Персональные данные** - сведения, позволяющие определить личность: имя, телефон, адрес, номер паспорта, геолокация, фотография.

Некоторые данные **чувствительны**: здоровье, финансы, биометрия. При утечке вред больше.

**Принцип минимальности:** передавайте только необходимое. Если для «регистрации» просят фото паспорта, спросите, зачем это нужно.

Чем в большем числе мест хранятся ваши данные, тем больше поверхность атаки.`,
    },
    exercises: [
      {
        id: 'e1', type: 'multi',
        q: { uz: 'Quyidagilardan qaysilari shaxsiy ma’lumot hisoblanadi?', ru: 'Что из перечисленного относится к персональным данным?' },
        options: [
          { id: 'a', uz: 'Telefon raqami', ru: 'Номер телефона' },
          { id: 'b', uz: 'Pasport raqami', ru: 'Номер паспорта' },
          { id: 'c', uz: 'Ob-havo ma’lumoti', ru: 'Данные о погоде' },
          { id: 'd', uz: 'Uy manzili', ru: 'Домашний адрес' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Shaxsni aniqlashga yordam beradigan axborot shaxsiy ma’lumot hisoblanadi.',
          ru: 'Сведения, помогающие определить личность, являются персональными данными.',
        },
      },
      {
        id: 'e2', type: 'mc',
        q: { uz: 'Minimallik tamoyili nimani anglatadi?', ru: 'Что означает принцип минимальности?' },
        options: [
          { id: 'a', uz: 'Faqat maqsad uchun zarur ma’lumotni berish', ru: 'Передавать только данные, нужные для цели' },
          { id: 'b', uz: 'Ma’lumotni imkon qadar ko‘p joyda saqlash', ru: 'Хранить данные в как можно большем числе мест' },
          { id: 'c', uz: 'Barcha so‘rovlarga rozi bo‘lish', ru: 'Соглашаться на все запросы' },
        ],
        answer: 'a',
        explain: {
          uz: 'Kam ma’lumot - kam xavf. Sizib chiqsa ham, yo‘qotish kichikroq bo‘ladi.',
          ru: 'Меньше данных - меньше риск. Даже при утечке потери будут меньше.',
        },
      },
      {
        id: 'e3', type: 'match',
        q: { uz: 'Ma’lumot turini misol bilan moslang.', ru: 'Сопоставьте тип данных с примером.' },
        pairs: [
          { id: 'p1', left: { uz: 'Oddiy', ru: 'Обычные' }, right: { uz: 'Ism va familiya', ru: 'Имя и фамилия' } },
          { id: 'p2', left: { uz: 'Sezgir', ru: 'Чувствительные' }, right: { uz: 'Tibbiy tashxis', ru: 'Медицинский диагноз' } },
          { id: 'p3', left: { uz: 'Biometrik', ru: 'Биометрические' }, right: { uz: 'Barmoq izi', ru: 'Отпечаток пальца' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Sezgir va biometrik ma’lumotni almashtirib bo‘lmaydi, shuning uchun ularni ayniqsa asrash kerak.',
          ru: 'Чувствительные и биометрические данные нельзя заменить, поэтому их нужно беречь особенно.',
        },
      },
    ],
  },
  {
    slug: 'sharing-and-privacy-settings',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 25,
    title: { uz: 'Ulashish va maxfiylik sozlamalari', ru: 'Публикации и настройки приватности' },
    content: {
      uz: `## Internetda yozilgan narsa qoladi

Bir marta ulashilgan rasm yoki post nusxalanishi mumkin - keyin o'chirsangiz ham.

**Nima qilish kerak:**
- Profil va postlarni «faqat do'stlar» ko'rinishiga o'tkazing.
- Joylashuvni (geoteg) faqat kerak bo'lganda yoqing.
- Ilovalar so'raydigan ruxsatlarni ko'rib chiqing: fonar ilovasi kontaktlaringizni nima uchun so'raydi?
- Ochiq Wi-Fi'da bank va parol kiritadigan joylarga kirmang.

**Ogohlantirish:** chiptangiz, hujjatingiz yoki uyingiz tasviri ba'zan shaxsiy ma'lumotni ko'rsatib qo'yadi.`,
      ru: `## Написанное в интернете остаётся

Однажды опубликованное фото или пост могут скопировать - даже если вы потом удалите.

**Что делать:**
- Переведите профиль и посты в режим «только друзья».
- Включайте геометки только при необходимости.
- Проверяйте разрешения приложений: зачем фонарику ваши контакты?
- Не заходите в банк и не вводите пароли в открытых сетях Wi-Fi.

**Внимание:** на фото билета, документа или дома иногда видны личные данные.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: {
          uz: 'Fonar ilovasi kontaktlaringizga kirishni so‘radi. Eng yaxshi harakat?',
          ru: 'Приложение-фонарик просит доступ к контактам. Что лучше сделать?',
        },
        options: [
          { id: 'a', uz: 'Ruxsat bermayman - ilovaga bu kerak emas', ru: 'Отказать - приложению это не нужно' },
          { id: 'b', uz: 'Doim ruxsat beraman', ru: 'Всегда разрешать' },
          { id: 'c', uz: 'Ilovaga ishonib, hech narsani tekshirmayman', ru: 'Довериться и ничего не проверять' },
        ],
        answer: 'a',
        explain: {
          uz: 'Ruxsat ilova vazifasiga mos bo‘lishi kerak. Ortiqcha ruxsat - ortiqcha xavf.',
          ru: 'Разрешение должно соответствовать назначению приложения. Лишние права - лишний риск.',
        },
      },
      {
        id: 'e2', type: 'multi',
        q: { uz: 'Maxfiylikni oshiradigan harakatlarni tanlang.', ru: 'Выберите действия, повышающие приватность.' },
        options: [
          { id: 'a', uz: 'Postlarni «faqat do‘stlar»ga o‘tkazish', ru: 'Ограничить посты режимом «только друзья»' },
          { id: 'b', uz: 'Barcha rasmlarga geotegni doim yoqish', ru: 'Всегда включать геометку на всех фото' },
          { id: 'c', uz: 'Kerakmas ilova ruxsatlarini olib tashlash', ru: 'Отозвать ненужные разрешения приложений' },
          { id: 'd', uz: 'Ochiq Wi-Fi’da bank ilovasiga kirmaslik', ru: 'Не заходить в банк через открытый Wi-Fi' },
        ],
        answers: ['a', 'c', 'd'],
        explain: {
          uz: 'Doimiy geoteg joylashuvingizni oshkor qiladi, qolganlari maxfiylikni oshiradi.',
          ru: 'Постоянная геометка раскрывает ваше местоположение; остальное повышает приватность.',
        },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'Postni o‘chirsangiz, uning barcha nusxalari ham yo‘qoladi.', ru: 'Если удалить пост, исчезнут и все его копии.' },
        answer: 'false',
        explain: {
          uz: 'Boshqalar skrinshot yoki nusxa olgan bo‘lishi mumkin. Ulashishdan oldin o‘ylang.',
          ru: 'Другие могли сделать скриншот или копию. Думайте до публикации.',
        },
      },
    ],
  },
  {
    slug: 'data-breach-what-to-do',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 25,
    title: { uz: 'Ma’lumotlar sizib chiqsa', ru: 'Если ваши данные утекли' },
    content: {
      uz: `## Tezkor reja

Xizmat «ma'lumotlar sizib chiqdi» deb xabar bersa, vahima qilmang - reja bo'yicha ishlang:

1. **Parolni almashtiring** - shu xizmatda va bir xil parol ishlatilgan boshqa joylarda.
2. **Ikki bosqichli tasdiqni yoqing.**
3. **Moliyaviy ma'lumot** sizsa, bank bilan bog'lanib, kartani bloklang yoki kuzating.
4. **Phishingga ehtiyot bo'ling:** sizib chiqqan ma'lumot asosida aldovchi xabarlar kelishi mumkin.

Har xizmat uchun alohida parol - bitta sizish hamma joyni ochmasligi uchun.`,
      ru: `## Быстрый план

Если сервис сообщает об утечке, не паникуйте - действуйте по плану:

1. **Смените пароль** - в этом сервисе и везде, где был такой же.
2. **Включите двухэтапную защиту.**
3. **Если затронуты финансовые данные**, свяжитесь с банком, заблокируйте или отслеживайте карту.
4. **Остерегайтесь фишинга:** на основе утёкших данных могут присылать убедительные письма.

Отдельный пароль для каждого сервиса - чтобы одна утечка не открыла всё.`,
    },
    exercises: [
      {
        id: 'e1', type: 'order',
        q: { uz: 'Sizib chiqish haqida xabar kelgach, harakatlarni tartiblang.', ru: 'Расставьте действия после сообщения об утечке.' },
        items: [
          { id: 'i1', uz: 'Shu xizmatdagi parolni almashtirish', ru: 'Сменить пароль в этом сервисе' },
          { id: 'i2', uz: 'Xuddi shu parol ishlatilgan boshqa joylarni almashtirish', ru: 'Сменить такой же пароль в других сервисах' },
          { id: 'i3', uz: 'Ikki bosqichli tasdiqni yoqish', ru: 'Включить двухэтапную защиту' },
          { id: 'i4', uz: 'Shubhali xabarlardan ehtiyot bo‘lish', ru: 'Остерегаться подозрительных сообщений' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval zararni to‘xtating, keyin himoyani kuchaytiring, so‘ng ehtiyot bo‘ling.',
          ru: 'Сначала остановите ущерб, затем усильте защиту, после будьте внимательны.',
        },
      },
      {
        id: 'e2', type: 'mc',
        q: { uz: 'Nima uchun har bir xizmatga alohida parol kerak?', ru: 'Зачем нужен отдельный пароль для каждого сервиса?' },
        options: [
          { id: 'a', uz: 'Bitta sizish boshqa hisoblarni ochib yubormasligi uchun', ru: 'Чтобы одна утечка не открыла другие аккаунты' },
          { id: 'b', uz: 'Parol uzunroq bo‘lishi uchun', ru: 'Чтобы пароль был длиннее' },
          { id: 'c', uz: 'Parollarni eslab qolish osonroq bo‘lishi uchun', ru: 'Чтобы проще запоминать пароли' },
        ],
        answer: 'a',
        explain: {
          uz: 'Hujumchilar sizib chiqqan parolni boshqa saytlarda sinab ko‘radi.',
          ru: 'Злоумышленники пробуют утёкший пароль на других сайтах.',
        },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'Sizib chiqqan ma’lumot asosida ishonchli ko‘rinadigan phishing xabari kelishi mumkin.', ru: 'На основе утёкших данных могут прислать убедительное фишинговое сообщение.' },
        answer: 'true',
        explain: {
          uz: 'Hujumchi ismingiz va buyurtmangizni bilsa, xabar ishonchliroq ko‘rinadi.',
          ru: 'Если злоумышленник знает ваше имя и заказ, сообщение выглядит правдоподобнее.',
        },
      },
    ],
  },
  {
    slug: 'checkpoint-privacy',
    kind: 'checkpoint',
    needs_review: true,
    xp_reward: 50,
    title: { uz: 'Nazorat: maxfiylik va ma’lumotlarni himoya qilish', ru: 'Контроль: приватность и защита данных' },
    content: {
      uz: `## Nazorat nuqtasi

Shaxsiy ma'lumot, ulashish sozlamalari va sizib chiqishdan keyingi harakatlarni mustahkamlang. Asosiy g'oya: **kamroq ulashing, ko'proq nazorat qiling.**`,
      ru: `## Контрольная точка

Закрепите знания о персональных данных, настройках публикаций и действиях после утечки. Главная идея: **делитесь меньше, контролируйте больше.**`,
    },
    exercises: [
      {
        id: 'e1', type: 'multi',
        q: { uz: 'Qaysilari sezgir ma’lumot?', ru: 'Что относится к чувствительным данным?' },
        options: [
          { id: 'a', uz: 'Sog‘liq ma’lumotlari', ru: 'Данные о здоровье' },
          { id: 'b', uz: 'Bank hisobi tafsilotlari', ru: 'Реквизиты банковского счёта' },
          { id: 'c', uz: 'Sevimli rang', ru: 'Любимый цвет' },
          { id: 'd', uz: 'Barmoq izi', ru: 'Отпечаток пальца' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Sog‘liq, moliya va biometrika sezgir toifaga kiradi.',
          ru: 'Здоровье, финансы и биометрия относятся к чувствительным данным.',
        },
      },
      {
        id: 'e2', type: 'mc',
        q: { uz: 'Ilova kerakmas ruxsat so‘rasa, nima qilasiz?', ru: 'Что делать, если приложение просит лишнее разрешение?' },
        options: [
          { id: 'a', uz: 'Rad etaman', ru: 'Отказать' },
          { id: 'b', uz: 'Qabul qilaman', ru: 'Принять' },
          { id: 'c', uz: 'E’tibor bermayman', ru: 'Не обращать внимания' },
        ],
        answer: 'a',
        explain: { uz: 'Ruxsat ilova vazifasiga mos bo‘lishi kerak.', ru: 'Разрешение должно соответствовать задаче приложения.' },
      },
      {
        id: 'e3', type: 'order',
        q: { uz: 'Ma’lumotlar sizib chiqqandan keyingi birinchi uch qadam.', ru: 'Первые три шага после утечки данных.' },
        items: [
          { id: 'i1', uz: 'Parolni almashtirish', ru: 'Сменить пароль' },
          { id: 'i2', uz: 'Ikki bosqichli tasdiqni yoqish', ru: 'Включить двухэтапную защиту' },
          { id: 'i3', uz: 'Bank bilan bog‘lanish (kartaga ta’sir qilgan bo‘lsa)', ru: 'Связаться с банком (если затронута карта)' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: { uz: 'Avval kirish himoyasi, keyin moliyaviy tomon.', ru: 'Сначала защита входа, затем финансовая сторона.' },
      },
      {
        id: 'e4', type: 'tf',
        q: { uz: 'Joylashuvni doimo yoqib qo‘yish maxfiylik uchun xavfsiz.', ru: 'Постоянно включённая геолокация безопасна для приватности.' },
        answer: 'false',
        explain: { uz: 'Doimiy joylashuv odatlaringizni oshkor qiladi.', ru: 'Постоянная геолокация раскрывает ваши привычки.' },
      },
    ],
  },
];
