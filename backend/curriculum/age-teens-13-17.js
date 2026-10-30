/**
 * Age group 13-17 - DRAFT CONTENT (needs_review: true).
 *
 * For teenagers. Direct and respectful: practical steps, no lecturing, no
 * graphic detail. The pressure / blackmail lesson says plainly that it is not
 * the young person's fault and always points to a trusted adult and to
 * reporting inside the app; it deliberately names no hotline numbers, because
 * the right local contacts must be supplied and verified by the project owner.
 * The Uzbek and Russian text has NOT been checked by a native speaker or a
 * child-safety specialist and must be before release (see
 * ../../CONTENT_REVIEW.md). All names and offers are fictional.
 */
module.exports = [
  {
    slug: 'digital-footprint',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 20,
    title: { uz: 'Raqamli iz', ru: 'Цифровой след' },
    content: {
      uz: `## Internetdagi har bir narsa iz qoldiradi

Joylashtirgan rasm, izoh va layk - hammasi **saqlanishi, ekran suratiga olinishi va topilishi** mumkin.

- **«Yopiq» - to‘liq yopiq emas.** Do‘sting hikoyangni skrinshot qilib tarqatishi mumkin.
- **«O‘chirdim» - butunlay yo‘qoldi degani emas.** Nusxa allaqachon bo‘lishi mumkin.
- Kelajakda **o‘qish, ish va yangi tanishlar** seni internet orqali ham ko‘radi.

**Joylashtirishdan oldin so‘ra:** «O‘qituvchim, ota-onam yoki kelajakdagi ish beruvchi buni ko‘rsa, qanday bo‘ladi?»`,
      ru: `## Всё в интернете оставляет след

Фото, комментарии и лайки - всё это можно **сохранить, заскринить и найти**.

- **«Закрыто» - не значит полностью закрыто.** Друг может сделать скриншот истории и разослать.
- **«Удалил» - не значит исчезло.** Копия могла уже появиться.
- В будущем **учёба, работа и новые знакомые** смотрят и в интернете.

**Перед публикацией спроси себя:** «Что будет, если это увидят учитель, родители или будущий работодатель?»`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Qaysi odat raqamli izdan kelib chiqadigan muammolarni kamaytiradi?', ru: 'Какая привычка уменьшает проблемы из-за цифрового следа?' },
        options: [
          { id: 'a', uz: 'Joylashtirishdan oldin «kim ko‘rsa ham bo‘ladimi?» deb o‘ylash', ru: 'Перед публикацией думать: «Можно ли, чтобы это увидел кто угодно?»' },
          { id: 'b', uz: 'Hammasini hamma uchun ochiq qoldirish', ru: 'Оставлять всё открытым для всех' },
          { id: 'c', uz: 'Do‘stlarga parolni berish', ru: 'Давать друзьям пароль' },
        ],
        answer: 'a',
        explain: {
          uz: 'Joylashtirishdan oldingi bir soniyalik o‘ylash eng kuchli himoya.',
          ru: 'Секунда размышления перед публикацией - самая сильная защита.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Yopiq akkauntdagi hikoyani ham boshqalar ekran surati orqali tarqatishi mumkin.', ru: 'Историю в закрытом аккаунте тоже можно разослать через скриншот.' },
        answer: 'true',
        explain: {
          uz: 'Sahifa yopiq bo‘lsa ham, uni ko‘radigan odam nusxa olishi mumkin.',
          ru: 'Даже если страница закрыта, тот, кто её видит, может сделать копию.',
        },
      },
      {
        id: 'e3', type: 'multi',
        q: { uz: 'Joylashtirishdan oldin nimalarni tekshirish kerak? (bir nechtasini tanlang)', ru: 'Что проверить перед публикацией? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'Rasmda manzil, maktab yoki raqam ko‘rinmayaptimi?', ru: 'Не видны ли на фото адрес, школа или номер?' },
          { id: 'b', uz: 'Buni kimlar ko‘ra oladi?', ru: 'Кто сможет это увидеть?' },
          { id: 'c', uz: 'Nechta layk olaman?', ru: 'Сколько лайков наберу?' },
          { id: 'd', uz: 'Yillar o‘tib ham bu menga muammo bo‘lmaydimi?', ru: 'Не создаст ли это проблем через годы?' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Ko‘rinadigan ma‘lumot, auditoriya va kelajakdagi oqibat muhim. Layk soni esa xavfsizlikka aloqasi yo‘q.',
          ru: 'Важны видимые данные, аудитория и последствия в будущем. Количество лайков к безопасности не относится.',
        },
      },
    ],
  },

  {
    slug: 'protect-your-accounts',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 20,
    title: { uz: 'Hisobingni o‘g‘irlashdan himoya', ru: 'Защита аккаунтов от угона' },
    content: {
      uz: `## Hisoblar qanday o‘g‘irlanadi

- **Bir xil parol** hamma joyda ishlatilganda.
- **Soxta havola:** «Menga ovoz ber» deb kirish sahifasiga yo‘naltiradi.
- **Kodni aytib yuborish:** SMS yoki ilovadagi kod - faqat seniki.

**Himoya:**
1. Har bir hisob uchun **alohida uzun parol** (parol menejeri yordam beradi).
2. **Ikki bosqichli tasdiq (2FA)**ni yoq.
3. Kirgan qurilmalarni vaqti-vaqti bilan tekshir.

**Buzilgan bo‘lsa:** parolni o‘zgartir, hamma qurilmadan chiq, 2FA yoq, do‘stlarni ogohlantir va ota-onangga ayt.`,
      ru: `## Как угоняют аккаунты

- **Один и тот же пароль** везде.
- **Поддельная ссылка:** «Проголосуй за меня» ведёт на страницу входа-обманку.
- **Кто-то узнал код:** код из SMS или приложения - только твой.

**Защита:**
1. **Отдельный длинный пароль** для каждого аккаунта (поможет менеджер паролей).
2. Включи **двухэтапную защиту (2FA)**.
3. Иногда проверяй, с каких устройств выполнен вход.

**Если взломали:** смени пароль, выйди со всех устройств, включи 2FA, предупреди друзей и скажи родителям.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Do‘stingning akkauntidan «menga ovoz ber» deb havola keldi, u kirish uchun parol so‘raydi. Nima qilasan?', ru: 'С аккаунта друга пришла ссылка «проголосуй за меня», она просит пароль. Что делаешь?' },
        options: [
          { id: 'a', uz: 'Bosmayman, do‘stimga boshqa yo‘l bilan yozib so‘rayman', ru: 'Не нажимаю, спрашиваю друга другим способом' },
          { id: 'b', uz: 'Parolni kiritaman', ru: 'Ввожу пароль' },
          { id: 'c', uz: 'Boshqalarga ham yuboraman', ru: 'Пересылаю другим' },
        ],
        answer: 'a',
        explain: {
          uz: 'Do‘stning akkaunti buzilgan bo‘lishi mumkin. Havolani bosmay, boshqa kanal orqali so‘ra.',
          ru: 'Аккаунт друга могли взломать. Не нажимай, уточни по другому каналу.',
        },
      },
      {
        id: 'e2', type: 'multi',
        q: { uz: 'Qaysilari akkauntni himoya qiladi? (bir nechtasini tanlang)', ru: 'Что защищает аккаунт? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'Har bir sayt uchun alohida parol', ru: 'Отдельный пароль для каждого сайта' },
          { id: 'b', uz: 'Ikki bosqichli tasdiqni yoqish', ru: 'Включить двухэтапную защиту' },
          { id: 'c', uz: 'SMS-kodni do‘stga aytish', ru: 'Говорить SMS-код другу' },
          { id: 'd', uz: 'Parol menejeridan foydalanish', ru: 'Пользоваться менеджером паролей' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Alohida parollar, 2FA va parol menejeri - kuchli uchlik. Kodni aytish esa himoyani buzadi.',
          ru: 'Отдельные пароли, 2FA и менеджер паролей - сильная тройка. Называть код - значит ломать защиту.',
        },
      },
      {
        id: 'e3', type: 'order',
        q: { uz: 'Akkaunting buzilganda tartibni joylashtiring.', ru: 'Расставьте порядок действий, если аккаунт взломали.' },
        items: [
          { id: 'i1', uz: 'Parolni o‘zgartirish', ru: 'Сменить пароль' },
          { id: 'i2', uz: 'Barcha qurilmalardan chiqish', ru: 'Выйти со всех устройств' },
          { id: 'i3', uz: 'Ikki bosqichli tasdiqni yoqish', ru: 'Включить двухэтапную защиту' },
          { id: 'i4', uz: 'Do‘stlarni ogohlantirish va kattaga aytish', ru: 'Предупредить друзей и сказать взрослому' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval kirishni yoping, keyin himoyani kuchaytiring, so‘ng boshqalarni ogohlantiring.',
          ru: 'Сначала закройте доступ, затем усильте защиту, после предупредите других.',
        },
      },
    ],
  },

  {
    slug: 'scams-aimed-at-teens',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 20,
    title: { uz: 'O‘smirlarga qaratilgan firibgarliklar', ru: 'Мошенничество, нацеленное на подростков' },
    content: {
      uz: `## Firibgarlar nimaga tayanadi

Ular **tez va oson** foyda va'da qiladi:

- soxta **sovg‘a o‘yinlari** (skin, obunachi, telefon);
- **«oson ish»:** «kartangga pul tushadi, 10% senga». Bu **pul o‘tkazish zanjiri** bo‘lishi va qonunni buzishi mumkin;
- soxta **investitsiya** yoki «kripto» maslahatchilari;
- soxta **qo‘llab-quvvatlash** xabarlari.

**Belgilar:** parol yoki kod so‘raydi, shoshiltiradi, avval pul o‘tkazishni talab qiladi.

> **Qoida:** bank kartangni yoki hisobingni hech kimga berma.`,
      ru: `## На что рассчитывают мошенники

Они обещают **быструю и лёгкую** выгоду:

- поддельные **розыгрыши** (скины, подписчики, телефоны);
- **«лёгкая работа»:** «на твою карту придут деньги, 10% тебе». Это может быть **схема перевода денег** и нарушение закона;
- поддельные **инвестиции** и «крипто»-советчики;
- поддельные сообщения **«поддержки»**.

**Признаки:** просят пароль или код, торопят, требуют сначала перевести деньги.

> **Правило:** никому не отдавай свою банковскую карту или аккаунт.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Notanish senga: «Kartangga pul tushadi, 10% senga qoladi» dedi. Nima qilasan?', ru: 'Незнакомец пишет: «На твою карту придут деньги, 10% оставишь себе». Что делаешь?' },
        options: [
          { id: 'a', uz: 'Rad etaman va ishonchli kattaga aytaman', ru: 'Отказываюсь и говорю доверенному взрослому' },
          { id: 'b', uz: 'Oson daromad - rozi bo‘laman', ru: 'Лёгкий заработок - соглашаюсь' },
          { id: 'c', uz: 'Kartani do‘stimga beraman', ru: 'Отдаю карту другу' },
        ],
        answer: 'a',
        explain: {
          uz: 'Bu firibgarlik va qonunbuzarlik xavfi bor sxema. Rad etib, kattaga ayting.',
          ru: 'Это мошенническая схема с риском нарушить закон. Откажитесь и скажите взрослому.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Haqiqiy sovg‘a o‘yini sovg‘ani berish uchun parolingni so‘raydi.', ru: 'Настоящий розыгрыш просит пароль, чтобы выдать приз.' },
        answer: 'false',
        explain: {
          uz: 'Sovg‘a uchun parol so‘ralsa - bu aldov.',
          ru: 'Если за приз просят пароль, это обман.',
        },
      },
      {
        id: 'e3', type: 'multi',
        q: { uz: 'Qaysilari firibgarlik belgisi? (bir nechtasini tanlang)', ru: 'Что является признаком мошенничества? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'Parol yoki kod so‘raydi', ru: 'Просит пароль или код' },
          { id: 'b', uz: 'Shoshiltiradi: «bugun oxirgi kun!»', ru: 'Торопит: «сегодня последний день!»' },
          { id: 'c', uz: 'Rasmiy, tekshirilgan sahifadan keladi', ru: 'Приходит с официальной проверенной страницы' },
          { id: 'd', uz: 'Avval pul o‘tkazishni talab qiladi', ru: 'Требует сначала перевести деньги' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Parol so‘rash, shoshiltirish va oldindan to‘lov - klassik belgilar.',
          ru: 'Просьба о пароле, спешка и предоплата - классические признаки.',
        },
      },
    ],
  },

  {
    slug: 'pressure-and-blackmail',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 20,
    title: { uz: 'Bosim va shantaj', ru: 'Давление и шантаж в сети' },
    content: {
      uz: `## Kimdir seni qo‘rqitsa

Ba‘zan kimdir internetda **bosim o‘tkazadi:** shaxsiy rasm yoki yozishmani tarqatish bilan qo‘rqitadi, pul yoki yana rasm talab qiladi. Bu **shantaj**.

**Eng muhimi: bu sening aybing emas.** Bunday holatga ko‘pchilik tushgan va uni to‘xtatish mumkin.

1. **To‘lama** va **yangi narsa yuborma** - talab to‘xtamaydi.
2. **Ishonchli kattaga ayt** (ota-ona, o‘qituvchi, maktab psixologi). Qanchalik tez aytsang, shunchalik yaxshi.
3. **Dalilni saqla:** yozishma va profilning ekran suratini ol.
4. **Bloklash** va ilova ichida **shikoyat** qil.

> Shaxsiy rasmlarni hech kimga yuborma: yuborilgandan keyin ularni nazorat qila olmaysan.`,
      ru: `## Если кто-то тебя пугает

Иногда в интернете **давят:** грозят разослать личное фото или переписку, требуют деньги или ещё снимки. Это **шантаж**.

**Главное: ты не виноват.** Многие оказывались в такой ситуации, и это можно остановить.

1. **Не плати** и **не отправляй ничего нового** - требования не прекратятся.
2. **Скажи доверенному взрослому** (родителям, учителю, школьному психологу). Чем раньше, тем лучше.
3. **Сохрани доказательства:** сделай скриншоты переписки и профиля.
4. **Заблокируй** и **пожалуйся** внутри приложения.

> Не отправляй личные фото никому: после отправки ты не сможешь их контролировать.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Kimdir: «To‘lamasang, rasmingni tarqataman» deb yozdi. Eng to‘g‘ri harakat?', ru: 'Кто-то пишет: «Не заплатишь - разошлю твоё фото». Что правильнее всего?' },
        options: [
          { id: 'a', uz: 'To‘lamayman, yozishmani saqlayman, bloklayman va ishonchli kattaga aytaman', ru: 'Не плачу, сохраняю переписку, блокирую и говорю доверенному взрослому' },
          { id: 'b', uz: 'Tezroq to‘layman, shunda tugaydi', ru: 'Быстрее заплачу, чтобы это закончилось' },
          { id: 'c', uz: 'Hech kimga aytmay, o‘zim hal qilaman', ru: 'Никому не скажу и решу сам' },
        ],
        answer: 'a',
        explain: {
          uz: 'To‘lov talabni to‘xtatmaydi. Yordam so‘rash va dalilni saqlash eng to‘g‘ri yo‘l.',
          ru: 'Оплата не останавливает требования. Просить помощи и сохранять доказательства - верный путь.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Shantaj qurboni o‘zi aybdor.', ru: 'Жертва шантажа сама виновата.' },
        answer: 'false',
        explain: {
          uz: 'Aybdor - bosim o‘tkazgan odam. Sen yordam so‘rashga haqlisan.',
          ru: 'Виноват тот, кто давит. Ты имеешь право просить помощи.',
        },
      },
      {
        id: 'e3', type: 'order',
        q: { uz: 'Shantaj qilishsa, tartibni joylashtiring.', ru: 'Если шантажируют, расставьте порядок действий.' },
        items: [
          { id: 'i1', uz: 'To‘lamayman va yangi narsa yubormayman', ru: 'Не плачу и ничего нового не отправляю' },
          { id: 'i2', uz: 'Ishonchli kattaga aytaman', ru: 'Говорю доверенному взрослому' },
          { id: 'i3', uz: 'Yozishma va profilning ekran suratini saqlayman', ru: 'Сохраняю скриншоты переписки и профиля' },
          { id: 'i4', uz: 'Bloklayman va ilovada shikoyat qilaman', ru: 'Блокирую и жалуюсь в приложении' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval to‘xtang, kattaga ayting, dalilni saqlang, keyin bloklab shikoyat qiling.',
          ru: 'Сначала остановитесь, скажите взрослому, сохраните доказательства, затем заблокируйте и пожалуйтесь.',
        },
      },
    ],
  },

  {
    slug: 'ethical-hacking-intro',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 20,
    title: { uz: 'Kiber xavfsizlik - kasb', ru: 'Кибербезопасность как профессия' },
    content: {
      uz: `## Etik xaker kim?

**Etik xaker** tizimning zaif joylarini egasining **ruxsati bilan** topadi va tuzatishga yordam beradi.

- Ruxsatsiz kirish - **hazil uchun bo‘lsa ham** - qonunbuzarlik.
- Halol yo‘l: **o‘z qurilmangda** sinash, o‘quv laboratoriyalari va **CTF musobaqalari**.
- Kerakli ko‘nikmalar: qiziquvchanlik, tarmoqlar, dasturlash va halollik.

> Qiziqsang, **«Kiber xavfsizlik»** yo‘lini ham ochib ko‘r - u noldan boshlanadi.`,
      ru: `## Кто такой этичный хакер

**Этичный хакер** находит слабые места системы **с разрешения владельца** и помогает их исправить.

- Доступ без разрешения - **даже ради шутки** - нарушение закона.
- Честный путь: тренироваться **на своих устройствах**, в учебных лабораториях и на **CTF-соревнованиях**.
- Нужные навыки: любопытство, сети, программирование и честность.

> Если интересно, загляни и в путь **«Кибербезопасность»** - он начинается с нуля.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Etik xaker jinoyatchidan nimasi bilan farq qiladi?', ru: 'Чем этичный хакер отличается от преступника?' },
        options: [
          { id: 'a', uz: 'Egasining ruxsati bilan zaifliklarni topib, tuzatishga yordam beradi', ru: 'Ищет уязвимости с разрешения владельца и помогает их исправить' },
          { id: 'b', uz: 'Hech kimga aytmay kiradi', ru: 'Заходит, никого не предупредив' },
          { id: 'c', uz: 'Parollarni yig‘adi', ru: 'Собирает пароли' },
        ],
        answer: 'a',
        explain: {
          uz: 'Asosiy farq - ruxsat va maqsad: tuzatishga yordam berish.',
          ru: 'Главное различие - разрешение и цель: помочь всё исправить.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Do‘stingning akkauntiga «hazil uchun» ruxsatsiz kirish mumkin.', ru: 'В аккаунт друга можно зайти без разрешения «ради шутки».' },
        answer: 'false',
        explain: {
          uz: 'Ruxsatsiz kirish hazil bo‘lsa ham qonunbuzarlik va ishonchni buzadi.',
          ru: 'Доступ без разрешения, даже в шутку, нарушает закон и доверие.',
        },
      },
      {
        id: 'e3', type: 'multi',
        q: { uz: 'Qaysilari qonuniy o‘rganish yo‘llari? (bir nechtasini tanlang)', ru: 'Какие способы учиться законны? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'O‘z qurilmangda sinab ko‘rish', ru: 'Пробовать на своём устройстве' },
          { id: 'b', uz: 'CTF musobaqalarida qatnashish', ru: 'Участвовать в CTF-соревнованиях' },
          { id: 'c', uz: 'Boshqalarning saytlarini ruxsatsiz skanerlash', ru: 'Сканировать чужие сайты без разрешения' },
          { id: 'd', uz: 'O‘quv laboratoriyalarida mashq qilish', ru: 'Практиковаться в учебных лабораториях' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'O‘z qurilma, musobaqalar va o‘quv laboratoriyalari qonuniy. Begona sayt - yo‘q.',
          ru: 'Свои устройства, соревнования и учебные лаборатории законны. Чужие сайты - нет.',
        },
      },
    ],
  },
];
