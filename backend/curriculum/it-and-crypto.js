/**
 * Curriculum — Kriptografiya (crypto) + IT asoslari (it-basics, databases, git)
 *
 * Shape (validated by scripts/validate-curriculum.js via lib/grade.validateExercise):
 *   module: { slug, domain, title:{uz,ru}, content:{uz,ru}, kind, xp_reward, exercises:[...] }
 *   kind: 'lesson' | 'checkpoint'   (checkpoint = end-of-domain trophy node)
 *
 * This file carries modules for SEVERAL domains, so every module carries its
 * own `domain` slug. curriculum/index.js groups by that field
 * (`m.domain ?? domain`, FILES entry has domain: null) and array order inside
 * this file = learning order within each domain.
 *
 * Rules for authors:
 *   - Lesson prose: short. 6–14 markdown lines per language. This is a
 *     warm-up, not a textbook — the exercises do the teaching.
 *   - Every exercise: bilingual q + explain, technically accurate, beginner
 *     level, no trick questions, explanations teach the WHY.
 *   - Exercise ids: e1..eN in delivery order.
 *   - Uzbek: simple, modern Uzbek Latin. Russian: natural, not machine-translated.
 *   - match follows fundamentals.js convention: right item id = its pair id,
 *     match_answer maps pair id -> that same id.
 */

