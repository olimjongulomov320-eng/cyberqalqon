/**
 * Age group 1-4: guidance for PARENTS - DRAFT CONTENT (needs_review: true).
 *
 * A child this young cannot read or answer questions, so these lessons are
 * written for the adult. The exercises check the parent's understanding.
 *
 * The Uzbek and Russian text has NOT been checked by a native speaker, and the
 * screen-time figures follow general public-health guidance (WHO, 2019) as
 * understood by the author: an early-years specialist must confirm them before
 * release (see ../../CONTENT_REVIEW.md). No real names, links or numbers.
 */
module.exports = [
  {
    slug: 'screens-at-1-4',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Ekran va kichkintoy', ru: 'Экран и малыш' },
    content: {
      uz: `## Ekran vaqti: 1-4 yosh

Kichik bolaning miyasi **o‘yin, harakat va suhbat** orqali o‘sadi. Ekran bularning o‘rnini bosa olmaydi.

- **1 yoshgacha:** ekranni ko‘rsatmaslikka harakat qiling. Yaqinlar bilan video qo‘ng‘iroq - istisno.
- **1-2 yosh:** ekran oldida jim o‘tirish tavsiya etilmaydi. Kitob, qo‘shiq va o‘yin afzal.
- **2-4 yosh:** kuniga ko‘pi bilan **1 soat**, sifatli va sekin dasturlar - va ularni **birga** ko‘ring.

> **Qoida:** ovqat paytida va uyqudan 1 soat oldin ekran yo‘q.

Birga ko‘rganda savol bering: «Bu nima?», «U nima qilyapti?» - shunda ekran suhbatga aylanadi.`,
      ru: `## Экранное время: 1-4 года

Мозг малыша растёт через **игру, движение и разговор**. Экран не может их заменить.

- **До 1 года:** старайтесь вообще не показывать экран. Исключение - видеозвонок с близкими.
- **1-2 года:** сидеть неподвижно перед экраном не рекомендуется. Лучше книги, песни и игры.
- **2-4 года:** не больше **1 часа** в день, качественные и неспешные программы - и смотрите их **вместе**.

> **Правило:** во время еды и за час до сна - без экрана.

Смотря вместе, задавайте вопросы: «Что это?», «Что он делает?» - так экран становится разговором.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: '2 yoshli bola uchun ekran vaqti haqida qaysi javob to‘g‘ri?', ru: 'Что верно про экранное время для 2-летнего ребёнка?' },
        options: [
          { id: 'a', uz: 'Kuniga ko‘pi bilan 1 soat, birga ko‘rish bilan', ru: 'Не больше 1 часа в день, глядя вместе' },
          { id: 'b', uz: 'Qancha xohlasa, shuncha', ru: 'Сколько захочет' },
          { id: 'c', uz: 'Faqat yotishdan oldin, uxlatish uchun', ru: 'Только перед сном, чтобы уснул' },
        ],
        answer: 'a',
        explain: {
          uz: 'Cheklangan vaqt, sifatli dastur va kattalar bilan birga - bu xavfsiz yo‘l.',
          ru: 'Ограниченное время, качественная программа и взрослый рядом - безопасный путь.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Ekran bolaning o‘yin va harakatini to‘liq almashtira oladi.', ru: 'Экран может полностью заменить ребёнку игру и движение.' },
        answer: 'false',
        explain: {
          uz: 'Bola o‘yin, harakat va suhbat orqali o‘rganadi. Ekran ularni to‘ldirishi mumkin, almashtira olmaydi.',
          ru: 'Ребёнок учится через игру, движение и разговор. Экран может дополнять, но не заменять их.',
        },
      },
      {
        id: 'e3', type: 'multi',
        q: { uz: 'Qaysilari yaxshi ekran odatlari? (bir nechtasini tanlang)', ru: 'Какие привычки с экраном хорошие? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'Ovqat paytida ekran yo‘q', ru: 'Во время еды экрана нет' },
          { id: 'b', uz: 'Uyqudan 1 soat oldin ekran yo‘q', ru: 'За час до сна экрана нет' },
          { id: 'c', uz: 'Bola yig‘lasa, tinchlantirish uchun doim telefon berish', ru: 'Всегда давать телефон, чтобы успокоить плач' },
          { id: 'd', uz: 'Dasturni birga ko‘rib, u haqida gaplashish', ru: 'Смотреть вместе и обсуждать увиденное' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Ekran tinchlantirish vositasiga aylanib qolmasligi kerak. Qolgan uchtasi - sog‘lom odat.',
          ru: 'Экран не должен становиться средством успокоения. Остальные три пункта - здоровые привычки.',
        },
      },
    ],
  },

  {
    slug: 'safe-device-for-child',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Bolaga xavfsiz qurilma', ru: 'Безопасное устройство для малыша' },
    content: {
      uz: `## Qurilmani berishdan oldin

Telefon yoki planshetni bolaga bermasdan oldin bir marta sozlab qo‘ying:

1. **Bola rejimi:** bola profili yoki cheklangan rejimni yoqing - faqat siz tanlagan ilovalar ochiladi.
2. **To‘lovlar:** ilova ichidagi xaridlarni o‘chiring va saqlangan bank kartasini olib tashlang.
3. **Oldindan yuklash:** videolarni oldindan yuklab, samolyot rejimida ko‘rsating - reklama va begona havolalar chiqmaydi.
4. **Qulf:** ekran qulfi va sozlamalar uchun faqat o‘zingiz biladigan PIN qo‘ying.

> **Esda tuting:** bola tasodifan bosib yuboradi. Sozlamalar uni himoya qiladi, taqiq emas.`,
      ru: `## Перед тем как дать устройство

Прежде чем отдать телефон или планшет малышу, один раз настройте его:

1. **Детский режим:** включите детский профиль или ограниченный режим - откроются только выбранные вами приложения.
2. **Платежи:** отключите покупки внутри приложений и удалите сохранённую банковскую карту.
3. **Загрузка заранее:** скачайте видео и включайте в режиме полёта - не будет рекламы и чужих ссылок.
4. **Блокировка:** поставьте блокировку экрана и PIN для настроек, известный только вам.

> **Помните:** малыш нажмёт что угодно случайно. Настройки защищают его - это не запрет.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Telefonni bolaga berishdan oldin eng muhim sozlama qaysi?', ru: 'Какая настройка важнее всего перед тем, как дать малышу телефон?' },
        options: [
          { id: 'a', uz: 'Bola rejimi va ilova ichidagi xaridlarni o‘chirish', ru: 'Детский режим и отключение покупок в приложениях' },
          { id: 'b', uz: 'Ekran yorqinligini oshirish', ru: 'Увеличить яркость экрана' },
          { id: 'c', uz: 'Ovozni eng baland qilish', ru: 'Сделать звук максимально громким' },
        ],
        answer: 'a',
        explain: {
          uz: 'Cheklangan ilovalar va o‘chirilgan xaridlar tasodifiy zararning oldini oladi.',
          ru: 'Ограниченный набор приложений и отключённые покупки предотвращают случайный вред.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Saqlangan bank kartasi bor qurilmani bolaga berish xavfsiz.', ru: 'Давать малышу устройство с сохранённой банковской картой безопасно.' },
        answer: 'false',
        explain: {
          uz: 'Bola bir bosishda pulli xarid qilib qo‘yishi mumkin. Kartani olib tashlang.',
          ru: 'Малыш может одним нажатием сделать платную покупку. Удалите карту.',
        },
      },
      {
        id: 'e3', type: 'match',
        q: { uz: 'Sozlamani uning foydasi bilan moslang.', ru: 'Сопоставьте настройку с её пользой.' },
        pairs: [
          { id: 'p1', left: { uz: 'Ilova ichidagi xaridlarni o‘chirish', ru: 'Отключить покупки в приложениях' }, right: { uz: 'Tasodifiy to‘lovlarning oldini oladi', ru: 'Не будет случайных платежей' } },
          { id: 'p2', left: { uz: 'Oldindan yuklab, samolyot rejimi', ru: 'Скачать заранее и режим полёта' }, right: { uz: 'Reklama va begona havolalar chiqmaydi', ru: 'Нет рекламы и чужих ссылок' } },
          { id: 'p3', left: { uz: 'Faqat o‘zingiz biladigan PIN', ru: 'PIN, известный только вам' }, right: { uz: 'Bola sozlamalarni o‘zgartirib yubormaydi', ru: 'Малыш не изменит настройки' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Har bir sozlama bitta xavfni yopadi: xarid, reklama yoki tasodifiy o‘zgarish.',
          ru: 'Каждая настройка закрывает один риск: покупки, рекламу или случайные изменения.',
        },
      },
    ],
  },

  {
    slug: 'child-data-and-photos',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Bola rasmlari va ma‘lumotlari', ru: 'Фото и данные ребёнка' },
    content: {
      uz: `## Bolaning raqamli izi tug‘ilishdan boshlanadi

Internetga qo‘yilgan rasm yoki ma‘lumot nusxa bo‘lib tarqalishi mumkin - o‘chirsangiz ham.

**Ommaga qo‘ymang:**
- bolaning to‘liq ismi va tug‘ilgan sanasi;
- bog‘cha yoki maktab nomi, forma, uy manzili;
- rasmdagi joylashuv (**geoteg**) - kamerada o‘chirib qo‘ying;
- yechinayotgan yoki cho‘milayotgan bolaning rasmi - hech qachon.

**Yaxshi odat:** yopiq guruhga yuboring, kim ko‘rishini tekshiring va yaqinlardan ham shuni so‘rang.

> **Eslatma:** «Yopiq» sahifadagi rasmni ham kimdir ekran suratiga olishi mumkin.`,
      ru: `## След ребёнка в сети начинается с рождения

Фото или данные, попавшие в интернет, могут разойтись копиями - даже если вы их удалите.

**Не публикуйте открыто:**
- полное имя и дату рождения ребёнка;
- название садика или школы, форму, домашний адрес;
- место съёмки (**геометку**) - отключите её в камере;
- снимки раздетого или купающегося ребёнка - никогда.

**Хорошая привычка:** отправляйте в закрытую группу, проверяйте, кто видит, и просите об этом же родственников.

> **Помните:** фото на «закрытой» странице тоже могут сфотографировать с экрана.`,
    },
    exercises: [
      {
        id: 'e1', type: 'multi',
        q: { uz: 'Qaysilarini ommaviy joylamaslik kerak? (bir nechtasini tanlang)', ru: 'Что не стоит публиковать открыто? (выберите несколько)' },
        options: [
          { id: 'a', uz: 'Bolaning to‘liq ismi va tug‘ilgan sanasi', ru: 'Полное имя ребёнка и дату рождения' },
          { id: 'b', uz: 'Bog‘cha nomi va forma ko‘ringan rasm', ru: 'Фото с названием садика и формой' },
          { id: 'c', uz: 'Rasmning joylashuv belgisi (geoteg)', ru: 'Метку места на фото (геометку)' },
          { id: 'd', uz: 'Gullagan bog‘ning bolasiz rasmi', ru: 'Фото цветущего сада без ребёнка' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Ism, sana, bog‘cha va joylashuv bolani aniqlashga yordam beradi. Bog‘ rasmi esa xavfsiz.',
          ru: 'Имя, дата, садик и место помогают найти ребёнка. Фото сада безопасно.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Yopiq akkauntdagi rasm hech qachon boshqalarga tarqalmaydi.', ru: 'Фото в закрытом аккаунте никогда не попадёт к посторонним.' },
        answer: 'false',
        explain: {
          uz: 'Ekran surati yoki yuborib qo‘yish orqali rasm tarqalishi mumkin. Shuning uchun nimani qo‘yishni oldindan o‘ylang.',
          ru: 'Фото могут сфотографировать с экрана или переслать. Поэтому думайте до публикации.',
        },
      },
      {
        id: 'e3', type: 'mc',
        q: { uz: 'Buvingiz bolaning rasmini ochiq sahifaga qo‘ymoqchi. Eng yaxshi javob?', ru: 'Бабушка хочет выложить фото малыша на открытую страницу. Как лучше ответить?' },
        options: [
          { id: 'a', uz: 'Mehr bilan so‘rang: faqat yopiq guruhga, ism va joylashuvsiz', ru: 'Тепло попросить: только в закрытую группу, без имени и места' },
          { id: 'b', uz: 'Hech narsa demang', ru: 'Ничего не говорить' },
          { id: 'c', uz: 'Uni xafa qilib, bahslashing', ru: 'Поссориться и спорить' },
        ],
        answer: 'a',
        explain: {
          uz: 'Kelishuv - eng yaxshi himoya. Qoidalarni mehr bilan tushuntiring.',
          ru: 'Договорённость - лучшая защита. Объясняйте правила по-доброму.',
        },
      },
    ],
  },

  {
    slug: 'first-safety-rules',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 15,
    title: { uz: 'Birinchi xavfsizlik odatlari', ru: 'Первые привычки безопасности' },
    content: {
      uz: `## Kichik odatlar, katta poydevor

Bola qoidani eshitib emas, **ko‘rib** o‘rganadi.

- **Birga o‘tiring.** Yangi ilovani birinchi marta birga oching.
- **Bir xil so‘zlar.** Har safar: «Ko‘rsat menga» - bola shuni eslab qoladi.
- **Ko‘rsatgani uchun maqtang.** Qo‘rqinchli narsani ko‘rsa va sizga kelsa - koyimang. Shunda keyin ham keladi.
- **O‘zingiz o‘rnak bo‘ling.** Ovqat paytida telefonni qo‘yib qo‘ying.

> **Keyingi qadam:** bola 5 yoshga to‘lganda «5-7 yosh» yo‘li bilan oddiy qoidalarni birga o‘rganing.`,
      ru: `## Маленькие привычки - большой фундамент

Ребёнок учится правилам не на словах, а **глядя на вас**.

- **Сидите вместе.** Первый раз открывайте новое приложение вместе.
- **Одни и те же слова.** Каждый раз: «Покажи мне» - малыш это запомнит.
- **Хвалите, что показал.** Если увидел страшное и пришёл к вам - не ругайте. Тогда придёт и в следующий раз.
- **Будьте примером.** Во время еды откладывайте телефон.

> **Следующий шаг:** когда малышу исполнится 5, изучайте простые правила вместе на пути «5-7 лет».`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Bola ekranda qo‘rqinchli narsani ko‘rib, sizga ko‘rsatdi. Eng yaxshi reaksiya?', ru: 'Малыш увидел на экране что-то страшное и показал вам. Лучшая реакция?' },
        options: [
          { id: 'a', uz: 'Ko‘rsatgani uchun maqtash va tinchlantirish', ru: 'Похвалить, что показал, и успокоить' },
          { id: 'b', uz: 'Koyib, qurilmani olib qo‘yish', ru: 'Отругать и забрать устройство' },
          { id: 'c', uz: 'Eʼtibor bermaslik', ru: 'Не обратить внимания' },
        ],
        answer: 'a',
        explain: {
          uz: 'Bola jazodan qo‘rqsa, keyingi safar yashiradi. Maqtov esa ishonchni mustahkamlaydi.',
          ru: 'Если ребёнок боится наказания, в следующий раз он спрячет. Похвала укрепляет доверие.',
        },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Ovqat paytida telefonni qo‘yib qo‘yishingiz bolaga o‘rnak bo‘ladi.', ru: 'Если вы откладываете телефон во время еды, это служит малышу примером.' },
        answer: 'true',
        explain: {
          uz: 'Kichik bola kattalarning xatti-harakatini takrorlaydi.',
          ru: 'Маленькие дети повторяют поведение взрослых.',
        },
      },
      {
        id: 'e3', type: 'order',
        q: { uz: 'Yangi ilovani bolaga ochishdan oldingi tartibni joylashtiring.', ru: 'Расставьте порядок действий перед тем, как открыть малышу новое приложение.' },
        items: [
          { id: 'i1', uz: 'Ilovani o‘zingiz sinab ko‘rish', ru: 'Сначала самим попробовать приложение' },
          { id: 'i2', uz: 'Reklama va xaridlarni o‘chirish', ru: 'Отключить рекламу и покупки' },
          { id: 'i3', uz: 'Bola bilan birga ochib, kuzatib turish', ru: 'Открыть вместе с малышом и наблюдать' },
          { id: 'i4', uz: 'Vaqtni belgilab, tugagach birga yopish', ru: 'Назначить время и вместе закрыть по окончании' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval o‘zingiz tekshiring, keyin sozlang, so‘ng birga foydalaning va vaqtni cheklang.',
          ru: 'Сначала проверьте сами, затем настройте, потом пользуйтесь вместе и ограничьте время.',
        },
      },
    ],
  },
];
