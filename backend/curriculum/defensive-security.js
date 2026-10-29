/**
 * Curriculum - Cybersecurity path › Domain: Defensive security (blue team / SOC)
 *
 * Shape (validated by scripts/validate-curriculum.js via lib/grade.validateExercise):
 *   module: { slug, title:{uz,ru}, content:{uz,ru}, kind, xp_reward, exercises:[...] }
 *   kind: 'lesson' | 'checkpoint'   (checkpoint = end-of-domain trophy node)
 *
 * Rules for authors:
 *   - Lesson prose: short. 6-14 markdown lines per language. This is a
 *     warm-up, not a textbook - the exercises do the teaching.
 *   - Every exercise: bilingual q + explain, technically accurate, beginner
 *     level, no trick questions, explanations teach the WHY.
 *   - Prefer established, vendor-neutral concepts (defense in depth, IDS/IPS,
 *     IR lifecycle). Do not invent product-specific or numeric claims.
 *   - Exercise ids: e1..eN in delivery order.
 *   - Uzbek: simple, modern Uzbek Latin. Russian: natural, not machine-translated.
 *   - Any string containing an apostrophe MUST be double-quoted (or a template
 *     literal) - a straight ' inside a single-quoted string breaks the file.
 */

module.exports = [
  {
    slug: 'defense-in-depth',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Chuqur himoya qatlamlari', ru: 'Эшелонированная защита' },
    content: {
      uz: `## Chuqur himoya (defense in depth)

Bitta himoya yetarli emas - u buzilsa, hammasi ochiladi. Shuning uchun **bir necha qatlam** qo'yiladi.

**Qatlamlar misoli:**
- **Tarmoq** - firewall, segmentatsiya
- **Tizim** - yamaqlar, eng kam imtiyoz, shifrlash
- **Ilova** - xavfsiz kod, kirishni tekshirish
- **Inson** - o'qitish, MFA, ogohlik

**Nega ishlaydi:** buzg'unchi bir qatlamni yorib o'tsa ham, keyingisiga uriladi. Bu vaqt va iz qoldiradi - himoyaga aniqlash imkonini beradi.

> **Xavfsizlik:** "hech narsa buzilmaydi" degan himoya yo'q. Maqsad - o'tishni qiyinlashtirish va payqash. Qatlamlar shuni beradi.`,
      ru: `## Эшелонированная защита (defense in depth)

Одной защиты недостаточно - если она сломается, откроется всё. Поэтому ставят **несколько слоёв**.

**Примеры слоёв:**
- **Сеть** - firewall, сегментация
- **Система** - патчи, наименьшие привилегии, шифрование
- **Приложение** - безопасный код, проверка доступа
- **Человек** - обучение, MFA, осведомлённость

**Почему работает:** даже если злоумышленник пробил один слой, он упирается в следующий. Это даёт время и оставляет следы - возможность обнаружить атаку.

> **Безопасность:** защиты «ничего никогда не сломается» не существует. Цель - затруднить проход и заметить его. Именно это дают слои.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Defense in depth nimani anglatadi?',
          ru: 'Что означает defense in depth?',
        },
        options: [
          { id: 'a', uz: "Bir nechta mustaqil himoya qatlamini qo'llash", ru: 'Применение нескольких независимых слоёв защиты' },
          { id: 'b', uz: 'Bitta juda kuchli parol', ru: 'Один очень надёжный пароль' },
          { id: 'c', uz: 'Faqat antivirus', ru: 'Только антивирус' },
          { id: 'd', uz: 'Faqat firewall', ru: 'Только firewall' },
        ],
        answer: 'a',
        explain: {
          uz: "Defense in depth - bir necha qatlam: bittasi buzilsa, boshqalari to'sadi. Bu bitta himoyaga tayanishdan ancha ishonchli.",
          ru: 'Defense in depth - это несколько слоёв: если один сломан, остальные сдерживают. Это надёжнее, чем полагаться на одну защиту.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Bitta juda kuchli himoya qatlami bo'lsa, boshqalari kerak emas.",
          ru: 'Если есть один очень сильный слой защиты, остальные не нужны.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - har qanday yagona himoya bir kun buzilishi mumkin. Qatlamlar bir-birini qoplaydi va buzg'unchiga to'sqinlik qiladi.",
          ru: 'Нет - любая единственная защита однажды может быть сломана. Слои дополняют друг друга и мешают злоумышленнику.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Himoya qatlamlariga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в слои защиты? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Tarmoq himoyasi (firewall, segmentatsiya)', ru: 'Защита сети (firewall, сегментация)' },
          { id: 'b', uz: 'Tizim yamoqlari va eng kam imtiyoz', ru: 'Патчи системы и наименьшие привилегии' },
          { id: 'c', uz: "Xodimlarni o'qitish va MFA", ru: 'Обучение сотрудников и MFA' },
          { id: 'd', uz: 'Faqat bitta kuchli parol', ru: 'Только один надёжный пароль' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Tarmoq, tizim va inson qatlamlari birga ishlaydi. Bitta parolga tayanish esa qatlam emas - bitta nuqta.",
          ru: 'Слои сети, системы и человека работают вместе. А ставка на один пароль - это не слой, а одна точка.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Tushunchani uning mazmuni bilan moslang',
          ru: 'Соотнесите понятие с его смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Qatlamli himoya', ru: 'Слойная защита' }, right: { uz: "Bir nechta mustaqil to'siq", ru: 'Несколько независимых барьеров' } },
          { id: 'p2', left: { uz: 'Aniqlash', ru: 'Обнаружение' }, right: { uz: 'Buzilishni payqash', ru: 'Заметить взлом' } },
          { id: 'p3', left: { uz: 'Eng kam imtiyoz', ru: 'Наименьшие привилегии' }, right: { uz: 'Faqat kerakli huquq', ru: 'Только необходимые права' } },
          { id: 'p4', left: { uz: 'Yagona himoya', ru: 'Единая защита' }, right: { uz: 'Bir joyda buzilsa - hammasi ochiladi', ru: 'Сломается в одном месте - откроется всё' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Qatlamlar bir nechta to'siq yaratadi, aniqlash buzilishni payqaydi, eng kam imtiyoz zararni kamaytiradi, yagona himoya esa bir nuqtada yorilib ketadi.",
          ru: 'Слои создают несколько барьеров, обнаружение замечает взлом, наименьшие привилегии снижают ущерб, а единая защита ломается в одной точке.',
        },
      },
    ],
  },

  {
    slug: 'logging-and-monitoring',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Loglar va kuzatish', ru: 'Логи и мониторинг' },
    content: {
      uz: `## Loglar va kuzatish

**Log** - tizimda nima bo'lganini yozib boruvchi yozuv. Kuzatmasdan himoya qilish qiyin: ko'rinmasa, bilmaysan.

**Nima log qilinadi:**
- Kirishlar (muvaffaqiyatli va muvaffaqiyatsiz)
- Huquq o'zgarishlari (yangi admin, ruxsat)
- Xatolar va ogohlantirishlar
- Muhim konfiguratsiya o'zgarishlari

**Log darajalari:** INFO (oddiy), WARNING (shubhali), ERROR (xato), CRITICAL (jiddiy).

**Markazlashtirish:** loglar bir joyga yig'ilsa (markaziy saqlash), ularni tahlil qilish osonlashadi va buzg'unchi hammasini o'chira olmaydi.

> **Xavfsizlik:** buzg'unchi birinchi navbatda loglarni o'chirishga urinadi. Shuning uchun loglar **alohida** va o'zgartirilishi qiyin joyda saqlanishi kerak.`,
      ru: `## Логи и мониторинг

**Лог** - запись о том, что происходило в системе. Без наблюдения защищать трудно: чего не видишь, о том не знаешь.

**Что логируют:**
- Входы (успешные и неудачные)
- Изменения прав (новый админ, разрешение)
- Ошибки и предупреждения
- Важные изменения конфигурации

**Уровни логов:** INFO (обычное), WARNING (подозрительное), ERROR (ошибка), CRITICAL (серьёзное).

**Централизация:** когда логи собираются в одном месте (центральное хранилище), их проще анализировать, и злоумышленник не сможет удалить все сразу.

> **Безопасность:** злоумышленник в первую очередь пытается удалить логи. Поэтому их нужно хранить **отдельно** и так, чтобы изменять было трудно.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Nega loglar muhim?',
          ru: 'Почему логи важны?',
        },
        options: [
          { id: 'a', uz: "Tizimda nima bo'lganini ko'rsatadi - aniqlash uchun asos", ru: 'Показывают, что происходило в системе - основа для обнаружения' },
          { id: 'b', uz: 'Fayllarni siqadi', ru: 'Сжимают файлы' },
          { id: 'c', uz: 'Internetni tezlashtiradi', ru: 'Ускоряют интернет' },
          { id: 'd', uz: 'Parollarni saqlaydi', ru: 'Хранят пароли' },
        ],
        answer: 'a',
        explain: {
          uz: "Log tizimda nima bo'lganini yozib boradi. Kuzatuv bo'lmasa, buzilishni payqash va tekshirish juda qiyin.",
          ru: 'Лог фиксирует, что происходило в системе. Без наблюдения заметить и расследовать взлом очень трудно.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Loglar markazlashgan holda saqlansa, tahlil osonlashadi va ularni o'chirish qiyinlashadi.",
          ru: 'Если логи хранятся централизованно, анализ проще, а удалить их труднее.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - markaziy saqlash tahlilni osonlashtiradi va buzg'unchi hamma nusxani bir vaqtda o'chira olmaydi.",
          ru: 'Верно - центральное хранение упрощает анализ, и злоумышленник не может удалить все копии сразу.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Qaysi hodisalar log qilinishi kerak? (bir nechtasini tanlang)',
          ru: 'Какие события нужно логировать? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Muvaffaqiyatsiz kirishlar', ru: 'Неудачные входы' },
          { id: 'b', uz: "Huquq o'zgarishlari (yangi admin)", ru: 'Изменения прав (новый админ)' },
          { id: 'c', uz: "Muhim konfiguratsiya o'zgarishlari", ru: 'Важные изменения конфигурации' },
          { id: 'd', uz: 'Faqat chiroyli dizayn', ru: 'Только красивый дизайн' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Kirishlar, huquq va konfiguratsiya o'zgarishlari - xavfsizlik uchun eng muhim hodisalar. Ular keyin tekshirish (audit) uchun asos bo'ladi.",
          ru: 'Входы, изменения прав и конфигурации - самые важные для безопасности события. Они становятся основой для последующего аудита.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: "Darajani ma'nosi bilan moslang",
          ru: 'Соотнесите уровень с его смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'INFO', ru: 'INFO' }, right: { uz: 'Oddiy hodisa', ru: 'Обычное событие' } },
          { id: 'p2', left: { uz: 'WARNING', ru: 'WARNING' }, right: { uz: 'Shubhali holat', ru: 'Подозрительное состояние' } },
          { id: 'p3', left: { uz: 'ERROR', ru: 'ERROR' }, right: { uz: 'Xato yuz berdi', ru: 'Произошла ошибка' } },
          { id: 'p4', left: { uz: 'Markaziy log', ru: 'Центральный лог' }, right: { uz: 'Barcha yozuv bir joyda', ru: 'Все записи в одном месте' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Log darajalari jiddiylikni bildiradi: INFO dan CRITICAL gacha. Markaziy saqlash esa yozuvlarni bir joyga to'playdi.",
          ru: 'Уровни логов показывают серьёзность: от INFO до CRITICAL. А центральное хранение собирает записи в одном месте.',
        },
      },
    ],
  },

  {
    slug: 'siem-and-alerts',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'SIEM va ogohlantirishlar', ru: 'SIEM и оповещения' },
    content: {
      uz: `## SIEM va ogohlantirishlar

**SIEM** - turli manbalardan loglarni **yig'ib**, ularni **bog'lab** (correlate) va **shubhali holatda ogohlantirish** beruvchi tizim.

**Nega birlashtirish kerak:** bitta log o'zi zararsiz ko'rinadi. Lekin "ko'p marta xato parol" + "keyin muvaffaqiyatli kirish" birga - shubhali naqsh (pattern).

**Muammo - shovqin:** noto'g'ri ogohlantirish (false positive) ko'p bo'lsa, jamoa ularga o'rganib qoladi va haqiqiysini o'tkazib yuboradi.

**Yechim:** ogohlantirishni sozlash (tuning), jiddiylik bo'yicha tartiblash, har bir ogohlantirishni tekshirish (triage).

> **Xavfsizlik:** SIEM sehrli quti emas - uni to'g'ri sozlash va o'qiy oladigan jamoa kerak. Aks holda u shovqin manbaiga aylanadi.`,
      ru: `## SIEM и оповещения

**SIEM** - система, которая **собирает** логи из разных источников, **связывает** их (correlation) и **оповещает о подозрительном**.

**Зачем связывать:** отдельная запись выглядит безобидно. Но «много неверных паролей» + «затем успешный вход» вместе - подозрительный шаблон (pattern).

**Проблема - шум:** если ложных оповещений (false positive) много, команда привыкает к ним и пропускает настоящее.

**Решение:** настройка оповещений (tuning), сортировка по серьёзности, проверка каждого оповещения (triage).

> **Безопасность:** SIEM - не волшебная коробка: его нужно правильно настроить и иметь команду, умеющую читать его вывод. Иначе он превращается в источник шума.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'SIEM asosan nima qiladi?',
          ru: 'Что в основном делает SIEM?',
        },
        options: [
          { id: 'a', uz: "Loglarni yig'ib, bog'lab, shubhali holatda ogohlantiradi", ru: 'Собирает логи, связывает их и оповещает о подозрительном' },
          { id: 'b', uz: "Parollarni o'zgartiradi", ru: 'Меняет пароли' },
          { id: 'c', uz: 'Veb-sayt dizaynini yaxshilaydi', ru: 'Улучшает дизайн сайта' },
          { id: 'd', uz: 'Fayllarni siqadi', ru: 'Сжимает файлы' },
        ],
        answer: 'a',
        explain: {
          uz: "SIEM loglarni markazlashtiradi, ularni bog'lab naqsh topadi va shubhali holatda ogoh beradi. Bu - blue team ning markaziy quroli.",
          ru: 'SIEM централизует логи, связывает их, находит шаблоны и оповещает о подозрительном. Это центральный инструмент blue team.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Bitta log yozuvi 'xato parol' + 'keyin muvaffaqiyatli kirish' naqshini o'zi ko'rsatmaydi - buni ko'rish uchun bir nechta manbani bog'lash kerak.",
          ru: 'Одна запись лога сама не показывает шаблон «неверный пароль + затем успешный вход» - для этого нужно связать несколько источников.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - alohida yozuvlar zararsiz ko'rinadi, lekin bog'langanda (correlation) hujum naqshi ko'rinadi. SIEM aynan shu uchun.",
          ru: 'Верно - отдельные записи выглядят безобидно, но при связывании (correlation) проявляется шаблон атаки. SIEM как раз для этого.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'SIEM shovqinini kamaytirishga nima yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает снизить шум SIEM? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Ogohlantirish qoidalarini sozlash (tuning)', ru: 'Настройка правил оповещений (tuning)' },
          { id: 'b', uz: "Jiddiylik bo'yicha tartiblash", ru: 'Сортировка по серьёзности' },
          { id: 'c', uz: 'Har ogohlantirishni tekshirish (triage)', ru: 'Проверка каждого оповещения (triage)' },
          { id: 'd', uz: "Barcha ogohlantirishni o'chirib qo'yish", ru: 'Отключить все оповещения' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Sozlash, tartiblash va tekshirish shovqinni kamaytiradi. Hammasini o'chirish esa haqiqiy hujumni ham ko'rinmas qiladi - bu xato.",
          ru: 'Настройка, сортировка и проверка снижают шум. А отключение всех оповещений скрывает и реальную атаку - это ошибка.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Atamani uning vazifasi bilan moslang',
          ru: 'Соотнесите термин с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'SIEM', ru: 'SIEM' }, right: { uz: "Loglarni yig'ib, bog'laydi", ru: 'Собирает и связывает логи' } },
          { id: 'p2', left: { uz: 'Correlation', ru: 'Correlation' }, right: { uz: "Alohida yozuvlarni naqshga bog'lash", ru: 'Связывание отдельных записей в шаблон' } },
          { id: 'p3', left: { uz: 'False positive', ru: 'False positive' }, right: { uz: "Noto'g'ri (bo'sh) ogohlantirish", ru: 'Ложное оповещение' } },
          { id: 'p4', left: { uz: 'Triage', ru: 'Triage' }, right: { uz: 'Ogohlantirishni tekshirib tartiblash', ru: 'Проверка и сортировка оповещений' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "SIEM platforma, correlation naqsh topadi, false positive - shovqin, triage esa ularni tartiblab tekshiradi.",
          ru: 'SIEM - платформа, correlation находит шаблон, false positive - шум, а triage проверяет и сортирует оповещения.',
        },
      },
    ],
  },

  {
    slug: 'network-and-endpoint-defense',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Tarmoq va qurilma himoyasi', ru: 'Защита сети и устройств' },
    content: {
      uz: `## Tarmoq va qurilma himoyasi

**Firewall** - qoidalar bo'yicha trafikni o'tkazadi yoki to'xtatadi. Xavfsizroq yondashuv: "hammasini blokla, faqat keraklisini och".

**Segmentatsiya** - tarmoqni bo'laklarga ajratish. Buzg'unchi bitta bo'lakka kirsa, boshqalariga oson o'ta olmaydi.

**IDS / IPS:**
- **IDS** - shubhali trafikni **aniqlaydi** va ogoh beradi.
- **IPS** - aniqlab, **to'xtatadi** (bloklaydi).

**Qurilma (endpoint) himoyasi** - kompyuter/server darajasida: antivirus/EDR, host firewall, yamaqlar, eng kam imtiyoz.

> **Xavfsizlik:** tarmoq va qurilma himoyasi birga ishlaydi. Faqat chegaraga tayanmang - "ichkarida hamma ishonchli" degan fikr xato (zero trust tamoyili).`,
      ru: `## Защита сети и устройств

**Firewall** - пропускает или блокирует трафик по правилам. Более безопасный подход: «блокировать всё, открывать только нужное».

**Сегментация** - деление сети на части. Если злоумышленник проник в один сегмент, он с трудом попадёт в другие.

**IDS / IPS:**
- **IDS** - **обнаруживает** подозрительный трафик и оповещает.
- **IPS** - обнаруживает и **останавливает** (блокирует).

**Защита устройства (endpoint)** - на уровне компьютера/сервера: антивирус/EDR, host firewall, патчи, наименьшие привилегии.

> **Безопасность:** защита сети и устройств работает вместе. Не полагайтесь только на периметр - мнение «внутри всё доверенное» ошибочно (принцип zero trust).`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'IDS va IPS orasidagi farq nima?',
          ru: 'В чём разница между IDS и IPS?',
        },
        options: [
          { id: 'a', uz: "IDS aniqlaydi va ogoh beradi, IPS esa to'xtatadi", ru: 'IDS обнаруживает и оповещает, а IPS останавливает' },
          { id: 'b', uz: 'Ikkalasi bir xil narsa', ru: 'Это одно и то же' },
          { id: 'c', uz: 'IDS faqat antivirus', ru: 'IDS - это только антивирус' },
          { id: 'd', uz: 'IPS faqat log yozadi', ru: 'IPS только пишет логи' },
        ],
        answer: 'a',
        explain: {
          uz: "IDS - aniqlash (detect) va ogohlantirish; IPS - aniqlash va bloklash (prevent). IPS ko'pincha IDS dan keyingi qadam.",
          ru: 'IDS - обнаружение (detect) и оповещение; IPS - обнаружение и блокировка (prevent). IPS часто следующий шаг после IDS.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Ichki tarmoq ichida hamma ishonchli degan fikr to'g'ri.",
          ru: 'Мнение «внутри сети все доверенные» верно.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - buzg'unchi tashqi chegarani chetlab, ichkariga kirishi mumkin. Zero trust tamoyili: har so'rovni tekshir, ichkariga ham ko'r-ko'rona ishonma.",
          ru: 'Нет - злоумышленник может обойти внешний периметр и попасть внутрь. Принцип zero trust: проверяй каждый запрос, не доверяй вслепую и внутренней сети.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Tarmoq segmentatsiyasi nima beradi? (bir nechtasini tanlang)',
          ru: 'Что даёт сегментация сети? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Buzg'unchi tarqalishini cheklaydi", ru: 'Ограничивает распространение злоумышленника' },
          { id: 'b', uz: 'Kritik tizimlarni ajratadi', ru: 'Изолирует критичные системы' },
          { id: 'c', uz: 'Hujum yuzasini kamaytiradi', ru: 'Уменьшает поверхность атаки' },
          { id: 'd', uz: "Parollarni avtomatik o'zgartiradi", ru: 'Автоматически меняет пароли' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Segmentatsiya buzg'unchi harakatini cheklaydi, kritik tizimlarni ajratadi va hujum yuzasini kamaytiradi. Parolni esa u boshqarmaydi.",
          ru: 'Сегментация ограничивает действия злоумышленника, изолирует критичные системы и уменьшает поверхность атаки. Паролями она не управляет.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Vositani vazifasi bilan moslang', ru: 'Соотнесите средство с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Firewall', ru: 'Firewall' }, right: { uz: "Trafikni qoida bo'yicha filtrlaydi", ru: 'Фильтрует трафик по правилам' } },
          { id: 'p2', left: { uz: 'IDS', ru: 'IDS' }, right: { uz: 'Shubhali trafikni aniqlaydi', ru: 'Обнаруживает подозрительный трафик' } },
          { id: 'p3', left: { uz: 'IPS', ru: 'IPS' }, right: { uz: 'Shubhali trafikni bloklaydi', ru: 'Блокирует подозрительный трафик' } },
          { id: 'p4', left: { uz: 'EDR', ru: 'EDR' }, right: { uz: 'Qurilmada tahdidni kuzatadi', ru: 'Отслеживает угрозу на устройстве' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Firewall qoida bilan filtrlaydi, IDS aniqlaydi, IPS bloklaydi, EDR esa qurilma darajasida kuzatadi.",
          ru: 'Firewall фильтрует по правилам, IDS обнаруживает, IPS блокирует, а EDR отслеживает на уровне устройства.',
        },
      },
    ],
  },

  {
    slug: 'hardening-and-patching',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Tizimni mustahkamlash va yamash', ru: 'Укрепление систем и патчи' },
    content: {
      uz: `## Mustahkamlash va yamash

**Hardening** - tizimdan keraksiz hamma narsani olib tashlash, hujum yuzasini kamaytirish.

**Asosiy qadamlar:**
- **Yamalash (patching)** - ma'lum zaifliklarni yopish. Eng arzon va samarali chora.
- **Keraksiz xizmat va portlarni o'chirish** - ishlatilmasa, xavf manbai bo'lmasin.
- **Standart sozlamalarni o'zgartirish** - standart parol va sozlamalar hammaga ma'lum.
- **Eng kam imtiyoz** - har kimga faqat kerakli huquq.
- **MFA va kuchli autentifikatsiya.**

> **Xavfsizlik:** yamalanmagan tizim - eng ko'p nishonga olinadigan holat. Ma'lum zaiflikni yopish, yangisini izlashdan ancha oson.`,
      ru: `## Укрепление и патчи

**Hardening** - убрать из системы всё лишнее, уменьшить поверхность атаки.

**Основные шаги:**
- **Патчинг (patching)** - закрытие известных уязвимостей. Самая дешёвая и эффективная мера.
- **Отключение лишних служб и портов** - если не используется, пусть не будет источником риска.
- **Смена настроек по умолчанию** - стандартные пароли и настройки известны всем.
- **Наименьшие привилегии** - каждому только необходимые права.
- **MFA и сильная аутентификация.**

> **Безопасность:** непатченная система - самая частая цель. Закрыть известную уязвимость намного проще, чем искать новую.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Hardening asosan nimaga qaratilgan?',
          ru: 'На что в основном направлен hardening?',
        },
        options: [
          { id: 'a', uz: 'Hujum yuzasini kamaytirishga', ru: 'На уменьшение поверхности атаки' },
          { id: 'b', uz: 'Faylni siqishga', ru: 'На сжатие файлов' },
          { id: 'c', uz: 'Internetni tezlashtirishga', ru: 'На ускорение интернета' },
          { id: 'd', uz: "Rangni o'zgartirishga", ru: 'На смену цвета' },
        ],
        answer: 'a',
        explain: {
          uz: "Hardening keraksiz hamma narsani olib tashlaydi - natijada hujum qiladigan yuza kichrayadi. Bu himoyaning asosiy tamoyillaridan biri.",
          ru: 'Hardening убирает всё лишнее - в результате поверхность для атаки уменьшается. Это один из главных принципов защиты.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Yamalash (patching) ma'lum zaifliklarni yopadi va himoyaning eng samarali choralaridan biridir.",
          ru: 'Патчинг закрывает известные уязвимости и является одной из самых эффективных мер защиты.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - ma'lum zaiflik yopilgan bo'lsa, buzg'unchi undan foydalana olmaydi. Shuning uchun muntazam yamalash juda muhim.",
          ru: 'Верно - если известная уязвимость закрыта, злоумышленник не сможет её использовать. Поэтому регулярный патчинг очень важен.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Hardening qadamlariga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в шаги hardening? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Keraksiz xizmat va portlarni o'chirish", ru: 'Отключение лишних служб и портов' },
          { id: 'b', uz: "Standart parolni o'zgartirish", ru: 'Смена пароля по умолчанию' },
          { id: 'c', uz: 'Eng kam imtiyoz', ru: 'Наименьшие привилегии' },
          { id: 'd', uz: "Hamma xizmatni yoqib qo'yish", ru: 'Включить все службы' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Keraksizni o'chirish, standart sozlamani almashtirish va eng kam imtiyoz hujum yuzasini kamaytiradi. Hammasini yoqish esa aksincha.",
          ru: 'Отключение лишнего, смена настроек по умолчанию и наименьшие привилегии уменьшают поверхность атаки. А включение всего - наоборот.',
        },
      },
      {
        id: 'e4',
        type: 'order',
        q: {
          uz: 'Yamalash jarayonini tartibga soling',
          ru: 'Расставьте процесс патчинга по порядку',
        },
        items: [
          { id: 'i1', uz: 'Zaiflik aniqlanadi', ru: 'Уязвимость обнаружена' },
          { id: 'i2', uz: "Yamoq baholanadi (jiddiyligi, ta'siri)", ru: 'Патч оценивается (серьёзность, влияние)' },
          { id: 'i3', uz: 'Sinov muhitida sinaladi', ru: 'Проверяется в тестовой среде' },
          { id: 'i4', uz: "Ishlab chiqarishga qo'llaniladi va tasdiqlanadi", ru: 'Применяется в рабочей среде и подтверждается' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Avval zaiflik aniqlanadi, keyin baholanadi, sinovdan o'tadi va ishlab chiqarishga qo'llaniladi - shunda tizim buzilmaydi.",
          ru: 'Сначала уязвимость обнаруживают, затем оценивают, проверяют в тесте и применяют в рабочей среде - так система не сломается.',
        },
      },
    ],
  },

  {
    slug: 'incident-response',
    kind: 'lesson',
    xp_reward: 35,
    title: { uz: 'Hodisalarga javob', ru: 'Реагирование на инциденты' },
    content: {
      uz: `## Hodisalarga javob (incident response)

**Hodisa (incident)** - xavfsizlikka ta'sir qilgan voqea. Javob rejasiz, sarosimada o'tadi.

**Bosqichlar:**
1. **Tayyorgarlik** - reja, aloqa, vositalar oldindan tayyor.
2. **Aniqlash** - hodisani payqash va tasdiqlash.
3. **Cheklash (containment)** - tarqalishni to'xtatish (masalan, tizimni tarmoqdan uzish).
4. **Yo'q qilish (eradication)** - sababni olib tashlash (zararli fayl, zaiflik).
5. **Tiklash (recovery)** - xizmatni toza holatdan qayta tiklash.
6. **Saboq (lessons learned)** - nima bo'ldi, nimani yaxshilash kerak.

> **Xavfsizlik:** tezlik muhim, lekin **dalillarni saqlash** ham shart. Tizimni o'chirishdan oldin nusxa va log oling, aks holda sababini aniqlab bo'lmaydi.`,
      ru: `## Реагирование на инциденты (incident response)

**Инцидент** - событие, повлиявшее на безопасность. Без плана реагирование идёт в панике.

**Этапы:**
1. **Подготовка** - план, связь, инструменты готовы заранее.
2. **Обнаружение** - заметить и подтвердить инцидент.
3. **Сдерживание (containment)** - остановить распространение (например, отключить систему от сети).
4. **Устранение (eradication)** - убрать причину (вредоносный файл, уязвимость).
5. **Восстановление (recovery)** - вернуть сервис из чистого состояния.
6. **Выводы (lessons learned)** - что произошло и что улучшить.

> **Безопасность:** скорость важна, но **сохранение доказательств** обязательно. До выключения системы сделайте копию и сохраните логи, иначе причину не установить.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'order',
        q: {
          uz: 'Hodisaga javob bosqichlarini tartibga soling',
          ru: 'Расставьте этапы реагирования на инцидент по порядку',
        },
        items: [
          { id: 'i1', uz: 'Tayyorgarlik', ru: 'Подготовка' },
          { id: 'i2', uz: 'Aniqlash', ru: 'Обнаружение' },
          { id: 'i3', uz: 'Cheklash', ru: 'Сдерживание' },
          { id: 'i4', uz: "Yo'q qilish", ru: 'Устранение' },
          { id: 'i5', uz: 'Tiklash', ru: 'Восстановление' },
          { id: 'i6', uz: 'Saboq (lessons learned)', ru: 'Выводы (lessons learned)' },
        ],
        order: ['i1', 'i2', 'i3', 'i4', 'i5', 'i6'],
        explain: {
          uz: "Tayyorgarlik → aniqlash → cheklash → yo'q qilish → tiklash → saboq. Tartib muhim: cheklamasdan yo'q qilish hujum qaytishiga olib keladi.",
          ru: 'Подготовка → обнаружение → сдерживание → устранение → восстановление → выводы. Порядок важен: устранение без сдерживания приведёт к возврату атаки.',
        },
      },
      {
        id: 'e2',
        type: 'mc',
        q: {
          uz: 'Hodisani cheklash (containment) nima qiladi?',
          ru: 'Что делает этап сдерживания (containment)?',
        },
        options: [
          { id: 'a', uz: "Tarqalishni to'xtatadi", ru: 'Останавливает распространение' },
          { id: 'b', uz: "Sababni o'chiradi", ru: 'Устраняет причину' },
          { id: 'c', uz: 'Xizmatni tiklaydi', ru: 'Восстанавливает сервис' },
          { id: 'd', uz: 'Hisobot yozadi', ru: 'Пишет отчёт' },
        ],
        answer: 'a',
        explain: {
          uz: "Cheklash - hujum tarqalishini to'xtatish (masalan, tizimni tarmoqdan uzish). Sababni yo'q qilish ancha keyin keladi.",
          ru: 'Сдерживание - остановка распространения атаки (например, отключение системы от сети). Устранение причины происходит позже.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Hodisa paytida tizimni darhol o'chirib, log va nusxa saqlamaslik eng to'g'ri qaror.",
          ru: 'При инциденте сразу выключить систему, не сохранив логи и копию, - самое правильное решение.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - dalilsiz sababni aniqlab bo'lmaydi. Avval log va nusxa oling, keyin cheklang va tiklang.",
          ru: 'Нет - без доказательств причину не установить. Сначала сохраните логи и копию, затем сдерживайте и восстанавливайте.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Bosqichni uning vazifasi bilan moslang',
          ru: 'Соотнесите этап с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Aniqlash', ru: 'Обнаружение' }, right: { uz: 'Hodisani payqash va tasdiqlash', ru: 'Заметить и подтвердить инцидент' } },
          { id: 'p2', left: { uz: 'Cheklash', ru: 'Сдерживание' }, right: { uz: "Tarqalishni to'xtatish", ru: 'Остановить распространение' } },
          { id: 'p3', left: { uz: 'Tiklash', ru: 'Восстановление' }, right: { uz: 'Xizmatni toza holatdan qaytarish', ru: 'Вернуть сервис из чистого состояния' } },
          { id: 'p4', left: { uz: 'Saboq', ru: 'Выводы' }, right: { uz: 'Kelgusi safar yaxshilash', ru: 'Улучшить в следующий раз' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Aniqlash hodisani topadi, cheklash tarqalishni to'xtatadi, tiklash xizmatni qaytaradi, saboq esa kelajakni yaxshilaydi.",
          ru: 'Обнаружение находит инцидент, сдерживание останавливает распространение, восстановление возвращает сервис, а выводы улучшают будущее.',
        },
      },
    ],
  },

  {
    slug: 'vulnerability-management',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Zaifliklarni boshqarish', ru: 'Управление уязвимостями' },
    content: {
      uz: `## Zaifliklarni boshqarish

**Zaiflik (vulnerability)** - tizimdagi kamchilik, undan hujumchi foydalanishi mumkin.

**Jarayon:**
1. **Topish** - skaner va audit bilan zaifliklarni qidirish.
2. **Baholash** - qaysi biri jiddiy va haqiqatan muhim?
3. **Tuzatish** - yamaq, sozlama o'zgarishi yoki boshqa chora.
4. **Tekshirish** - muammo haqiqatan yopilganini qayta sinash.

**Muhim nuqta:** hamma zaiflikni bir vaqtda tuzatib bo'lmaydi. **Xavfga qarab** tartiblash kerak - eng jiddiy va ochiq turganidan boshlab.

> **Xavfsizlik:** skanerning topgani - faqat ro'yxat. U hali hujum emas. Lekin yopilmagan zaiflik - tayyor eshik. Shuning uchun bu jarayon doimiy bo'lishi kerak.`,
      ru: `## Управление уязвимостями

**Уязвимость (vulnerability)** - недостаток в системе, которым может воспользоваться злоумышленник.

**Процесс:**
1. **Поиск** - искать уязвимости сканером и аудитом.
2. **Оценка** - какая из них серьёзна и действительно важна?
3. **Устранение** - патч, изменение настройки или другая мера.
4. **Проверка** - заново убедиться, что проблема закрыта.

**Важный момент:** все уязвимости сразу не закрыть. Нужно расставлять приоритеты **по риску** - начиная с самых серьёзных и открытых.

> **Безопасность:** найденное сканером - лишь список. Это ещё не атака. Но незакрытая уязвимость - готовая дверь. Поэтому процесс должен быть постоянным.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Zaifliklarni boshqarishdagi birinchi qadam nima?',
          ru: 'Какой первый шаг в управлении уязвимостями?',
        },
        options: [
          { id: 'a', uz: 'Zaifliklarni topish (skan, audit)', ru: 'Поиск уязвимостей (скан, аудит)' },
          { id: 'b', uz: 'Hammasini bir kunda tuzatish', ru: 'Исправить всё за один день' },
          { id: 'c', uz: "Skanerni o'chirish", ru: 'Отключить сканер' },
          { id: 'd', uz: 'Parolni ochiq saqlash', ru: 'Хранить пароль открыто' },
        ],
        answer: 'a',
        explain: {
          uz: "Boshqarish 'topish' bilan boshlanadi: skan va audit zaifliklarni ochib beradi. Keyin baholash va tuzatish keladi.",
          ru: 'Управление начинается с «поиска»: скан и аудит выявляют уязвимости. Затем идут оценка и устранение.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "'Skaner zaiflikni topdi' degani - tizim allaqachon buzilgan degani.",
          ru: '«Сканер нашёл уязвимость» означает, что система уже взломана.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - skaner faqat ro'yxatni beradi: bu yerda zaiflik bor. U hali ishlatilmagan bo'lishi mumkin. Lekin yopilmasa - haqiqiy xavf.",
          ru: 'Нет - сканер лишь даёт список: здесь есть уязвимость. Её могли ещё не использовать. Но если не закрыть - это реальный риск.',
        },
      },
      {
        id: 'e3',
        type: 'order',
        q: {
          uz: 'Zaiflikni boshqarish siklini tartibga soling',
          ru: 'Расставьте цикл управления уязвимостью по порядку',
        },
        items: [
          { id: 'i1', uz: 'Zaiflikni topish', ru: 'Найти уязвимость' },
          { id: 'i2', uz: 'Xavfini baholash', ru: 'Оценить риск' },
          { id: 'i3', uz: 'Tuzatish (yamaq/chora)', ru: 'Устранить (патч/мера)' },
          { id: 'i4', uz: 'Tuzatilganini tekshirish', ru: 'Проверить, что устранено' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Topish → baholash → tuzatish → tekshirish. Tekshirishsiz tuzatilganiga ishonch bo'lmaydi.",
          ru: 'Найти → оценить → устранить → проверить. Без проверки нельзя быть уверенным, что устранено.',
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: 'Zaifliklarni tartiblashda nimaga qaraladi? (bir nechtasini tanlang)',
          ru: 'На что смотрят при приоритизации уязвимостей? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Jiddiylik darajasi', ru: 'Уровень серьёзности' },
          { id: 'b', uz: 'Tizim qanchalik muhim (kritikligi)', ru: 'Насколько важна система (критичность)' },
          { id: 'c', uz: 'Zaiflik internetga ochiq turibdimi', ru: 'Открыта ли уязвимость в интернет' },
          { id: 'd', uz: 'Faylning rangi', ru: 'Цвет файла' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Jiddiylik, tizim kritikligi va ochiqlik - xavfni aniqlaydi. Shunga qarab avval nimani tuzatish kerakligi belgilanadi.",
          ru: 'Серьёзность, критичность системы и открытость определяют риск. По ним решают, что исправлять в первую очередь.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-defensive-security',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Himoya nazorati', ru: 'Проверка: Защита' },
    content: {
      uz: `## 🏆 Nazorat

Himoyaviy xavfsizlik bo'yicha bilimingizni tekshiring: qatlamlar, loglar, SIEM, tarmoq va qurilma himoyasi, mustahkamlash, hodisalarga javob va zaifliklarni boshqarish. Javobdan oldin o'ylang.`,
      ru: `## 🏆 Проверка

Проверьте знания по защитной безопасности: слои, логи, SIEM, защита сети и устройств, укрепление, реагирование на инциденты и управление уязвимостями. Подумайте перед ответом.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Blue team ning asosiy vazifasi nima?',
          ru: 'Какова основная задача blue team?',
        },
        options: [
          { id: 'a', uz: 'Tizimni himoya qilish, kuzatish va hodisalarga javob berish', ru: 'Защищать систему, наблюдать и реагировать на инциденты' },
          { id: 'b', uz: 'Zaifliklarni sotish', ru: 'Продавать уязвимости' },
          { id: 'c', uz: "Faqat parol o'zgartirish", ru: 'Только менять пароли' },
          { id: 'd', uz: 'Veb-sayt dizayni', ru: 'Дизайн сайта' },
        ],
        answer: 'a',
        explain: {
          uz: "Blue team - himoya, kuzatish (monitoring) va hodisalarga javob (IR) bilan shug'ullanadi. Bu - defense in depth ning amaliy tomoni.",
          ru: 'Blue team занимается защитой, мониторингом и реагированием на инциденты (IR). Это практическая сторона defense in depth.',
        },
      },
      {
        id: 'e2',
        type: 'order',
        q: {
          uz: 'Hodisaga javob bosqichlarini joylang',
          ru: 'Расставьте этапы реагирования на инцидент',
        },
        items: [
          { id: 'i1', uz: 'Aniqlash', ru: 'Обнаружение' },
          { id: 'i2', uz: 'Cheklash', ru: 'Сдерживание' },
          { id: 'i3', uz: "Yo'q qilish", ru: 'Устранение' },
          { id: 'i4', uz: 'Tiklash', ru: 'Восстановление' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Aniqlash → cheklash → yo'q qilish → tiklash. Tartib buzilsa, hujum qaytadi yoki tarqaladi.",
          ru: 'Обнаружение → сдерживание → устранение → восстановление. Если порядок нарушить, атака вернётся или распространится.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: 'IDS va IPS bir xil narsa.',
          ru: 'IDS и IPS - это одно и то же.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - IDS shubhali trafikni aniqlab ogoh beradi, IPS esa uni to'xtatadi (bloklaydi).",
          ru: 'Нет - IDS обнаруживает подозрительный трафик и оповещает, а IPS его останавливает (блокирует).',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Tushunchani vazifasi bilan moslang',
          ru: 'Соотнесите понятие с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Log', ru: 'Лог' }, right: { uz: 'Tizim hodisalarining yozuvi', ru: 'Запись событий системы' } },
          { id: 'p2', left: { uz: 'SIEM', ru: 'SIEM' }, right: { uz: "Loglarni yig'ib, bog'lab ogohlantiradi", ru: 'Собирает и связывает логи, оповещает' } },
          { id: 'p3', left: { uz: 'Yamalash', ru: 'Патчинг' }, right: { uz: "Ma'lum zaiflikni yopadi", ru: 'Закрывает известную уязвимость' } },
          { id: 'p4', left: { uz: 'Segmentatsiya', ru: 'Сегментация' }, right: { uz: "Tarmoqni bo'laklarga ajratadi", ru: 'Делит сеть на части' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Log yozuv, SIEM platforma, yamalash zaiflikni yopadi, segmentatsiya tarmoqni ajratadi - hammasi himoya qatlamlari.",
          ru: 'Лог - запись, SIEM - платформа, патчинг закрывает уязвимость, сегментация делит сеть - всё это слои защиты.',
        },
      },
      {
        id: 'e5',
        type: 'multi',
        q: {
          uz: 'Himoyani kuchaytirishga nima yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает усилить защиту? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Muntazam yamalash', ru: 'Регулярный патчинг' },
          { id: 'b', uz: 'Markazlashgan log va monitoring', ru: 'Централизованные логи и мониторинг' },
          { id: 'c', uz: 'Eng kam imtiyoz va MFA', ru: 'Наименьшие привилегии и MFA' },
          { id: 'd', uz: "Barcha xizmatni ochiq qoldirish", ru: 'Оставить все службы открытыми' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Yamalash, monitoring va eng kam imtiyoz himoyani kuchaytiradi. Hamma xizmatni ochiq qoldirish esa hujum yuzasini oshiradi.",
          ru: 'Патчинг, мониторинг и наименьшие привилегии усиливают защиту. А открытые все службы увеличивают поверхность атаки.',
        },
      },
    ],
  },
];
