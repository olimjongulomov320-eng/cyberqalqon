/**
 * Curriculum — Cybersecurity path › Domain: Linux
 *
 * Shape (validated by scripts/validate-curriculum.js via lib/grade.validateExercise):
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
    slug: 'linux-basics',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'Linux asoslari', ru: 'Основы Linux' },
    content: {
      uz: `## Linux asoslari

**Linux** — bu yadro (kernel). Uning ustiga turli jamoalar turli tayyor tizimlar yig'adi — bularga **distribyutiv** deyiladi.

| Distr | Xususiyat |
|---|---|
| **Ubuntu** | Boshlovchilar uchun eng mashhur |
| **Debian** | Barqaror, uzoq qo'llab-quvvatlanadi |
| **Fedora** | Yangi texnologiyalar birinchi sinovdan o'tadi |

Linuxda ikkita ish usuli bor: **GUI** (sichqoncha bilan) va **terminal** (buyruq yozib).

Serverlar deyarli hammasi Linuxda ishlaydi: ochiq kodli, bepul, barqaror va oylar bo'yi to'xtamaydi.`,
      ru: `## Основы Linux

**Linux** — это ядро (kernel). Поверх него сообщества собирают готовые системы — их называют **дистрибутивами**.

| Дистрибутив | Особенность |
|---|---|
| **Ubuntu** | Самый популярный для новичков |
| **Debian** | Стабильный, долгая поддержка |
| **Fedora** | Новые технологии проходят проверку первыми |

В Linux два способа работы: **GUI** (мышью) и **терминал** (вводом команд).

Почти все серверы работают на Linux: открытый код, бесплатно, стабильно и месяцами без остановок.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Serverlar uchun Linux nima uchun ko\'p tanlanadi?',
          ru: 'Почему для серверов чаще всего выбирают Linux?',
        },
        options: [
          { id: 'a', uz: 'Ochiq kodli, bepul va barqaror', ru: 'Открытый код, бесплатно и стабильно' },
          { id: 'b', uz: 'Faqat o\'yinlar uchun yaratilgan', ru: 'Создан только для игр' },
          { id: 'c', uz: 'Faqat grafik interfeys bilan ishlaydi', ru: 'Работает только с графическим интерфейсом' },
          { id: 'd', uz: 'Internet talab qilmaydi', ru: 'Не требует интернета' },
        ],
        answer: 'a',
        explain: {
          uz: "Linux ochiq kodli va bepul, shuning uchun uni serverga o'rnatish qimmatga tushmaydi. Barqarorligi tizim haftalar bo'yi to'xtamay ishlashini ta'minlaydi — server uchun asosiy shart shu.",
          ru: 'Linux с открытым кодом и бесплатен, поэтому установка на сервер ничего не стоит. Стабильность позволяет системе работать неделями без остановок — это главное требование к серверу.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: 'Ubuntu — bu Linux yadrosi asosidagi distribyutiv.',
          ru: 'Ubuntu — это дистрибутив на основе ядра Linux.',
        },
        answer: 'true',
        explain: {
          uz: 'Linux — bu faqat yadro. Ubuntu uning ustiga dasturlar, paketlar va interfeysni qo\'shib, tayyor tizimga aylantiradi. Shuning uchun "Linux" va "Ubuntu" — bir xil narsa emas.',
          ru: 'Linux — это только ядро. Ubuntu добавляет поверх него программы, пакеты и интерфейс, превращая ядро в готовую систему. Поэтому «Linux» и «Ubuntu» — не одно и то же.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Distribyutivni uning xususiyatiga moslang',
          ru: 'Соотнесите дистрибутив с его особенностью',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Ubuntu', ru: 'Ubuntu' }, right: { uz: 'Boshlovchilar uchun eng mashhur', ru: 'Самый популярный для новичков' } },
          { id: 'p2', left: { uz: 'Debian', ru: 'Debian' }, right: { uz: 'Barqaror va uzoq qo\'llab-quvvatlanadi', ru: 'Стабильный, долгая поддержка' } },
          { id: 'p3', left: { uz: 'Fedora', ru: 'Fedora' }, right: { uz: 'Yangi texnologiyalar sinov maydoni', ru: 'Площадка для новых технологий' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Ubuntu — kirish nuqtasi, Debian — barqarorlik, Fedora — yangiliklarni birinchi sinash. Barchasi Linux yadrosidan foydalanadi.',
          ru: 'Ubuntu — точка входа, Debian — стабильность, Fedora — первое тестирование нового. Все используют ядро Linux.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: 'Grafik oynasiz, faqat buyruq yozib ishlash maydoni qanday ataladi? (inglizcha)',
          ru: 'Как называется среда работы без графики, только через ввод команд? (по-английски)',
        },
        answer: 'terminal',
        accepted: ['терминал', 'командная строка', 'shell'],
        explain: {
          uz: 'Bu — **terminal**. Uning ichida shell buyruqlarni qabul qiladi: `cd`, `ls`, `chmod`. Server ishining asosi aynan shu yerda.',
          ru: 'Это **терминал**. Внутри него shell принимает команды: `cd`, `ls`, `chmod`. Основная работа на сервере происходит именно здесь.',
        },
      },
    ],
  },

  {
    slug: 'linux-permissions',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Fayl ruxsatlari: chmod', ru: 'Права файлов: chmod' },
    content: {
      uz: `## Fayl ruxsatlari: rwx

Har bir faylning uchta himoyachisi bor: **egasi (owner)**, **guruh (group)** va **boshqalar (other)**.

| Harf | Ma'no | Raqam |
|---|---|---|
| **r** — read | o'qish | 4 |
| **w** — write | yozish | 2 |
| **x** — execute | bajarish | 1 |

Raqamlar qo'shib yoziladi: **600** — egasi o'qiydi va yozadi (4+2), guruh va boshqalari hech narsa qilmaydi.

Maxfiy fayllar (SSH kaliti, .env) shu raqam bilan saqlanadi: **chmod 600 id_rsa**.`,
      ru: `## Права файлов: rwx

У каждого файла три группы прав: **владелец (owner)**, **группа (group)** и **остальные (other)**.

| Буква | Значение | Число |
|---|---|---|
| **r** — read | чтение | 4 |
| **w** — write | запись | 2 |
| **x** — execute | запуск | 1 |

Числа складываются: **600** — владелец читает и пишет (4+2), группа и остальные ничего не делают.

Секретные файлы (SSH-ключ, .env) хранят именно так: **chmod 600 id_rsa**.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'chmod 600 id_rsa',
        q: {
          uz: 'Bu buyruqdan keyin faylga kim kirishi mumkin?',
          ru: 'После этой команды кто имеет доступ к файлу?',
        },
        options: [
          { id: 'a', uz: 'Faqat egasi o\'qiydi va yozadi', ru: 'Только владелец читает и пишет' },
          { id: 'b', uz: 'Hamma faylni o\'qiydi', ru: 'Все могут читать файл' },
          { id: 'c', uz: 'Egasi bajaradi, guruh yozadi', ru: 'Владелец запускает, группа пишет' },
          { id: 'd', uz: 'Guruh o\'qiydi va yozadi, egasi o\'qimaydi', ru: 'Группа читает и пишет, владелец не читает' },
        ],
        answer: 'a',
        explain: {
          uz: '600 = egasi 6 (4+2 = r+w), guruh 0, boshqalar 0. Boshqalarda ruxsat umuman yo\'q — shu sababli SSH kaliti boshqa odam tomonidan o\'qib bo\'lmaydi.',
          ru: '600 = владелец 6 (4+2 = r+w), группа 0, остальные 0. У остальных прав нет вообще — поэтому SSH-ключ нельзя прочитать со стороны.',
        },
      },
      {
        id: 'e2',
        type: 'input',
        q: {
          uz: 'Egasi faqat o\'qiydi va bajaradi, guruh va boshqalar hech narsa qilmaydi — raqamli ruxsat: ______',
          ru: 'Владелец только читает и запускает, группа и остальные ничего не могут — числовые права: ______',
        },
        answer: '500',
        accepted: ['0500'],
        explain: {
          uz: 'Hisob oddiy: r (4) + x (1) = 5 egasi uchun, guruhga 0, boshqalarga 0. Jami — **500**, ya\'ni rwx------.',
          ru: 'Расчёт простой: r (4) + x (1) = 5 у владельца, группе 0, остальным 0. Итого **500**, то есть rwx------.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'chmod 755 haqida qaysilar to\'g\'ri? (bir nechtasini tanlang)',
          ru: 'Что верно о chmod 755? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Egasi uchun uchala ruxsat bor (7)', ru: 'У владельца все три права (7)' },
          { id: 'b', uz: 'Guruh va boshqalar o\'qiydi va bajaradi (5)', ru: 'Группа и остальные читают и запускают (5)' },
          { id: 'c', uz: 'Boshqalar faylni yozolmaydi', ru: 'Остальные не могут записать файл' },
          { id: 'd', uz: 'Guruh faylni yozoladi', ru: 'Группа может записать файл' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: '7 = rwx (4+2+1), 5 = r-x (4+0+1). Yozish huquqi (2) hech kimda yo\'q, shuning uchun faylni faqat egasi o\'zgartira oladi — bu ochiq, lekin xavfsiz kirish.',
          ru: '7 = rwx (4+2+1), 5 = r-x (4+0+1). Права записи (2) нет ни у кого — файл может менять только владелец. Это открытый, но безопасный доступ.',
        },
      },
      {
        id: 'e4',
        type: 'order',
        q: {
          uz: 'Ruxsatni hisoblash tartibini to\'g\'ri ketma-ketlikda joylang',
          ru: 'Расставьте шаги вычисления прав по порядку',
        },
        items: [
          { id: 'i1', uz: 'Uch guruhga bo\'lish: owner, group, other', ru: 'Разделить на три группы: владелец, группа, остальные' },
          { id: 'i2', uz: 'Har bir guruh uchun r=4, w=2, x=1 qo\'shish', ru: 'Для каждой группы сложить r=4, w=2, x=1' },
          { id: 'i3', uz: 'Uch raqamni yozib, chmod bilan berish', ru: 'Записать три цифры и применить chmod' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: {
          uz: 'Avval faylning kimlarga tegishli ekanini ajratamiz, keyin har bir guruh uchun raqamlarni yig\'amiz va oxirida tayyor natijani chmod ga beramiz.',
          ru: 'Сначала определяем, кому принадлежит файл, затем складываем числа для каждой группы и в конце передаём готовый результат в chmod.',
        },
      },
    ],
  },

  {
    slug: 'linux-security-basics',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Linux xavfsizlik asoslari', ru: 'Основы безопасности Linux' },
    content: {
      uz: `## Linux xavfsizlik asoslari

- **sudo** — oddiy foydalanuvchi faqat kerak bo'lganda vaqtinchalik ko'tariladi. Doim root bilan ishlash bitta xatoda tizimni yo'qotadi.
- **Yangilanishlar** — \`apt update\` va \`apt upgrade\` zaifliklarni yopadi.
- **SSH kalitlari** — parol o'rniga juft kalit ishlatiladi; maxfiy qism hech qayerga yuborilmaydi.
- **Firewall** — \`ufw\` bilan faqat kerakli eshik ochiladi, qolgani yopiq qoladi.

| Buyruq | Vazifa |
|---|---|
| sudo apt upgrade | Tizimni yangilash |
| ufw allow OpenSSH | SSH uchun ruxsat |
| ufw enable | Firewallni yoqish |

Xavfsizlik qatlamlardan iborat: bittasi buzilsa, qolgani to'sib qo'yadi.`,
      ru: `## Основы безопасности Linux

- **sudo** — обычный пользователь получает права только при необходимости и на время. Постоянная работа от root — один неверный шаг, и система потеряна.
- **Обновления** — \`apt update\` и \`apt upgrade\` закрывают уязвимости.
- **SSH-ключи** — вместо пароля используется ключевая пара; закрытая часть никуда не отправляется.
- **Фаервол** — с \`ufw\` открыт только нужный порт, остальные закрыты.

| Команда | Зачем |
|---|---|
| sudo apt upgrade | Обновить систему |
| ufw allow OpenSSH | Разрешить SSH |
| ufw enable | Включить фаервол |

Безопасность состоит из слоёв: сорвётся один — остальные задержат атаку.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Nega doim root o\'rniga sudo ishlatish afzal?',
          ru: 'Почему лучше использовать sudo, а не постоянную работу от root?',
        },
        options: [
          { id: 'a', uz: 'Huquq faqat kerak bo\'lganda vaqtinchalik ko\'tariladi', ru: 'Права повышаются только при необходимости и на время' },
          { id: 'b', uz: 'sudo dasturlarni tezlashtiradi', ru: 'sudo ускоряет программы' },
          { id: 'c', uz: 'sudo parollarni saqlab qoladi', ru: 'sudo запоминает пароли' },
          { id: 'd', uz: 'Root Linuxda umuman ishlamaydi', ru: 'Root в Linux вообще не работает' },
        ],
        answer: 'a',
        explain: {
          uz: 'Bu — kam ruxsat tamoyili (least privilege): odatda siz oddiy foydalanuvchisiz, faqat sudo paytida huquq oshadi. Xato qilsangiz, zarar oddiy foydalanuvchi darajasida cheklanadi.',
          ru: 'Это принцип наименьших привилегий: обычно вы обычный пользователь, права повышаются только на время sudo. При ошибке ущерб ограничен обычным уровнем.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: 'SSH juft kalitining maxfiy (private) qismi hech qayerga yuborilmaydi — u doim sizda qoladi.',
          ru: 'Закрытая (private) часть SSH-ключа никуда не отправляется — она всегда остаётся у вас.',
        },
        answer: 'true',
        explain: {
          uz: 'Serverga faqat ochiq (public) qism o\'rnatiladi. Maxfiy qism tarqatilsa, kalitning himoya maqsadi yo\'qoladi — uni hech qachon bermang.',
          ru: 'На сервер ставится только открытая часть. Если закрытая часть уйдёт другим, смысл защиты исчезает — её никогда не отдают.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'SSH kirishini xavfsizlashga nima yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает сделать вход по SSH безопаснее? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Kalit juftligi ishlatish', ru: 'Использовать ключевую пару' },
          { id: 'b', uz: 'Root bilan to\'g\'ridan-to\'g\'ri kirishni o\'chirish', ru: 'Отключить прямой вход от root' },
          { id: 'c', uz: 'Parolni qisqartirib, oson qilish', ru: 'Сделать пароль коротким и простым' },
          { id: 'd', uz: 'Kalitga parol (passphrase) qo\'yish', ru: 'Поставить пароль самому ключу (passphrase)' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Kalit juftligi parolni almashtiradi, root kirishini o\'chirish zararlanish darajasini kamaytiradi, passphrase esa o\'g\'irlangan kalitni ham bloklaydi. Qisqa parol esa qaytadan zaiflik yaratadi.',
          ru: 'Ключевая пара заменяет пароль, отключение root снижает урон при взломе, passphrase блокирует украденный ключ. Короткий пароль — наоборот, слабость.',
        },
      },
      {
        id: 'e4',
        type: 'mc',
        code: 'ufw allow OpenSSH',
        q: {
          uz: 'Bu buyruq firewallda nima qiladi?',
          ru: 'Что делает эта команда в фаерволе?',
        },
        options: [
          { id: 'a', uz: 'Faqat SSH uchun kirishga ruxsat beradi', ru: 'Разрешает вход только для SSH' },
          { id: 'b', uz: 'Firewallni to\'liq o\'chiradi', ru: 'Полностью выключает фаервол' },
          { id: 'c', uz: 'Barcha portlarni ochadi', ru: 'Открывает все порты' },
          { id: 'd', uz: 'SSH parolini o\'zgartiradi', ru: 'Меняет пароль SSH' },
        ],
        answer: 'a',
        explain: {
          uz: 'allow — ruxsat berish, OpenSSH — SSH xizmati. Qolgan eshiklar yopiq qoladi: tashqaridan avval hech narsa ochilmaydi, kerakli xizmatni qo\'lda qo\'shasiz.',
          ru: 'allow — разрешить, OpenSSH — служба SSH. Остальные порты остаются закрытыми: снаружи ничего не открыто, нужные службы добавляются точечно.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-linux',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Linux nazorati', ru: 'Проверка: Linux' },
    content: {
      uz: `## 🏆 Nazorat

Linux bo'yicha bilimingizni tekshiring: ruxsatlar, xavfsiz sozlamalar va buyruqlar birgalikda beriladi. O'ylab javob bering.`,
      ru: `## 🏆 Проверка

Проверьте знания по Linux: права, безопасные настройки и команды встречаются вместе. Отвечайте обдуманно.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'chmod 640 id_rsa',
        q: {
          uz: 'Bu buyruqda guruh (group) qanday huquqga ega bo\'ladi?',
          ru: 'Какие права получает группа в этой команде?',
        },
        options: [
          { id: 'a', uz: 'Faqat o\'qish (4)', ru: 'Только чтение (4)' },
          { id: 'b', uz: 'O\'qish va yozish (6)', ru: 'Чтение и запись (6)' },
          { id: 'c', uz: 'O\'qish va bajarish (5)', ru: 'Чтение и запуск (5)' },
          { id: 'd', uz: 'Hech qanday (0)', ru: 'Никаких (0)' },
        ],
        answer: 'a',
        explain: {
          uz: '640 → egasi 6 (r+w), guruh 4 (faqat r), boshqalar 0. Bu faylni guruhdagilar o\'qiydi, lekin yozolmaydi va bajarolmaydi.',
          ru: '640 → владелец 6 (r+w), группа 4 (только r), остальные 0. Группа может прочитать файл, но не записать и не запустить.',
        },
      },
      {
        id: 'e2',
        type: 'input',
        q: {
          uz: '-rwxr-xr-x ko\'rinishidagi faylning raqamli ruxsati: ______',
          ru: 'Числовые права файла -rwxr-xr-x: ______',
        },
        answer: '755',
        explain: {
          uz: 'Har uch guruhni alohida hisoblaymiz: rwx = 4+2+1 = 7, r-x = 4+1 = 5, r-x = 5. Jami — **755**: egasi hamma narsa qila oladi, boshqalari o\'qib-bajaradi.',
          ru: 'Считаем каждую группу отдельно: rwx = 4+2+1 = 7, r-x = 4+1 = 5, r-x = 5. Итого **755**: владелец всё, остальные читают и запускают.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Yangi serverni xavfsizlashga qaysi amallar to\'g\'ri? (bir nechtasini tanlang)',
          ru: 'Какие действия делают новый сервер безопаснее? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Tizimni muntazam yangilash', ru: 'Регулярно обновлять систему' },
          { id: 'b', uz: 'Kundalik ishni sudo bilan oddiy foydalanuvchida bajarish', ru: 'Работать от обычного пользователя с sudo' },
          { id: 'c', uz: 'ufw yoqib, kerakli portlarnigina qoldirish', ru: 'Включить ufw и оставить только нужные порты' },
          { id: 'd', uz: 'Barcha portlarni ochib qo\'yish', ru: 'Открыть все порты' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Yangilanish zaiflikni yopadi, oddiy foydalanuvchi + sudo zararni chekladi, ufw esa tashqi trafikni tashqarida qoldiradi. Barcha port ochish — bu eshikni yopish emas.',
          ru: 'Обновления закрывают уязвимости, обычный пользователь с sudo ограничивает урон, ufw держит внешний трафик снаружи. Открытые все порты — это не защита.',
        },
      },
      {
        id: 'e4',
        type: 'order',
        q: {
          uz: 'Yangi serverni sozlashda to\'g\'ri tartib (birinchisi — eng muhim)',
          ru: 'Расставьте шаги настройки нового сервера (первый — самый важный)',
        },
        items: [
          { id: 'i1', uz: 'Yangi foydalanuvchi yaratib, unga sudo berish', ru: 'Создать нового пользователя и выдать ему sudo' },
          { id: 'i2', uz: 'Tizimni oxirgi holatigacha yangilash', ru: 'Обновить систему до последнего состояния' },
          { id: 'i3', uz: 'ufw yoqish va faqat SSH portini ochish', ru: 'Включить ufw и открыть только порт SSH' },
          { id: 'i4', uz: 'SSH kalitlarini o\'rnatib, parol bilan kirishni o\'chirish', ru: 'Установить SSH-ключи и отключить вход по паролю' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval o\'z foydalanuvchi hisobingizni olasiz (root bilan doimiy ishlash xavfli), keyin tizimni yangilaysiz, firewall bilan eshiklarni yopasiz va oxirida SSH ni qattiqroq sozlaysiz.',
          ru: 'Сначала создаёте своего пользователя (работать от root опасно), затем обновляете систему, закрываете порты фаерволом и только после этого ужесточаете SSH.',
        },
      },
      {
        id: 'e5',
        type: 'tf',
        q: {
          uz: 'sudo — bu har qanday foydalanuvchiga barcha huquqlarni avtomatik beradigan tugma.',
          ru: 'sudo — это кнопка, которая автоматически даёт любому пользователю все права.',
        },
        answer: 'false',
        explain: {
          uz: 'sudo ni faqat maxsus guruhdagi (masalan, sudo) foydalanuvchilar ishlatadi va odatda o\'z parolini ham kiritadi. Aks holda tizimga kirgan har kim root bo\'lib qolardi.',
          ru: 'sudo доступен только пользователям из специальной группы (например, sudo) и обычно требует ввести свой пароль. Иначе любой вошедший стал бы root.',
        },
      },
    ],
  },
];
