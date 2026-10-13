/**
 * Curriculum — Cybersecurity path › Domain: Ethical testing (offensive / pentest)
 *
 * Shape (validated by scripts/validate-curriculum.js via lib/grade.validateExercise):
 *   module: { slug, title:{uz,ru}, content:{uz,ru}, kind, xp_reward, exercises:[...] }
 *   kind: 'lesson' | 'checkpoint'   (checkpoint = end-of-domain trophy node)
 *
 * Rules for authors:
 *   - Lesson prose: short. 6–14 markdown lines per language.
 *   - Every exercise: bilingual q + explain, beginner level, no trick questions.
 *   - CONCEPTUAL only — no exploit instructions, no tool commands, no payloads.
 *     Ethics and authorization come first; the goal is understanding, not a recipe.
 *   - Exercise ids: e1..eN in delivery order.
 *   - Uzbek: simple, modern Uzbek Latin. Russian: natural, not machine-translated.
 *   - Any string containing a straight ' MUST be double-quoted (or a template
 *     literal) — a ' inside a single-quoted string breaks the file.
 */

module.exports = [
  {
    slug: 'ethics-and-authorization',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Etika va ruxsat', ru: 'Этика и разрешение' },
    content: {
      uz: `## Etika va ruxsat (authorization)

**Axloqiy xakerlik** — faqat **ruxsat bilan** tekshirish. Ruxsatsiz sinash — jinoyat, hatto "yaxshi maqsad" bilan bo'lsa ham.

**Asosiy hujjatlar:**
- **Ruxsat (authorization)** — yozma rozilik: kim, nimani, qachon sinaydi.
- **Scope** — aniq chegaralar: qaysi tizimlar kiradi, qaysilari **hech qachon** tegmaydi.
- **Rules of engagement** — qoidalar: vaqt, usul, nima qilish mumkin yoki mumkin emas.

**Qoida:** scope tashqarisidagi tizim — taqiqlangan. "Tasodifan topdim" ham ruxsat bermaydi.

> **Xavfsizlik:** birinchi qadam — texnika emas, **huquqiy asos**. Ruxsatsiz test — karyera va erkinlikni yo'qotadigan xato.`,
      ru: `## Этика и разрешение (authorization)

**Этичный хакинг** — проверка **только с разрешения**. Тестирование без разрешения — преступление, даже с «благими намерениями».

**Основные документы:**
- **Разрешение (authorization)** — письменное согласие: кто, что и когда тестирует.
- **Scope** — чёткие границы: какие системы входят, а каких **никогда** не касаются.
- **Rules of engagement** — правила: время, методы, что можно и что нельзя.

**Правило:** система за пределами scope — запрещена. «Случайно нашёл» тоже не даёт разрешения.

> **Безопасность:** первый шаг — не техника, а **правовое основание**. Тест без разрешения — ошибка, которая стоит карьеры и свободы.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Axloqiy xakerlikning birinchi sharti nima?',
          ru: 'Каково первое условие этичного хакинга?',
        },
        options: [
          { id: 'a', uz: 'Yozma ruxsat (authorization)', ru: 'Письменное разрешение (authorization)' },
          { id: 'b', uz: 'Eng kuchli vosita', ru: 'Самый мощный инструмент' },
          { id: 'c', uz: 'Tezlik', ru: 'Скорость' },
          { id: 'd', uz: 'Yashirinlik', ru: 'Скрытность' },
        ],
        answer: 'a',
        explain: {
          uz: "Ruxsat — asos. Ruxsatsiz sinash jinoyat hisoblanadi, natijasi qanday bo'lishidan qat'i nazar.",
          ru: 'Разрешение — основа. Тестирование без разрешения является преступлением независимо от результата.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Agar zaiflik tasodifan topilsa, uni sinab ko'rish mumkin, chunki ruxsat shart emas.",
          ru: 'Если уязвимость найдена случайно, её можно проверить — разрешение не нужно.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q — scope tashqarisidagi tizim taqiqlangan. Tasodifan topilgan narsa ham ruxsat bermaydi.",
          ru: 'Нет — система вне scope запрещена. Случайно найденная вещь тоже не даёт разрешения.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Rules of engagement nimani belgilaydi? (bir nechtasini tanlang)',
          ru: 'Что определяют rules of engagement? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Qaysi tizimlar kiradi (scope)', ru: 'Какие системы входят (scope)' },
          { id: 'b', uz: 'Qaysi usullar mumkin', ru: 'Какие методы допустимы' },
          { id: 'c', uz: 'Vaqt va aloqa tartibi', ru: 'Время и порядок связи' },
          { id: 'd', uz: 'Xohlagan tizimni sinash', ru: 'Тестировать любую систему' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Scope, usullar va vaqt — oldindan yozma kelishiladi. 'Xohlagan tizim' esa aynan taqiqlangan narsa.",
          ru: 'Scope, методы и время согласуют заранее письменно. А «любая система» — как раз запрещённое.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Atamani mazmuni bilan moslang',
          ru: 'Соотнесите термин со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Authorization', ru: 'Authorization' }, right: { uz: 'Yozma rozilik', ru: 'Письменное согласие' } },
          { id: 'p2', left: { uz: 'Scope', ru: 'Scope' }, right: { uz: 'Aniq chegaralar', ru: 'Чёткие границы' } },
          { id: 'p3', left: { uz: 'Rules of engagement', ru: 'Rules of engagement' }, right: { uz: "O'yin qoidalari", ru: 'Правила игры' } },
          { id: 'p4', left: { uz: 'Out of scope', ru: 'Out of scope' }, right: { uz: 'Tegish taqiqlangan', ru: 'Трогать запрещено' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Authorization rozilik, scope chegara, rules of engagement qoidalar, out of scope esa tegish taqiqlangan hudud.",
          ru: 'Authorization — согласие, scope — границы, rules of engagement — правила, а out of scope — запретная зона.',
        },
      },
    ],
  },

  {
    slug: 'reconnaissance',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Razvedka', ru: 'Разведка' },
    content: {
      uz: `## Razvedka (reconnaissance)

**Razvedka** — hujumdan oldin ma'lumot yig'ish. Qancha ko'p bilsang, shuncha aniq ishlaysan.

**Turlari:**
- **Passiv** — tizimga tegmasdan yig'ish (ochiq manbalar, OSINT): domen, xodimlar, texnologiyalar.
- **Aktiv** — tizimga so'rov yuborib tekshirish (ko'proq iz qoldiradi).

**Nima qidiriladi:** domenlar, IP diapazonlar, ochiq xizmatlar, ishlatilgan texnologiyalar, ochiq hujjatlar.

> **Xavfsizlik:** passiv razvedka ko'pincha yetarli — ochiq ma'lumotning o'zi katta sirni ochadi. Shu sabab tashkilotlar "ochiq" ma'lumotni ham boshqarishi kerak.`,
      ru: `## Разведка (reconnaissance)

**Разведка** — сбор информации до атаки. Чем больше знаешь, тем точнее действуешь.

**Виды:**
- **Пассивная** — сбор без касания системы (открытые источники, OSINT): домены, сотрудники, технологии.
- **Активная** — проверка с запросами к системе (оставляет больше следов).

**Что ищут:** домены, диапазоны IP, открытые сервисы, используемые технологии, открытые документы.

> **Безопасность:** пассивной разведки часто достаточно — открытые данные сами раскрывают большой секрет. Поэтому организации должны управлять даже «открытой» информацией.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Passiv razvedka aktivdan nimasi bilan farq qiladi?',
          ru: 'Чем пассивная разведка отличается от активной?',
        },
        options: [
          { id: 'a', uz: 'Tizimga bevosita tegmaydi', ru: 'Не касается системы напрямую' },
          { id: 'b', uz: 'Har doim noqonuniy', ru: 'Всегда незаконна' },
          { id: 'c', uz: 'Vosita talab qilmaydi', ru: 'Не требует инструментов' },
          { id: 'd', uz: 'Faqat parolni topadi', ru: 'Находит только пароль' },
        ],
        answer: 'a',
        explain: {
          uz: "Passiv razvedka tizimga to'g'ridan-to'g'ri tegmasdan ma'lumot yig'adi (masalan, ochiq manbalardan), aktiv esa so'rov yuboradi.",
          ru: 'Пассивная разведка собирает данные, не касаясь системы напрямую (например, из открытых источников), а активная отправляет запросы.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Razvedka hujumdan oldingi bosqich bo'lib, ko'proq ma'lumot aniqroq harakat beradi.",
          ru: 'Разведка — этап перед атакой: больше данных даёт более точные действия.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri — ma'lumot qancha ko'p bo'lsa, keyingi bosqichlar shuncha aniq va samarali bo'ladi.",
          ru: 'Верно — чем больше данных, тем точнее и эффективнее последующие этапы.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Razvedkada nima yig'iladi? (bir nechtasini tanlang)",
          ru: 'Что собирают на разведке? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Domen va IP diapazonlar', ru: 'Домены и диапазоны IP' },
          { id: 'b', uz: 'Ochiq xizmatlar va texnologiyalar', ru: 'Открытые сервисы и технологии' },
          { id: 'c', uz: 'Ochiq hujjatlar', ru: 'Открытые документы' },
          { id: 'd', uz: "Boshqalarning shaxsiy sirlari", ru: 'Личные тайны других' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Domen, IP, xizmatlar va ochiq hujjatlar — qonuniy va foydali ma'lumot. Shaxsiy sirlarni yig'ish esa etikaga zid.",
          ru: 'Домены, IP, сервисы и открытые документы — законные и полезные данные. А сбор личных тайн противоречит этике.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Turni mazmuni bilan moslang',
          ru: 'Соотнесите вид со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Passiv razvedka', ru: 'Пассивная разведка' }, right: { uz: "Tegmasdan ma'lumot yig'ish", ru: 'Сбор данных без касания' } },
          { id: 'p2', left: { uz: 'Aktiv razvedka', ru: 'Активная разведка' }, right: { uz: "So'rov yuborib tekshirish", ru: 'Проверка с запросами' } },
          { id: 'p3', left: { uz: 'OSINT', ru: 'OSINT' }, right: { uz: "Ochiq manbalardan yig'ish", ru: 'Сбор из открытых источников' } },
          { id: 'p4', left: { uz: 'Footprinting', ru: 'Footprinting' }, right: { uz: "Nishon 'izini' chizish", ru: 'Составление «следа» цели' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Passiv tegmasdan, aktiv so'rov bilan, OSINT ochiq manbadan, footprinting esa nishon haqida umumiy tasvirni chizadi.",
          ru: 'Пассивная — без касания, активная — с запросами, OSINT — из открытых источников, а footprinting рисует общую картину цели.',
        },
      },
    ],
  },

  {
    slug: 'scanning-and-enumeration',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Skanerlash va sanab chiqish', ru: 'Сканирование и перечисление' },
    content: {
      uz: `## Skanerlash va sanab chiqish (enumeration)

**Skanerlash** — nishonda qaysi port va xizmat ochiqligini aniqlash. Bu — "xarita" chizish.

**Enumeration** — har bir ochiq xizmat haqida chuqurroq ma'lumot: versiya, sozlama, foydalanuvchilar.

**Nima uchun:** eski versiya yoki noto'g'ri sozlama ko'pincha ma'lum zaiflikni bildiradi.

**Muhim:** skanerlash shovqinli bo'lishi mumkin — tizim logiga tushadi. Shuning uchun **ruxsat** va **vaqt** kelishilgan bo'lishi shart.

> **Xavfsizlik:** skaner zaiflikni **topadi**, lekin isbotlamaydi. Ba'zan "topilgan" narsa noto'g'ri (false positive) bo'ladi — tekshirish kerak.`,
      ru: `## Сканирование и перечисление (enumeration)

**Сканирование** — определить, какие порты и сервисы открыты на цели. Это составление «карты».

**Enumeration** — более глубокие сведения о каждом открытом сервисе: версия, настройка, пользователи.

**Зачем:** старая версия или неверная настройка часто указывают на известную уязвимость.

**Важно:** сканирование бывает шумным — оно попадает в логи системы. Поэтому **разрешение** и **время** должны быть согласованы.

> **Безопасность:** сканер **находит** уязвимость, но не доказывает её. Иногда «найденное» оказывается ложным (false positive) — нужна проверка.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Enumeration (sanab chiqish) nima qiladi?',
          ru: 'Что делает enumeration (перечисление)?',
        },
        options: [
          { id: 'a', uz: "Ochiq xizmatlar haqida chuqurroq ma'lumot yig'adi", ru: 'Собирает более глубокие данные об открытых сервисах' },
          { id: 'b', uz: "Tizimni o'chiradi", ru: 'Выключает систему' },
          { id: 'c', uz: "Parolni o'zgartiradi", ru: 'Меняет пароль' },
          { id: 'd', uz: 'Faylni siqadi', ru: 'Сжимает файлы' },
        ],
        answer: 'a',
        explain: {
          uz: "Enumeration har bir ochiq xizmat bo'yicha versiya, sozlama va foydalanuvchilarni aniqlaydi — skanerdan keyingi qadam.",
          ru: 'Enumeration определяет версию, настройку и пользователей по каждому открытому сервису — шаг после сканирования.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Skaner topgan hamma narsa haqiqiy zaiflik (false positive yo'q)",
          ru: 'Всё, что нашёл сканер, — реальная уязвимость (ложных нет).',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q — skaner noto'g'ri natija (false positive) berishi mumkin. Har bir topilmani qo'lda tekshirish kerak.",
          ru: 'Нет — сканер может дать ложный результат (false positive). Каждую находку нужно проверять вручную.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Skanerlashda nimaga e'tibor beriladi? (bir nechtasini tanlang)",
          ru: 'На что обращают внимание при сканировании? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Ochiq portlar', ru: 'Открытые порты' },
          { id: 'b', uz: 'Xizmat versiyalari', ru: 'Версии сервисов' },
          { id: 'c', uz: "Noto'g'ri sozlamalar", ru: 'Неверные настройки' },
          { id: 'd', uz: 'Faqat fon rangi', ru: 'Только цвет фона' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Portlar, versiyalar va sozlamalar — asosiy ma'lumot. Ular ma'lum zaifliklarga ishora qiladi.",
          ru: 'Порты, версии и настройки — основные данные. Они указывают на известные уязвимости.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Atamani mazmuni bilan moslang',
          ru: 'Соотнесите термин со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Skanerlash', ru: 'Сканирование' }, right: { uz: 'Ochiq port va xizmatlarni topadi', ru: 'Находит открытые порты и сервисы' } },
          { id: 'p2', left: { uz: 'Enumeration', ru: 'Enumeration' }, right: { uz: 'Xizmat haqida chuqur malumot', ru: 'Глубокие данные о сервисе' } },
          { id: 'p3', left: { uz: 'False positive', ru: 'False positive' }, right: { uz: "Noto'g'ri topilma", ru: 'Ложная находка' } },
          { id: 'p4', left: { uz: 'Versiya', ru: 'Версия' }, right: { uz: "Eski bo'lsa xavf manbai", ru: 'Если старая — источник риска' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Skanerlash ochiq narsani topadi, enumeration chuqurlashtiradi, false positive yolg'on natija, eski versiya esa xavf tug'diradi.",
          ru: 'Сканирование находит открытое, enumeration углубляет, false positive — ложный результат, а старая версия создаёт риск.',
        },
      },
    ],
  },

  {
    slug: 'exploitation-basics',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Ekspluatatsiya asoslari', ru: 'Основы эксплуатации' },
    content: {
      uz: `## Ekspluatatsiya asoslari (exploitation)

**Ekspluatatsiya** — topilgan zaiflikdan **ruxsat doirasida** foydalanib, uning ta'sirini ko'rsatish.

**Maqsad — isbot, zarar emas:**
- Eng kam ta'sir bilan isbotlash (proof of concept, PoC).
- Faqat kerakli qadamni bajarish, keyin **to'xtash**.
- Ma'lumotni ko'chirmaslik va o'zgartirmaslik.

**Nima uchun muhim:** rahbariyat "zaiflik bor" degan gapga emas, **ko'rsatilgan ta'sirga** ishonadi.

> **Xavfsizlik:** ekspluatatsiya paytida chegaradan chiqib ketish oson. Isbot yetganda to'xtash — professionallik belgisi.`,
      ru: `## Основы эксплуатации (exploitation)

**Эксплуатация** — использование найденной уязвимости **в рамках разрешения**, чтобы показать её влияние.

**Цель — доказательство, а не вред:**
- Доказать с минимальным воздействием (proof of concept, PoC).
- Выполнить только нужный шаг, затем **остановиться**.
- Не копировать и не изменять данные.

**Почему это важно:** руководство верит не словам «есть уязвимость», а **продемонстрированному влиянию**.

> **Безопасность:** при эксплуатации легко выйти за рамки. Остановиться, когда доказательство получено, — признак профессионализма.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Ruxsat berilgan testda ekspluatatsiyaning maqsadi nima?',
          ru: 'Какова цель эксплуатации в разрешённом тесте?',
        },
        options: [
          { id: 'a', uz: "Ta'sirni eng kam zarar bilan isbotlash", ru: 'Доказать влияние с минимальным ущербом' },
          { id: 'b', uz: "Iloji boricha ko'p zarar yetkazish", ru: 'Нанести как можно больше вреда' },
          { id: 'c', uz: "Ma'lumotni o'chirish", ru: 'Удалить данные' },
          { id: 'd', uz: 'Foydalanuvchilarni bezovta qilish', ru: 'Мешать пользователям' },
        ],
        answer: 'a',
        explain: {
          uz: "Maqsad — isbot, zarar emas: eng kam ta'sir bilan zaiflikni ko'rsatish va to'xtash.",
          ru: 'Цель — доказательство, а не вред: показать уязвимость с минимальным воздействием и остановиться.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Zaiflik isbotlangach, chuqurroq kirish uchun chegaradan chiqish mumkin.",
          ru: 'После доказательства уязвимости можно выйти за рамки, чтобы проникнуть глубже.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q — isbot yetganda to'xtash kerak. Scope tashqarisiga chiqish ruxsatni buzadi.",
          ru: 'Нет — когда доказательство получено, нужно остановиться. Выход за scope нарушает разрешение.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Yaxshi ekspluatatsiya isbotiga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в хорошее доказательство эксплуатации? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Eng kam ta'sir", ru: 'Минимальное воздействие' },
          { id: 'b', uz: "Qayta ko'rsatish mumkin (reproducible)", ru: 'Воспроизводимость (reproducible)' },
          { id: 'c', uz: 'Aniq qadamlar (hujjat)', ru: 'Чёткие шаги (документ)' },
          { id: 'd', uz: "Ma'lumotni ko'chirib olish", ru: 'Копирование данных' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Kam ta'sir, qayta ko'rsatish va hujjat — ishonchli isbot. Ma'lumotni ko'chirish esa etikaga zid va ruxsatdan tashqari.",
          ru: 'Минимальное воздействие, воспроизводимость и документ — надёжное доказательство. А копирование данных противоречит этике и выходит за разрешение.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Atamani mazmuni bilan moslang',
          ru: 'Соотнесите термин со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'PoC', ru: 'PoC' }, right: { uz: "Zaiflikni ko'rsatuvchi isbot", ru: 'Доказательство, показывающее уязвимость' } },
          { id: 'p2', left: { uz: "Eng kam ta'sir", ru: 'Минимальное воздействие' }, right: { uz: 'Zararni minimallashtirish', ru: 'Минимизация ущерба' } },
          { id: 'p3', left: { uz: 'Reproducible', ru: 'Reproducible' }, right: { uz: "Qayta ko'rsatish mumkin", ru: 'Можно воспроизвести' } },
          { id: 'p4', left: { uz: "To'xtash", ru: 'Остановка' }, right: { uz: 'Isbot yetganda tugatish', ru: 'Завершить, когда доказательство получено' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "PoC — isbot, eng kam ta'sir — zararni minimallashtirish, reproducible — qayta ko'rsatish, to'xtash esa isbot yetganda tugatish.",
          ru: 'PoC — доказательство, минимальное воздействие — уменьшение ущерба, reproducible — воспроизводимость, а остановка — завершение по достижении доказательства.',
        },
      },
    ],
  },

  {
    slug: 'privilege-escalation-and-lateral-movement',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: "Huquq oshirish va harakatlanish", ru: 'Повышение привилегий и перемещение' },
    content: {
      uz: `## Huquq oshirish va yonlama harakatlanish

**Privilege escalation (huquq oshirish)** — past huquqdan yuqori huquqqa (masalan, oddiy foydalanuvchidan admin) chiqish.

- **Vertikal** — pastdan yuqoriga (foydalanuvchi → admin).
- **Gorizontal** — teng darajadan boshqa hisobga (bir foydalanuvchidan boshqasiga).

**Lateral movement (yonlama harakatlanish)** — bitta tizimdan boshqasiga o'tish, ko'pincha bir xil parol yoki kalit tufayli.

**Himoya tomoni:** segmentatsiya, eng kam imtiyoz va **har xil parol** bunday zanjirni uzadi.

> **Xavfsizlik:** buzg'unchi ko'pincha bitta kichik kirishdan boshlaydi, keyin huquq oshirib, ichkarida tarqaladi. Shu sabab har bir qadam muhim.`,
      ru: `## Повышение привилегий и перемещение

**Privilege escalation (повышение привилегий)** — переход с низких прав на высокие (например, от обычного пользователя к админу).

- **Вертикальное** — снизу вверх (пользователь → админ).
- **Горизонтальное** — с одного равного уровня на другой аккаунт (от одного пользователя к другому).

**Lateral movement (перемещение вбок)** — переход с одной системы на другую, часто из-за одинакового пароля или ключа.

**Со стороны защиты:** сегментация, наименьшие привилегии и **разные пароли** разрывают такую цепочку.

> **Безопасность:** злоумышленник часто начинает с одного небольшого доступа, затем повышает права и распространяется внутри. Поэтому важен каждый шаг.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Vertikal privilege escalation nima?',
          ru: 'Что такое вертикальное повышение привилегий?',
        },
        options: [
          { id: 'a', uz: 'Past huquqdan yuqori huquqqa chiqish', ru: 'Переход с низких прав на высокие' },
          { id: 'b', uz: "Bir tizimdan boshqasiga o'tish", ru: 'Переход с одной системы на другую' },
          { id: 'c', uz: 'Faylni shifrlash', ru: 'Шифрование файла' },
          { id: 'd', uz: 'Parolni tiklash', ru: 'Восстановление пароля' },
        ],
        answer: 'a',
        explain: {
          uz: "Vertikal — pastdan yuqoriga (foydalanuvchi → admin). Gorizontal esa teng darajadan boshqa hisobga.",
          ru: 'Вертикальное — снизу вверх (пользователь → админ). А горизонтальное — с одного равного уровня на другой аккаунт.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Lateral movement ko'pincha bir xil parol yoki kalit ishlatilishi tufayli osonlashadi.",
          ru: 'Lateral movement часто облегчается из-за одинакового пароля или ключа.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri — bir xil parol yoki kalit bir tizimdan boshqasiga o'tishni osonlashtiradi. Shu sabab har joyda har xil parol kerak.",
          ru: 'Верно — одинаковый пароль или ключ облегчает переход с одной системы на другую. Поэтому везде нужны разные пароли.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Yonlama harakatlanishni qiyinlashtirishga nima yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает затруднить перемещение вбок? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Segmentatsiya', ru: 'Сегментация' },
          { id: 'b', uz: 'Eng kam imtiyoz', ru: 'Наименьшие привилегии' },
          { id: 'c', uz: 'Har xil parol', ru: 'Разные пароли' },
          { id: 'd', uz: 'Hamma uchun bitta admin parol', ru: 'Один админский пароль для всех' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Segmentatsiya, eng kam imtiyoz va har xil parol zanjirni uzadi. Bitta admin parol esa aksincha — hammasini ochadi.",
          ru: 'Сегментация, наименьшие привилегии и разные пароли разрывают цепочку. А один админский пароль наоборот открывает всё.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Atamani mazmuni bilan moslang',
          ru: 'Соотнесите термин со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Vertikal escalation', ru: 'Вертикальное повышение' }, right: { uz: 'Pastdan yuqoriga', ru: 'Снизу вверх' } },
          { id: 'p2', left: { uz: 'Gorizontal escalation', ru: 'Горизонтальное повышение' }, right: { uz: 'Tengdan tengga', ru: 'От равного к равному' } },
          { id: 'p3', left: { uz: 'Lateral movement', ru: 'Lateral movement' }, right: { uz: "Tizimdan tizimga o'tish", ru: 'Переход с системы на систему' } },
          { id: 'p4', left: { uz: 'Segmentatsiya', ru: 'Сегментация' }, right: { uz: "Tarqalishni to'sadi", ru: 'Останавливает распространение' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Vertikal pastdan yuqoriga, gorizontal tengdan tengga, lateral movement tizimlararo, segmentatsiya esa tarqalishni to'sadi.",
          ru: 'Вертикальное — снизу вверх, горизонтальное — от равного к равному, lateral movement — между системами, а сегментация останавливает распространение.',
        },
      },
    ],
  },

  {
    slug: 'reporting-and-remediation',
    kind: 'lesson',
    xp_reward: 35,
    title: { uz: 'Hisobot va tuzatish', ru: 'Отчёт и устранение' },
    content: {
      uz: `## Hisobot va tuzatish (reporting)

Tekshiruvning **asosiy mahsuloti — hisobot**. Usiz butun ish behuda.

**Hisobotda nima bo'ladi:**
- **Topilma** — zaiflik tavsifi va dalil.
- **Jiddiylik** — ta'sir va ehtimollik asosida baho.
- **Qayta ko'rsatish** — muammoni qanday takrorlash mumkin.
- **Tavsiya (remediation)** — qanday tuzatish kerak.

**Tartib:** eng jiddiysidan boshlash. Har bir topilma **tushunarli tilda** yozilsin — texnik va rahbariyat ikkisi ham o'qiy olsin.

> **Xavfsizlik:** "topdim" bilan ish tugamaydi. Tuzatilishi va qayta tekshirilishi kerak — aks holda zaiflik joyida qoladi.`,
      ru: `## Отчёт и устранение (reporting)

**Главный продукт проверки — отчёт**. Без него вся работа напрасна.

**Что содержит отчёт:**
- **Находка** — описание уязвимости и доказательство.
- **Серьёзность** — оценка на основе влияния и вероятности.
- **Воспроизведение** — как повторить проблему.
- **Рекомендация (remediation)** — как исправить.

**Порядок:** начинать с самого серьёзного. Каждая находка должна быть **на понятном языке** — чтобы её поняли и технари, и руководство.

> **Безопасность:** на «нашёл» работа не заканчивается. Нужно исправить и перепроверить — иначе уязвимость останется на месте.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Penetratsion testning asosiy mahsuloti nima?',
          ru: 'Каков главный продукт пентеста?',
        },
        options: [
          { id: 'a', uz: 'Hisobot (topilmalar va tavsiyalar)', ru: 'Отчёт (находки и рекомендации)' },
          { id: 'b', uz: "Faqat parol ro'yxati", ru: 'Только список паролей' },
          { id: 'c', uz: 'Yangi dastur', ru: 'Новая программа' },
          { id: 'd', uz: 'Dizayn', ru: 'Дизайн' },
        ],
        answer: 'a',
        explain: {
          uz: "Hisobot — asosiy natija: topilmalar, jiddiylik, qayta ko'rsatish va tuzatish tavsiyalari.",
          ru: 'Отчёт — главный результат: находки, серьёзность, воспроизведение и рекомендации по устранению.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Hisobot faqat texnik mutaxassislar uchun, rahbariyat tushunishi shart emas.",
          ru: 'Отчёт только для технических специалистов, руководству понимать не обязательно.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q — qarorni rahbariyat qabul qiladi. Hisobot texnik va tushunarli tilda bo'lishi kerak.",
          ru: 'Нет — решение принимает руководство. Отчёт должен быть техническим и при этом понятным.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Yaxshi hisobotga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в хороший отчёт? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Topilma tavsifi va dalil', ru: 'Описание находки и доказательство' },
          { id: 'b', uz: 'Jiddiylik bahosi', ru: 'Оценка серьёзности' },
          { id: 'c', uz: 'Tuzatish tavsiyasi', ru: 'Рекомендация по устранению' },
          { id: 'd', uz: 'Faqat tizim nomi, tafsilotsiz', ru: 'Только имя системы, без деталей' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Topilma, jiddiylik va tuzatish — hisobotning asosi. Tafsilotsiz yozuv tuzatishga yordam bermaydi.",
          ru: 'Находка, серьёзность и устранение — основа отчёта. Запись без деталей не поможет исправить.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: "Bo'limni mazmuni bilan moslang",
          ru: 'Соотнесите раздел со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Topilma', ru: 'Находка' }, right: { uz: 'Aniqlangan muammo tavsifi', ru: 'Описание найденной проблемы' } },
          { id: 'p2', left: { uz: 'Jiddiylik', ru: 'Серьёзность' }, right: { uz: "Ta'sir va ehtimollik bahosi", ru: 'Оценка влияния и вероятности' } },
          { id: 'p3', left: { uz: 'Reproducible', ru: 'Reproducible' }, right: { uz: "Qayta ko'rsatish mumkin", ru: 'Можно воспроизвести' } },
          { id: 'p4', left: { uz: 'Remediation', ru: 'Remediation' }, right: { uz: 'Tuzatish tavsiyasi', ru: 'Рекомендация по устранению' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Topilma muammoni tasvirlaydi, jiddiylik ta'sirni baholaydi, reproducible qayta ko'rsatishni, remediation esa tuzatishni bildiradi.",
          ru: 'Находка описывает проблему, серьёзность оценивает влияние, reproducible означает воспроизводимость, а remediation — способ устранения.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-ethical-testing',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Etik test nazorati', ru: 'Проверка: Этичный хакинг' },
    content: {
      uz: `## 🏆 Nazorat

Etik (ruxsatli) test bo'yicha bilimingizni tekshiring: ruxsat, razvedka, skanerlash, ekspluatatsiya, huquq oshirish va hisobot. Javobdan oldin o'ylang.`,
      ru: `## 🏆 Проверка

Проверьте знания по этичному (разрешённому) тестированию: разрешение, разведка, сканирование, эксплуатация, повышение привилегий и отчёт. Подумайте перед ответом.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Etik testni boshlashdan oldin eng muhim narsa nima?',
          ru: 'Что самое важное перед началом этичного теста?',
        },
        options: [
          { id: 'a', uz: 'Yozma ruxsat va aniq scope', ru: 'Письменное разрешение и чёткий scope' },
          { id: 'b', uz: 'Eng kuchli vosita', ru: 'Самый мощный инструмент' },
          { id: 'c', uz: 'Tezlik', ru: 'Скорость' },
          { id: 'd', uz: 'Yashirinlik', ru: 'Скрытность' },
        ],
        answer: 'a',
        explain: {
          uz: "Ruxsat va scope — poydevor. Ularsiz har qanday 'test' jinoyat hisoblanadi.",
          ru: 'Разрешение и scope — основа. Без них любой «тест» является преступлением.',
        },
      },
      {
        id: 'e2',
        type: 'order',
        q: {
          uz: 'Etik test bosqichlarini tartibga soling',
          ru: 'Расставьте этапы этичного теста по порядку',
        },
        items: [
          { id: 'i1', uz: 'Ruxsat va scopeni kelishish', ru: 'Согласование разрешения и scope' },
          { id: 'i2', uz: 'Razvedka', ru: 'Разведка' },
          { id: 'i3', uz: 'Skanerlash va enumeration', ru: 'Сканирование и enumeration' },
          { id: 'i4', uz: 'Ekspluatatsiya (isbot)', ru: 'Эксплуатация (доказательство)' },
          { id: 'i5', uz: 'Hisobot va tavsiya', ru: 'Отчёт и рекомендации' },
        ],
        order: ['i1', 'i2', 'i3', 'i4', 'i5'],
        explain: {
          uz: "Ruxsat → razvedka → skanerlash → ekspluatatsiya → hisobot. Ruxsat birinchi, hisobot oxirgi — va eng muhim natijalardan biri.",
          ru: 'Разрешение → разведка → сканирование → эксплуатация → отчёт. Разрешение первым, отчёт последним — и он один из главных результатов.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Ruxsatsiz tizimni sinash 'yaxshi niyat' bilan oqlanadi.",
          ru: 'Тестирование системы без разрешения оправдывается «благими намерениями».',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q — niyat emas, ruxsat muhim. Ruxsatsiz sinash jinoyat hisoblanadi.",
          ru: 'Нет — важно не намерение, а разрешение. Тестирование без разрешения является преступлением.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Bosqichni mazmuni bilan moslang',
          ru: 'Соотнесите этап со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Reconnaissance', ru: 'Reconnaissance' }, right: { uz: "Ma'lumot yig'ish", ru: 'Сбор информации' } },
          { id: 'p2', left: { uz: 'Enumeration', ru: 'Enumeration' }, right: { uz: 'Xizmatlarni sanab chiqish', ru: 'Перечисление сервисов' } },
          { id: 'p3', left: { uz: 'Privilege escalation', ru: 'Privilege escalation' }, right: { uz: 'Huquqni oshirish', ru: 'Повышение привилегий' } },
          { id: 'p4', left: { uz: 'Reporting', ru: 'Reporting' }, right: { uz: 'Topilma va tavsiya', ru: 'Находка и рекомендация' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Reconnaissance ma'lumot yig'adi, enumeration xizmatlarni sanaydi, privilege escalation huquqni oshiradi, reporting esa topilma va tavsiya beradi.",
          ru: 'Reconnaissance собирает данные, enumeration перечисляет сервисы, privilege escalation повышает права, а reporting даёт находку и рекомендацию.',
        },
      },
      {
        id: 'e5',
        type: 'multi',
        q: {
          uz: 'Etik testda nima taqiqlangan? (bir nechtasini tanlang)',
          ru: 'Что запрещено в этичном тесте? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Scopedan tashqari tizimni sinash', ru: 'Тестирование системы вне scope' },
          { id: 'b', uz: "Ma'lumotni ko'chirib olish", ru: 'Копирование данных' },
          { id: 'c', uz: 'Ruxsatsiz test', ru: 'Тест без разрешения' },
          { id: 'd', uz: 'Topilmani hisobotga yozish', ru: 'Запись находки в отчёт' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Scope tashqarisi, ma'lumot o'g'irlash va ruxsatsiz test — taqiqlangan. Topilmani hisobotga yozish esa talab qilinadi.",
          ru: 'Выход за scope, кража данных и тест без разрешения — запрещены. А запись находки в отчёт, наоборот, обязательна.',
        },
      },
    ],
  },
];
