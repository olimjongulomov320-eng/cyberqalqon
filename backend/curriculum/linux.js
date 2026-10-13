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
    slug: 'linux-command-line',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'Buyruq qatori: navigatsiya', ru: 'Командная строка: навигация' },
    content: {
      uz: `## Buyruq qatori: navigatsiya

Terminalda siz doim biron **papka (katalog)** ichida turasiz. Eng kerakli buyruqlar:

| Buyruq | Vazifa |
|---|---|
| pwd | Hozir qaysi papkadaligingizni ko'rsatadi |
| ls | Papkadagi fayllarni sanaydi |
| cd /etc | Boshqa papkaga o'tish |
| cd .. | Bir qadam yuqoriga chiqish |
| man ls | Buyruq haqida qo'llanma |

Fayl bilan ishlash: **cp** (nusxa), **mv** (ko'chirish yoki qayta nomlash), **rm** (o'chirish), **cat** (matnni chiqarish).

> **Xavfsizlik:** \`rm -rf /\` kabi buyruq butun tizimni o'chirib tashlashi mumkin — root bilan juda ehtiyot bo'ling. O'chirishdan oldin \`ls\` bilan tekshirib oling.`,
      ru: `## Командная строка: навигация

В терминале вы всегда находитесь внутри какой-то **папки (каталога)**. Самые нужные команды:

| Команда | Задача |
|---|---|
| pwd | Показывает, в какой папке вы сейчас |
| ls | Перечисляет файлы в папке |
| cd /etc | Перейти в другую папку |
| cd .. | Подняться на шаг выше |
| man ls | Справка о команде |

Работа с файлами: **cp** (копировать), **mv** (переместить или переименовать), **rm** (удалить), **cat** (показать текст).

> **Безопасность:** команда вроде \`rm -rf /\` может стереть всю систему — с root будьте предельно осторожны. Перед удалением проверяйте \`ls\`.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Hozir qaysi papkada turganingizni qaysi buyruq ko'rsatadi?",
          ru: 'Какая команда показывает, в какой папке вы находитесь?',
        },
        options: [
          { id: 'a', uz: 'pwd', ru: 'pwd' },
          { id: 'b', uz: 'ls', ru: 'ls' },
          { id: 'c', uz: 'cd', ru: 'cd' },
          { id: 'd', uz: 'rm', ru: 'rm' },
        ],
        answer: 'a',
        explain: {
          uz: "pwd (print working directory) joriy papka yo'lini chiqaradi. ls fayllarni sanaydi, cd papkani o'zgartiradi, rm esa o'chiradi.",
          ru: 'pwd (print working directory) выводит путь текущей папки. ls перечисляет файлы, cd меняет папку, а rm удаляет.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Buyruqni vazifasi bilan moslang',
          ru: 'Соотнесите команду с её задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'cp', ru: 'cp' }, right: { uz: 'Fayldan nusxa oladi', ru: 'Копирует файл' } },
          { id: 'p2', left: { uz: 'mv', ru: 'mv' }, right: { uz: "Ko'chiradi yoki qayta nomlaydi", ru: 'Перемещает или переименовывает' } },
          { id: 'p3', left: { uz: 'rm', ru: 'rm' }, right: { uz: "Faylni o'chiradi", ru: 'Удаляет файл' } },
          { id: 'p4', left: { uz: 'cat', ru: 'cat' }, right: { uz: 'Fayl matnini chiqaradi', ru: 'Выводит текст файла' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "cp nusxa oladi (asl fayl qoladi), mv ko'chiradi yoki nomini o'zgartiradi, rm o'chiradi, cat esa matnni ko'rsatadi.",
          ru: 'cp копирует (исходный файл остаётся), mv перемещает или переименовывает, rm удаляет, а cat показывает текст.',
        },
      },
      {
        id: 'e3',
        type: 'order',
        q: {
          uz: "Papkaga kirib, faylni ko'rish bosqichlarini tartiblang (birinchisi — birinchi qadam)",
          ru: 'Расставьте шаги: зайти в папку и посмотреть файл (первый — самый первый)',
        },
        items: [
          { id: 'i1', uz: "Papkaga o'tish: cd /var/log", ru: 'Перейти в папку: cd /var/log' },
          { id: 'i2', uz: 'Fayllarni sanash: ls', ru: 'Перечислить файлы: ls' },
          { id: 'i3', uz: "Fayl matnini ko'rish: cat syslog", ru: 'Показать текст файла: cat syslog' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: {
          uz: "Avval kerakli papkaga o'tamiz, keyin ichidagi fayllarni ko'ramiz va oxirida kerakli faylni o'qiymiz. Bu — terminalda ishlashning eng oddiy ketma-ketligi.",
          ru: 'Сначала переходим в нужную папку, затем смотрим её файлы и в конце читаем нужный файл. Это простейшая последовательность работы в терминале.',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: "rm -rf / buyrug'i xavfsiz — u faqat vaqtinchalik fayllarni o'chiradi.",
          ru: 'Команда rm -rf / безопасна — она удаляет только временные файлы.',
        },
        answer: 'false',
        explain: {
          uz: "Bu buyruq ildizdan (/) hamma narsani majburan o'chirishga urinadi. Root huquqi bilan bajarilsa, tizim butunlay yo'qoladi — shuning uchun root bilan rm dan oldin doim tekshiriladi.",
          ru: 'Эта команда пытается принудительно удалить всё начиная с корня (/). При правах root система уничтожается полностью — поэтому с root перед rm всегда проверяют.',
        },
      },
    ],
  },

  {
    slug: 'linux-filesystem',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'Fayl tizimi tuzilishi', ru: 'Структура файловой системы' },
    content: {
      uz: `## Fayl tizimi tuzilishi

Linuxda hamma narsa bitta daraxtdan boshlanadi: ildiz **/**.

| Papka | Nima saqlanadi |
|---|---|
| /etc | Sozlamalar (config) fayllari |
| /home | Foydalanuvchilarning shaxsiy papkalari |
| /var | Loglar va o'zgaruvchan ma'lumotlar |
| /bin, /usr/bin | Buyruqlar (programmalar) |
| /root | root foydalanuvchisining uyi |

Yo'l **absolyut** (/ dan boshlanadi) yoki **nisbiy** (joriy papkadan) bo'ladi.

> **Xavfsizlik:** /etc ichida parol va kalitlarga oid sozlamalar bor. /var/log dagi loglar tizimda nima bo'lganini ko'rsatadi — buzg'unchilikni aniqlashda birinchi qaraladigan joy.`,
      ru: `## Структура файловой системы

В Linux всё начинается с одного дерева: корень **/**.

| Папка | Что хранится |
|---|---|
| /etc | Файлы настроек (config) |
| /home | Личные папки пользователей |
| /var | Логи и изменяемые данные |
| /bin, /usr/bin | Команды (программы) |
| /root | Домашняя папка пользователя root |

Путь бывает **абсолютным** (начинается с /) или **относительным** (от текущей папки).

> **Безопасность:** в /etc лежат настройки паролей и ключей. Логи в /var/log показывают, что происходило в системе — это первое, что проверяют при поиске взлома.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Tizim sozlamalari odatda qaysi papkada saqlanadi?',
          ru: 'В какой папке обычно хранятся системные настройки?',
        },
        options: [
          { id: 'a', uz: '/etc', ru: '/etc' },
          { id: 'b', uz: '/home', ru: '/home' },
          { id: 'c', uz: '/bin', ru: '/bin' },
          { id: 'd', uz: '/var', ru: '/var' },
        ],
        answer: 'a',
        explain: {
          uz: "/etc — sozlamalar uchun. /home — foydalanuvchi fayllari, /bin — buyruqlar, /var esa loglar va o'zgaruvchan ma'lumotlar uchun.",
          ru: '/etc — для настроек. /home — файлы пользователей, /bin — команды, а /var — логи и изменяемые данные.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Papkani unda saqlanadigan narsa bilan moslang',
          ru: 'Соотнесите папку с тем, что в ней хранится',
        },
        pairs: [
          { id: 'p1', left: { uz: '/etc', ru: '/etc' }, right: { uz: 'Sozlamalar', ru: 'Настройки' } },
          { id: 'p2', left: { uz: '/home', ru: '/home' }, right: { uz: 'Foydalanuvchi papkalari', ru: 'Папки пользователей' } },
          { id: 'p3', left: { uz: '/var/log', ru: '/var/log' }, right: { uz: 'Loglar', ru: 'Логи' } },
          { id: 'p4', left: { uz: '/bin', ru: '/bin' }, right: { uz: 'Buyruqlar', ru: 'Команды' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Har bir papkaning aniq vazifasi bor: sozlama /etc da, odam fayllari /home da, loglar /var/log da, buyruqlar esa /bin da.",
          ru: 'У каждой папки своё назначение: настройки в /etc, файлы людей в /home, логи в /var/log, а команды в /bin.',
        },
      },
      {
        id: 'e3',
        type: 'input',
        q: {
          uz: 'Linux fayl daraxtining ildizi qanday belgilanadi? (bitta belgi)',
          ru: 'Как обозначается корень файлового дерева Linux? (один символ)',
        },
        answer: '/',
        accepted: ['/', 'slash', '/ (slash)'],
        explain: {
          uz: "Ildiz — bitta qiya chiziq: /. Har bir absolyut yo'l shundan boshlanadi: /etc, /home/ali, /var/log.",
          ru: 'Корень — один слэш: /. Любой абсолютный путь начинается с него: /etc, /home/ali, /var/log.',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: '/var/log papkasida tizim va xizmat loglari saqlanadi.',
          ru: 'В папке /var/log хранятся системные логи и логи служб.',
        },
        answer: 'true',
        explain: {
          uz: "Loglar /var/log ichida. Ular tizimda nima sodir bo'lganini, kim qachon kirganini ko'rsatadi — xavfsizlik tekshiruvining boshlanish nuqtasi.",
          ru: 'Логи лежат в /var/log. Они показывают, что происходило в системе и кто когда входил — это отправная точка проверки безопасности.',
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
    slug: 'linux-users-groups',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Foydalanuvchilar va guruhlar', ru: 'Пользователи и группы' },
    content: {
      uz: `## Foydalanuvchilar va guruhlar

Linux — ko'p foydalanuvchili tizim. Har bir jarayon biron foydalanuvchi nomidan ishlaydi.

- **id** — sizning UID, GID va guruhlaringizni ko'rsatadi.
- **whoami** — joriy foydalanuvchi nomini chiqaradi.
- **chown** — fayl egasini o'zgartiradi: \`chown ali fayl.txt\`.
- **chmod** — fayl ruxsatlarini o'zgartiradi.

Har bir foydalanuvchi kamida bitta **guruh**ga kiradi. Guruh orqali bir nechta odamga bir xil ruxsat berish qulay.

> **Xavfsizlik:** har bir xizmat (masalan, veb-server) alohida **xizmat foydalanuvchisi** nomidan ishlashi kerak. Agar u buzilsa, buzg'unchi faqat shu cheklangan huquqqa ega bo'ladi.`,
      ru: `## Пользователи и группы

Linux — многопользовательская система. Каждый процесс работает от имени какого-то пользователя.

- **id** — показывает ваш UID, GID и группы.
- **whoami** — выводит имя текущего пользователя.
- **chown** — меняет владельца файла: \`chown ali file.txt\`.
- **chmod** — меняет права файла.

Каждый пользователь входит хотя бы в одну **группу**. Через группу удобно выдать одинаковые права сразу нескольким людям.

> **Безопасность:** каждая служба (например, веб-сервер) должна работать от отдельного **служебного пользователя**. Если её взломают, злоумышленник получит только эти ограниченные права.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Faylning egasini (owner) o'zgartiruvchi buyruq qaysi?",
          ru: 'Какая команда меняет владельца (owner) файла?',
        },
        options: [
          { id: 'a', uz: 'chown', ru: 'chown' },
          { id: 'b', uz: 'chmod', ru: 'chmod' },
          { id: 'c', uz: 'id', ru: 'id' },
          { id: 'd', uz: 'whoami', ru: 'whoami' },
        ],
        answer: 'a',
        explain: {
          uz: "chown — change owner, egasini almashtiradi. chmod esa ruxsatlarni o'zgartiradi. Bu ikkovini chalkashtirmaslik kerak.",
          ru: 'chown — change owner, меняет владельца. chmod меняет права. Эти две команды важно не путать.',
        },
      },
      {
        id: 'e2',
        type: 'input',
        q: {
          uz: "Joriy foydalanuvchining UID, GID va guruhlarini ko'rsatuvchi buyruq (2 harf): ____",
          ru: 'Команда, показывающая UID, GID и группы текущего пользователя (2 буквы): ____',
        },
        answer: 'id',
        accepted: ['id'],
        explain: {
          uz: "id buyrug'i sizning identifikatorlaringiz va qaysi guruhlarga kirishingizni bir qatorga chiqaradi. whoami esa faqat nomni ko'rsatadi.",
          ru: 'Команда id выводит ваши идентификаторы и группы в одной строке. whoami показывает только имя.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Buyruqni vazifasi bilan moslang',
          ru: 'Соотнесите команду с её задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'chown', ru: 'chown' }, right: { uz: "Fayl egasini o'zgartiradi", ru: 'Меняет владельца файла' } },
          { id: 'p2', left: { uz: 'chmod', ru: 'chmod' }, right: { uz: "Fayl ruxsatlarini o'zgartiradi", ru: 'Меняет права файла' } },
          { id: 'p3', left: { uz: 'whoami', ru: 'whoami' }, right: { uz: 'Joriy foydalanuvchi nomi', ru: 'Имя текущего пользователя' } },
          { id: 'p4', left: { uz: 'sudo', ru: 'sudo' }, right: { uz: 'Vaqtincha root huquqi beradi', ru: 'Временно даёт права root' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "chown egalikni, chmod ruxsatni, whoami nomni ko'rsatadi, sudo esa vaqtincha huquqni oshiradi. Har biri o'z ishini qiladi.",
          ru: 'chown управляет владельцем, chmod — правами, whoami показывает имя, а sudo временно повышает права. У каждой команды своя задача.',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: "Veb-server kabi xizmatlar root o'rniga alohida cheklangan xizmat foydalanuvchisi bilan ishlagani xavfsizroq.",
          ru: 'Службы вроде веб-сервера безопаснее запускать не от root, а от отдельного ограниченного служебного пользователя.',
        },
        answer: 'true',
        explain: {
          uz: "Agar xizmat cheklangan foydalanuvchi bilan ishlasa, u buzilganda buzg'unchi ham shu cheklangan huquqqa ega bo'ladi — butun tizim emas. Bu least privilege tamoyili.",
          ru: 'Если служба работает от ограниченного пользователя, то при её взломе злоумышленник получит только эти ограниченные права, а не всю систему. Это принцип наименьших привилегий.',
        },
      },
    ],
  },

  {
    slug: 'linux-processes-services',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Jarayonlar va xizmatlar', ru: 'Процессы и службы' },
    content: {
      uz: `## Jarayonlar va xizmatlar

Ishlayotgan dastur — bu **jarayon (process)**. Har biri PID (raqamli identifikator) oladi.

| Buyruq | Vazifa |
|---|---|
| ps aux | Barcha jarayonlarni ko'rsatadi |
| top | Jarayonlarni real vaqtda kuzatadi |
| kill 1234 | 1234-PID jarayonni to'xtatadi |
| systemctl status ssh | Xizmat holatini ko'rsatadi |
| systemctl restart ssh | Xizmatni qayta ishga tushiradi |

**Xizmat (service yoki daemon)** — fon rejimida doim ishlab turadigan dastur: SSH, veb-server, ma'lumotlar bazasi.

> **Xavfsizlik:** keraksiz xizmatlarni o'chirib qo'yish kerak — har bir ochiq xizmat hujum yuzasini kengaytiradi. \`systemctl\` bilan nima ishlayotganini tekshirib turing.`,
      ru: `## Процессы и службы

Запущенная программа — это **процесс**. Каждый получает PID (числовой идентификатор).

| Команда | Задача |
|---|---|
| ps aux | Показывает все процессы |
| top | Наблюдает за процессами в реальном времени |
| kill 1234 | Останавливает процесс с PID 1234 |
| systemctl status ssh | Показывает состояние службы |
| systemctl restart ssh | Перезапускает службу |

**Служба (service или daemon)** — программа, которая постоянно работает в фоне: SSH, веб-сервер, база данных.

> **Безопасность:** ненужные службы надо отключать — каждая открытая служба расширяет поверхность атаки. Следите за тем, что работает, с помощью \`systemctl\`.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Fon rejimida doim ishlab turadigan dastur nima deb ataladi?",
          ru: 'Как называется программа, которая постоянно работает в фоне?',
        },
        options: [
          { id: 'a', uz: 'Xizmat (service/daemon)', ru: 'Служба (service/daemon)' },
          { id: 'b', uz: 'Fayl', ru: 'Файл' },
          { id: 'c', uz: 'Papka', ru: 'Папка' },
          { id: 'd', uz: 'Foydalanuvchi', ru: 'Пользователь' },
        ],
        answer: 'a',
        explain: {
          uz: "SSH, veb-server, ma'lumotlar bazasi — bularning hammasi fon xizmatlari. Ular tizim yonganda ishga tushadi va doim kutib turadi.",
          ru: 'SSH, веб-сервер, база данных — всё это фоновые службы. Они стартуют при загрузке системы и постоянно ожидают запросов.',
        },
      },
      {
        id: 'e2',
        type: 'input',
        q: {
          uz: "Jarayonning raqamli identifikatori qisqartmasi (3 harf): ____",
          ru: 'Сокращение числового идентификатора процесса (3 буквы): ____',
        },
        answer: 'pid',
        accepted: ['pid'],
        explain: {
          uz: "PID (Process ID) — har bir jarayonga beriladigan raqam. kill buyrug'iga aynan shu raqam beriladi: kill 1234.",
          ru: 'PID (Process ID) — номер, выдаваемый каждому процессу. Именно его передают команде kill: kill 1234.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Buyruqni vazifasi bilan moslang',
          ru: 'Соотнесите команду с её задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'ps', ru: 'ps' }, right: { uz: "Jarayonlar ro'yxatini beradi", ru: 'Выводит список процессов' } },
          { id: 'p2', left: { uz: 'top', ru: 'top' }, right: { uz: 'Real vaqtda kuzatadi', ru: 'Наблюдает в реальном времени' } },
          { id: 'p3', left: { uz: 'kill', ru: 'kill' }, right: { uz: "Jarayonni to'xtatadi", ru: 'Останавливает процесс' } },
          { id: 'p4', left: { uz: 'systemctl', ru: 'systemctl' }, right: { uz: 'Xizmatlarni boshqaradi', ru: 'Управляет службами' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "ps bir lahzalik ro'yxat beradi, top jonli kuzatuv, kill jarayonni to'xtatadi, systemctl esa xizmatlarni yoqadi, o'chiradi va qayta ishga tushiradi.",
          ru: 'ps даёт разовый список, top — живое наблюдение, kill останавливает процесс, а systemctl включает, выключает и перезапускает службы.',
        },
      },
      {
        id: 'e4',
        type: 'order',
        q: {
          uz: "Yangi xizmatni to'liq ishga tushirish tartibini joylang (birinchisi — birinchi qadam)",
          ru: 'Расставьте шаги полного запуска новой службы (первый — самый первый)',
        },
        items: [
          { id: 'i1', uz: "O'rnatish: sudo apt install <xizmat>", ru: 'Установить: sudo apt install <служба>' },
          { id: 'i2', uz: 'Hozir ishga tushirish: systemctl start', ru: 'Запустить сейчас: systemctl start' },
          { id: 'i3', uz: "Avtoyuklashga qo'shish: systemctl enable", ru: 'Добавить в автозапуск: systemctl enable' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: {
          uz: "Avval paket o'rnatiladi, keyin xizmat hozir ishga tushiriladi, va oxirida enable bilan tizim har yonganda avtomatik yonishi ta'minlanadi.",
          ru: 'Сначала пакет устанавливается, затем служба запускается сейчас, и в конце enable делает так, чтобы она поднималась автоматически при каждой загрузке.',
        },
      },
    ],
  },

  {
    slug: 'linux-packages-logs',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Paketlar va loglar', ru: 'Пакеты и логи' },
    content: {
      uz: `## Paketlar va loglar

Dasturlar **paket menejeri** orqali o'rnatiladi va yangilanadi.

| Buyruq (Debian/Ubuntu) | Vazifa |
|---|---|
| sudo apt update | Paketlar ro'yxatini yangilaydi |
| sudo apt install nginx | Dastur o'rnatadi |
| sudo apt upgrade | O'rnatilgan paketlarni yangilaydi |
| sudo apt remove nginx | Dasturni o'chiradi |

Fedora va CentOS'da bu ishlarni **dnf** bajaradi.

**Loglar** — tizimda nima bo'lganini yozib boradi. Ubuntu'da ko'p loglar **/var/log** ichida, xizmat loglari esa \`journalctl\` buyrug'i bilan ko'riladi.

> **Xavfsizlik:** muntazam \`apt upgrade\` zaifliklarni yopadi. Loglarni kuzatish esa shubhali faoliyatni (ko'p marta urinilgan parol, kutilmagan xizmat) erta aniqlashga yordam beradi.`,
      ru: `## Пакеты и логи

Программы устанавливаются и обновляются через **менеджер пакетов**.

| Команда (Debian/Ubuntu) | Задача |
|---|---|
| sudo apt update | Обновляет список пакетов |
| sudo apt install nginx | Устанавливает программу |
| sudo apt upgrade | Обновляет установленные пакеты |
| sudo apt remove nginx | Удаляет программу |

В Fedora и CentOS это делает **dnf**.

**Логи** — запись того, что происходило в системе. В Ubuntu большинство логов лежит в **/var/log**, а логи служб смотрят командой \`journalctl\`.

> **Безопасность:** регулярный \`apt upgrade\` закрывает уязвимости. А наблюдение за логами помогает рано заметить подозрительную активность (много попыток входа, неожиданная служба).`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Ubuntu'da o'rnatilgan paketlarni yangilab, zaifliklarni yopuvchi buyruq qaysi?",
          ru: 'Какая команда обновляет установленные пакеты и закрывает уязвимости в Ubuntu?',
        },
        options: [
          { id: 'a', uz: 'sudo apt upgrade', ru: 'sudo apt upgrade' },
          { id: 'b', uz: 'sudo apt install', ru: 'sudo apt install' },
          { id: 'c', uz: 'sudo apt remove', ru: 'sudo apt remove' },
          { id: 'd', uz: 'systemctl stop', ru: 'systemctl stop' },
        ],
        answer: 'a',
        explain: {
          uz: "apt upgrade o'rnatilgan dasturlarni yangi versiyaga ko'taradi va ma'lum zaifliklarni yopadi. apt install esa yangi dastur qo'shadi.",
          ru: 'apt upgrade поднимает установленные программы до новых версий и закрывает известные уязвимости. apt install добавляет новую программу.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: "Buyruq yoki yo'lni vazifasi bilan moslang",
          ru: 'Соотнесите команду или путь с его назначением',
        },
        pairs: [
          { id: 'p1', left: { uz: 'apt update', ru: 'apt update' }, right: { uz: "Paketlar ro'yxatini yangilaydi", ru: 'Обновляет список пакетов' } },
          { id: 'p2', left: { uz: 'apt install', ru: 'apt install' }, right: { uz: "Dastur o'rnatadi", ru: 'Устанавливает программу' } },
          { id: 'p3', left: { uz: 'journalctl', ru: 'journalctl' }, right: { uz: "Xizmat loglarini ko'rish", ru: 'Просмотр логов служб' } },
          { id: 'p4', left: { uz: '/var/log', ru: '/var/log' }, right: { uz: 'Log fayllari joyi', ru: 'Место лог-файлов' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "update faqat ro'yxatni yangilaydi, install dasturni o'rnatadi, journalctl xizmat loglarini ko'rsatadi, /var/log esa log fayllar saqlanadigan papka.",
          ru: 'update обновляет только список, install устанавливает программу, journalctl показывает логи служб, а /var/log — папка, где лежат лог-файлы.',
        },
      },
      {
        id: 'e3',
        type: 'input',
        q: {
          uz: "Fedora va CentOS'da ishlatiladigan paket menejeri nomi (3 harf): ____",
          ru: 'Название менеджера пакетов в Fedora и CentOS (3 буквы): ____',
        },
        answer: 'dnf',
        accepted: ['dnf', 'yum'],
        explain: {
          uz: "dnf — Fedora/CentOS oilasidagi paket menejeri (avvalgi nomi yum). Debian/Ubuntu esa apt dan foydalanadi.",
          ru: 'dnf — менеджер пакетов в семействе Fedora/CentOS (прежнее название yum). Debian/Ubuntu использует apt.',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: "Loglar faqat xatoliklarni ko'rsatadi, xavfsizlikka aloqasi yo'q.",
          ru: 'Логи показывают только ошибки и к безопасности отношения не имеют.',
        },
        answer: 'false',
        explain: {
          uz: "Loglar xavfsizlik uchun juda muhim: kim qachon kirgani, muvaffaqiyatsiz urinishlar va g'alati xizmatlar shu yerda ko'rinadi. Shuning uchun ular doim kuzatiladi.",
          ru: 'Логи очень важны для безопасности: в них видно, кто когда входил, неудачные попытки и подозрительные службы. Поэтому за ними постоянно следят.',
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

Linux bo'yicha bilimingizni tekshiring: buyruqlar, fayl tizimi, ruxsatlar, foydalanuvchilar, xizmatlar, loglar va xavfsiz sozlamalar birgalikda beriladi. O'ylab javob bering.`,
      ru: `## 🏆 Проверка

Проверьте знания по Linux: команды, файловая система, права, пользователи, службы, логи и безопасные настройки встречаются вместе. Отвечайте обдуманно.`,
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
