/**
 * Age group 8-12 - DRAFT CONTENT (needs_review: true).
 *
 * For school-age children who read on their own. Plain, concrete advice and no
 * graphic detail; when something feels wrong, the answer always includes
 * "tell a trusted adult". The Uzbek and Russian text has NOT been checked by a
 * native speaker or a child-safety educator and must be before release (see
 * ../../CONTENT_REVIEW.md). All names and offers are fictional.
 */
module.exports = [
  {
    slug: 'strong-passwords-kids',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Kuchli parol', ru: 'Крепкий пароль' },
    content: {
      uz: `## Kuchli parol qanday bo‘ladi?

Parol - hisobingning kaliti. Kuchli parol **uzun** bo‘ladi.

- Bir necha tasodifiy so‘zni birlashtiring: **ko‘k-fil-uchadi-bulut**.
- Ismingni, tug‘ilgan yilingni yoki «12345» ni ishlatma.
- Har bir o‘yin va ilova uchun **alohida** parol qo‘y.
- Parolni hech kimga aytma - eng yaqin do‘stingga ham.

> Kimdir parolingni bilib qolsa: darhol o‘zgartir va ota-onangga ayt.`,
      ru: `## Каким бывает крепкий пароль

Пароль - это ключ от твоего аккаунта. Крепкий пароль - **длинный**.

- Соедини несколько случайных слов: **синий-слон-летит-облако**.
- Не используй своё имя, год рождения или «12345».
- Для каждой игры и приложения придумай **свой** пароль.
- Никому не говори пароль - даже лучшему другу.

> Если кто-то узнал пароль: сразу смени его и скажи родителям.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Qaysi parol kuchliroq?', ru: 'Какой пароль крепче?' },
        options: [
          { id: 'a', uz: 'Ali2012', ru: 'Ali2012' },
          { id: 'b', uz: 'ko‘k-fil-uchadi-bulut', ru: 'синий-слон-летит-облако' },
          { id: 'c', uz: '12345678', ru: '12345678' },
        ],
        answer: 'b',
        explain: {
          uz: 'Bir necha tasodifiy so‘zdan iborat uzun parol topish qiyin, lekin eslab qolish oson.',
          ru: 'Длинный пароль из случайных слов трудно угадать, но легко запомнить.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Eng yaqin do‘stingga parolingni aytsa bo‘ladi.', ru: 'Лучшему другу можно сказать свой пароль.' },
        answer: 'false',
        explain: {
          uz: 'Do‘stlik o‘zgarishi mumkin, parol esa shaxsiy. Uni faqat o‘zing va ota-onang biladi.',
          ru: 'Дружба может измениться, а пароль личный. Его знаете только вы и родители.',
        },
      },
      {
        id: 'e3', type: 'multi',
        q: { uz: 'Parolni kuchli qilish uchun nima qilish kerak? (bir nechtasini tanlang)', ru: 'Что сделает пароль крепче? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'Uzun, bir necha so‘zdan tuzish', ru: 'Сделать длинным, из нескольких слов' },
          { id: 'b', uz: 'Ismingni qo‘shish', ru: 'Добавить своё имя' },
          { id: 'c', uz: 'Har bir ilova uchun alohida parol', ru: 'Свой пароль для каждого приложения' },
          { id: 'd', uz: 'Do‘sting bilan bir xil parol qo‘yish', ru: 'Поставить такой же, как у друга' },
        ],
        answers: ['a', 'c'],
        explain: {
          uz: 'Uzunlik va har bir joy uchun alohida parol eng muhim. Ism va umumiy parol esa xavfli.',
          ru: 'Длина и отдельный пароль для каждого места - самое важное. Имя и общий пароль опасны.',
        },
      },
    ],
  },

  {
    slug: 'fake-messages-and-offers',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Yolg‘on xabarlar va «yutuqlar»', ru: 'Обманные сообщения и «выигрыши»' },
    content: {
      uz: `## «Bepul» hamma vaqt ham bepul emas

«Bepul o‘yin puli!», «Yutuq yutding!» kabi xabarlar ko‘pincha **aldov**. Belgilari:

- **Juda yaxshi** eshitiladi.
- **Shoshiltiradi:** «faqat 5 daqiqa!»
- **Parol, kod yoki karta** so‘raydi.
- Noma‘lum **havola** bosishni aytadi.

**Nima qilish kerak:** bosma, hech narsa kiritma, oynani yop va kattaga ko‘rsat.`,
      ru: `## «Бесплатно» - не всегда бесплатно

Сообщения вроде «Бесплатная игровая валюта!» или «Ты выиграл!» часто бывают **обманом**. Признаки:

- Звучит **слишком хорошо**.
- **Торопит:** «осталось 5 минут!»
- Просит **пароль, код или карту**.
- Предлагает нажать на незнакомую **ссылку**.

**Что делать:** не нажимай, ничего не вводи, закрой окно и покажи взрослому.`,
    },
    exercises: [
      {
        id: 'e1', type: 'multi',
        q: { uz: 'Qaysi belgilar aldovdan dalolat beradi? (bir nechtasini tanlang)', ru: 'Какие признаки говорят об обмане? (выберите несколько)' },
        options: [
          { id: 'a', uz: '«Bepul o‘yin puli, faqat 5 daqiqa!»', ru: '«Бесплатная валюта, осталось 5 минут!»' },
          { id: 'b', uz: '«Olish uchun parolingni kirit»', ru: '«Чтобы получить, введи свой пароль»' },
          { id: 'c', uz: 'O‘qituvching sinf chatida dars jadvalini yubordi', ru: 'Учитель прислал расписание в классный чат' },
          { id: 'd', uz: 'Noma‘lum havolani bosishni so‘raydi', ru: 'Просит нажать на незнакомую ссылку' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Shoshiltirish, parol so‘rash va begona havola - aldovning klassik belgilari.',
          ru: 'Спешка, просьба о пароле и чужая ссылка - классические признаки обмана.',
        },
      },
      {
        id: 'e2', type: 'mc',
        q: { uz: 'O‘yinda «1000 olmos bepul, parolingni kirit» chiqdi. Nima qilasan?', ru: 'В игре появилось «1000 кристаллов бесплатно, введи пароль». Что делаешь?' },
        options: [
          { id: 'a', uz: 'Parol kiritmayman, kattaga ko‘rsataman', ru: 'Не ввожу пароль, показываю взрослому' },
          { id: 'b', uz: 'Parolni kiritaman', ru: 'Ввожу пароль' },
          { id: 'c', uz: 'Do‘stlarimga ham yuboraman', ru: 'Отправляю друзьям' },
        ],
        answer: 'a',
        explain: {
          uz: 'Haqiqiy o‘yin parolni bunday so‘ramaydi. Kattaga ko‘rsatish xavfsiz yo‘l.',
          ru: 'Настоящая игра так пароль не просит. Показать взрослому - безопасный путь.',
        },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'Haqiqiy o‘yin kompaniyasi parolingni xabar orqali so‘rashi mumkin.', ru: 'Настоящая игровая компания может попросить пароль в сообщении.' },
        answer: 'false',
        explain: {
          uz: 'Hech bir rasmiy xizmat parolni xabarda so‘ramaydi.',
          ru: 'Ни одна настоящая служба не просит пароль в сообщении.',
        },
      },
    ],
  },

  {
    slug: 'game-chat-safety',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'O‘yin chatida xavfsizlik', ru: 'Безопасность в игровом чате' },
    content: {
      uz: `## O‘yindagi «do‘st» - hali notanish

Faqat internetda tanishgan odam **notanish** hisoblanadi - o‘yinda yaxshi o‘ynasa ham.

- **Laqab** ishlat, haqiqiy ismingni emas.
- **Aytma:** to‘liq ism, maktab, manzil, telefon, rasm.
- Noqulay yozsa: **bloklash** va **shikoyat** tugmalaridan foydalan.
- «Boshqa ilovaga o‘tamiz» yoki «ota-onangga aytma» desa - **rad et** va ota-onangga ayt.

> Sirni kattalardan yashirishni so‘ragan odam - xavf belgisi.`,
      ru: `## «Друг» из игры - пока незнакомец

Человек, с которым ты познакомился только в интернете, - **незнакомец**, даже если здорово играет.

- Используй **ник**, а не настоящее имя.
- **Не говори:** полное имя, школу, адрес, телефон, фото.
- Если пишет неприятное: используй кнопки **«заблокировать»** и **«пожаловаться»**.
- Если зовёт «перейти в другое приложение» или просит «не говорить родителям» - **откажись** и расскажи родителям.

> Тот, кто просит скрывать от взрослых, - сигнал опасности.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'O‘yindagi notanish: «Boshqa ilovaga o‘tamiz, ota-onangga aytma» dedi. Nima qilasan?', ru: 'Незнакомец из игры пишет: «Давай в другое приложение, родителям не говори». Что делаешь?' },
        options: [
          { id: 'a', uz: 'Rad etaman, bloklayman va ota-onamga aytaman', ru: 'Отказываюсь, блокирую и говорю родителям' },
          { id: 'b', uz: 'O‘taman, lekin sir saqlayman', ru: 'Перехожу, но держу в секрете' },
          { id: 'c', uz: 'Rasmimni yuboraman', ru: 'Отправляю своё фото' },
        ],
        answer: 'a',
        explain: {
          uz: 'Sirni yashirishni so‘rash - xavf belgisi. To‘g‘ri yo‘l: rad etish, bloklash, kattaga aytish.',
          ru: 'Просьба хранить секрет от взрослых - сигнал опасности. Верно: отказать, заблокировать, сказать взрослому.',
        },
      },
      {
        id: 'e2', type: 'multi',
        q: { uz: 'O‘yin chatida qaysi ma‘lumotni aytmaslik kerak? (bir nechtasini tanlang)', ru: 'Что нельзя сообщать в игровом чате? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'To‘liq ismim', ru: 'Своё полное имя' },
          { id: 'b', uz: 'Maktabimning nomi', ru: 'Название своей школы' },
          { id: 'c', uz: 'Sevimli o‘yin qahramonim', ru: 'Любимого героя игры' },
          { id: 'd', uz: 'Uy manzilim', ru: 'Свой домашний адрес' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Ism, maktab va manzil seni topishga yordam beradi. Sevimli qahramon esa zararsiz.',
          ru: 'Имя, школа и адрес помогают найти тебя. Любимый герой безвреден.',
        },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'Faqat internetda tanishgan, yaxshi o‘ynaydigan do‘sting ham notanish hisoblanadi.', ru: 'Тот, с кем ты познакомился только в сети и кто хорошо играет, всё равно незнакомец.' },
        answer: 'true',
        explain: {
          uz: 'Internetda odam o‘zini boshqacha ko‘rsatishi mumkin. Shuning uchun ehtiyot bo‘lasan.',
          ru: 'В сети человек может притворяться другим. Поэтому нужно быть осторожным.',
        },
      },
    ],
  },

  {
    slug: 'when-someone-is-mean',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Agar internetda xafa qilishsa', ru: 'Если обижают в интернете' },
    content: {
      uz: `## Yomon xabarlar bilan nima qilish kerak

Internetda xafa qilish - masxara, qo‘rqitish yoki sharmanda rasmlarni tarqatish. Bu **sening aybing emas**.

**Senga yozishsa:**
1. Javob yozma.
2. Xabarlarning **ekran suratini** saqla.
3. Yozgan odamni **blokla**.
4. Ishonchli kattaga **ko‘rsat**.

**Boshqani xafa qilishsa:** qo‘shilma, rasmni yuborma, unga yordam ber va kattaga ayt.`,
      ru: `## Что делать со злыми сообщениями

Обижать в сети - значит издеваться, пугать или рассылать стыдные фото. **Ты в этом не виноват.**

**Если пишут тебе:**
1. Не отвечай.
2. Сохрани **скриншот** сообщений.
3. **Заблокируй** того, кто пишет.
4. **Покажи** доверенному взрослому.

**Если обижают другого:** не присоединяйся, не пересылай фото, поддержи его и скажи взрослому.`,
    },
    exercises: [
      {
        id: 'e1', type: 'order',
        q: { uz: 'Senga yomon xabar yozishdi. Tartibni joylashtir.', ru: 'Тебе написали злое. Расставь по порядку.' },
        items: [
          { id: 'i1', uz: 'Javob yozmayman', ru: 'Не отвечаю' },
          { id: 'i2', uz: 'Ekran suratini saqlayman', ru: 'Сохраняю скриншот' },
          { id: 'i3', uz: 'Yozgan odamni bloklayman', ru: 'Блокирую того, кто пишет' },
          { id: 'i4', uz: 'Ishonchli kattaga ko‘rsataman', ru: 'Показываю доверенному взрослому' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Javob bermaslik, dalilni saqlash, bloklash va kattaga aytish - to‘g‘ri tartib.',
          ru: 'Не отвечать, сохранить доказательство, заблокировать и сказать взрослому - верный порядок.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Birovni kamsitadigan rasmni do‘stlarga yuborish - zararsiz hazil.', ru: 'Пересылать друзьям фото, где кого-то унижают, - безобидная шутка.' },
        answer: 'false',
        explain: {
          uz: 'Yuborsang, sen ham zarar yetkazishga qo‘shilasan. Yubormaslik va kattaga aytish kerak.',
          ru: 'Если перешлёшь, ты присоединяешься к травле. Не пересылай и скажи взрослому.',
        },
      },
      {
        id: 'e3', type: 'mc',
        q: { uz: 'Sinfdoshingni chatda masxara qilishyapti. Nima qilasan?', ru: 'Одноклассника в чате высмеивают. Что делаешь?' },
        options: [
          { id: 'a', uz: 'Qo‘shilmayman, unga yordam beraman va kattaga aytaman', ru: 'Не присоединяюсь, поддерживаю его и говорю взрослому' },
          { id: 'b', uz: 'Men ham kulaman', ru: 'Тоже смеюсь' },
          { id: 'c', uz: 'Jim turaman', ru: 'Молчу' },
        ],
        answer: 'a',
        explain: {
          uz: 'Qo‘llab-quvvatlash va kattaga aytish xafa bo‘lgan odamga katta yordam.',
          ru: 'Поддержка и обращение ко взрослому очень помогают тому, кого обижают.',
        },
      },
    ],
  },

  {
    slug: 'safe-downloads-kids',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Xavfsiz yuklab olish', ru: 'Безопасные загрузки' },
    content: {
      uz: `## Hamma fayl ham xavfsiz emas

- Ilovalarni **faqat rasmiy do‘kondan** va kattalar bilan birga yukla.
- «Bepul **chit**», «mod» va «hack» fayllarida ko‘pincha **virus** bo‘ladi.
- «Telefoningda virus bor!» degan oyna - odatda **aldov**. Yop va kattaga ko‘rsat.
- Do‘sting fayl yuborsa ham, **so‘ramay ochma**: uning akkaunti buzilgan bo‘lishi mumkin.

> Shubha bo‘lsa - **ochma, yuklama, so‘ra**.`,
      ru: `## Не каждый файл безопасен

- Приложения скачивай **только из официального магазина** и вместе со взрослым.
- В «бесплатных **читах**», «модах» и «хаках» часто прячутся **вирусы**.
- Окно «На твоём телефоне вирус!» - обычно **обман**. Закрой и покажи взрослому.
- Даже если файл прислал друг, **не открывай, не спросив**: его аккаунт могли взломать.

> Сомневаешься - **не открывай, не скачивай, спроси**.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Do‘sting «bepul chit» faylini yubordi. Nima qilasan?', ru: 'Друг прислал файл «бесплатный чит». Что делаешь?' },
        options: [
          { id: 'a', uz: 'Ochmayman, avval kattadan so‘rayman', ru: 'Не открываю, сначала спрашиваю взрослого' },
          { id: 'b', uz: 'Darhol ochaman', ru: 'Сразу открываю' },
          { id: 'c', uz: 'Boshqa do‘stlarga ham yuboraman', ru: 'Отправляю другим друзьям' },
        ],
        answer: 'a',
        explain: {
          uz: 'Chit fayllarida virus bo‘lishi mumkin, do‘sting akkaunti ham buzilgan bo‘lishi mumkin.',
          ru: 'В читах бывают вирусы, а аккаунт друга могли взломать.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Rasmiy do‘kondan tashqaridagi «bepul modlar» xavfsiz.', ru: '«Бесплатные моды» вне официального магазина безопасны.' },
        answer: 'false',
        explain: {
          uz: 'Rasmiy do‘kondan tashqari manbalar tekshirilmaydi va zararli bo‘lishi mumkin.',
          ru: 'Источники вне официального магазина не проверяются и могут быть вредными.',
        },
      },
      {
        id: 'e3', type: 'match',
        q: { uz: 'Vaziyatni to‘g‘ri harakat bilan moslang.', ru: 'Сопоставьте ситуацию с правильным действием.' },
        pairs: [
          { id: 'p1', left: { uz: 'Rasmiy ilova do‘koni', ru: 'Официальный магазин приложений' }, right: { uz: 'Kattam bilan yuklayman', ru: 'Скачиваю вместе со взрослым' } },
          { id: 'p2', left: { uz: 'Havoladan kelgan «chit» fayl', ru: 'Файл-«чит» по ссылке' }, right: { uz: 'Ochmayman', ru: 'Не открываю' } },
          { id: 'p3', left: { uz: '«Telefoningda virus bor!» oynasi', ru: 'Окно «На телефоне вирус!»' }, right: { uz: 'Yopib, kattaga ko‘rsataman', ru: 'Закрываю и показываю взрослому' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Faqat rasmiy manba va kattalar bilan; shubhali narsani esa ochmaymiz.',
          ru: 'Только официальный источник и вместе со взрослыми; подозрительное не открываем.',
        },
      },
    ],
  },
];
