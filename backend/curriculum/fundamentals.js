/**
 * Curriculum — Cybersecurity path › Domain 1: Fundamentals
 *
 * Shape (validated by setup.js via lib/grade.validateExercise):
 *   module: { slug, title:{uz,ru}, content:{uz,ru}, kind, xp_reward, exercises:[...] }
 *   kind: 'lesson' | 'checkpoint'   (checkpoint = end-of-domain trophy node)
 *
 * Rules for authors:
 *   - Lesson prose: short. 6–14 markdown lines per language. This is a
 *     warm-up, not a textbook — the exercises do the teaching.
 *   - Every exercise: bilingual q + explain, technically accurate, beginner
 *     level, no trick questions, explanations teach the WHY.
 *   - Exercise ids: e1..eN in delivery order.
 *   - Uzbek: simple, modern Uzbek Latin. Russian: natural, not machine-translated.
 */

module.exports = [
  {
    slug: 'what-is-cybersecurity',
    kind: 'lesson',
    xp_reward: 15,
    title: { uz: 'Kiber xavfsizlik nima?', ru: 'Что такое кибербезопасность?' },
    content: {
      uz: `## Kiber xavfsizlik nima?

Kiber xavfsizlik — ma'lumotlarni ruxsatsiz kirishdan, o'g'irlashdan va buzib ketishdan himoya qilish san'ati.

U faqat "hakerlarga qarshi" emas. Kiber xavfsizlik — bu:

- **Himoya** — ma'lumotni o'g'irlashning oldini olish
- **Aniqlash** — huzur bo'layotgan hujumni tez ko'rish
- **Tiklash** — hujumdan keyin ishlarni qayta boshlash

> **Eslatma:** Xavfsizlik — bu mahsulot, lekin hech qachon 100% emas. Vazifa — xavfni qabul qilib bo'ladigan darajaga tushirish.`,
      ru: `## Что такое кибербезопасность?

Кибербезопасность — искусство защиты данных от несанкционированного доступа, кражи и повреждений.

Это не только «борьба с хакерами». Кибербезопасность — это:

- **Защита** — предотвращение кражи данных
- **Обнаружение** — быстрая фиксация идущей атаки
- **Восстановление** — возврат к работе после атаки

> **Важно:** безопасность — это продукт, но никогда не 100%. Задача — снизить риск до приемлемого уровня.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Kiber xavfsizlikning asosiy maqsadi nima?',
          ru: 'Какова главная цель кибербезопасности?',
        },
        options: [
          { id: 'a', uz: "Kompyuterni tezlashtirish", ru: 'Ускорить компьютер' },
          { id: 'b', uz: "Ma'lumotlarni himoya qilish", ru: 'Защитить данные' },
          { id: 'c', uz: 'Yangi ilova yozish', ru: 'Написать новое приложение' },
          { id: 'd', uz: 'Internetni ochish', ru: 'Открыть доступ в интернет' },
        ],
        answer: 'b',
        explain: {
          uz: "Kiber xavfsizlik ma'lumotlarni himoya qilishga yo'naltirilgan. Tezlashtirish — bu tizim administratorining, ilova yozish — dasturchining vazifasi.",
          ru: 'Кибербезопасность направлена на защиту данных. Ускорение — задача администратора, разработка — задача программиста.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: 'Kiber xavfsizlik faqat katta kompaniyalarga kerak.',
          ru: 'Кибербезопасность нужна только крупным компаниям.',
        },
        answer: 'false',
        explain: {
          uz: "Har qanday odamning hisobi, telefoni va ma'lumotlari mavjud. O'g'irlik kattalikni tanlamaydi — shaxsiy hisoblar ham nishondir.",
          ru: 'У любого человека есть аккаунты, телефон и данные. Вор не выбирает по размеру — личные аккаунты тоже цель.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Kiber xavfsizlikka qaysilar kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в кибербезопасность? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Hujumni aniqlash', ru: 'Обнаружение атак' },
          { id: 'b', uz: "Ma'lumotni himoya qilish", ru: 'Защита данных' },
          { id: 'c', uz: 'Foydalanuvchilarni o\'qitish', ru: 'Обучение пользователей' },
          { id: 'd', uz: 'WiFi parolini oson qilish', ru: 'Упрощение пароля WiFi' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Aniqlash, himoya va odamlarni o\'qitish — uchalasi ham xavfsizlikning qismi. WiFi parolini oson qilish esa aksincha — zaiflik yaratadi.',
          ru: 'Обнаружение, защита и обучение людей — всё это часть безопасности. Простой пароль WiFi создаёт слабость.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "Xaker ma'lumotga ruxsatsiz kirishga urinayotganda, bu qirra atama deyiladi: ______ (inglizcha)",
          ru: 'Когда злоумышленник пытается получить доступ без разрешения, это называется ______ (по-английски)',
        },
        answer: 'attack',
        accepted: ['hujum', ' cyber attack', 'cyberattack', 'cyber attack'],
        explain: {
          uz: 'Inglizchada buning nomi **attack** (hujum). Xavfsizlikda hujum — bu maqsadli, ruxsatsiz harakat.',
          ru: 'По-английски это **attack** (атака). В безопасности атака — это целенаправленное, несанкционированное действие.',
        },
      },
    ],
  },

  {
    slug: 'cia-triad',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'CIA uchburchagi', ru: 'Триада CIA' },
    content: {
      uz: `## CIA uchburchagi

Kiber xavfsizlikning uchta ustuni bor. Ularning boshi harflari **CIA** bo'lib chiqadi — bu tasodif emas:

| Harf | Tushuncha | Savol |
|---|---|---|
| **C** — Confidentiality | Maxfiylik | Kim ko'ra olishi kerak? |
| **I** — Integrity | Butunlik | Ma'lumot o'zgartirilmaganmi? |
| **A** — Availability | Mavjudlik | Tizim hozir ishlashda? |

Birini ham buzsa — xavfsizlik buziladi. Chorrahada to'xtab turgan tizim ham, o'g'irlangan parol ham, buzilgan fayl ham bir xil muammo.`,
      ru: `## Триада CIA

У кибербезопасности есть три столпа. Их первые буквы складываются в **CIA** — и это не случайность:

| Буква | Понятие | Вопрос |
|---|---|---|
| **C** — Confidentiality | Конфиденциальность | Кто имеет право видеть? |
| **I** — Integrity | Целостность | Данные не изменены? |
| **A** — Availability | Доступность | Система работает прямо сейчас? |

Нарушение любого из трёх — это нарушение безопасности. И недоступная система, и украденный пароль, и испорченный файл — одна и та же проблема.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Parol o\'g\'irlanib, boshqa odam hisobga kirdi. Qaysil buzildi?',
          ru: 'Украли пароль, и кто-то вошёл в чужой аккаунт. Что нарушено?',
        },
        options: [
          { id: 'a', uz: 'Maxfiylik (Confidentiality)', ru: 'Конфиденциальность' },
          { id: 'b', uz: 'Mavjudlik (Availability)', ru: 'Доступность' },
          { id: 'c', uz: 'Butunlik (Integrity)', ru: 'Целостность' },
          { id: 'd', uz: 'Hech narsa', ru: 'Ничего' },
        ],
        answer: 'a',
        explain: {
          uz: 'Maxfiylik — "faqat ruxsat etilganlar ko\'ra oladi". Boshqa odam kirsa, aynan shu buzildi.',
          ru: 'Конфиденциальность — «только авторизованные видят». Чужой вошёл — нарушено именно это.',
        },
      },
      {
        id: 'e2',
        type: 'mc',
        q: {
          uz: 'Server hujum ostida qold va sayt ochilmayapti. Qaysil buzildi?',
          ru: 'Сервер под атакой, сайт не открывается. Что нарушено?',
        },
        options: [
          { id: 'a', uz: 'Maxfiylik', ru: 'Конфиденциальность' },
          { id: 'b', uz: 'Butunlik', ru: 'Целостность' },
          { id: 'c', uz: 'Mavjudlik', ru: 'Доступность' },
          { id: 'd', uz: 'Maxfiylik va butunlik', ru: 'Конфиденциальность и целостность' },
        ],
        answer: 'c',
        explain: {
          uz: 'Availability (mavjudlik) — tizim hozir ishlashi kerak. Sayt ochilmayapti demak, shu buzildi.',
          ru: 'Availability — система должна работать сейчас. Сайт недоступен — нарушена именно она.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Har bir tushunchani uning savoliga moslang',
          ru: 'Соотнесите понятие с его вопросом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Maxfiylik', ru: 'Конфиденциальность' }, right: { uz: 'Kim ko\'ra oladi?', ru: 'Кто может видеть?' } },
          { id: 'p2', left: { uz: 'Butunlik', ru: 'Целостность' }, right: { uz: 'O\'zgartirilmaganmi?', ru: 'Не изменено?' } },
          { id: 'p3', left: { uz: 'Mavjudlik', ru: 'Доступность' }, right: { uz: 'Hozir ishlashda?', ru: 'Работает сейчас?' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Uch savol — uch ustun: kim ko\'radi (C), o\'zgarganmi (I), ishlayaptimi (A).',
          ru: 'Три вопроса — три столпа: кто видит (C), не изменено ли (I), работает ли (A).',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: 'Fayl buzilib (o\'zgartirilib) qolgan bo\'lsa, Integrity (butunlik) buzilgan.',
          ru: 'Если файл повреждён (изменён), нарушена Integrity (целостность).',
        },
        answer: 'true',
        explain: {
          uz: "Butunlik — ma'lumot aynan shunday saqlanishi kerakligini anglatadi. Biroz o'zgarsa ham buziladi.",
          ru: 'Целостность означает, что данные должны храниться без изменений. Даже небольшая правка её нарушает.',
        },
      },
    ],
  },

  {
    slug: 'threats-and-risks',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'Tahdid, zaiflik va risk', ru: 'Угроза, уязвимость и риск' },
    content: {
      uz: `## Uchta atama — adashtirmang

Bu uchtasi bir-biriga o'xshaydi, lekin turli narsa:

- **Tahdid (threat)** — zarar yetkazishi mumkin bo'lgan narsa. Masalan, haker yoki ransomware.
- **Zaiflik (vulnerability)** — tahdid foydalanadigan zaif tomon. Masalan, eski dastur yoki "123456" parol.
- **Risk** — tahdid zaiflikdan foydalanib, zarar keltirish ehtimoli.

\`\`\`
Tahdid + Zaiflik = Risk
\`\`\`

Zaiflikni yopganingizda — risk tugaydi. Shuning uchun yangilanishlar (update) shunchaki "bezovta" emas.`,
      ru: `## Три термина — не путайте их

Они похожи, но это разные вещи:

- **Угроза (threat)** — то, что может навредить. Например, хакер или ransomware.
- **Уязвимость (vulnerability)** — слабое место, которым угроза пользуется. Например, старая программа или пароль «123456».
- **Риск** — вероятность того, что угроза воспользуется уязвимостью и нанесёт ущерб.

\`\`\`
Угроза + Уязвимость = Риск
\`\`\`

Закрыли уязвимость — риск исчезает. Поэтому обновления — это не «назойливость», а защита.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'match',
        q: { uz: 'Atamani uning ta\'rifiga moslang', ru: 'Соотнесите термин с определением' },
        pairs: [
          { id: 'p1', left: { uz: 'Tahdid', ru: 'Угроза' }, right: { uz: 'Zarar keltirishi mumkin bo\'lgan narsa', ru: 'То, что может навредить' } },
          { id: 'p2', left: { uz: 'Zaiflik', ru: 'Уязвимость' }, right: { uz: 'Tahdid foydalanadigan zaif tomon', ru: 'Слабое место, которым пользуются' } },
          { id: 'p3', left: { uz: 'Risk', ru: 'Риск' }, right: { uz: 'Zarar yetish ehtimoli', ru: 'Вероятность ущерба' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Tahdid — kuch, zaiflik — teshik, risk — ikkalasining kombinatsiyasi.',
          ru: 'Угроза — сила, уязвимость — дыра, риск — их комбинация.',
        },
      },
      {
        id: 'e2',
        type: 'mc',
        q: {
          uz: 'Kompaniyada eski, yangilanmagan server bor. Bu nima?',
          ru: 'В компании есть старый сервер без обновлений. Это что?',
        },
        options: [
          { id: 'a', uz: 'Tahdid', ru: 'Угроза' },
          { id: 'b', uz: 'Zaiflik', ru: 'Уязвимость' },
          { id: 'c', uz: 'Risk', ru: 'Риск' },
          { id: 'd', uz: 'Zaiflik emas, balki himoya', ru: 'Это не уязвимость, а защита' },
        ],
        answer: 'b',
        explain: {
          uz: 'Eski server — bu zaif tomon. Tahdid (masalan, haker) shu zaiflikdan foydalanishi mumkin.',
          ru: 'Старый сервер — это слабое место. Угроза (например, хакер) сможет им воспользоваться.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: 'Zaiflikni yopgandan keyin ham risk butunlay yo\'qolavermaydi.',
          ru: 'Даже после закрытия уязвимости риск не всегда исчезает полностью.',
        },
        answer: 'true',
        explain: {
          uz: 'To\'g\'ri: yangi zaifliklar paydo bo\'ladi, odash omili ham qoladi. Xavfsizlik — doimiy jarayon.',
          ru: 'Верно: появляются новые уязвимости, остаётся человеческий фактор. Безопасность — это процесс.',
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: 'Riskni kamaytirishga nima yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает снизить риск? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Dasturlarni yangilash', ru: 'Обновлять программы' },
          { id: 'b', uz: 'Kuchli parollar ishlatish', ru: 'Использовать надёжные пароли' },
          { id: 'c', uz: 'Muhim ma\'lumotni zaxiralash (backup)', ru: 'Делать резервные копии данных' },
          { id: 'd', uz: 'Hammasini bir parolga tenglash', ru: 'Сделать один пароль на всё' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Yangilash zaiflikni, kuchli parol kirishni, backup esa zarar yetganda yo\'qotishni kamaytiradi.',
          ru: 'Обновления закрывают уязвимости, пароли защищают вход, бэкапы снижают потери при инциденте.',
        },
      },
    ],
  },

  {
    slug: 'malware-basics',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Zararli dasturlar asoslari', ru: 'Основы вредоносного ПО' },
    content: {
      uz: `## Malware — zararli dasturlar

**Malware** (malicious software) — kompyuterga zarar berish uchun yozilgan dastur. Asosiy turlari:

| Tur | Xususiyat |
|---|---|
| **Virus** | Boshqa faylga "yopishib", ulanishda tarqaladi |
| **Worm** | O'zi tarmoq orqali tarqaladi, odam yordami shart emas |
| **Trojan** | Foydali dastur ko'rinishida keladi |
| **Ransomware** | Fayllarni shifrlab, pul so'raydi |

> **Eng muhim qoida:** Ransomware'dan himoyaning eng ishonchli usuli — zaxira nusxa (backup).`,
      ru: `## Malware — вредоносное ПО

**Malware** (malicious software) — программа, созданная для вреда. Основные типы:

| Тип | Особенность |
|---|---|
| **Вирус** | «Прилипает» к другому файлу и распространяется при запуске |
| **Червь** | Сам распространяется по сети, без участия человека |
| **Троянец** | Приходит под видом полезной программы |
| **Рансомшифровальщик** | Шифрует файлы и требует деньги |

> **Главное правило:** от ransomware надёжнее всего защищают резервные копии.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Fayllarni shifrlab, qaytarish uchun pul so\'raydigan zararli dastur qaysi?',
          ru: 'Какой вредоносный шифрует файлы и требует выкуп?',
        },
        options: [
          { id: 'a', uz: 'Trojan', ru: 'Троянец' },
          { id: 'b', uz: 'Ransomware', ru: 'Рансомшифровальщик' },
          { id: 'c', uz: 'Firewall', ru: 'Файрвол' },
          { id: 'd', uz: 'Cookie', ru: 'Cookie' },
        ],
        answer: 'b',
        explain: {
          uz: 'Ransomware (ransom = pul tikish) fayllarni shifrlab, ochish uchun to\'lov talab qiladi. Firewall — himoya vositasi, cookie — brauzer ma\'lumoti.',
          ru: 'Рансомшифровальщик шифрует файлы и требует выкуп. Файрвол — средство защиты, cookie — данные браузера.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: { uz: 'Zararli dastur turini uning xususiyatiga moslang', ru: 'Соотнесите тип вредоносной программы с её признаком' },
        pairs: [
          { id: 'p1', left: { uz: 'Virus', ru: 'Вирус' }, right: { uz: 'Faylga yopishib tarqaladi', ru: 'Прилипает к файлу' } },
          { id: 'p2', left: { uz: 'Worm', ru: 'Червь' }, right: { uz: 'Tarmoq orqali o\'zi tarqaladi', ru: 'Сам распространяется по сети' } },
          { id: 'p3', left: { uz: 'Trojan', ru: 'Троянец' }, right: { uz: 'Foydali dastur ko\'rinishida', ru: 'Под видом полезной программы' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Virus — yopishqoq, worm — mustaqil sayohatchi, trojan — ikki yuzli.',
          ru: 'Вирус — прилипает, червь — путешествует сам, троянец — маскируется.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: 'Worm uchun odam boshqa faylni ochishi shart emas.',
          ru: 'Червю не нужно, чтобы человек открыл файл.',
        },
        answer: 'true',
        explain: {
          uz: "Ha — worm o'zi tarmoqdagi zaifliklarni topib, odam ishtirokisiz tarqaladi. Shuning uchun u virusdan xavfliroq.",
          ru: 'Да — червь сам находит слабости в сети и распространяется без человека. Поэтому он опаснее вируса.',
        },
      },
      {
        id: 'e4',
        type: 'mc',
        q: {
          uz: 'Ransomware hujumidan keyin eng ishonchli qutulish usuli qaysi?',
          ru: 'Самый надёжный способ оправиться после атаки ransomware?',
        },
        options: [
          { id: 'a', uz: 'Pul to\'lash', ru: 'Заплатить' },
          { id: 'b', uz: 'Kompyuterni qayta ishga tushirish', ru: 'Перезагрузить компьютер' },
          { id: 'c', uz: 'Zaxira nusxadan tiklash', ru: 'Восстановить из резервной копии' },
          { id: 'd', uz: 'Parolni o\'zgartirish', ru: 'Сменить пароль' },
        ],
        answer: 'c',
        explain: {
          uz: 'Pul to\'lash kafolat bermaydi (ko\'p hollarda fayllar qaytarilmaydi). Zaxira nusxa — yagona ishonchli yo\'l. Shuning uchun backup muntazam qilinadi.',
          ru: 'Выкуп не гарантирует возврат (часто файлы не возвращают). Надёжный путь — резервная копия. Поэтому бэкап делают регулярно.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-fundamentals',
    kind: 'checkpoint',
    xp_reward: 40,
    title: { uz: 'Fundamentals nazorati', ru: 'Проверка: Основы' },
    content: {
      uz: `## 🏆 Nazorat

Asosiylar bo'yicha bilimingizni tekshiring. Savollar master mavzularidan — o'ylab javob bering.`,
      ru: `## 🏆 Проверка

Проверьте свои знания по основам. Вопросы охватывают все уроки этого раздела — отвечайте обдуманно.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Kompaniya ma\'lumotlari ochganda: "Hammasi internetda ochiq bo\'lsin". Bu qaysil buzildi?',
          ru: 'Компания говорит: «Пусть все данные будут открыты в интернете». Что нарушено?',
        },
        options: [
          { id: 'a', uz: 'Maxfiylik', ru: 'Конфиденциальность' },
          { id: 'b', uz: 'Butunlik', ru: 'Целостность' },
          { id: 'c', uz: 'Mavjudlik', ru: 'Доступность' },
          { id: 'd', uz: 'Hech narsa', ru: 'Ничего' },
        ],
        answer: 'a',
        explain: {
          uz: 'Barchasi ochiq = maxfiylik yo\'q. Ma\'lumot faqat ruxsat etilganlar uchun bo\'lishi kerak.',
          ru: 'Всё открыто = нет конфиденциальности. Данные должны быть только для авторизованных.',
        },
      },
      {
        id: 'e2',
        type: 'multi',
        q: {
          uz: 'Xavfsiz parol qaysi xususiyatlarga ega? (bir nechtasini tanlang)',
          ru: 'Какие признаки у надёжного пароля? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Kamida 12 belgi', ru: 'Минимум 12 символов' },
          { id: 'b', uz: 'Harflar, raqamlar, belgilar aralash', ru: 'Смесь букв, цифр и символов' },
          { id: 'c', uz: 'Boshqa saytlardagi bilan bir xil', ru: 'Такой же, как на других сайтах' },
          { id: 'd', uz: 'Tahmin qilib bo\'lmasin', ru: 'Трудно угадать' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Uzun, aralash va taxmin qilib bo\'lmaydigan parol yaxshi. Lekin eng muhimi — har bir sayt uchun alohida parol.',
          ru: 'Длинный, сложный и неугадываемый пароль — хороший. Но главное — отдельный пароль для каждого сайта.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: 'Zaiflikni yopgandan keyin ham xavfsizlik haqida o\'ylash to\'xtaydi.',
          ru: 'После закрытия уязвимости о безопасности можно забыть.',
        },
        answer: 'false',
        explain: {
          uz: 'Xavfsizlik — doimiy jarayon. Yangi tahdid va zaifliklar har kuni paydo bo\'ladi.',
          ru: 'Безопасность — процесс. Новые угрозы и уязвимости появляются каждый день.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: 'Uch ustunning boshi: maxfiylik, butunlik va ______ (bir harfli atama, inglizcha)',
          ru: 'Первые буквы трёх столпов: конфиденциальность, целостность и ______ (буква, по-английски)',
        },
        answer: 'a',
        accepted: ['availability', 'mavjudlik', 'доступность', 'доступ'],
        explain: {
          uz: 'A — Availability (mavjudlik). Uchovlari birgalikda CIA triadasini tashkil qiladi.',
          ru: 'A — Availability (доступность). Вместе они образуют триаду CIA.',
        },
      },
      {
        id: 'e5',
        type: 'order',
        q: {
          uz: 'Ransomware xavfsizligi uchun to\'g\'ri tartibda joylang (birinchisi — eng muhim)',
          ru: 'Расставьте шаги защиты от ransomware (первый — самый важный)',
        },
        items: [
          { id: 'i1', uz: 'Muntazam zaxira nusxa olish', ru: 'Регулярно делать резервные копии' },
          { id: 'i2', uz: 'Tizim va dasturlarni yangilash', ru: 'Обновлять систему и программы' },
          { id: 'i3', uz: 'Xavfsizlik bo\'yicha mashq o\'tkazish', ru: 'Проводить обучение по безопасности' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: {
          uz: 'Avval backup (u qutulishni kafolatlaydi), so\'ng yangilanish (hujumni oldini oladi), keyin odamlarni o\'qitish (phishing ustida ishlaydi).',
          ru: 'Сначала бэкуп (гарантирует восстановление), затем обновления (предотвращают атаку), потом обучение (работает против фишинга).',
        },
      },
    ],
  },
];