module.exports = [
  // ─────────────────────────── domain: crypto ───────────────────────────
  {
    slug: 'hashing-vs-encryption',
    domain: 'crypto',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Hash va shifrlash — farq nima?', ru: 'Хеширование и шифрование — в чём разница' },
    content: {
      uz: `## Hash va shifrlash — farq nima?

Ikkelasi ham ma'lumotni o'zgartiradi, lekin maqsadi butunlay boshqa:

- **Hash** — bir tomonlama: ma'lumotdan qisqa "iz" chiqadi, izdan ma'lumotni qaytarib bo'lmaydi.
- **Shifrlash (encryption)** — ikki tomonlama: maxfiy matn → shifrlangan matn → **kalit** yordamida yana ochiladi.

\`\`\`
parol  → [hash]    → 9f86d081…   (qaytarib bo'lmaydi)
matn   → [encrypt] → aGf3Kp…     → [kalit] → matn
\`\`\`

> **Qoida:** parollar **hashlanadi**, maxfiy fayllar va trafik esa **shifrlanadi**. Server administratoriga ham ochiq parol ko'rinishda kerak emas.`,
      ru: `## Хеширование и шифрование — в чём разница

Оба действия меняют данные, но цель у них совсем разная:

- **Хеш** — односторонний: из данных получается короткий «отпечаток», но по отпечатку данные не восстановить.
- **Шифрование (encryption)** — обратимое: открытый текст → шифротекст → **ключ** снова открывает его.

\`\`\`
пароль → [hash]    → 9f86d081…   (не обратим)
текст  → [encrypt] → aGf3Kp…     → [ключ] → текст
\`\`\`

> **Правило:** пароли **хешируют**, конфиденциальные файлы и трафик — **шифруют**. Даже у администратора сервера не должно быть доступа к открытому паролю.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Sayt foydalanuvchi parolini ma'lumotlar bazasida qanday saqlashi to'g'ri?",
          ru: 'Как сайт должен хранить пароль пользователя в базе данных?',
        },
        options: [
          { id: 'a', uz: 'Ochiq matn sifatida', ru: 'Открытым текстом' },
          { id: 'b', uz: 'Hash sifatida', ru: 'В виде хеша' },
          { id: 'c', uz: 'Boshqalarga korinadigan faylga yozib', ru: 'Записать в файл, доступный другим' },
          { id: 'd', uz: 'Faqat administratorning xotirasida', ru: 'Только в памяти администратора' },
        ],
        answer: 'b',
        explain: {
          uz: "Parol hashlanadi, chunki hash bir tomonlama: bazani o'g'irlashsa ham ochiq parol chiqmaydi. Kirishda server kiritilgan parolni hashlab, bazadagi hash bilan solishtiradi.",
          ru: 'Пароль хешируют, потому что хеш необратим: даже украв базу, открытый пароль не получить. При входе сервер хеширует введённый пароль и сравнивает с хешем из базы.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Hash — qaytarib bo'ladigan jarayon: natijadan original matnni tiklash mumkin.",
          ru: 'Хеш — обратимый процесс: по результату можно восстановить исходный текст.',
        },
        answer: 'false',
        explain: {
          uz: "Hash bir tomonlama: originaldan hash oson, lekin hashdan originalga yo'q. Vazifa faqat taxmin qilib ko'rish — shuning uchun parol uchun kuchli, uzun kalit tanlash muhim.",
          ru: 'Хеш односторонний: получить хеш из текста легко, а текст из хеша нельзя. Остаётся только подбирать — поэтому для паролей выбирают длинные, сложные строки.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Tushunchani uning xususiyatiga moslang',
          ru: 'Соотнесите понятие с его свойством',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'Hash', ru: 'Хеш' },
            right: { id: 'p1', uz: "Bir tomonlama — izdan ma'lumot qaymaydi", ru: 'Односторонний — данные не вернуть' },
          },
          {
            id: 'p2',
            left: { uz: 'Shifrlash', ru: 'Шифрование' },
            right: { id: 'p2', uz: 'Kalit yordamida qayta ochiladi', ru: 'Открывается с помощью ключа' },
          },
          {
            id: 'p3',
            left: { uz: 'Fayl yaxlitligini tekshirish', ru: 'Проверка целостности файла' },
            right: { id: 'p3', uz: 'Hashni solishtirish yetarli', ru: 'Достаточно сравнить хеши' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Hash qaytarib bo\'lmaydi, shifrlash ochiladi, fayl yaxlitligi esa hash solishtirish bilan tekshiriladi — bitta bayt o\'zgarsa, hash farq qiladi.',
          ru: 'Хеш необратим, шифрование открывается, а целостность файла проверяют сравнением хешей — изменился один байт, хеш уже другой.',
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: "Qaysi vazifalar uchun hash ishlatiladi? (bir nechtasini tanlang)",
          ru: 'Для каких задач используют хеш? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Parolni bazada xavfsiz saqlash', ru: 'Безопасно хранить пароль в базе' },
          { id: 'b', uz: "Fayl yaxlitligini tekshirish", ru: 'Проверять целостность файла' },
          { id: 'c', uz: 'Yuklab olingan dastur haqiqiyligini solishtirish', ru: 'Сверять подлинность скачанной программы' },
          { id: 'd', uz: "Maxfiy xatni keyin qayta o'qish", ru: 'Затем снова прочитать секретное письмо' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Saqlash, yaxlitlik va yuklab olishni tekshirish — hammasi bir tomonlama ishga yaraydi. Xatni keyin o\'qish uchun esa qaytarib bo\'ladigan shifrlash kerak.',
          ru: 'Хранение, целостность и проверка скачивания — всё это задачи для одностороннего преобразования. Для повторного чтения письма нужно обратимое шифрование.',
        },
      },
    ],
  },

  {
    slug: 'symmetric-vs-asymmetric',
    domain: 'crypto',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Simmetrik va asimmetrik shifrlash', ru: 'Симметричное и асимметричное шифрование' },
    content: {
      uz: `## Simmetrik va asimmetrik shifrlash

**Kalit** — shifrni ochadigan maxfiy ma'lumot.

- **Simmetrik** — bitta umumiy kalit: u ham shifrlaydi, ham ochadi. Tez, lekin shu kalitni xavfsiz yetkazish muammo.
- **Asimmetrik** — kalit juftligi: **ochiq kalit** hamma uchun ochiq, **shaxsiy kalit** faqat egasida. Ochiq kalit bilan shifrlangan narsani faqat shaxsiy kalit ochadi.

**TLS handshaki bitta gapda:** mijoz va server avval ochiq-oydin tanishib, keyin xavfsiz **simmetrik session kalit**ni kelishib oladi.

> **HTTPS ikkalasidan ham foydalanadi:** asimmetrik kalitlar session kalitni xavfsiz almashishga xizmat qiladi, asosiy ma'lumot esa tez simmetrik kalit bilan shifrlanadi.`,
      ru: `## Симметричное и асимметричное шифрование

**Ключ** — секрет, который открывает шифр.

- **Симметричное** — один общий ключ: им и шифруют, и расшифровывают. Быстро, но как безопасно его доставить — отдельная задача.
- **Асимметричное** — пара ключей: **открытый ключ** известен всем, **закрытый ключ** остаётся у владельца. То, что зашифровано открытым ключом, открыть можно только закрытым.

**TLS-рукопожатие в одном предложении:** клиент и сервер сначала знакомятся открыто, потом договариваются о безопасном **симметричном сессионном ключе**.

> **HTTPS использует оба метода:** асимметричные ключи служат для безопасного обмена сессионным ключом, а основные данные шифруются быстрым симметричным ключом.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'HTTPS nima uchun ikkala usuldan ham foydalanadi?',
          ru: 'Почему HTTPS использует оба метода?',
        },
        options: [
          { id: 'a', uz: 'Simmetrik kalit yetadi, asimmetrik bezovta qiladi', ru: 'Симметричного ключа достаточно, асимметричный только мешает' },
          { id: 'b', uz: 'Session kalitni xavfsiz almashish uchun asimmetrik, asosiy trafik uchun tez simmetrik', ru: 'Асимметричный — для безопасного обмена сессионным ключом, симметричный — для самого трафика' },
          { id: 'c', uz: 'HTTPS umuman shifrlamaydi', ru: 'HTTPS вообще ничего не шифрует' },
          { id: 'd', uz: 'Shunchaki, an\'ana shunday', ru: 'Просто традиция' },
        ],
        answer: 'b',
        explain: {
          uz: 'Asimmetrik kalit sekin, lekin muammani hal qiladi: session kalitni xavfsiz uzatadi. Katta ma\'lumot esa tezroq simmetrik kalit bilan shifrlanadi — shuning uchun HTTPS ikkallasidan foydalanadi.',
          ru: 'Асимметричное шифрование медленнее, но решает главную задачу — безопасно передать сессионный ключ. Объёмные данные быстрее шифровать симметричным ключом, поэтому в HTTPS работают оба.',
        },
      },
      {
        id: 'e2',
        type: 'order',
        q: {
          uz: "HTTPS ulanishining soddalashtirilgan tartibini to'g'ri joylang",
          ru: 'Расставьте упрощённые этапы соединения по HTTPS',
        },
        items: [
          { id: 'i1', uz: "Server o'z sertifikatini yuboradi", ru: 'Сервер отправляет свой сертификат' },
          { id: 'i2', uz: 'Mijoz sertifikatni tekshiradi', ru: 'Клиент проверяет сертификат' },
          { id: 'i3', uz: 'Session (simmetrik) kalit almashiladi', ru: 'Обмениваются сессионным (симметричным) ключом' },
          { id: 'i4', uz: "Ma'lumot shifrlanib uzatiladi", ru: 'Данные передаются в зашифрованном виде' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval server o\'zini tanishtiradi (sertifikat), mijoz uni tekshiradi, keyin xavfsiz session kelishiladi va shundan keyin ma\'lumot shifrlanib yuradi.',
          ru: 'Сначала сервер представляется (сертификат), клиент его проверяет, затем договариваются о безопасном сессионном ключе — и только после этого данные идут шифрованными.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Tushunchani uning xususiyatiga moslang',
          ru: 'Соотнесите понятие с его свойством',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'Simmetrik shifrlash', ru: 'Симметричное шифрование' },
            right: { id: 'p1', uz: 'Bitta umumiy kalit', ru: 'Один общий ключ' },
          },
          {
            id: 'p2',
            left: { uz: 'Asimmetrik shifrlash', ru: 'Асимметричное шифрование' },
            right: { id: 'p2', uz: 'Ochiq va shaxsiy kalit juftligi', ru: 'Пара открытого и закрытого ключей' },
          },
          {
            id: 'p3',
            left: { uz: 'HTTPS', ru: 'HTTPS' },
            right: { id: 'p3', uz: 'Ikkalasi birga ishlatiladi', ru: 'Используются оба метода' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Simmetrikda bitta kalit, asimmetrikda juftlik bor. HTTPS esa ikkalasini birlashtiradi: avval asimmetrik, keyin simmetrik.',
          ru: 'В симметричном — один ключ, в асимметричном — пара. HTTPS объединяет оба подхода: сначала асимметричный, потом симметричный.',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: "Asimmetrik shifrlash simmetrikdan sekinroq, shuning uchun katta ma'lumotni odatda simmetrik kalit bilan shifrlashadi.",
          ru: 'Асимметричное шифрование медленнее, поэтому большие данные обычно шифруют симметричным ключом.',
        },
        answer: 'true',
        explain: {
          uz: 'To\'g\'ri: asimmetrik operatsiyalar og\'irroq. Shuning uchun uni kalit almashishga, qolgan ishga esa tez simmetrik kalitga topshirishadi — aralash (hybrid) sxema shunday ishlaydi.',
          ru: 'Верно: асимметричные операции тяжелее. Поэтому её оставляют для обмена ключами, а остальную работу поручают быстрому симметричному ключу — так устроена гибридная схема.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-crypto',
    domain: 'crypto',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Kriptografiya nazorati', ru: 'Проверка: Криптография' },
    content: {
      uz: `## 🏆 Nazorat

Uch ta darsdan olingan bilimni tekshiradigan savollar. Bu safar vaziyat asosidagi, biroz murakkabroq savollar — o'ylab javob bering.

**O'tilgan mavzular:** hash va shifrlash, simmetrik va asimmetrik kalitlar, HTTPS.`,
      ru: `## 🏆 Проверка

Вопросы, проверяющие знания из трёх уроков. На этот раз — ситуации посложнее, отвечайте обдуманно.

**Пройденные темы:** хеширование и шифрование, симметричные и асимметричные ключи, HTTPS.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "HTTPS'da asosiy ma'lumot (sahifalar, rasmlar, fayllar) qaysi kalit bilan shifrlanadi?",
          ru: 'В HTTPS основной контент (страницы, картинки, файлы) шифруется каким ключом?',
        },
        options: [
          { id: 'a', uz: 'Simmetrik session kalit bilan', ru: 'Симметричным сессионным ключом' },
          { id: 'b', uz: "Serverning shaxsiy kaliti bilan", ru: 'Закрытым ключом сервера' },
          { id: 'c', uz: 'Ochiq kalit bilan', ru: 'Открытым ключом' },
          { id: 'd', uz: 'Umuman shifrlanmaydi', ru: 'Ничего не шифруется' },
        ],
        answer: 'a',
        explain: {
          uz: 'Asimmetrik kalitlar faqat handshake davrida session kalitni xavfsiz kelishish uchun ishlatiladi. Uzoq asosiy trafik esa shu kelishilgan simmetrik session kalit bilan shifrlanadi — u tezroq.',
          ru: 'Асимметричные ключи работают только во время рукопожатия — чтобы безопасно договориться о сессионном ключе. Основной поток данных шифруется уже этим симметричным ключом, потому что он быстрее.',
        },
      },
      {
        id: 'e2',
        type: 'multi',
        q: {
          uz: "Qaysi ma'lumotlar uchun to'g'ri saqlash usuli tanlangan? (bir nechtasini tanlang)",
          ru: 'Для каких данных выбран правильный способ хранения? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Parollar — hash sifatida', ru: 'Пароли — в виде хеша' },
          { id: 'b', uz: 'Maxfiy shaxsiy xatlar — shifrlangan holda', ru: 'Личные письма — в зашифрованном виде' },
          { id: 'c', uz: 'Fayl yaxlitligi — hash solishtirish orqali', ru: 'Целостность файла — сравнением хешей' },
          { id: 'd', uz: 'Barcha parollar ochiq matn sifatida jadvalda', ru: 'Все пароли открытым текстом в таблице' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Parol uchun bitta tomonlama hash, maxfiy xat uchun qaytarib bo\'ladigan shifrlash, yaxlitlik uchun hash solishtirish — har bir vazifaga o\'z usuli. Ochiq matndagi parollar esa birinchi o\'g\'irlikda yo\'qoladi.',
          ru: 'Для пароля — односторонний хеш, для секретного письма — обратимое шифрование, для целостности — сравнение хешей: у каждой задачи свой способ. Пароли открытым текстом утекают первыми.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Vaziyatni to\'g\'ri usulga moslang',
          ru: 'Соотнесите ситуацию с подходящим методом',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'Parolni bazada saqlash', ru: 'Хранение пароля в базе' },
            right: { id: 'p1', uz: 'Bir tomonlama hash', ru: 'Односторонний хеш' },
          },
          {
            id: 'p2',
            left: { uz: "HTTPS orqali ma'lumot uzatish", ru: 'Передача данных по HTTPS' },
            right: { id: 'p2', uz: 'Simmetrik va asimmetrik birga', ru: 'Симметричное и асимметричное вместе' },
          },
          {
            id: 'p3',
            left: { uz: 'Ochiq kalit', ru: 'Открытый ключ' },
            right: { id: 'p3', uz: 'Hamma bilishi mumkin', ru: 'Может быть известен всем' },
          },
          {
            id: 'p4',
            left: { uz: 'Shaxsiy kalit', ru: 'Закрытый ключ' },
            right: { id: 'p4', uz: 'Faqat egasida qoladi', ru: 'Остаётся только у владельца' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: 'Har bir vaziyatga o\'z mosligi bor: parolga hash, HTTPS\'ga aralash sxema, ochiq kalit ochiq, shaxsiy kalit esa sir bo\'lib qoladi.',
          ru: 'Каждой ситуации — своё: паролю хеш, HTTPS гибридная схема, открытый ключ открыт всем, закрытый ключ остаётся секретным.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "Bir xil kiritishga har doim bir xil natija beradigan, lekin natijadan kiritishni qaytarib bo'lmaydigan jarayon: ______ (inglizcha bir so'z)",
          ru: 'Процесс, дающий одинаковый результат на одинаковом входе, но не позволяющий вернуть вход по результату: ______ (одно слово по-английски)',
        },
        answer: 'hash',
        accepted: ['хеш', 'хеширование', 'hashing'],
        explain: {
          uz: 'Bu — **hash**. Bir xil kiritish har doim bir xil beradi (shuning uchun solishtirish mumkin), lekin qaytarish mumkin emas (shuning uchun parol xavfsiz saqlanadi).',
          ru: 'Это **hash**. Одинаковый вход всегда даёт одинаковый результат (поэтому можно сравнивать), но обратное преобразование невозможно (поэтому пароль в безопасности).',
        },
      },
      {
        id: 'e5',
        type: 'order',
        q: {
          uz: "Hashlangan parol bilan tizimga kirish jarayonini to'g'ri tartibda joylang",
          ru: 'Расставьте этапы входа в систему с хешированным паролем',
        },
        items: [
          { id: 'i1', uz: 'Foydalanuvchi parolni kiritadi', ru: 'Пользователь вводит пароль' },
          { id: 'i2', uz: 'Server kiritilgan parolni hashlaydi', ru: 'Сервер хеширует введённый пароль' },
          { id: 'i3', uz: 'Hashni bazadagi hash bilan solishtiradi', ru: 'Сравнивает хеш с хешем из базы' },
          { id: 'i4', uz: 'Mos kelsa — kirishga ruxsat', ru: 'Совпало — доступ разрешён' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Server hech qachon ochiq parolni saqlamaydi: u kiritilgan narsani hashlaydi va faqat hashlarni solishtiradi. Mos kelsa — kirish ochiladi.',
          ru: 'Сервер никогда не хранит открытый пароль: он хеширует введённое и сравнивает только хеши. Совпало — вход открыт.',
        },
      },
    ],
  },

  // ────────────────────────── domain: it-basics ─────────────────────────
  {
    slug: 'hardware-basics',
    domain: 'it-basics',
    kind: 'lesson',
    xp_reward: 15,
    title: { uz: 'Apparat asoslari: CPU, RAM, disk', ru: 'Основы железа: ЦП, ОЗУ, диск' },
    content: {
      uz: `## Apparat asoslari

Kompyuterning uchta asosiy qismi bor — vazifalari har xil:

| Qism | Vazifa |
|---|---|
| **CPU** | Buyruqlarni hisoblab bajaradi — kompyuterning "miyasi" |
| **RAM** | Ochiq dasturlar uchun tez, lekin vaqtinchalik xotira |
| **Disk (HDD/SSD)** | Fayllar uzoq muddat saqlanadi, faqat sekinroq |

**Quyug' bosilganda:** BIOS/UEFI tekshiruvdan o'tadi → tizim (OS) diskdan yuklanadi → ishchi stol tayyor.

> **Forensika uchun muhim:** RAM **o'zgaruvchan (volatile)** — o'chirilsa ma'lumot yo'qoladi. Diskda esa narsa qoladi. Shuning uchun tekshiruvda jonli tizimdan RAM ham, disk ham o'rganiladi.`,
      ru: `## Основы железа

У компьютера три основных узла — задачи у них разные:

| Узел | Задача |
|---|---|
| **ЦП (CPU)** | Считает и выполняет команды — «мозг» компьютера |
| **ОЗУ (RAM)** | Быстрая, но временная память для открытых программ |
| **Диск (HDD/SSD)** | Долговременное хранение файлов, только медленнее |

**После нажатия кнопки питания:** BIOS/UEFI проходит самопроверку → операционная система загружается с диска → рабочий стол готов.

> **Важно для форензики:** RAM — энергозависимая (volatile), при отключении данные исчезают. На диске данные остаются. Поэтому при расследовании изучают и живую память, и диск.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Kompyuterning buyruqlarni hisoblab bajaruvchi asosiy qismi qaysi?",
          ru: 'Какой узел компьютера считает и выполняет команды?',
        },
        options: [
          { id: 'a', uz: 'RAM', ru: 'ОЗУ (RAM)' },
          { id: 'b', uz: 'CPU', ru: 'ЦП (CPU)' },
          { id: 'c', uz: 'Disk', ru: 'Диск' },
          { id: 'd', uz: 'Monitor', ru: 'Монитор' },
        ],
        answer: 'b',
        explain: {
          uz: 'CPU (markaziy protsessor) barcha hisob-kitoblarni bajaradi. RAM faqat vaqtinchalik saqlaydi, disk — uzoq muddat, monitor esa natijani ko\'rsatadi.',
          ru: 'ЦП (центральный процессор) выполняет все вычисления. RAM хранит временно, диск — долговременно, монитор лишь показывает результат.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Qismni uning vazifasiga moslang',
          ru: 'Соотнесите узел с его задачей',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'CPU', ru: 'ЦП (CPU)' },
            right: { id: 'p1', uz: 'Buyruqlarni hisoblab bajaradi', ru: 'Считает и выполняет команды' },
          },
          {
            id: 'p2',
            left: { uz: 'RAM', ru: 'ОЗУ (RAM)' },
            right: { id: 'p2', uz: "Ochiq dasturlar uchun tez vaqtinchalik xotira", ru: 'Быстрая временная память для открытых программ' },
          },
          {
            id: 'p3',
            left: { uz: 'Disk (HDD/SSD)', ru: 'Диск (HDD/SSD)' },
            right: { id: 'p3', uz: 'Fayllarni uzoq muddat saqlaydi', ru: 'Долговременно хранит файлы' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'CPU ishlaydi, RAM tez lekin vaqtinchalik saqlaydi, disk esa sekinroq, lekin ma\'lumotni o\'chirishsiz uzoq saqlaydi.',
          ru: 'ЦП выполняет работу, RAM хранит быстро, но временно, диск медленнее, но сохраняет данные надолго.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "RAM'dagi ma'lumot kompyuter o'chirilgandan keyin ham qoladi.",
          ru: 'Данные в RAM остаются после выключения компьютера.',
        },
        answer: 'false',
        explain: {
          uz: 'RAM o\'zgaruvchan (volatile) xotira: quvvat uzilsa, ma\'lumot yo\'qoladi. Shuning uchun saqlanmagan ish yo\'qoladi — va shuning uchun jonli tizimdan olingan RAM tasviri forensikada qimmatli.',
          ru: 'RAM энергозависимая память: пропало питание — данные исчезают. Поэтому несохранённая работа теряется, а снимок оперативной памяти живой системы ценен для форензики.',
        },
      },
      {
        id: 'e4',
        type: 'order',
        q: {
          uz: "Kompyuter yoqilganda bo'ladigan hodisalarni to'g'ri tartibda joylang",
          ru: 'Расставьте события при включении компьютера по порядку',
        },
        items: [
          { id: 'i1', uz: "Quyug' tugmasi bosiladi", ru: 'Нажимается кнопка питания' },
          { id: 'i2', uz: "BIOS/UEFI tekshiruvdan o'tadi", ru: 'BIOS/UEFI проходит самопроверку' },
          { id: 'i3', uz: 'Tizim (OS) diskdan yuklanadi', ru: 'Операционная система загружается с диска' },
          { id: 'i4', uz: 'Ishchi stol tayyor bo\'ladi', ru: 'Рабочий стол готов' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval quvvat, keyin apparatni tekshiruv (POST), so\'ng tizim diskdan yuklanadi va oxirida foydalanuvchi interfeysi paydo bo\'ladi.',
          ru: 'Сначала питание, затем самопроверка оборудования (POST), после чего система загружается с диска и в конце появляется интерфейс пользователя.',
        },
      },
    ],
  },

  {
    slug: 'os-basics',
    domain: 'it-basics',
    kind: 'lesson',
    xp_reward: 15,
    title: { uz: 'Operatsion tizim nima?', ru: 'Что такое операционная система?' },
    content: {
      uz: `## Operatsion tizim nima?

**Operatsion tizim (OS)** — foydalanuvchi bilan kompyuter apparati orasidagi vositachi. U uch ishni bajaradi:

- **Yadro (kernel)** — apparatni boshqaradi va dasturlarga ruxsat beradi
- **Jarayonlar (process)** — bir vaqtda ishlayotgan dasturlarni tartiblaydi
- **Fayl tizimi (filesystem)** — fayllarni papkalarda tartibli saqlaydi

| | Windows | Linux |
|---|---|---|
| Interfeys | Grafik, odatda ish stoli | Terminal ham, grafik ham |
| Litsenziya | Pullik litsenziya kerak | Odatda ochiq va bepul |
| Qo'llanilishi | Ish stoli, o'yin | Serverlar, telefon, sun'iy intellekt |

> **Xavfsizlikda muhim:** dasturlar barcha ruxsatni OS dan so'raydi — agar ruxsatlar tizimi zaif bo'lsa, hujumchi ham xuddi shu ruxsatlardan foydalanadi.`,
      ru: `## Что такое операционная система?

**Операционная система (ОС)** — посредник между человеком и железом компьютера. Она делает три вещи:

- **Ядро (kernel)** — управляет оборудованием и выдаёт программам разрешения
- **Процессы** — распоряжается программами, работающими одновременно
- **Файловая система** — хранит файлы аккуратно, в папках

| | Windows | Linux |
|---|---|---|
| Интерфейс | Обычно графический рабочий стол | И терминал, и графика |
| Лицензия | Нужна платная лицензия | Обычно открыт и бесплатен |
| Где используют | Рабочий стол, игры | Серверы, телефоны, ИИ |

> **Важно для безопасности:** все разрешения программы запрашивают у ОС — если система прав устроена неправильно, атакер получит те же разрешения.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Operatsion tizim yadrosi (kernel) asosiy vazifasi nima?",
          ru: 'Главная задача ядра (kernel) операционной системы?',
        },
        options: [
          { id: 'a', uz: 'Internetni tezlashtirish', ru: 'Ускорять интернет' },
          { id: 'b', uz: "Apparat va dasturlar orasidagi vositachi bo'lish", ru: 'Быть посредником между оборудованием и программами' },
          { id: 'c', uz: 'Fayllarni chop etish', ru: 'Печатать файлы' },
          { id: 'd', uz: 'Viruslarni skanerlash', ru: 'Сканировать вирусы' },
        ],
        answer: 'b',
        explain: {
          uz: 'Yadro — OS ning markazi: u apparatni boshqaradi va dasturlar apparatga to\'g\'ridan-to\'g\'ri tegishiga yo\'l qo\'ymaydi. Chop etish va skanerlash — alohida dasturlarning ishi.',
          ru: 'Ядро — центр ОС: оно управляет оборудованием и не даёт программам обращаться к нему напрямую. Печать и сканерирование — задачи отдельных программ.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Tushunchani uning vazifasiga moslang',
          ru: 'Соотнесите понятие с его задачей',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'Yadro (kernel)', ru: 'Ядро (kernel)' },
            right: { id: 'p1', uz: "Apparatni boshqaradi", ru: 'Управляет оборудованием' },
          },
          {
            id: 'p2',
            left: { uz: 'Jarayon (process)', ru: 'Процесс (process)' },
            right: { id: 'p2', uz: 'Ishlab turgan dastur', ru: 'Выполняющаяся программа' },
          },
          {
            id: 'p3',
            left: { uz: 'Fayl tizimi', ru: 'Файловая система' },
            right: { id: 'p3', uz: 'Fayllarni papkalarda tartiblaydi', ru: 'Организует файлы в папках' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Yadro boshqaradi, har bir ochiq dastur — bu alohida jarayon, fayl tizimi esa fayllar qayerda turganini biladi.',
          ru: 'Ядро управляет, каждая запущенная программа — это процесс, а файловая система знает, где лежат файлы.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Windows va Linux haqida to'g'ri gaplar qaysi? (bir nechtasini tanlang)",
          ru: 'Что верно о Windows и Linux? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Linux ko'pincha serverlarda ishlatiladi", ru: 'Linux чаще используют на серверах' },
          { id: 'b', uz: 'Windows ham, Linux ham grafik interfeysga ega', ru: 'И Windows, и Linux умеют в графический интерфейс' },
          { id: 'c', uz: "Linux ochiq kodli", ru: 'Linux с открытым исходным кодом' },
          { id: 'd', uz: "Linux faqat o'yin o'ynash uchun", ru: 'Linux годится только для игр' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Linux ochiq kodli va serverlarda ustunlik qiladi, lekin grafik muhitga ham ega. Windows esa mashhur ish stoli tizimi. "Faqat o\'yin" — bu noto\'g\'ri.',
          ru: 'Linux открыт и доминирует на серверах, но умеет и в графику. Windows — популярная настольная ОС. «Только для игр» — неверно.',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: "Bir vaqtda ko'p dastur ishlashi — OS boshqaruvi (jarayonlarni tartiblash) natijasi.",
          ru: 'Одновременная работа многих программ — результат управления процессами ОС.',
        },
        answer: 'true',
        explain: {
          uz: 'To\'g\'ri: CPU bir vaqtda bitta buyruqni bajaradi, lekin OS jarayonlar orasida tez almashib, ko\'p dastur "birga" ishlayotgandek ko\'rinadi.',
          ru: 'Верно: ЦП выполняет по одному запросу за раз, но ОС быстро переключает процессы, и создаётся впечатление, что программы работают одновременно.',
        },
      },
    ],
  },

  // ────────────────────────── domain: databases ─────────────────────────
  {
    slug: 'what-is-a-database',
    domain: 'databases',
    kind: 'lesson',
    xp_reward: 15,
    title: { uz: "Ma'lumotlar bazasi nima?", ru: 'Что такое база данных?' },
    content: {
      uz: `## Ma'lumotlar bazasi nima?

**Ma'lumotlar bazasi (DB)** — ma'lumotni tartibli va tez qidirib bo'ladigan holda saqlash tizimi. Oddiy fayllardan farqi: izlash tezroq va xavfsizroq.

Tuzilishi uch qatlamli:

- **Jadval (table)** — bitta mavzudagi ma'lumotlar to'plami. Masalan, \`users\`.
- **Qator (row)** — bitta yozuv: bitta foydalanuvchi.
- **Ustun (column)** — bitta xususiyat: \`name\`, \`email\`, \`password_hash\`.

> **Ikki asosiy himoya:** muntazam **zaxira nusxa (backup)** — buzilgan ma'lumotni tiklash uchun; **kirish huquqlarini cheklash** — kerak bo'lmagan ma'lumotni ko'ra olmasligi uchun.`,
      ru: `## Что такое база данных?

**База данных (БД)** — система хранения данных, упорядоченная так, чтобы быстро искать нужное. Обычных файлов она отличается тем, что поиск быстрее и безопаснее.

Устройство — три уровня:

- **Таблица (table)** — набор данных на одну тему. Например, \`users\`.
- **Строка (row)** — одна запись: один пользователь.
- **Столбец (column)** — одно свойство: \`name\`, \`email\`, \`password_hash\`.

> **Два главных правила защиты:** регулярные **резервные копии** — чтобы восстановить повреждённые данные; **ограничение доступа** — чтобы лишний человек ничего не увидел.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Jadvaldagi bitta yozuv (masalan, bitta foydalanuvchi) qanday ataladi?",
          ru: 'Как называется одна запись в таблице (например, один пользователь)?',
        },
        options: [
          { id: 'a', uz: 'Ustun (column)', ru: 'Столбец (column)' },
          { id: 'b', uz: 'Qator (row)', ru: 'Строка (row)' },
          { id: 'c', uz: 'So\'rov (query)', ru: 'Запрос (query)' },
          { id: 'd', uz: 'Papka', ru: 'Папка' },
        ],
        answer: 'b',
        explain: {
          uz: 'Qator (row) — bitta yozuv, ya\'ni bitta foydalanuvchi. Ustun (column) esa uning xususiyati: name yoki email. So\'rov — bazaga berilgan savol.',
          ru: 'Строка (row) — это одна запись, то есть один пользователь. Столбец (column) — его свойство: name или email. Запрос — это вопрос к базе.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Tushunchani uning misoliga moslang',
          ru: 'Соотнесите понятие с примером',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'Jadval (table)', ru: 'Таблица (table)' },
            right: { id: 'p1', uz: "Bitta mavzudagi ma'lumotlar to'plami, masalan users", ru: 'Набор данных на одну тему, например users' },
          },
          {
            id: 'p2',
            left: { uz: 'Qator (row)', ru: 'Строка (row)' },
            right: { id: 'p2', uz: 'Bitta yozuv — bitta foydalanuvchi', ru: 'Одна запись — один пользователь' },
          },
          {
            id: 'p3',
            left: { uz: 'Ustun (column)', ru: 'Столбец (column)' },
            right: { id: 'p3', uz: "Bitta xususiyat, masalan email", ru: 'Одно свойство, например email' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Jadval — butun "ilova", qator — bitta odam, ustun esa uning bir xususiyati. Uch qatlamni aynan shunday eslab qoling.',
          ru: 'Таблица — вся «ilova», строка — один человек, столбец — одно его свойство. Запомните эти три уровня именно так.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Muhim ma'lumotlar bazasini bitta joyda, bitta nusxada saqlash xavfsiz hisoblanadi.",
          ru: 'Важную базу данных безопасно хранить в одном месте, в одном экземпляре.',
        },
        answer: 'false',
        explain: {
          uz: 'Bitta nusxa = bitta nuqtadagi nosozlik yoki hujum butun ma\'lumotni yo\'qotadi. Shuning uchun zaxira nusxalar muntazam va boshqa joyda saqlanadi — ransomware\'dan eng ishonchli himoya shu.',
          ru: 'Одна копия = одна точка отказа или атака уничтожает все данные. Поэтому резервные копии делают регулярно и хранят отдельно — это самая надёжная защита от ransomware.',
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: "Ma'lumotlar bazasini himoyalashning yo'llari qaysi? (bir nechtasini tanlang)",
          ru: 'Какими способами защищают базу данных? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Muntazam zaxira nusxa olish', ru: 'Регулярно делать резервные копии' },
          { id: 'b', uz: "Kirish huquqlarini cheklash", ru: 'Ограничивать права доступа' },
          { id: 'c', uz: 'Barchaga administratorlik berish', ru: 'Выдать всем права администратора' },
          { id: 'd', uz: 'Parollarni hashlab saqlash', ru: 'Хранить пароли в виде хеша' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Backup tiklashni, cheklangan huquqlar ko\'rmaslikni, hash esa parol o\'g\'irlanishining oldini oladi. Barchaga admin berish esa himoyani butunlay yo\'q qiladi.',
          ru: 'Бэкап позволяет восстановить, ограничения — скрыть лишнее, хеш — защитить пароли от утечки. Выдать всем права администратора — значит не защищать ничего.',
        },
      },
    ],
  },

  {
    slug: 'sql-basics',
    domain: 'databases',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'SQL asoslari: SELECT, INSERT, UPDATE, DELETE', ru: 'Основы SQL: SELECT, INSERT, UPDATE, DELETE' },
    content: {
      uz: `## SQL — ma'lumotlar bazasi tili

SQL — bu ma'lumotlar bazasiga savol beradigan til. Asosiy to'rtta buyruq:

- **SELECT** — ma'lumotni o'qiydi
- **INSERT** — yangi qator qo'shadi
- **UPDATE** — mavjud qatorni o'zgartiradi
- **DELETE** — qatorni o'chiradi

Shart bilan filtr qo'shish uchun **WHERE** kaliti ishlatiladi:

\`\`\`sql
SELECT name, email FROM users WHERE city = 'Tashkent';
\`\`\`

> **Xavfsizlik eslatmasi:** foydalanuvchi matni to'g'ridan-to'g'ri so'rovga qo'shilsa, SQL injection paydo bo'ladi — shuning uchun so'rovlarni parametrlar bilan yozish shart.`,
      ru: `## SQL — язык баз данных

SQL — это язык, на котором задают вопросы базе данных. Четыре основных запроса:

- **SELECT** — читает данные
- **INSERT** — добавляет новую строку
- **UPDATE** — изменяет существующую строку
- **DELETE** — удаляет строку

Для фильтра используется ключевое слово **WHERE**:

\`\`\`sql
SELECT name, email FROM users WHERE city = 'Tashkent';
\`\`\`

> **Замечание по безопасности:** если текст пользователя напрямую вставить в запрос, возникает SQL-инъекция — поэтому запросы пишут с параметрами.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'SELECT * FROM users WHERE age >= 18;',
        q: {
          uz: 'Bu so\'rov nima qiladi?',
          ru: 'Что делает этот запрос?',
        },
        options: [
          { id: 'a', uz: "18 yosh va undan katta foydalanuvchilarni ko'rsatadi", ru: 'Показывает пользователей от 18 лет и старше' },
          { id: 'b', uz: "Foydalanuvchilarni o'chiradi", ru: 'Удаляет пользователей' },
          { id: 'c', uz: 'Yangi foydalanuvchi qo\'shadi', ru: 'Добавляет нового пользователя' },
          { id: 'd', uz: 'Jadvalni yaratadi', ru: 'Создаёт таблицу' },
        ],
        answer: 'a',
        explain: {
          uz: "SELECT ma'lumotni faqat o'qiydi, WHERE esa shart beradi: faqat 18 dan kattalar qoladi. Hech narsa o'zgarmaydi — ko'rish uchun xavfsiz so'rov.",
          ru: 'SELECT только читает данные, а WHERE задаёт условие: остаются только совершеннолетние. Ничего не меняется — это безопасный запрос для просмотра.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'SQL buyrog\'ini uning vazifasiga moslang',
          ru: 'Соотнесите SQL-запрос с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'SELECT', ru: 'SELECT' }, right: { id: 'p1', uz: "Ma'lumotni o'qiydi", ru: 'Читает данные' } },
          { id: 'p2', left: { uz: 'INSERT', ru: 'INSERT' }, right: { id: 'p2', uz: "Yangi qator qo'shadi", ru: 'Добавляет новую строку' } },
          { id: 'p3', left: { uz: 'UPDATE', ru: 'UPDATE' }, right: { id: 'p3', uz: 'Mavjud qatorni o\'zgartiradi', ru: 'Изменяет существующую строку' } },
          { id: 'p4', left: { uz: 'DELETE', ru: 'DELETE' }, right: { id: 'p4', uz: "Qatorni o'chiradi", ru: 'Удаляет строку' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: 'Bittasi o\'qiydi (SELECT), uchtasi ma\'lumotni o\'zgartiradi. Xavfsizlikda bu farq muhim: SELECT ni hamma kora oladi, boshqasi esa huquq talab qiladi.',
          ru: 'Один читает (SELECT), три меняют данные. Для безопасности разница важна: доступ к SELECT можно дать многим, к остальным — только нужным.',
        },
      },
      {
        id: 'e3',
        type: 'input',
        q: {
          uz: "Ma'lumotni o'qish uchun ishlatiladigan asosiy SQL buyruqi: ______ (bitta so'z, inglizcha)",
          ru: 'Основный SQL-запрос для чтения данных: ______ (одно слово по-английски)',
        },
        answer: 'select',
        accepted: ['показать', 'выбрать', 'show'],
        explain: {
          uz: '**SELECT** — ma\'lumotni o\'qiydi va hech narsani o\'zgartirmaydi. INSERT/UPDATE/DELETE esa ma\'lumotga ta\'sir qiladi va ehtiyotkorlik talab qiladi.',
          ru: '**SELECT** читает данные и ничего не меняет. INSERT/UPDATE/DELETE действуют на данные и требуют осторожности.',
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: "Qaysi SQL buyruqlari ma'lumotni o'zgartiradi? (bir nechtasini tanlang)",
          ru: 'Какие SQL-запросы изменяют данные? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'SELECT', ru: 'SELECT' },
          { id: 'b', uz: 'INSERT', ru: 'INSERT' },
          { id: 'c', uz: 'UPDATE', ru: 'UPDATE' },
          { id: 'd', uz: 'DELETE', ru: 'DELETE' },
        ],
        answers: ['b', 'c', 'd'],
        explain: {
          uz: 'SELECT faqat o\'qiydi, qolgan uchtasi qo\'shadi, o\'zgartiradi yoki o\'chiradi. Shuning uchun hisobot uchun SELECT, yozish huquqi esa alohida beriladi.',
          ru: 'SELECT лишь читает, остальные три добавляют, меняют или удаляют. Поэтому для отчётов хватает SELECT, а права на изменение выдают отдельно.',
        },
      },
    ],
  },

  // ───────────────────────────── domain: git ────────────────────────────
  {
    slug: 'git-basics',
    domain: 'git',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'Git va versiya nazorati', ru: 'Git и контроль версий' },
    content: {
      uz: `## Git nima?

**Git** — loyiha fayllari tarixini saqlaydigan **versiya nazorati** tizimi. Xato qilsang, o'tgan holatga qayta olasan.

- **Repozitoriy (repo)** — loyiha fayllari va ularning tarixi saqlanadigan joy.
- **Commit** — bir lahzadagi "surat": nima o'zgargani va izoh yoziladi.
- **Branch** — loyihaning alohida oqimi (keyingi darsda).

\`\`\`bash
git add fayl.txt
git commit -m "Xavfsizlik tuzatilishi kiritildi"
\`\`\`

> **Nega xavfsizlik uchun muhim:** git tarixi kim, qachon va nima o'zgartirganini ko'rsatadi — bu **audit** uchun asos. Tarixni yo'qotish = javobgarlik izini yo'qotish.`,
      ru: `## Что такое Git?

**Git** — система **контроля версий**, хранящая историю файлов проекта. Ошиблись — можно вернуться к прошлому состоянию.

- **Репозиторий (repo)** — место, где хранятся файлы проекта и их история.
- **Коммит (commit)** — «снимок» момента: что изменено и зачем.
- **Ветка (branch)** — отдельная линия разработки (следующий урок).

\`\`\`bash
git add fayl.txt
git commit -m "Исправление по безопасности добавлено"
\`\`\`

> **Почему это важно для безопасности:** история Git показывает, кто и когда что менял — это основа **аудита**. Потеря истории = потеря следов ответственности.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Git — bu nima?",
          ru: 'Git — это что?',
        },
        options: [
          { id: 'a', uz: 'Antivirus dasturi', ru: 'Антивирус' },
          { id: 'b', uz: "Fayllar tarixini saqlaydigan versiya nazorati tizimi", ru: 'Система контроля версий, хранящая историю файлов' },
          { id: 'c', uz: 'Internet brauzeri', ru: 'Интернет-браузер' },
          { id: 'd', uz: "Ma'lumotlar bazasi tili", ru: 'Язык баз данных' },
        ],
        answer: 'b',
        explain: {
          uz: 'Git — versiya nazorati: u har bir "suratni" (commit) saqlaydi, shuning uchun istalgan o\'tgan holatga qaytish mumkin. Antivirus va brauzer boshqa vositalar.',
          ru: 'Git — контроль версий: он хранит каждый «снимок» (коммит), поэтому можно вернуться к любому прошлому состоянию. Антивирус и браузер — другие инструменты.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Git atamasini uning izohiga moslang',
          ru: 'Соотнесите термин Git с его описанием',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'Repozitoriy', ru: 'Репозиторий' },
            right: { id: 'p1', uz: "Loyiha fayllari va tarixi saqlanadigan joy", ru: 'Место хранения файлов проекта и истории' },
          },
          {
            id: 'p2',
            left: { uz: 'Commit', ru: 'Коммит' },
            right: { id: 'p2', uz: 'Bir lahzadagi surat + izoh', ru: 'Снимок момента + описание' },
          },
          {
            id: 'p3',
            left: { uz: 'Branch', ru: 'Ветка' },
            right: { id: 'p3', uz: 'Loyihaning alohida oqimi', ru: 'Отдельная линия разработки' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Repo — uy, commit — har bir surat, branch esa alohida oqim. Commit qancha ko\'p bo\'lsa, tarix shuncha aniqroq bo\'ladi.',
          ru: 'Репозиторий — дом, коммит — каждый снимок, ветка — отдельная линия. Чем больше коммитов, тем точнее история.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Git tarixi tufayli kim va qachon fayl o'zgartirganini ko'rish mumkin — bu xavfsizlik auditi uchun foydali.",
          ru: 'Благодаря истории Git можно увидеть, кто и когда менял файл — это полезно для аудита безопасности.',
        },
        answer: 'true',
        explain: {
          uz: 'Har commit muallif, sana va izoh bilan saqlanadi. Hujum yoki xato aniqlanganda kim mas\'ulatini tarixdan ko\'rish — aynan audit degani shu.',
          ru: 'Каждый коммит хранит автора, дату и описание. Когда найдена атака или ошибка, по истории видно, кто отвечает — это и есть аудит.',
        },
      },
      {
        id: 'e4',
        type: 'order',
        q: {
          uz: "Yangi o'zgarishni saqlash tartibini joylang (git)",
          ru: 'Расставьте порядок сохранения изменений (git)',
        },
        items: [
          { id: 'i1', uz: "Faylni tahrirlash", ru: 'Отредактировать файл' },
          { id: 'i2', uz: 'git add bilan tayyorlash', ru: 'git add — подготовить' },
          { id: 'i3', uz: 'git commit bilan saqlash', ru: 'git commit — сохранить' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: {
          uz: 'Avval o\'zgartirasiz (working tree), keyin tanlanganlarni tayyorlaysiz (add), oxirida tarixga butunlay saqlaysiz (commit). Shu uch bosqich — Git\'ning kundalik ritmi.',
          ru: 'Сначала меняете (рабочее дерево), затем готовите выбранные файлы (add), в конце навсегда сохраняете в историю (commit). Эти три шага — ежедневный ритм Git.',
        },
      },
    ],
  },

  {
    slug: 'git-branching',
    domain: 'git',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Branch, merge va pull request', ru: 'Ветки, слияние и pull request' },
    content: {
      uz: `## Branch — xavfsiz oqim

**Branch (filial)** — loyihaning mustaqil oqimi. Unda ishlash **asosiy (main) kodni o'zgartirmaydi**.

- **Merge** — ikki oqimni birlashtirish.
- **Pull request (PR)** — o'zgarishni avval jamoa ko'rib chiqadi, keyin main'ga qo'shiladi.

\`\`\`bash
git checkout -b yangi-funksiya   # branch ochish
git merge yangi-funksiya          # birlashtirish
\`\`\`

> **Nega main himoyalangan:** yangi kod avval branch'da sinab va tekshiriladi. Xato chiqsa — shu branch o'chiriladi, hamma ishlaydigan main buzilmaydi.`,
      ru: `## Ветка — безопасная линия

**Ветка (branch)** — независимая линия разработки. Работа в ней **не меняет основной (main) код**.

- **Merge (слияние)** — объединение двух линий.
- **Pull request (PR)** — сначала команда рассматривает изменение, и только потом оно попадает в main.

\`\`\`bash
git checkout -b new-feature   # создать ветку
git merge new-feature         # слить её
\`\`\`

> **Почему защищён main:** новый код сначала проверяют в ветке. Ошибка — ветку удаляют, а рабочий main остаётся целым.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Git'da branch nima?",
          ru: 'Что такое ветка (branch) в Git?',
        },
        options: [
          { id: 'a', uz: 'Fayl turi', ru: 'Тип файла' },
          { id: 'b', uz: 'Kodning alohida, mustaqil oqimi', ru: 'Отдельная независимая линия кода' },
          { id: 'c', uz: "Git xatosi", ru: 'Ошибка Git' },
          { id: 'd', uz: 'Server nomi', ru: 'Имя сервера' },
        ],
        answer: 'b',
        explain: {
          uz: 'Branch — loyihaning yangi oqimi: unda xohlagancha o\'zgartirish qilasiz, lekin main faqat siz ruxsat berganingizgacha o\'zgarmaydi.',
          ru: 'Ветка — новая линия проекта: в ней можно менять что угодно, но main изменится только с вашего явного разрешения.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Git atamasini uning izohiga moslang',
          ru: 'Соотнесите термин Git с его описанием',
        },
        pairs: [
          {
            id: 'p1',
            left: { uz: 'Branch', ru: 'Ветка' },
            right: { id: 'p1', uz: "Alohida oqim — main buzilmaydi", ru: 'Отдельная линия — main не затрагивается' },
          },
          {
            id: 'p2',
            left: { uz: 'Merge', ru: 'Merge (слияние)' },
            right: { id: 'p2', uz: 'Ikki oqimni birlashtirish', ru: 'Объединение двух линий' },
          },
          {
            id: 'p3',
            left: { uz: 'Pull request', ru: 'Pull request' },
            right: { id: 'p3', uz: "O'zgarishni ko'rib chiqish va qabul qilish", ru: 'Рассмотрение и принятие изменений' },
          },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Branch mustaqil ishlaydi, merge ikkisini birlashtiradi, PR esa birlashtirishdan oldin odamlar ko\'rib chiqishini ta\'minlaydi.',
          ru: 'Ветка работает независимо, merge объединяет, а PR обеспечивает человеческую проверку перед слиянием.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Nega to'g'ridan-to'g'ri main'ga yozish xavfli? (bir nechtasini tanlang)",
          ru: 'Почему опасно писать прямо в main? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Barchaning ishlayotgan kodiga ta'sir qilishi mumkin", ru: 'Может затронуть рабочий код всех' },
          { id: 'b', uz: "Tekshiruvsiz o'zgarish kirishi mumkin", ru: 'Изменение может попасть без проверки' },
          { id: 'c', uz: 'Tarix tez chigallashadi', ru: 'История быстро запутывается' },
          { id: 'd', uz: "Disk to'lishi mumkin", ru: 'Может закончиться место на диске' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Main — barcha uchun ishlaydigan kod. Unga tekshiruvsiz yozish buzilish, xatosiz o\'zgarish va murakkab tarixga olib keladi. Diskga bu hech qanday aloqasi yo\'q.',
          ru: 'Main — код, работающий у всех. Писать туда без проверки — значит рискнуть сломать всё, впустить непроверенное и запутать историю. К диску это отношения не имеет.',
        },
      },
      {
        id: 'e4',
        type: 'tf',
        q: {
          uz: "Branch'da o'zgarish qilish main'ni darhol o'zgartirmaydi.",
          ru: 'Изменения в ветке сразу не меняют main.',
        },
        answer: 'true',
        explain: {
          uz: 'To\'g\'ri: branch — alohida oqim. Main faqat merge yoki PR qabul qilingandagina o\'zgaradi — shu orada xato uchun joy bor.',
          ru: 'Верно: ветка — отдельная линия. Main меняется только после merge или принятого PR — так остаётся место для ошибки.',
        },
      },
    ],
  },
];
