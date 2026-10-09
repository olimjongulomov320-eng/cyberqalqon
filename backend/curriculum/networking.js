/**
 * Curriculum — Cybersecurity path › Domain 2: Networking
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
    slug: 'intro-to-networking',
    kind: 'lesson',
    xp_reward: 15,
    title: { uz: 'Tarmoqlarga kirish', ru: 'Введение в сети' },
    content: {
      uz: `## Tarmoqlarga kirish

**Tarmoq** — bir-biriga ulangan va ma'lumot almashadigan qurilmalar to'plami. Kompyuter, telefon, printer — hammasi tarmoqda bo'lishi mumkin.

- **LAN** — kichik hudud: uy, ofis, maktab. Tez va arzon.
- **WAN** — katta masofa: shaharlar, mamlakatlar. Butun internet ham WAN sanaladi.

Ulashning ikki shakli:
- **Client-Server** — barcha so'rovlar markaziy serverga boradi.
- **P2P (peer-to-peer)** — har bir qurilma ham server, ham klient bo'ladi.

> **Nega xavfsizlikka aloqadori?** Qurilmalar qancha ko'p ulansa, hujum yo'llari ham shuncha ko'p ochiladi. Bir zaif qurilma butun tarmoqni xavf ostida qoldirishi mumkin.`,
      ru: `## Введение в сети

**Сеть** — это набор устройств, соединённых между собой и обменивающихся данными. Компьютер, телефон, принтер — всё может быть частью сети.

- **LAN** — маленькая зона: дом, офис, школа. Быстро и недорого.
- **WAN** — большие расстояния: города, страны. Весь интернет тоже считается WAN.

Два способа организации:
- **Клиент-сервер** — все запросы идут к центральному серверу.
- **P2P (одноранговый)** — каждое устройство одновременно и сервер, и клиент.

> **Почему это важно для безопасности:** чем больше устройств соединено, тем больше путей для атаки. Одно слабое устройство может поставить под угрозу всю сеть.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Ofis ichidagi 20 ta kompyuter va bitta printer bir-biri bilan ulangan. Bu qaysi tarmoq turi (hajmi bo'yicha)?",
          ru: '20 компьютеров и один принтер в офисе соединены между собой. Это какой тип сети (по размеру)?',
        },
        options: [
          { id: 'a', uz: 'LAN (lokal tarmoq)', ru: 'LAN (локальная сеть)' },
          { id: 'b', uz: 'WAN (katta masofali tarmoq)', ru: 'WAN (сеть большой дальности)' },
          { id: 'c', uz: "P2P (tengdoshlar tarmoqi)", ru: 'P2P (одноранговая сеть)' },
          { id: 'd', uz: 'VPN (shifrlangan tunnel)', ru: 'VPN (зашифрованный туннель)' },
        ],
        answer: 'a',
        explain: {
          uz: "LAN — kichik hudud (uy, ofis, maktab) ichidagi tarmoq. WAN shaharlar va mamlakatlar bo'ylab uzaydi, P2P esa ulanish usuli, VPN — shifrlash yo'li: ular hajm turi emas.",
          ru: 'LAN — сеть в пределах малой зоны (дом, офис, школа). WAN охватывает города и страны, P2P — способ объединения, VPN — способ шифрования: это не размер сети.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: 'P2P tarmoqda har bir qurilma ham ma\'lumot beradi, ham qabul qiladi.',
          ru: 'В P2P-сети каждое устройство и раздаёт данные, и принимает их.',
        },
        answer: 'true',
        explain: {
          uz: "Ha — P2P da markaziy server yo'q: har bir ishtirokchi (peer) o'zi ham server, ham klient bo'ladi. Shuning uchun torrentlarda fayllar boshqa foydalanuvchilardan yuklab olinadi.",
          ru: 'Верно — в P2P центрального сервера нет: каждый участник (peer) одновременно сервер и клиент. Поэтому в торрентах файлы скачиваются с других пользователей.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: 'Tarmoq turini uning tavsifiga moslang',
          ru: 'Соотнесите тип сети с его описанием',
        },
        pairs: [
          { id: 'p1', left: { uz: 'LAN', ru: 'LAN' }, right: { uz: "Kichik hudud: uy, ofis, maktab", ru: 'Малая зона: дом, офис, школа' } },
          { id: 'p2', left: { uz: 'WAN', ru: 'WAN' }, right: { uz: "Katta masofa: butun internet", ru: 'Большие расстояния: весь интернет' } },
          { id: 'p3', left: { uz: 'P2P', ru: 'P2P' }, right: { uz: "Markaziy server yo'q, qurilmalar to'g'ridan-to'g'ri", ru: 'Без центрального сервера, устройства напрямую' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: "LAN — kichik hudud, WAN — katta masofa, P2P esa server'siz tengdoshlar ulanishi. Har birining roli boshqacha.",
          ru: 'LAN — маленькая зона, WAN — большие расстояния, P2P — прямое соединение пиров без сервера.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "Butun dunyoni qamrab olgan katta masofali tarmoq qisqartmasi: ______ (3 harfli lotincha)",
          ru: 'Сеть большой дальности, охватывающая весь мир: ______ (сокращение из трёх латинских букв)',
        },
        answer: 'wan',
        accepted: ['wan'],
        explain: {
          uz: 'WAN — Wide Area Network. Internet aynan shunday tarmoq: u shaharlar va mamlakatlarni bo\'ylab uzaydi.',
          ru: 'WAN — Wide Area Network (сеть большой дальности). Интернет — как раз такая сеть: она охватывает города и страны.',
        },
      },
    ],
  },

  {
    slug: 'ip-addresses',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'IP manzillar', ru: 'IP-адреса' },
    content: {
      uz: `## IP manzillar

**IP manzil** — tarmoqdagi har bir qurilmaning noyob raqamli manzili. U pochta kodidek ishlaydi: paket faqat to'g'ri qurilmaga yetib boradi.

IPv4 — 4 ta son, nuqta bilan ajratilgan (har biri 0–255): **192.168.1.10**

| Tur | Misol | Qayerda ishlaydi |
|---|---|---|
| **Ichki (private)** | **10.x.x.x**, **172.16–31.x.x**, **192.168.x.x** | Faqat lokal tarmoqda |
| **Ochiq (public)** | **8.8.8.8** | Butun internet orqali |

> **Xavfsizlik:** ichki manzillar tashqaridan ko'rinmaydi — bu tabiiy himoya. Umumiy WiFi'da esa barcha qurilmalar bir xil ichki makondan foydalanadi.`,
      ru: `## IP-адреса

**IP-адрес** — уникальный цифровой адрес каждого устройства в сети. Он работает как почтовый индекс: пакет должен дойти именно к нужному устройству.

IPv4 — четыре числа через точку (каждое от 0 до 255): **192.168.1.10**

| Тип | Пример | Где работает |
|---|---|---|
| **Внутренний (private)** | **10.x.x.x**, **172.16–31.x.x**, **192.168.x.x** | Только в локальной сети |
| **Открытый (public)** | **8.8.8.8** | По всему интернету |

> **Безопасность:** внутренние адреса не видны снаружи — это естественная защита. В общем Wi-Fi все устройства используют одну внутреннюю подсеть, поэтому такой сети не доверяют.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Quyidagi manzillardan qaysi biri ichki (private) IP manzil?',
          ru: 'Какой из этих адресов является внутренним (private) IP-адресом?',
        },
        options: [
          { id: 'a', uz: '192.168.10.25', ru: '192.168.10.25' },
          { id: 'b', uz: '8.8.8.8', ru: '8.8.8.8' },
          { id: 'c', uz: '93.184.216.34', ru: '93.184.216.34' },
          { id: 'd', uz: '203.0.113.7', ru: '203.0.113.7' },
        ],
        answer: 'a',
        explain: {
          uz: "192.168.x.x ichki blokka kiradi (10.x.x.x va 172.16–31.x.x bilan birga). Qolgan uchtasi ochiq (public) manzillar: ular internet orqali ko'rinadi va global yo'naltiriladi.",
          ru: '192.168.x.x входит во внутренний блок (как и 10.x.x.x и 172.16–31.x.x). Остальные три — публичные адреса: они видны в интернете и маршрутизируются глобально.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Tarmoqda ikkita qurilma bir xil IP manzilni egallab turishi — bu normal holat.",
          ru: 'Два устройства в сети могут спокойно использовать один и тот же IP-адрес.',
        },
        answer: 'false',
        explain: {
          uz: "IP manzil qurilma uchun noyob bo'lishi shart. Takrorlansa (IP konflikti), paketlar qaysi qurilmaga borishini tushunib bo'lmaydi va aloqa buziladi.",
          ru: 'IP-адрес должен быть уникален для устройства. При совпадении (конфликте IP) непонятно, куда доставлять пакеты, и связь ломается.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Qaysi manzillar ichki (private) bloklarga kiradi? (bir nechtasini tanlang)',
          ru: 'Какие адреса входят во внутренние (private) блоки? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: '10.1.1.1', ru: '10.1.1.1' },
          { id: 'b', uz: '172.16.0.1', ru: '172.16.0.1' },
          { id: 'c', uz: '172.32.0.1', ru: '172.32.0.1' },
          { id: 'd', uz: '192.168.100.100', ru: '192.168.100.100' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Ichki bloklar: 10.x.x.x, 172.16.x.x – 172.31.x.x va 192.168.x.x. 172.32.0.1 esa 172.31 dan tashqarida — bu ochiq (public) manzil.',
          ru: 'Внутренние блоки: 10.x.x.x, 172.16.x.x – 172.31.x.x и 192.168.x.x. Адрес 172.32.0.1 выходит за пределы 172.31 — это публичный адрес.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "IP to'liq holda qanday ikki so'zdan iborat? (inglizcha, kichik harflarda yozing)",
          ru: 'Расшифруйте IP полностью: из каких двух слов оно состоит? (по-английски, строчными буквами)',
        },
        answer: 'internet protocol',
        accepted: ['internet protocol'],
        explain: {
          uz: 'IP — Internet Protocol. Aynan shu protokol har bir qurilmaga noyob manzil beradi va paketlarni to\'g\'ri yo\'naltiradi.',
          ru: 'IP — Internet Protocol. Именно этот протокол даёт каждому устройству уникальный адрес и направляет пакеты по назначению.',
        },
      },
    ],
  },

  {
    slug: 'dns-basics',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: 'DNS asoslari', ru: 'Основы DNS' },
    content: {
      uz: `## DNS — internet telefon kitobi

google.com deb yozganimizda, aslida biz serverning IP manzilini talab qilamiz. Nomni raqamga aylantiruvchi tizim — **DNS** (Domain Name System).

Soddalashtirilgan jarayon:

1. Foydalanuvchi **maktab.uz** manzilini kiradi
2. Brauzer buni **DNS resolver** (maxsus server) ga so'raydi
3. Resolver kerakli IP manzilni topib qaytaradi
4. Brauzer shu IP manzilga ulanadi

DNS asosan **53-port**da ishlaydi.

> **Nega muhim:** agar bu javob almashtirilsa (DNS spoofing), foydalanuvchi haqiqiy sayt o'rniga haker serveriga kiradi — manzil satrini tekshirish ham yordam bermaydi.`,
      ru: `## DNS — телефонная книга интернета

Когда мы пишем google.com, на самом деле мы запрашиваем IP-адрес сервера. Систему, преобразующую имена в цифры, называют **DNS** (Domain Name System).

Упрощённый процесс:

1. Пользователь вводит адрес **maktab.uz**
2. Браузер спрашивает об этом у **DNS-резолвера** (специального сервера)
3. Резолвер находит нужный IP-адрес и возвращает его
4. Браузер подключается по этому IP-адресу

DNS в основном работает через **порт 53**.

> **Почему это важно:** если подменить ответ (DNS spoofing), пользователь попадёт не на настоящий сайт, а на сервер злоумышленника — строку адреса проверить тоже не поможет.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'DNS ning asosiy vazifasi nima?',
          ru: 'Какова основная задача DNS?',
        },
        options: [
          { id: 'a', uz: 'Sayt nomini IP manzilga aylantirish', ru: 'Преобразовывать имя сайта в IP-адрес' },
          { id: 'b', uz: 'Fayllarni shifrlash', ru: 'Шифровать файлы' },
          { id: 'c', uz: 'Parol kuchini tekshirish', ru: 'Проверять надёжность пароля' },
          { id: 'd', uz: 'Tarmoqni WiFi ga ulash', ru: 'Подключать сеть к Wi-Fi' },
        ],
        answer: 'a',
        explain: {
          uz: "DNS — internet manzillari daftari: u inson o'qiydigan nomni (google.com) mashina uchun kerak bo'lgan IP manzilga aylantiradi. Shifrlash va parollar boshqa vazifalar.",
          ru: 'DNS — телефонная книга интернета: он превращает читаемое человеком имя (google.com) в нужный машине IP-адрес. Шифрование и пароли — другие задачи.',
        },
      },
      {
        id: 'e2',
        type: 'order',
        q: {
          uz: "Foydalanuvchi sayt ochish jarayonini to'g'ri tartibda joylang",
          ru: 'Расставьте этапы открытия сайта в правильном порядке',
        },
        items: [
          { id: 'i1', uz: "Brauzer domenni DNS resolverga so'raydi", ru: 'Браузер запрашивает домен у DNS-резолвера' },
          { id: 'i2', uz: 'Resolver kerakli IP manzilni topadi', ru: 'Резолвер находит нужный IP-адрес' },
          { id: 'i3', uz: 'Resolver bu IP manzilni brauzerga qaytaradi', ru: 'Резолвер возвращает IP-адрес браузеру' },
          { id: 'i4', uz: 'Brauzer shu IP manzilga ulanadi', ru: 'Браузер подключается по этому IP-адресу' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Avval so'rov (resolverga), keyin izlash, so'ng javob qaytish va nihoyat ulanish — DNS shu ketma-ketlikda ishlaydi.",
          ru: 'Сначала запрос к резолверу, затем поиск, потом возврат ответа и в конце подключение — DNS работает именно так.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "DNS spoofing'da haker so'rovga noto'g'ri (soxta) IP manzil qaytarishi mumkin.",
          ru: 'При DNS spoofing злоумышленник может вернуть в ответ поддельный IP-адрес.',
        },
        answer: 'true',
        explain: {
          uz: "Ha — agar javob aldashtirilsa, foydalanuvchi haqiqiy sayt o'rniga haker serveriga kiradi. Shuning uchun muhim saytlar DNS javobini ham tekshiradi (DNSSEC).",
          ru: 'Да — если подменить ответ, пользователь попадёт на сервер злоумышленника вместо настоящего сайта. Поэтому важные сайты проверяют и ответы DNS (DNSSEC).',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: "Tushunchani uning roliga moslang",
          ru: 'Соотнесите понятие с его ролью',
        },
        pairs: [
          { id: 'p1', left: { uz: 'DNS', ru: 'DNS' }, right: { uz: 'Sayt nomini IP manzilga aylantiradi', ru: 'Преобразует имя сайта в IP-адрес' } },
          { id: 'p2', left: { uz: 'Resolver', ru: 'DNS-резолвер' }, right: { uz: "DNS so'rovini bajaruvchi server", ru: 'Сервер, выполняющий DNS-запрос' } },
          { id: 'p3', left: { uz: 'IP manzil', ru: 'IP-адрес' }, right: { uz: 'Qurilmaning raqamli manzili', ru: 'Цифровой адрес устройства' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: "DNS — tizim, resolver — uning ishchi serveri, IP manzil esa yakuniy natija: qurilmaning o'z manzili.",
          ru: 'DNS — система, резолвер — её рабочий сервер, а IP-адрес — результат: собственный адрес устройства.',
        },
      },
    ],
  },

  {
    slug: 'tcp-and-udp',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'TCP va UDP', ru: 'TCP и UDP' },
    content: {
      uz: `## TCP va UDP

Ma'lumot tarmoqda **portlar** orqali yetkaziladi — port qaysi dastur uchunligini bildiradi (80 — veb, 22 — SSH).

| | **TCP** | **UDP** |
|---|---|---|
| Ulanish | Avval aloqa quradi | To'g'ridan-to'g'ri yuboradi |
| Kafolat | Yetkazilganini tekshiradi | Kafolat yo'q, lekin tez |
| Ishlatadi | Veb, email, fayl uzatish | Video, ovoz, o'yin, DNS |

> **Eslatma:** TCP sekinroq, lekin har bir paketni hisobga oladi. UDP'da manzil soxtalashtirish (spoofing) osonroq — shuning uchun xavfsiz tizimlar ko'pincha TCP ni tanlaydi.`,
      ru: `## TCP и UDP

Данные в сети доставляются через **порты** — они показывают, для какой программы предназначен пакет (80 — веб, 22 — SSH).

| | **TCP** | **UDP** |
|---|---|---|
| Соединение | Сначала устанавливает его | Шлёт сразу, без подготовки |
| Гарантия | Проверяет доставку | Гарантий нет, зато быстро |
| Применение | Веб, почта, передача файлов | Видео, звук, игры, DNS |

> **Важно:** TCP медленнее, но контролирует каждый пакет. В UDP подменить адрес (spoofing) проще — поэтому защищённые системы чаще выбирают TCP.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Qaysi protokol avval ulanish qurib, har bir paket yetib borganini kafolaydi?',
          ru: 'Какой протокол сначала устанавливает соединение и гарантирует доставку каждого пакета?',
        },
        options: [
          { id: 'a', uz: 'TCP', ru: 'TCP' },
          { id: 'b', uz: 'UDP', ru: 'UDP' },
          { id: 'c', uz: 'HTTP', ru: 'HTTP' },
          { id: 'd', uz: 'DNS', ru: 'DNS' },
        ],
        answer: 'a',
        explain: {
          uz: "TCP — ulanishga asoslangan (connection-oriented): avval aloqa quriladi, keyin har bir paket kelgani tekshiriladi. UDP buni qilmaydi, HTTP va DNS esa TCP yoki UDP ustidagi yuqori darajadagi protokollar.",
          ru: 'TCP — протокол с установлением соединения: сначала создаётся канал, затем проверяется доставка каждого пакета. UDP этого не делает, а HTTP и DNS работают поверх TCP или UDP.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Protokol yoki tushunchani uning xususiyatiga moslang',
          ru: 'Соотнесите протокол или понятие с его признаком',
        },
        pairs: [
          { id: 'p1', left: { uz: 'TCP', ru: 'TCP' }, right: { uz: "Ulanish quradi va yetkazilganini tekshiradi", ru: 'Устанавливает соединение и проверяет доставку' } },
          { id: 'p2', left: { uz: 'UDP', ru: 'UDP' }, right: { uz: "Ulanisiz tez yuboradi, kafolat yo'q", ru: 'Шлёт без соединения: быстро, но без гарантий' } },
          { id: 'p3', left: { uz: 'Port', ru: 'Порт' }, right: { uz: "Qaysi dastur uchunligini bildiradi (masalan, 80)", ru: 'Показывает, для какой программы данные (например, 80)' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: "TCP — ishonch va tartib, UDP — tezlik, port esa paketning qaysi dasturga tegishligini ko'rsatadi.",
          ru: 'TCP — надёжность и порядок, UDP — скорость, а порт указывает, для какой программы предназначен пакет.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Qaysi vazifalar uchun odatda TCP ishlatiladi? (bir nechtasini tanlang)',
          ru: 'Для каких задач обычно используют TCP? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Veb sahifani ochish (HTTP)', ru: 'Открытие веб-страницы (HTTP)' },
          { id: 'b', uz: "Email yuborish (SMTP)", ru: 'Отправка письма (SMTP)' },
          { id: 'c', uz: 'Jonli video uzatish', ru: 'Трансляция видео в реальном времени' },
          { id: 'd', uz: 'Fayl uzatish (FTP)', ru: 'Передача файлов (FTP)' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: "Veb, email va fayl uzatishda har bir bayt yetib borishi shart — bu TCP vazifasi. Jonli videoda kechikish muhimroq: bir necha kadrs yo'qolsa ham ko'rinmaydi, shuning uchun u yerda UDP ishlatiladi.",
          ru: 'Для веба, почты и передачи файлов важна доставка каждого байта — это задача TCP. В живом видео важнее задержка: потерянный кадр незаметен, поэтому берут UDP.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "TCP qisqartmasidagi 'C' harfi qaysi so'zni bildiradi? (bitta inglizcha so'z)",
          ru: 'Буква «C» в сокращении TCP — это какое английское слово? (одно слово)',
        },
        answer: 'connection',
        accepted: ['connection'],
        explain: {
          uz: 'C — connection (ulanish). TCP avval connection quradi, shuning uchun uni connection-oriented deyiladi.',
          ru: 'C — connection (соединение). TCP сначала устанавливает соединение, поэтому его называют connection-oriented.',
        },
      },
    ],
  },

  {
    slug: 'http-and-https',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'HTTP va HTTPS', ru: 'HTTP и HTTPS' },
    content: {
      uz: `## HTTP va HTTPS

Brauzer va server **HTTP** protokoli orqali gaplashadi. **HTTPS** — shu protokolning shifrlangan ko'rinishi.

| | HTTP | HTTPS |
|---|---|---|
| **Port** | 80 | 443 |
| **Shifrlash** | Yo'q | TLS orqali |
| **Himoya** | Matn ochiq yuradi | Parol ham himoyalangan |

**TLS** — ma'lumotni o'g'irlar ko'ra olmasligi uchun shifrlaydigan protokol (sahifadagi qulf belgisi).

Methodlar: **GET** — serverdan ma'lumot SO'RAYDI, **POST** — serverga ma'lumot YUBORADI.
Kodlar: **200** — joyida, **404** — topilmadi, **500** — serverda xato.`,
      ru: `## HTTP и HTTPS

Браузер и сервер общаются по протоколу **HTTP**. **HTTPS** — это тот же протокол, но в зашифрованном виде.

| | HTTP | HTTPS |
|---|---|---|
| **Порт** | 80 | 443 |
| **Шифрование** | Нет | Через **TLS** |
| **Защита** | Текст идёт открыто | Защищены даже пароли |

**TLS** — протокол, который шифрует данные, чтобы посторонние их не прочитали (значок замка в адресной строке).

Методы: **GET** — ЗАПРАШИВАЕТ данные у сервера, **POST** — ОТПРАВЛЯЕТ данные на сервер.
Коды: **200** — всё хорошо, **404** — страница не найдена, **500** — ошибка на сервере.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'HTTPS qaysi portda ishlaydi?',
          ru: 'На каком порту работает HTTPS?',
        },
        options: [
          { id: 'a', uz: '80', ru: '80' },
          { id: 'b', uz: '443', ru: '443' },
          { id: 'c', uz: '53', ru: '53' },
          { id: 'd', uz: '22', ru: '22' },
        ],
        answer: 'b',
        explain: {
          uz: 'HTTPS 443-portda, oddiy HTTP esa 80-portda ishlaydi. 53 — DNS, 22 — SSH. Portni bilish firewall qoidasi yozishda ham kerak bo\'ladi.',
          ru: 'HTTPS работает на 443, обычный HTTP — на 80. 53 — DNS, 22 — SSH. Порт нужен и при написании правил файрвола.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "HTTP orqali yuborilgan parol matni ochiq ko'rinishda, hech qanday shifrlashsiz yuradi.",
          ru: 'Пароль, отправленный по HTTP, передаётся открытым текстом, без шифрования.',
        },
        answer: 'true',
        explain: {
          uz: "Ha — HTTP shifrlamaydi: har qanday oraliq tarmoqda turgan odam (masalan, ochiq WiFi'da) trafikni o'qishi mumkin. Shuning uchun parolni faqat HTTPS orqali yuborish kerak.",
          ru: 'Да — HTTP не шифрует: любой посредник (например, в открытом Wi-Fi) сможет прочитать трафик. Поэтому пароли отправляют только по HTTPS.',
        },
      },
      {
        id: 'e3',
        type: 'match',
        q: {
          uz: "HTTP javob kodini uning ma'nosiga moslang",
          ru: 'Соотнесите HTTP-код ответа с его значением',
        },
        pairs: [
          { id: 'p1', left: { uz: '200', ru: '200' }, right: { uz: "So'rov muvaffaqiyatli bajarildi", ru: 'Запрос успешно выполнен' } },
          { id: 'p2', left: { uz: '404', ru: '404' }, right: { uz: 'Sahifa topilmadi', ru: 'Страница не найдена' } },
          { id: 'p3', left: { uz: '500', ru: '500' }, right: { uz: 'Serverda kutilmagan xato', ru: 'Внутренняя ошибка сервера' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: "2xx — muvaffaqiyat, 4xx — xato foydalanuvchi tomonida (masalan, yo'q sahifa), 5xx — xato server tomonida. Bu raqamlarni loglarda ko'p ko'rasiz.",
          ru: '2xx — успех, 4xx — ошибка на стороне пользователя (например, несуществующая страница), 5xx — ошибка на стороне сервера. Эти коды часто видно в логах.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "Serverga ma'lumot yuborish uchun ishlatiladigan HTTP method nomini yozing (katta-kichik farqsiz).",
          ru: 'Напишите название HTTP-метода, которым данные отправляются на сервер (регистр не важен).',
        },
        answer: 'post',
        accepted: ['post', 'post request'],
        explain: {
          uz: "POST — serverga ma'lumot yuboradi (parol, ro'yxatdan o'tish formasi). GET esa serverdan ma'lumot SO'RAYDI va faqat o'qish uchun ishlatiladi.",
          ru: 'POST отправляет данные на сервер (пароль, форма регистрации). GET запрашивает данные у сервера и используется только для чтения.',
        },
      },
    ],
  },

  {
    slug: 'what-is-a-firewall',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Firewall nima?', ru: 'Что такое файрвол?' },
    content: {
      uz: `## Firewall — tarmoq darvozasi

**Firewall** — tarmoq trafigini qoidalar bo'yicha filtrlaydigan vosita: ruxsat etilganini o'tkazadi, qolganini bloklaydi.

| Tur | Nima tekshiradi |
|---|---|
| **Packet filtering** | Har bir paketning manzil va portini (yakka-yakka) |
| **Stateful** | Ulanish holatini eslab qoladi — butun suhbatni kuzatadi |
| **WAF** | Veb-so'rovlarni: SQL injection, XSS kabi hujumlar |

Qoidalar oddiy jumlada yoziladi. Masalan: **ALLOW tcp out to port 443** — chiqishga faqat 443 ochiq.

> **Eslatma:** firewall — himoyaning faqat bitta qatlami. Uni ham muntazam yangilab turish kerak.`,
      ru: `## Файрвол — шлюз сети

**Файрвол** — средство, фильтрующее сетевой трафик по правилам: разрешённое пропускает, остальное блокирует.

| Тип | Что проверяет |
|---|---|
| **Packet filtering** | адрес и порт каждого пакета по отдельности |
| **Stateful** | помнит состояние соединения — следит за всем разговором |
| **WAF** | запросы к сайту: SQL-инъекции, XSS и похожие атаки |

Правила пишутся простым языком. Например: **ALLOW tcp out to port 443** — наружу открыт только 443.

> **Важно:** файрвол — лишь один слой защиты. Его тоже нужно регулярно обновлять и не выключать.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Firewall ning asosiy vazifasi nima?',
          ru: 'Какова основная задача файрвола?',
        },
        options: [
          { id: 'a', uz: 'Tarmoq trafikini qoidalar bo\'yicha filtrlash', ru: 'Фильтровать сетевой трафик по правилам' },
          { id: 'b', uz: 'Kompyuterni tezlashtirish', ru: 'Ускорять компьютер' },
          { id: 'c', uz: 'Fayllarni zaxiralash', ru: 'Создавать резервные копии файлов' },
          { id: 'd', uz: "Wi-Fi parolini kuchli qilish", ru: 'Делать пароль Wi-Fi надёжнее' },
        ],
        answer: 'a',
        explain: {
          uz: "Firewall — darvozabon: u paketlarni qoida bo'yicha tekshirib, ruxsat etilganini o'tkazadi, qolganini to'xtatadi. Tezlashtirish, backup va parollar boshqa vositalarning ishi.",
          ru: 'Файрвол — «сторож»: он проверяет пакеты по правилам, пропускает разрешённые и останавливает остальные. Ускорение, бэкапы и пароли — задачи других средств.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Firewall turini uning tekshiruviga moslang',
          ru: 'Соотнесите тип файрвола с тем, что он проверяет',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Packet filtering', ru: 'Packet filtering' }, right: { uz: 'Yakka paketning manzil va portini', ru: 'Адрес и порт каждого пакета по отдельности' } },
          { id: 'p2', left: { uz: 'Stateful', ru: 'Stateful' }, right: { uz: 'Ulanish holatini — butun suhbatni eslab qoladi', ru: 'Состояние соединения — помнит весь разговор' } },
          { id: 'p3', left: { uz: 'WAF', ru: 'WAF' }, right: { uz: "Veb-so'rovlarni: SQL injection, XSS kabi hujumlar", ru: 'Веб-запросы: SQL-инъекции, XSS и похожие атаки' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: "Packet filtering har bir paketni alohida ko'radi, stateful suhbat tarixini eslab qoladi, WAF esa veb-trafikni tushunadi va saytga qilingan hujumlarni ushlaydi.",
          ru: 'Packet filtering смотрит каждый пакет отдельно, stateful помнит историю соединения, а WAF разбирается в веб-трафике и ловит атаки на сайт.',
        },
      },
      {
        id: 'e3',
        type: 'mc',
        code: 'DENY tcp in from any to port 23',
        q: {
          uz: 'Quyidagi firewall qoidasi qanday natija beradi?',
          ru: 'Какой результат даёт следующее правило файрвола?',
        },
        options: [
          { id: 'a', uz: 'Tashqaridan 23-portga kirishga urinishlar bloklanadi', ru: 'Входящие попытки подключиться к порту 23 блокируются' },
          { id: 'b', uz: '443-portdan chiqish yopiladi', ru: 'Исходящий трафик на порт 443 закрывается' },
          { id: 'c', uz: 'Faqat ichki tarmoq uzilib qoladi', ru: 'Отключается только внутренняя сеть' },
          { id: 'd', uz: "Hech qanday ta'sir ko'rsatmaydi", ru: 'Не оказывает никакого эффекта' },
        ],
        answer: 'a',
        explain: {
          uz: "'in' — kirish (inbound) trafik, 'to port 23' — 23-port (eski va xavfsiz bo'lmagan telnet), 'from any' — istalgan manzildan. Demak, qoida tashqaridan kelgan telnet kirishini yopadi — bu to'g'ri himoya qoidasi.",
          ru: "«in» — входящий трафик, «to port 23» — порт 23 (устаревший небезопасный telnet), «from any» — с любого адреса. Значит, правило закрывает входящий telnet извне — это правильная защита.",
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: 'WAF qaysi hujumlarga qarshi himoya qiladi? (bir nechtasini tanlang)',
          ru: 'От каких атак защищает WAF? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'SQL injection', ru: 'SQL-инъекция' },
          { id: 'b', uz: "XSS (skript qo'yish)", ru: 'XSS (внедрение скриптов)' },
          { id: 'c', uz: "Foydalanuvchining o'z xohishi bilan phishing saytiga kirishi", ru: 'Самостоятельный переход пользователя на фишинговый сайт' },
          { id: 'd', uz: 'Kompaniya WiFi tarmoqini himoya qilish', ru: 'Защита корпоративной Wi-Fi сети' },
        ],
        answers: ['a', 'b'],
        explain: {
          uz: "WAF veb-sahifaga kelgan so'rovlarni tekshiradi: SQL injection va XSS ni shu yerda ushlaydi. Phishing'da foydalanuvchi o'zi noto'g'ri saytga kiradi — buni o'z saytingizdagi WAF to'xtata olmaydi. WiFi himoyasi esa boshqa qatlam — firewall va access point vazifasi.",
          ru: 'WAF проверяет запросы, приходящие на сайт, — именно он ловит SQL-инъекции и XSS. При фишинге пользователь сам заходит на чужой сайт — это не остановить его же сервером. А защита Wi-Fi — другой уровень: задача файрвола и точки доступа.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-networking',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Tarmoqlar nazorati', ru: 'Проверка: Сети' },
    content: {
      uz: `## 🏆 Nazorat

Tarmoqlar bo'yicha bilimingizni tekshiring: IP manzillar, DNS, TCP/UDP, HTTP/HTTPS va firewall — hammasi birlashtirilgan.

Savollar o'tgan darslardan, biroz murakkabroq. Har birida eng to'g'ri javobni tanlang.

Omad!`,
      ru: `## 🏆 Проверка

Проверьте знания по сетям: IP-адреса, DNS, TCP/UDP, HTTP/HTTPS и файрвол — всё в одном месте.

Вопросы чуть сложнее предыдущих уроков. В каждом выберите самый верный ответ.

Удачи!`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "Ofisdagi printer faqat ichki tarmoqda ishlashi kerak. Unga qaysi manzil berish eng ma'qul?",
          ru: 'Принтер в офисе должен работать только во внутренней сети. Какой адрес ему лучше всего выдать?',
        },
        options: [
          { id: 'a', uz: '192.168.1.50', ru: '192.168.1.50' },
          { id: 'b', uz: '8.8.8.8', ru: '8.8.8.8' },
          { id: 'c', uz: '93.184.216.34', ru: '93.184.216.34' },
          { id: 'd', uz: '203.0.113.25', ru: '203.0.113.25' },
        ],
        answer: 'a',
        explain: {
          uz: "Ichki qurilmaga ichki (private) manzil beriladi — 192.168.1.50 shunga to'g'ri keladi. Qolgan uchtasi ochiq (public) manzillar: ular internetda yo'naltiriladi va lokal printer uchun noto'g'ri.",
          ru: 'Внутреннему устройству дают внутренний (private) адрес — 192.168.1.50 подходит. Остальные три публичные: они маршрутизируются в интернете и для локального принтера не годятся.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: "Xizmatni o'z portiga moslang",
          ru: 'Соотнесите службу с её портом',
        },
        pairs: [
          { id: 'p1', left: { uz: 'HTTP', ru: 'HTTP' }, right: { uz: '80', ru: '80' } },
          { id: 'p2', left: { uz: 'HTTPS', ru: 'HTTPS' }, right: { uz: '443', ru: '443' } },
          { id: 'p3', left: { uz: 'DNS', ru: 'DNS' }, right: { uz: '53', ru: '53' } },
          { id: 'p4', left: { uz: 'SSH', ru: 'SSH' }, right: { uz: '22', ru: '22' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "80 — oddiy veb, 443 — shifrlangan veb, 53 — DNS so'rovlari, 22 — masofadan boshqaruv (SSH). Bu raqamlarni firewall qoidalarida ko'p ishlatasiz.",
          ru: '80 — обычный веб, 443 — зашифрованный веб, 53 — DNS-запросы, 22 — удалённое управление (SSH). Эти номера часто встречаются в правилах файрвола.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Sayt xavfsizligini oshirish uchun qaysi choralar to\'g\'ri? (bir nechtasini tanlang)',
          ru: 'Какие меры повысят безопасность сайта? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "HTTP ni HTTPS ga o'tkazish (TLS yoqish)", ru: 'Перейти с HTTP на HTTPS (включить TLS)' },
          { id: 'b', uz: 'Firewall da keraksiz portlarni yopish', ru: 'Закрыть лишние порты в файрволе' },
          { id: 'c', uz: "DNS javobini tekshirmasdan so'z bo'yicha ishonish", ru: 'Доверять ответу DNS без проверки' },
          { id: 'd', uz: 'Barcha portlarni ochiq qoldirish', ru: 'Оставить все порты открытыми' },
        ],
        answers: ['a', 'b'],
        explain: {
          uz: "TLS trafikni shifrlaydi, firewall esa keraksiz eshiklarni yopadi — ikkalasi ham himoyani kuchaytiradi. DNS javobiga so'zsiz ishonish spoofing ga ochiq eshik, barcha portni ochiq qoldirish esa hujum maydoni yaratadi.",
          ru: 'TLS шифрует трафик, а файрвол закрывает лишние «двери» — обе меры усиливают защиту. Слепое доверие к ответу DNS открывает дорогу к подмене, а открытые все порты — готовое поле для атаки.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "Brauzer va server o'rtasidagi ma'lumotni shifrlaydigan protokol qisqartmasi: ______ (inglizcha uchta harf)",
          ru: 'Сокращение протокола, который шифрует данные между браузером и сервером: ______ (три латинские буквы)',
        },
        answer: 'tls',
        accepted: ['tls'],
        explain: {
          uz: 'TLS (Transport Layer Security) — HTTPS ishlagan shifrlash protokoli. Aynan u parol va karta raqamlarini o\'g\'irlardan himoya qiladi.',
          ru: 'TLS (Transport Layer Security) — протокол шифрования, на котором работает HTTPS. Именно он защищает пароли и номера карт.',
        },
      },
      {
        id: 'e5',
        type: 'order',
        q: {
          uz: "Sayt ochilishining to'g'ri tartibini joylang (birinchisi — birinchi qadam)",
          ru: 'Расставьте этапы открытия сайта по порядку (первый — самый первый шаг)',
        },
        items: [
          { id: 'i1', uz: "DNS dan saytning IP manzilini so'rash", ru: 'Запросить IP-адрес сайта через DNS' },
          { id: 'i2', uz: 'TCP bilan 443-portga ulanish qurish', ru: 'Установить TCP-соединение с портом 443' },
          { id: 'i3', uz: 'TLS orqali shifrlangan aloqani o\'rnatish', ru: 'Установить зашифрованное соединение через TLS' },
          { id: 'i4', uz: "HTTP so'rov yuborish va 200 kodini kutish", ru: 'Отправить HTTP-запрос и дождаться кода 200' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Avval manzil kerak (DNS), keyin trubka (TCP), so'ng shifrlash (TLS) va oxirida o'z suhbat (HTTP). HTTPS shu tartibda ishlaydi.",
          ru: 'Сначала нужен адрес (DNS), затем «труба» (TCP), потом шифрование (TLS) и в конце сам разговор (HTTP). Именно так работает HTTPS.',
        },
      },
    ],
  },
];
