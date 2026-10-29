/**
 * Curriculum - Cybersecurity path › Domain: Cloud security
 *
 * Shape (validated by scripts/validate-curriculum.js via lib/grade.validateExercise):
 *   module: { slug, title:{uz,ru}, content:{uz,ru}, kind, xp_reward, exercises:[...] }
 *   kind: 'lesson' | 'checkpoint'   (checkpoint = end-of-domain trophy node)
 *
 * Rules for authors:
 *   - Lesson prose: short. 6-14 markdown lines per language.
 *   - Every exercise: bilingual q + explain, beginner level, no trick questions.
 *   - Vendor-neutral concepts only (shared responsibility, IAM, VPC, buckets).
 *     No product names, no prices, no invented numbers.
 *   - Exercise ids: e1..eN in delivery order.
 *   - Uzbek: simple, modern Uzbek Latin. Russian: natural, not machine-translated.
 *   - Any string containing a straight ' MUST be double-quoted (or a template
 *     literal) - a ' inside a single-quoted string breaks the file.
 */

module.exports = [
  {
    slug: 'cloud-basics',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Bulut asoslari', ru: 'Основы облака' },
    content: {
      uz: `## Bulut (cloud) nima

**Bulut** - hisoblash resurslarini (server, saqlash, tarmoq) internet orqali ijaraga olish. O'z server xonangizni qurish o'rniga, kerak bo'lganda olasiz.

**Xizmat modellari:**
- **IaaS** - infratuzilma ijarasi (virtual server, tarmoq).
- **PaaS** - tayyor platforma (ilovani joylash muhiti).
- **SaaS** - tayyor dastur (pochta, hujjat, CRM).

**Joylashuv (deployment):** public (umumiy provayder), private (faqat tashkilot ichida), hybrid (ikkisi birga).

> **Xavfsizlik:** bulut "xavfsiz" yoki "xavfli" emas - bu boshqaruv masalasi. Ko'p jihatdan xavfsizlik **sizning sozlamalaringizga** bog'liq.`,
      ru: `## Что такое облако (cloud)

**Облако** - аренда вычислительных ресурсов (сервер, хранилище, сеть) через интернет. Вместо своей серверной вы берёте нужное по мере надобности.

**Модели услуг:**
- **IaaS** - аренда инфраструктуры (виртуальный сервер, сеть).
- **PaaS** - готовая платформа (среда для размещения приложения).
- **SaaS** - готовое приложение (почта, документы, CRM).

**Размещение (deployment):** public (общий провайдер), private (только внутри организации), hybrid (оба вместе).

> **Безопасность:** облако не «безопасное» и не «опасное» - это вопрос управления. Во многом безопасность зависит от **ваших настроек**.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'IaaS, PaaS, SaaS - qaysi biri tayyor dasturni bildiradi?',
          ru: 'IaaS, PaaS, SaaS - какая модель означает готовое приложение?',
        },
        options: [
          { id: 'a', uz: 'SaaS', ru: 'SaaS' },
          { id: 'b', uz: 'IaaS', ru: 'IaaS' },
          { id: 'c', uz: 'PaaS', ru: 'PaaS' },
          { id: 'd', uz: 'DNS', ru: 'DNS' },
        ],
        answer: 'a',
        explain: {
          uz: "SaaS (Software as a Service) - tayyor dastur internet orqali. Foydalanuvchi infratuzilmani boshqarmaydi.",
          ru: 'SaaS (Software as a Service) - готовое приложение через интернет. Пользователь не управляет инфраструктурой.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Bulutga to'liq ishonib, o'z sozlamalarini tekshirmasa ham bo'ladi.",
          ru: 'Можно полностью довериться облаку и не проверять свои настройки.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - xavfsizlikning bir qismi sizda qoladi (mas'uliyat taqsimoti). Noto'g'ri sozlama - eng keng tarqalgan bulut muammosi.",
          ru: 'Нет - часть безопасности остаётся за вами (разделение ответственности). Неверная настройка - самая частая проблема в облаке.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Qaysi xizmat modellari mavjud? (bir nechtasini tanlang)',
          ru: 'Какие модели услуг существуют? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'IaaS', ru: 'IaaS' },
          { id: 'b', uz: 'PaaS', ru: 'PaaS' },
          { id: 'c', uz: 'SaaS', ru: 'SaaS' },
          { id: 'd', uz: 'Faqat shaxsiy server', ru: 'Только личный сервер' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Uchta asosiy model: IaaS (infratuzilma), PaaS (platforma), SaaS (dastur). Ular boshqaruv darajasi bilan farq qiladi.",
          ru: 'Три основные модели: IaaS (инфраструктура), PaaS (платформа), SaaS (приложение). Они различаются уровнем управления.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Modelni uning mazmuni bilan moslang',
          ru: 'Соотнесите модель с её смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'IaaS', ru: 'IaaS' }, right: { uz: 'Infratuzilma ijarasi', ru: 'Аренда инфраструктуры' } },
          { id: 'p2', left: { uz: 'PaaS', ru: 'PaaS' }, right: { uz: 'Tayyor platforma', ru: 'Готовая платформа' } },
          { id: 'p3', left: { uz: 'SaaS', ru: 'SaaS' }, right: { uz: 'Tayyor dastur', ru: 'Готовое приложение' } },
          { id: 'p4', left: { uz: 'Public cloud', ru: 'Public cloud' }, right: { uz: 'Umumiy provayder infratuzilmasi', ru: 'Инфраструктура общего провайдера' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Modellar boshqaruv darajasi bilan farq qiladi: IaaS da ko'p narsani siz, SaaS da ko'p narsani provayder boshqaradi.",
          ru: 'Модели различаются уровнем управления: в IaaS многое делаете вы, в SaaS многое берёт на себя провайдер.',
        },
      },
    ],
  },

  {
    slug: 'shared-responsibility',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: "Mas'uliyat taqsimoti", ru: 'Разделение ответственности' },
    content: {
      uz: `## Mas'uliyat taqsimoti (shared responsibility)

Bulutda xavfsizlik ikki tomon o'rtasida bo'linadi:

- **Provayder** - *bulutning* o'zi: fizik xavfsizlik, hostlar, tarmoq infratuzilmasi.
- **Siz (mijoz)** - *bulutdagi* narsalar: ma'lumot, sozlamalar, identifikatsiya, ilova.

**Misol:** provayder serverni xavfsiz saqlaydi, lekin **siz** kim kirishi mumkinligini, saqlash ochiqmi-yo'qmi va yamoqlarni boshqarasiz.

> **Xavfsizlik:** "Bu provayderning ishi" deb o'ylash - eng katta xato. Aksariyat bulut hodisalari **mijoz tomonidagi** noto'g'ri sozlamadan kelib chiqadi.`,
      ru: `## Разделение ответственности (shared responsibility)

В облаке безопасность делится между двумя сторонами:

- **Провайдер** - само *облако*: физическая безопасность, хосты, сетевая инфраструктура.
- **Вы (клиент)** - то, что *в облаке*: данные, настройки, идентификация, приложение.

**Пример:** провайдер хранит сервер в безопасности, но **вы** решаете, кому можно входить, открыто ли хранилище и как ставить патчи.

> **Безопасность:** мысль «это дело провайдера» - самая большая ошибка. Большинство облачных инцидентов происходит из-за неверных настроек **на стороне клиента**.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Shared responsibility modelda bulutdagi ma'lumot va sozlamalar uchun kim javobgar?",
          ru: 'Кто отвечает за данные и настройки в облаке в модели shared responsibility?',
        },
        options: [
          { id: 'a', uz: 'Mijoz (siz)', ru: 'Клиент (вы)' },
          { id: 'b', uz: 'Faqat provayder', ru: 'Только провайдер' },
          { id: 'c', uz: 'Hech kim', ru: 'Никто' },
          { id: 'd', uz: 'Internet provayder', ru: 'Интернет-провайдер' },
        ],
        answer: 'a',
        explain: {
          uz: "Provayder infratuzilmani, mijoz esa ma'lumot, identifikatsiya va sozlamalarni himoya qiladi. Ma'lumot uchun javobgarlik mijozga tegishli.",
          ru: 'Провайдер защищает инфраструктуру, а клиент - данные, идентификацию и настройки. Ответственность за данные лежит на клиенте.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "\"Bu provayderning ishi\" degan fikr ko'p bulut hodisalarining sababi.",
          ru: 'Мысль «это дело провайдера» - причина многих облачных инцидентов.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - aksariyat hodisa mijoz tomondagi noto'g'ri sozlama va boshqaruvdan kelib chiqadi.",
          ru: 'Верно - большинство инцидентов происходит из-за неверных настроек и управления на стороне клиента.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Mijoz tomonidagi mas'uliyatga nima kiradi? (bir nechtasini tanlang)",
          ru: 'Что входит в ответственность клиента? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Kim kirishini boshqarish (identifikatsiya)', ru: 'Управление тем, кто входит (идентификация)' },
          { id: 'b', uz: "Saqlash ochiqmi-yo'qmi sozlash", ru: 'Настройка открытости хранилища' },
          { id: 'c', uz: "Ma'lumotni himoya qilish", ru: 'Защита данных' },
          { id: 'd', uz: "Fizik qurilmalarni qo'riqlash", ru: 'Охрана физического оборудования' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Identifikatsiya, sozlamalar va ma'lumot - mijozda. Fizik qurilmalar va host infratuzilmasi esa provayderda.",
          ru: 'Идентификация, настройки и данные - за клиентом. А физическое оборудование и хосты - за провайдером.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Tomonni uning vazifasi bilan moslang',
          ru: 'Соотнесите сторону с её задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Provayder', ru: 'Провайдер' }, right: { uz: 'Infratuzilmani himoya qiladi', ru: 'Защищает инфраструктуру' } },
          { id: 'p2', left: { uz: 'Mijoz', ru: 'Клиент' }, right: { uz: "Ma'lumot va sozlamalarni himoya qiladi", ru: 'Защищает данные и настройки' } },
          { id: 'p3', left: { uz: "Noto'g'ri sozlama", ru: 'Неверная настройка' }, right: { uz: "Eng ko'p uchraydigan bulut xatosi", ru: 'Самая частая облачная ошибка' } },
          { id: 'p4', left: { uz: 'Shared responsibility', ru: 'Shared responsibility' }, right: { uz: "Mas'uliyatni bo'lish", ru: 'Разделение ответственности' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Provayder infratuzilmani, mijoz ma'lumot va sozlamalarni himoya qiladi. Noto'g'ri sozlama esa eng ko'p uchraydigan xato.",
          ru: 'Провайдер защищает инфраструктуру, клиент - данные и настройки. А неверная настройка - самая частая ошибка.',
        },
      },
    ],
  },

  {
    slug: 'cloud-identity-and-access',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Kirishni boshqarish (IAM)', ru: 'Управление доступом (IAM)' },
    content: {
      uz: `## Bulutda kirishni boshqarish (IAM)

**IAM** (Identity and Access Management) - "kim nimaga kira oladi"ni boshqaradi.

**Asosiy tamoyillar:**
- **Eng kam imtiyoz** - har bir foydalanuvchi/xizmatga faqat kerakli huquq.
- **Rollar** - huquqni odamga emas, vazifaga (rolga) berish.
- **MFA** - kuchli autentifikatsiya, ayniqsa admin hisoblarda.
- **Kalitlarni boshqarish** - API kalit va parollarni kodda emas, xavfsiz saqlash (secrets).

**Xato:** root/admin hisobdan kundalik ish qilish. Uning huquqi cheksiz - buzilsa, hammasi ketadi.

> **Xavfsizlik:** bulutdagi eng katta zarba - **buzilgan identifikatsiya**. Bitta noto'g'ri ochilgan kalit yoki admin parol butun muhitni ochib qo'yadi.`,
      ru: `## Управление доступом в облаке (IAM)

**IAM** (Identity and Access Management) управляет тем, «кто к чему имеет доступ».

**Основные принципы:**
- **Наименьшие привилегии** - каждому пользователю/сервису только необходимые права.
- **Роли** - давать права не человеку, а задаче (роли).
- **MFA** - сильная аутентификация, особенно для админских учёток.
- **Управление ключами** - API-ключи и пароли хранить безопасно, не в коде (secrets).

**Ошибка:** работать с root/admin-учётки в повседневных задачах. Её права безграничны - при компрометации теряется всё.

> **Безопасность:** самый большой удар в облаке - **скомпрометированная идентификация**. Один неверно открытый ключ или админский пароль открывает всю среду.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'IAM nimani boshqaradi?',
          ru: 'Чем управляет IAM?',
        },
        options: [
          { id: 'a', uz: 'Kim nimaga kira olishini', ru: 'Кто к чему имеет доступ' },
          { id: 'b', uz: 'Internet tezligini', ru: 'Скорость интернета' },
          { id: 'c', uz: 'Fayl rangini', ru: 'Цвет файлов' },
          { id: 'd', uz: 'Ekran yorqinligini', ru: 'Яркость экрана' },
        ],
        answer: 'a',
        explain: {
          uz: 'IAM (Identity and Access Management) - identifikatsiya va huquqlarni boshqaradi.',
          ru: 'IAM (Identity and Access Management) управляет идентификацией и правами.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Admin hisobdan kundalik ishlarni qilish xavfsizroq, chunki u kuchli.",
          ru: 'Работать с админской учётки в повседневных задачах безопаснее, потому что она сильная.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - admin huquqi cheksiz, buzilsa zarar katta. Kundalik ish uchun eng kam imtiyozli hisob ishlatiladi.",
          ru: 'Нет - у админа безграничные права, и при компрометации ущерб велик. Для повседневных задач используют учётку с наименьшими привилегиями.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'IAM tamoyillariga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в принципы IAM? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Eng kam imtiyoz', ru: 'Наименьшие привилегии' },
          { id: 'b', uz: 'Rollar orqali huquq berish', ru: 'Выдача прав через роли' },
          { id: 'c', uz: 'MFA', ru: 'MFA' },
          { id: 'd', uz: 'Hamma parolni bitta admin ostida saqlash', ru: 'Хранить все пароли под одним админом' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Eng kam imtiyoz, rollar va MFA himoyani kuchaytiradi. Bitta 'super admin' esa bitta nuqta xatosi.",
          ru: 'Наименьшие привилегии, роли и MFA усиливают защиту. А один «супер-админ» - это единая точка отказа.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Atamani vazifasi bilan moslang',
          ru: 'Соотнесите термин с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'IAM', ru: 'IAM' }, right: { uz: 'Kirishni boshqarish tizimi', ru: 'Система управления доступом' } },
          { id: 'p2', left: { uz: 'Eng kam imtiyoz', ru: 'Наименьшие привилегии' }, right: { uz: 'Faqat kerakli huquq', ru: 'Только необходимые права' } },
          { id: 'p3', left: { uz: 'MFA', ru: 'MFA' }, right: { uz: 'Ikkinchi omil bilan tasdiqlash', ru: 'Подтверждение вторым фактором' } },
          { id: 'p4', left: { uz: 'Secrets', ru: 'Secrets' }, right: { uz: "Kalit va parolni xavfsiz saqlash", ru: 'Безопасное хранение ключей и паролей' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "IAM kirishni boshqaradi, eng kam imtiyoz huquqni cheklaydi, MFA ikkinchi omil qo'shadi, secrets esa kalitlarni himoya qiladi.",
          ru: 'IAM управляет доступом, наименьшие привилегии ограничивают права, MFA добавляет второй фактор, а secrets защищает ключи.',
        },
      },
    ],
  },

  {
    slug: 'cloud-network-security',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Bulut tarmoq xavfsizligi', ru: 'Сетевая безопасность в облаке' },
    content: {
      uz: `## Bulut tarmoq xavfsizligi

Bulutda tarmoq **virtual** - dasturiy ta'minot bilan sozlanadi.

**Tushunchalar:**
- **Virtual tarmoq (VPC/VNet)** - sizga tegishli ajratilgan tarmoq.
- **Public va private subnet** - tashqi dunyoga ochiq va faqat ichki qism.
- **Security group / firewall** - kirish-chiqish qoidalari (kim, qaysi portga).
- **Segmentatsiya** - kritik resurslarni alohida ajratish.

**Xato:** keraksiz portni \`0.0.0.0/0\` (butun internet) ga ochib qo'yish. Masalan, boshqaruv porti hammani qabul qiladi.

> **Xavfsizlik:** "hammasini blokla, keraklisini och" - bulutda ham asosiy qoida. Ochiq qolgan bitta port ko'p hodisaga sabab bo'ladi.`,
      ru: `## Сетевая безопасность в облаке

В облаке сеть **виртуальная** - настраивается программно.

**Понятия:**
- **Виртуальная сеть (VPC/VNet)** - выделенная сеть, принадлежащая вам.
- **Public и private subnet** - открытая наружу часть и только внутренняя.
- **Security group / firewall** - правила входа-выхода (кому и на какой порт).
- **Сегментация** - выделение критичных ресурсов отдельно.

**Ошибка:** открыть лишний порт на \`0.0.0.0/0\` (весь интернет). Например, порт управления начинает принимать всех.

> **Безопасность:** «блокировать всё, открывать нужное» - главное правило и в облаке. Один оставшийся открытым порт становится причиной многих инцидентов.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Bulutda '0.0.0.0/0' nimani anglatadi?",
          ru: 'Что означает «0.0.0.0/0» в облаке?',
        },
        options: [
          { id: 'a', uz: 'Butun internetdan kirish mumkin', ru: 'Доступ из всего интернета' },
          { id: 'b', uz: 'Faqat lokal tarmoq', ru: 'Только локальная сеть' },
          { id: 'c', uz: 'Faqat administrator', ru: 'Только администратор' },
          { id: 'd', uz: 'Hech kim', ru: 'Никто' },
        ],
        answer: 'a',
        explain: {
          uz: "0.0.0.0/0 - barcha manzillar, ya'ni butun internet. Boshqaruv portini bunga ochish katta xavf.",
          ru: '0.0.0.0/0 - все адреса, то есть весь интернет. Открывать на это порт управления - большой риск.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Private subnet faqat ichki tarmoqdan kirishga mo'ljallangan.",
          ru: 'Private subnet предназначен для доступа только из внутренней сети.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - private subnet tashqi dunyoga to'g'ridan-to'g'ri ochilmaydi; kritik resurslar shu yerda saqlanadi.",
          ru: 'Верно - private subnet не открыт напрямую наружу; критичные ресурсы хранят именно там.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Bulut tarmoq himoyasiga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в сетевую защиту облака? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Security group qoidalari', ru: 'Правила security group' },
          { id: 'b', uz: 'Segmentatsiya', ru: 'Сегментация' },
          { id: 'c', uz: 'Keraksiz portlarni yopish', ru: 'Закрытие лишних портов' },
          { id: 'd', uz: "Hamma portni ochiq qoldirish", ru: 'Оставить все порты открытыми' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Qoidalar, segmentatsiya va ortiqcha portlarni yopish himoyani kuchaytiradi. Hammasini ochish esa hujum yuzasini oshiradi.",
          ru: 'Правила, сегментация и закрытие лишних портов усиливают защиту. А открытие всего увеличивает поверхность атаки.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Tushunchani mazmuni bilan moslang',
          ru: 'Соотнесите понятие со смыслом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'VPC', ru: 'VPC' }, right: { uz: 'Ajratilgan virtual tarmoq', ru: 'Выделенная виртуальная сеть' } },
          { id: 'p2', left: { uz: 'Private subnet', ru: 'Private subnet' }, right: { uz: 'Faqat ichki tarmoq', ru: 'Только внутренняя сеть' } },
          { id: 'p3', left: { uz: 'Security group', ru: 'Security group' }, right: { uz: 'Kirish-chiqish qoidalari', ru: 'Правила входа-выхода' } },
          { id: 'p4', left: { uz: '0.0.0.0/0', ru: '0.0.0.0/0' }, right: { uz: 'Butun internet', ru: 'Весь интернет' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "VPC virtual tarmoq, private subnet faqat ichki, security group qoidalar, 0.0.0.0/0 esa butun internetni bildiradi.",
          ru: 'VPC - виртуальная сеть, private subnet - только внутренняя, security group - правила, а 0.0.0.0/0 означает весь интернет.',
        },
      },
    ],
  },

  {
    slug: 'cloud-storage-security',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Bulut saqlash xavfsizligi', ru: 'Безопасность облачного хранилища' },
    content: {
      uz: `## Bulut saqlash (storage) xavfsizligi

Bulutda saqlash - **buckets / blobs** ko'rinishida. Noto'g'ri sozlansa, butun dunyo ko'radi.

**Asosiy qoidalar:**
- **Public access** - sukut bo'yicha yopiq bo'lsin. Har bir ochiq joy ongli qaror bo'lsin.
- **Eng kam imtiyoz** - kim o'qiy yoki o'chira olishini cheklash.
- **Shifrlash** - saqlashda (at rest) va uzatishda (in transit).
- **Versiyalash va nusxa** - tasodifan o'chirilgan ma'lumotni tiklash.

**Xato:** maxfiy ma'lumot (kalit, shaxsiy ma'lumot) ochiq saqlashda qolib ketishi. Bu - eng ko'p uchraydigan bulut sizib chiqishi.

> **Xavfsizlik:** saqlashni tekshirish oson va arzon: "bu joy kimga ko'rinadi?" degan savolni muntazam bering.`,
      ru: `## Безопасность облачного хранилища (storage)

В облаке хранилище существует в виде **buckets / blobs**. При неверной настройке его видит весь мир.

**Основные правила:**
- **Public access** - по умолчанию должно быть закрыто. Каждое открытие - осознанное решение.
- **Наименьшие привилегии** - ограничить, кто может читать или удалять.
- **Шифрование** - при хранении (at rest) и при передаче (in transit).
- **Версионирование и копии** - восстановление случайно удалённых данных.

**Ошибка:** секретные данные (ключи, персональные данные) остаются в открытом хранилище. Это - самая частая облачная утечка.

> **Безопасность:** проверять хранилище просто и дешёво: регулярно задавайте вопрос «кто это видит?».`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Bulut saqlashdagi eng ko'p uchraydigan sizib chiqish sababi nima?",
          ru: 'Какова самая частая причина утечки в облачном хранилище?',
        },
        options: [
          { id: 'a', uz: "Ochiq (public) qolib ketgan saqlash", ru: 'Открытое (public) хранилище' },
          { id: 'b', uz: "Juda ko'p shifrlash", ru: 'Слишком много шифрования' },
          { id: 'c', uz: 'Kuchli parol', ru: 'Надёжный пароль' },
          { id: 'd', uz: 'Segmentatsiya', ru: 'Сегментация' },
        ],
        answer: 'a',
        explain: {
          uz: "Ochiq bucket - eng ko'p uchraydigan bulut sizib chiqishi. Ma'lumot hammaga ko'rinib qoladi.",
          ru: 'Открытый bucket - самая частая облачная утечка. Данные становятся видны всем.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Bulut saqlash sukut (default) holatida ochiq bo'lishi kerak - qulaylik uchun.",
          ru: 'Облачное хранилище по умолчанию должно быть открытым - ради удобства.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - sukut bo'yicha yopiq bo'lishi kerak. Har bir ochiq joy ongli va asoslangan qaror bo'lsin.",
          ru: 'Нет - по умолчанию оно должно быть закрыто. Каждое открытие - осознанное и обоснованное решение.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Bulut saqlashni himoya qilishga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в защиту облачного хранилища? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Shifrlash (at rest va in transit)', ru: 'Шифрование (at rest и in transit)' },
          { id: 'b', uz: 'Eng kam imtiyoz', ru: 'Наименьшие привилегии' },
          { id: 'c', uz: 'Versiyalash va nusxa', ru: 'Версионирование и копии' },
          { id: 'd', uz: 'Hamma faylni ochiq qilish', ru: 'Сделать все файлы открытыми' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Shifrlash, eng kam imtiyoz va nusxa himoyani kuchaytiradi. Hamma faylni ochish esa sizib chiqishga olib keladi.",
          ru: 'Шифрование, наименьшие привилегии и копии усиливают защиту. А открытие всех файлов ведёт к утечке.',
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
          { id: 'p1', left: { uz: 'At rest', ru: 'At rest' }, right: { uz: 'Saqlashda shifrlash', ru: 'Шифрование при хранении' } },
          { id: 'p2', left: { uz: 'In transit', ru: 'In transit' }, right: { uz: 'Uzatishda shifrlash', ru: 'Шифрование при передаче' } },
          { id: 'p3', left: { uz: 'Public bucket', ru: 'Public bucket' }, right: { uz: 'Hammaga ochiq saqlash', ru: 'Хранилище, открытое всем' } },
          { id: 'p4', left: { uz: 'Eng kam imtiyoz', ru: 'Наименьшие привилегии' }, right: { uz: 'Faqat kerakli kirish', ru: 'Только необходимый доступ' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "At rest va in transit shifrlashning ikki holati, public bucket - ochiq saqlash, eng kam imtiyoz esa kirishni cheklaydi.",
          ru: 'At rest и in transit - два состояния шифрования, public bucket - открытое хранилище, а наименьшие привилегии ограничивают доступ.',
        },
      },
    ],
  },

  {
    slug: 'cloud-monitoring-and-hardening',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Kuzatish va mustahkamlash', ru: 'Мониторинг и укрепление' },
    content: {
      uz: `## Bulutda kuzatish va mustahkamlash

**Kuzatish:**
- **Audit log** - bulutda kim nima qilgani (kim resurs yaratdi yoki o'chirdi).
- **Config monitoring** - sozlama o'zgarganini payqash.
- **Anomaliya** - kutilmagan joydan kirish yoki resurs sarfi.

**Mustahkamlash:**
- Yamoqlar va yangilangan obrazlar (image) ishlatish.
- Standart sozlamani o'zgartirish (standart parol, ochiq port).
- Keraksiz resurslarni o'chirish - ishlatilmaydigan narsa xavf manbai.

**Xato:** audit logni yoqmaslik. Hodisa bo'lganda "kim qildi?" degan savolga javob bo'lmaydi.

> **Xavfsizlik:** bulut tez o'zgaradi - monitoring ham doimiy bo'lishi kerak. Bir marta sozlab, unutib qo'yish yetarli emas.`,
      ru: `## Мониторинг и укрепление в облаке

**Мониторинг:**
- **Audit log** - кто что делал в облаке (кто создал или удалил ресурс).
- **Config monitoring** - заметить изменение настройки.
- **Аномалия** - вход из неожиданного места или необычный расход ресурсов.

**Укрепление:**
- Использовать патчи и обновлённые образы (image).
- Сменить настройки по умолчанию (стандартный пароль, открытый порт).
- Удалять лишние ресурсы - неиспользуемое становится источником риска.

**Ошибка:** не включить audit log. При инциденте не будет ответа на вопрос «кто это сделал?».

> **Безопасность:** облако меняется быстро - и мониторинг должен быть постоянным. Настроить один раз и забыть недостаточно.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Audit log bulutda nima beradi?',
          ru: 'Что даёт audit log в облаке?',
        },
        options: [
          { id: 'a', uz: "Kim nima qilganini ko'rsatadi", ru: 'Показывает, кто что делал' },
          { id: 'b', uz: 'Internetni tezlashtiradi', ru: 'Ускоряет интернет' },
          { id: 'c', uz: 'Faylni siqadi', ru: 'Сжимает файлы' },
          { id: 'd', uz: 'Dizaynni yaxshilaydi', ru: 'Улучшает дизайн' },
        ],
        answer: 'a',
        explain: {
          uz: "Audit log kim resurs yaratdi yoki o'chirdi kabi harakatlarni yozadi. Hodisani tekshirish uchun asosiy vosita.",
          ru: 'Audit log фиксирует действия: кто создал или удалил ресурс. Это основной инструмент расследования инцидента.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Bulut sozlamalarini bir marta to'g'rilab, keyin tekshirmasa ham bo'ladi.",
          ru: 'Настроив облако один раз, дальше проверять не нужно.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - bulut doim o'zgaradi. Yangi resurs va yangi sozlama yangi xavf olib keladi; monitoring doimiy bo'lishi kerak.",
          ru: 'Нет - облако постоянно меняется. Новый ресурс и новая настройка несут новый риск; мониторинг должен быть постоянным.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Bulutda mustahkamlashga nima kiradi? (bir nechtasini tanlang)',
          ru: 'Что входит в укрепление облака? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Yamoqlar va yangilangan obrazlar', ru: 'Патчи и обновлённые образы' },
          { id: 'b', uz: "Standart sozlamani o'zgartirish", ru: 'Смена настроек по умолчанию' },
          { id: 'c', uz: "Keraksiz resurslarni o'chirish", ru: 'Удаление лишних ресурсов' },
          { id: 'd', uz: "Audit logni o'chirib qo'yish", ru: 'Отключить audit log' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Yamaqlar, sozlamalarni almashtirish va keraksizni o'chirish hujum yuzasini kamaytiradi. Audit logni o'chirish esa tekshiruvni yo'q qiladi.",
          ru: 'Патчи, смена настроек и удаление лишнего уменьшают поверхность атаки. А отключение audit log уничтожает возможность расследования.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Vositani vazifasi bilan moslang',
          ru: 'Соотнесите средство с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Audit log', ru: 'Audit log' }, right: { uz: 'Kim nima qilgani', ru: 'Кто что делал' } },
          { id: 'p2', left: { uz: 'Config monitoring', ru: 'Config monitoring' }, right: { uz: "Sozlama o'zgarishini payqash", ru: 'Заметить изменение настройки' } },
          { id: 'p3', left: { uz: 'Anomaliya', ru: 'Аномалия' }, right: { uz: 'Kutilmagan harakat', ru: 'Неожиданное действие' } },
          { id: 'p4', left: { uz: 'Keraksiz resurs', ru: 'Лишний ресурс' }, right: { uz: "O'chirilishi kerak", ru: 'Следует удалить' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Audit log harakatlarni yozadi, config monitoring o'zgarishni payqaydi, anomaliya kutilmagan hodisa, keraksiz resurs esa o'chirilishi kerak.",
          ru: 'Audit log фиксирует действия, config monitoring замечает изменения, аномалия - неожиданное событие, а лишний ресурс нужно удалить.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-cloud-security',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Bulut nazorati', ru: 'Проверка: Облако' },
    content: {
      uz: `## 🏆 Nazorat

Bulut xavfsizligi bo'yicha bilimingizni tekshiring: xizmat modellari, mas'uliyat taqsimoti, IAM, tarmoq, saqlash va monitoring. Javobdan oldin o'ylang.`,
      ru: `## 🏆 Проверка

Проверьте знания по облачной безопасности: модели услуг, разделение ответственности, IAM, сеть, хранилище и мониторинг. Подумайте перед ответом.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Bulut xavfsizligi uchun odatda kim javobgar?',
          ru: 'Кто обычно отвечает за безопасность в облаке?',
        },
        options: [
          { id: 'a', uz: 'Provayder va mijoz birgalikda (shared responsibility)', ru: 'Провайдер и клиент вместе (shared responsibility)' },
          { id: 'b', uz: 'Faqat provayder', ru: 'Только провайдер' },
          { id: 'c', uz: 'Faqat davlat', ru: 'Только государство' },
          { id: 'd', uz: 'Hech kim', ru: 'Никто' },
        ],
        answer: 'a',
        explain: {
          uz: "Mas'uliyat bo'linadi: provayder infratuzilma, mijoz ma'lumot va sozlama uchun.",
          ru: 'Ответственность делится: провайдер - за инфраструктуру, клиент - за данные и настройки.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Ochiq qolib ketgan saqlash (bucket) keng tarqalgan bulut sizib chiqishidir.",
          ru: 'Оставшееся открытым хранилище (bucket) - распространённая облачная утечка.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - public bucket eng ko'p uchraydigan sabablardan. Sukut bo'yicha yopiq bo'lishi kerak.",
          ru: 'Верно - public bucket одна из самых частых причин. По умолчанию он должен быть закрыт.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Bulutni himoyalashga nima yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает защитить облако? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Eng kam imtiyoz va MFA', ru: 'Наименьшие привилегии и MFA' },
          { id: 'b', uz: 'Audit log va monitoring', ru: 'Audit log и мониторинг' },
          { id: 'c', uz: 'Shifrlash', ru: 'Шифрование' },
          { id: 'd', uz: "Hamma portni ochiq qoldirish", ru: 'Оставить все порты открытыми' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Eng kam imtiyoz, monitoring va shifrlash himoyani kuchaytiradi. Hamma portni ochish esa hujum yuzasini oshiradi.",
          ru: 'Наименьшие привилегии, мониторинг и шифрование усиливают защиту. А открытые порты увеличивают поверхность атаки.',
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
          { id: 'p1', left: { uz: 'IAM', ru: 'IAM' }, right: { uz: 'Kirishni boshqaradi', ru: 'Управляет доступом' } },
          { id: 'p2', left: { uz: 'Security group', ru: 'Security group' }, right: { uz: 'Tarmoq qoidalari', ru: 'Сетевые правила' } },
          { id: 'p3', left: { uz: 'Shifrlash', ru: 'Шифрование' }, right: { uz: "Ma'lumotni o'qib bo'lmaydigan qiladi", ru: 'Делает данные нечитаемыми' } },
          { id: 'p4', left: { uz: 'Audit log', ru: 'Audit log' }, right: { uz: 'Harakatlar tarixi', ru: 'История действий' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "IAM kirishni, security group tarmoqni, shifrlash ma'lumotni himoya qiladi, audit log esa harakatlar tarixini saqlaydi.",
          ru: 'IAM защищает доступ, security group - сеть, шифрование - данные, а audit log хранит историю действий.',
        },
      },
      {
        id: 'e5',
        type: 'order',
        q: {
          uz: 'Bulut resursini xavfsiz ishga tushirish tartibini belgilang',
          ru: 'Расставьте порядок безопасного запуска облачного ресурса',
        },
        items: [
          { id: 'i1', uz: 'Eng kam imtiyozli rol yaratish', ru: 'Создать роль с наименьшими привилегиями' },
          { id: 'i2', uz: 'Saqlash va tarmoqni yopiq (private) sozlash', ru: 'Настроить хранилище и сеть как закрытые (private)' },
          { id: 'i3', uz: 'Faqat kerakli portlarni ochish', ru: 'Открыть только нужные порты' },
          { id: 'i4', uz: 'Audit log va monitoringni yoqish', ru: 'Включить audit log и мониторинг' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Avval huquq cheklanadi, keyin yopiq sozlanadi, faqat kerakli ochiladi va nihoyat kuzatuv yoqiladi - shunda resurs boshidan xavfsiz boshlanadi.",
          ru: 'Сначала ограничивают права, затем настраивают закрыто, открывают только нужное и включают наблюдение - так ресурс безопасен с самого начала.',
        },
      },
    ],
  },
];
