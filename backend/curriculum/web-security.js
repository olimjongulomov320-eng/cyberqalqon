/**
 * Curriculum — Cybersecurity path › Domain: Web security
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
 *   - SQLi is taught strictly as a defense topic; the classic sample appears
 *     only as an illustration of what to protect against.
 *   - Exercise ids: e1..eN in delivery order.
 *   - Uzbek: simple, modern Uzbek Latin. Russian: natural, not machine-translated.
 */

module.exports = [
  {
    slug: 'what-is-sql-injection',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'SQL injection nima?', ru: 'Что такое SQL injection?' },
    content: {
      uz: `## SQL injection (SQLi)

**SQL injection** — sayt foydalanuvchi kiritgan matnni to'g'ridan-to'g'ri SQL so'roviga qo'shib yuboradi va shu matn so'rov mantiqini "buzib yuboradi".

Klassik namuna — kirish formasiga shunday matn tushadi:

\`\`\`
' OR '1'='1
\`\`\`

Mantiqiy shart doimiy ravishda to'g'ri chiqadi va kirish tekshiruvi chetlab o'tiladi.

**To'g'ri himoya — parametrlangan so'rovlar (prepared statements):** foydalanuvchi matni hech qachon koda aylanmaydi, u faqat qiymat bo'lib qoladi. Qo'shimcha qatlam — kirishni tekshirish (validation).`,
      ru: `## SQL injection (SQLi)

**SQL injection** — сайт подставляет введённый пользователем текст прямо в SQL-запрос, и пользователь может «сломать» логику запроса.

Классический пример — в поле логина появляется такой текст:

\`\`\`
' OR '1'='1
\`\`\`

Логическое условие всегда истинно, и проверка входа обходится.

**Правильная защита — параметризованные запросы (prepared statements):** текст пользователя никогда не становится кодом, он остаётся значением. Дополнительный слой — проверка ввода (validation).`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'SQL injection — bu nima?',
          ru: 'Что такое SQL injection?',
        },
        options: [
          { id: 'a', uz: 'Foydalanuvchi matni so\'rov kodiga kirib, uni "buzishi"', ru: 'Текст пользователя попадает в код запроса и «ломает» его' },
          { id: 'b', uz: 'Parollarni navbat bilan sinash', ru: 'Перебор паролей по очереди' },
          { id: 'c', uz: 'Serverni ko\'p so\'rov bilan to\'ldirish', ru: 'Заполнение сервера огромным числом запросов' },
          { id: 'd', uz: 'Sayt sertifikatini yangilash', ru: 'Обновление сертификата сайта' },
        ],
        answer: 'a',
        explain: {
          uz: 'SQLi muammosi shundaki, ma\'lumot (foydalanuvchi matni) kod ichiga kirib ketadi. Parolni taxmin qilish — brute force, ko\'p so\'rov — DoS: ular boshqa muammolar.',
          ru: 'Проблема SQLi в том, что данные (текст пользователя) попадают внутрь кода. Перебор паролей — это brute force, поток запросов — DoS: это другие проблемы.',
        },
      },
      {
        id: 'e2',
        type: 'mc',
        code: "' OR '1'='1",
        q: {
          uz: 'Bu matn kirish formasiga kiritilsa, nima bo\'ladi?',
          ru: 'Что произойдёт, если ввести этот текст в поле входа?',
        },
        options: [
          { id: 'a', uz: 'So\'rov sharti doim to\'g\'ri bo\'lib qoladi va kirish tekshiruvi chetlab o\'tadi', ru: 'Условие запроса становится всегда истинным, и проверка входа обходится' },
          { id: 'b', uz: 'Hisob paroli yangilanadi', ru: 'Пароль аккаунта обновляется' },
          { id: 'c', uz: 'Saytning dizayni o\'zgaradi', ru: 'Изменяется дизайн сайта' },
          { id: 'd', uz: 'Hech narsa — bu oddiy matn', ru: 'Ничего — это обычный текст' },
        ],
        answer: 'a',
        explain: {
          uz: 'Bu — SQLi ning klassik ko\'rinishi: \'1\'=\'1\' doim to\'g\'ri, shuning uchun "login = parol" tekshiruvi aylanib o\'tadi. Himoya esa boshqa joyda — parametrlangan so\'rovlar.',
          ru: 'Это классический вид SQLi: \'1\'=\'1\' всегда истинно, поэтому проверка «логин = пароль» объезжается. Лечится это не хитростями, а параметризованными запросами.',
        },
      },
      {
        id: 'e3',
        type: 'mc',
        q: {
          uz: 'SQL injection dan eng ishonchli himoya qaysi?',
          ru: 'Самая надёжная защита от SQL injection — какая?',
        },
        options: [
          { id: 'a', uz: 'Parametrlangan so\'rovlar (prepared statements)', ru: 'Параметризованные запросы (prepared statements)' },
          { id: 'b', uz: 'Parolni uzoqroq qilish', ru: 'Сделать пароль длиннее' },
          { id: 'c', uz: 'Faqat HTTPS ishlatish', ru: 'Использовать только HTTPS' },
          { id: 'd', uz: 'Faqat bir brauzerdan foydalanish', ru: 'Пользоваться только одним браузером' },
        ],
        answer: 'a',
        explain: {
          uz: 'HTTPS trafikni kanalda himoyalaydi, lekin so\'rov serverda baribir xavfli yozilsa — SQLi joyida qoladi. Parol esa bu muammoqa umuman aloqador emas. Muammo server tomonida, shuning uchun tuzatish ham server tomonida.',
          ru: 'HTTPS защищает канал, но если запрос на сервере собирается небезопасно — SQLi остаётся. Пароль к этой проблеме вообще не относится. Проблема на сервере, значит и решение на сервере.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Atamani uning izohiga moslang',
          ru: 'Соотнесите термин с его пояснением',
        },
        pairs: [
          { id: 'p1', left: { uz: 'SQL injection', ru: 'SQL injection' }, right: { uz: 'Foydalanuvchi matni so\'rov kodiga aylanadi', ru: 'Текст пользователя становится частью запроса' } },
          { id: 'p2', left: { uz: 'Parametrlangan so\'rov', ru: 'Параметризованный запрос' }, right: { uz: 'Ma\'lumot kod emas, faqat qiymat bo\'ladi', ru: 'Данные — значение, а не код' } },
          { id: 'p3', left: { uz: 'Kirishni tekshirish (validation)', ru: 'Проверка ввода (validation)' }, right: { uz: 'Faqat ruxsat etilgan belgilar qabul qilinadi', ru: 'Принимаются только разрешённые символы' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'SQLi — muammo (ma\'lumot koddan o\'tadi), parametrlangan so\'rov — asosiy tuzatish, validation esa uni mustahkamlovchi qo\'shimcha qatlam.',
          ru: 'SQLi — проблема (данные попадают в код), параметризованный запрос — основное решение, validation — дополнительный, укрепляющий слой.',
        },
      },
    ],
  },

  {
    slug: 'xss-basics',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'XSS asoslari', ru: 'Основы XSS' },
    content: {
      uz: `## XSS — Cross-Site Scripting

**XSS** — foydalanuvchi kiritgan JavaScript boshqa foydalanuvchilar brauzerida, saytning o'z nomidan ishga tushadi.

Turlari (qisqacha):
- **Stored XSS** — xavfli matn bazada saqlanadi (masalan, izoh) va barchaga ko'rinadi.
- **Reflected XSS** — xavfli matn havolada keladi va darhol sahifaga qaytariladi.

Nega xavfli? Izohga yozilgan \`<script>\` tegi boshqa odamning brauzerida aynan shu sayt nomidan bajariladi — uning cookie va sessiyasi o'g'irlanishi mumkin.

**Himoya:** chiqishdan oldin escape/sanitize — foydalanuvchi matnini kod emas, matn sifatida ko'rsatish.`,
      ru: `## XSS — Cross-Site Scripting

**XSS** — введённый пользователем JavaScript выполняется в браузере других людей от имени самого сайта.

Типы (кратко):
- **Stored XSS** — опасный текст хранится в базе (например, комментарий) и виден всем.
- **Reflected XSS** — опасный текст приходит в ссылке и сразу отражается на странице.

Почему опасно? Тег \`<script>\` в комментарии выполняется в браузере другого человека уже от имени сайта — его cookie и сессию можно украсть.

**Защита:** экранирование и санитизация — показывать текст пользователя как текст, а не как код.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'XSS — bu nima?',
          ru: 'Что такое XSS?',
        },
        options: [
          { id: 'a', uz: 'Foydalanuvchi kiritgan skriptning sayt orqali boshqa brauzerlarda ishlashi', ru: 'Введённый пользователем скрипт выполняется в чужих браузерах через сайт' },
          { id: 'b', uz: 'Ma\'lumotlar bazasini buzish', ru: 'Взлом базы данных' },
          { id: 'c', uz: 'Serverga juda ko\'p so\'rov yuborish', ru: 'Отправка огромного числа запросов на сервер' },
          { id: 'd', uz: 'Parollarni qayta hisoblash', ru: 'Пересчёт паролей' },
        ],
        answer: 'a',
        explain: {
          uz: 'XSS ning kaliti — "sayt nomidan ishlash". Skript boshqa odam brauzerida bajarilgani uchun uning cookie va sessiyasiga yetib boradi. SQLi esa server tomonida — ular turli muammolar.',
          ru: 'Ключ XSS — «выполнение от имени сайта». Скрипт работает в чужом браузере, поэтому получает доступ к его cookie и сессии. SQLi живёт на сервере — это разные проблемы.',
        },
      },
      {
        id: 'e2',
        type: 'mc',
        q: {
          uz: 'Izohlar bazada saqlanib, keyin barcha tashrif buyuruvchilarga ko\'rinadi. Bu qaysi XSS turi?',
          ru: 'Комментарий хранится в базе и потом виден всем посетителям. Какой это тип XSS?',
        },
        options: [
          { id: 'a', uz: 'Stored XSS (saqlangan)', ru: 'Stored XSS (сохранённый)' },
          { id: 'b', uz: 'Reflected XSS (qaytarilgan)', ru: 'Reflected XSS (отражённый)' },
          { id: 'c', uz: 'SQL injection', ru: 'SQL injection' },
          { id: 'd', uz: 'Brute force', ru: 'Brute force' },
        ],
        answer: 'a',
        explain: {
          uz: 'Kalit so\'z — "bazada saqlanadi". Reflected XSS esa saqlanmaydi: xavfli matn havolada keladi, sahifada ko\'rinadi va keyin yo\'qoladi.',
          ru: 'Ключевое слово — «хранится в базе». Reflected XSS ничего не хранит: текст приходит в ссылке, отображается и исчезает.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'XSS dan himoyalanishga nima yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает защититься от XSS? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Chiqishdan oldin escape/sanitization', ru: 'Экранирование и санитизация при выводе' },
          { id: 'b', uz: 'Faqat ruxsat etilgan HTML teglarini o\'tkazish (allowlist)', ru: 'Пропускать только разрешённые HTML-теги (allowlist)' },
          { id: 'c', uz: 'Foydalanuvchi matnini to\'g\'ridan-to\'g\'ri sahifaga chiqarish', ru: 'Выводить текст пользователя прямо на страницу' },
          { id: 'd', uz: 'Faqat parolni uzaytirish', ru: 'Просто удлинить пароль' },
        ],
        answers: ['a', 'b'],
        explain: {
          uz: 'Escape/sanitization matnni koddan tozalaydi, allowlist esa faqat kerakli teglarni o\'tkazadi. To\'g\'ridan-to\'g\'ri chiqarish — XSS ning o\'ziga eshik ochish, parol esa bu yerga aloqador emas.',
          ru: 'Экранирование очищает текст от кода, allowlist пропускает только нужные теги. Прямой вывод — это открыть дверь для XSS, а пароль тут ни при чём.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: 'Cross-Site Scripting atamasining qisqartmasi (inglizcha, uch harf): ______',
          ru: 'Сокращение от Cross-Site Scripting (по-английски, три буквы): ______',
        },
        answer: 'xss',
        explain: {
          uz: 'Bu — **XSS**. Uchta harf, lekin xavfi katta: skript saytning o\'z hududida bajarilgani uchun brauzer buni o\'sha saytning qonuniy kodidek ko\'radi.',
          ru: 'Это **XSS**. Три буквы, но риск большой: скрипт выполняется на самом сайте, и браузер считает его законным кодом этого сайта.',
        },
      },
    ],
  },

  {
    slug: 'phishing-basics',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Phishing va ijtimoiy injiqlik', ru: 'Фишинг и социальная инженерия' },
    content: {
      uz: `## Phishing — odamni aldash

**Phishing** — soxta xat, SMS yoki sayt orqali parol, karta raqami yoki faylni yig'ish. Bu texnik zaiflik emas — qurbonni ishontirish san'ati.

Qizil belgilar:
- **Shoshilinch:** «24 soatda hisob yopiladi!»
- **Manzil mos emas:** support@g00gle-help.com
- **Kutilmagan fayl:** hisob.pdf.exe
- **Umumiy murojaat:** «Hurmatli foydalanuvchi»

**Nima qilish kerak:** havolani bosmasdan, rasmiy saytni o'zingiz oching va manbani tekshiring.

**2FA** — parol o'g'irlansa ham, ikkinchi bosqich (SMS yoki ilova) hujumni to'sib qo'yadi.`,
      ru: `## Фишинг — искусство обмана

**Фишинг** — сбор паролей, номеров карт или файлов через поддельное письмо, SMS или сайт. Это не техническая уязвимость — это искусство убедить жертву.

Красные флаги:
- **Срочность:** «Счёт закроется через 24 часа!»
- **Несовпадение адреса:** support@g00gle-help.com
- **Неожиданный файл:** hisob.pdf.exe
- **Общее обращение:** «Уважаемый пользователь»

**Что делать:** не нажимая ссылку, открыть официальный сайт самостоятельно и проверить отправителя.

**2FA** — даже украденный пароль не приводит к взлому: второй шаг блокирует атаку.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Qaysi manzil phishing belgisini ko\'rsatadi?',
          ru: 'Какой адрес показывает признак фишинга?',
        },
        options: [
          { id: 'a', uz: 'support@g00gle-help.com', ru: 'support@g00gle-help.com' },
          { id: 'b', uz: 'news@telegram.org', ru: 'news@telegram.org' },
          { id: 'c', uz: 'no-reply@yourbank.uz', ru: 'no-reply@yourbank.uz' },
          { id: 'd', uz: 'hello@company.com', ru: 'hello@company.com' },
        ],
        answer: 'a',
        explain: {
          uz: '"google" so\'zidagi o harflari 0 raqami bilan almashtirilgan va -help.com qo\'shilgan. Haqiqiy Google domeni boshqa — aralashtirib yozilgan manzilning o\'zi ogohlantiradi.',
          ru: 'В слове «google» буквы «о» заменены нулями, а сверху добавлен -help.com. Настоящий домен Google другой — уже сам подделанный адрес настораживает.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: 'Bank hech qachon e-pochta orqali parolingizni so\'ramaydi.',
          ru: 'Банк никогда не запрашивает ваш пароль по электронной почте.',
        },
        answer: 'true',
        explain: {
          uz: 'Haqiqiy tashkilot parolni xatda so\'ramaydi — u sizdan faqat kirish oynasida kerak. Xat orqali parol so\'ragan har qanday xabar — phishing.',
          ru: 'Настоящая организация не спрашивает пароль в письме — он нужен только на странице входа. Любое письмо с просьбой назвать пароль — фишинг.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: 'Phishing xatidagi qizil belgilar qaysi? (bir nechtasini tanlang)',
          ru: 'Какие признаки выдают письмо-фишинг? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Shoshilinch, qo\'rqituvchi tilda yozilgan', ru: 'Написано срочно, с запугиванием' },
          { id: 'b', uz: 'Kutilmagan fayl ilova (masalan, .exe)', ru: 'Неожиданный файл-программа (например, .exe)' },
          { id: 'c', uz: 'Manzil haqiqiy domenden farq qiladi', ru: 'Адрес отличается от настоящего домена' },
          { id: 'd', uz: 'Rasmiy logotip va chiroyli dizayn', ru: 'Официальный логотип и красивый дизайн' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Shoshilinch o\'ylash imkonini bermaydi, .exe fayl o\'zi dastur, noto\'g\'ri domen esa kim bilan gapirishingizni ochiq ko\'rsatadi. Logotip esa qo\'lda qo\'yiladi — u ishonch belgisi emas.',
          ru: 'Срочность не даёт подумать, .exe — это программа, чужой домен прямо показывает, с кем вы говорите. А логотип вставляет кто угодно — это не признак доверия.',
        },
      },
      {
        id: 'e4',
        type: 'order',
        q: {
          uz: 'Shubhali xatni ko\'rganda to\'g\'ri tartib (birinchisi — eng muhim)',
          ru: 'Расставьте действия при подозрительном письме (первое — самое важное)',
        },
        items: [
          { id: 'i1', uz: 'Havola va ilovani ochmaslik', ru: 'Не открывать ссылку и вложение' },
          { id: 'i2', uz: 'Rasmiy saytni o\'zingiz ochib, holatni tekshirish', ru: 'Самому открыть официальный сайт и проверить' },
          { id: 'i3', uz: 'Xatni o\'chirish yoki manbaga xabar berish', ru: 'Удалить письмо или сообщить отправителю' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: {
          uz: 'Avval zarar manbasini yopamiz (bosish = darhol yo\'qotish), keyin haqiqiy manbadan tekshiramiz va oxirida xatni yo\'qotamiz. Havolani bosib "tekshirish" xavfli.',
          ru: 'Сначала закрываем источник опасности (нажатие = мгновенная потеря), затем сверяемся с официальным сайтом и в конце удаляем письмо. «Проверить» нажатием — опасно.',
        },
      },
    ],
  },

  {
    slug: 'input-validation',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Kiritmani tekshirish', ru: 'Проверка входных данных' },
    content: {
      uz: `## Kiritmani tekshirish

**Qoida:** foydalanuvchi kiritgan har qanday ma'lumot — ishonchsiz.

Himoya ikki qadamdan iborat:

- **Tekshirish (validation)** — ma'lumot kutilgan shaklga mos keladimi? Tur, uzunlik, format.
- **Kodlash / tozalash (encoding / sanitization)** — ma'lumot ishlatiladigan joyga xavfsiz joylashtiriladimi?

**Ikki yondashuv:**
- **Oq ro'yxat (allowlist):** faqat ma'lum to'g'ri shaklni qabul qilish. Eng ishonchli.
- **Qora ro'yxat (denylist):** ma'lum xavfli belgilarni taqiqlash. Yangi hiyla doim topiladi.

> **Xavfsizlik:** tekshirish har doim **serverda** bo'lishi kerak. Brauzerdagi (client) tekshirishni chetlab o'tish oson — u faqat qulaylik uchun.`,
      ru: `## Проверка входных данных

**Правило:** любые данные, введённые пользователем, — недоверенные.

Защита состоит из двух шагов:

- **Проверка (validation)** — соответствует ли ввод ожидаемой форме? Тип, длина, формат.
- **Кодирование / очистка (encoding / sanitization)** — безопасно ли ввод вставляется туда, где используется?

**Два подхода:**
- **Белый список (allowlist):** принимать только известную правильную форму. Самый надёжный.
- **Чёрный список (denylist):** запрещать известные опасные символы. Новую уловку найдут всегда.

> **Безопасность:** проверка всегда должна быть **на сервере**. Проверку в браузере (клиентскую) легко обойти — она только для удобства.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Kiritmani tekshirish uchun eng ishonchli yondashuv qaysi?',
          ru: 'Какой подход к проверке ввода самый надёжный?',
        },
        options: [
          { id: 'a', uz: "Oq ro'yxat: faqat ma'lum to'g'ri shaklni qabul qilish", ru: 'Белый список: принимать только известную правильную форму' },
          { id: 'b', uz: "Qora ro'yxat: xavfli belgilarni taqiqlash", ru: 'Чёрный список: запрещать опасные символы' },
          { id: 'c', uz: 'Faqat brauzerda tekshirish', ru: 'Проверять только в браузере' },
          { id: 'd', uz: 'Umuman tekshirmaslik', ru: 'Вообще не проверять' },
        ],
        answer: 'a',
        explain: {
          uz: "Oq ro'yxat eng xavfsiz: u faqat kutilgan shaklni o'tkazadi. Qora ro'yxat esa to'liq bo'la olmaydi — har yangi hiyla uni chetlab o'tadi.",
          ru: 'Белый список безопаснее: он пропускает только ожидаемую форму. Чёрный список не может быть полным — каждая новая уловка его обходит.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Brauzerdagi tekshirish yetarli, chunki foydalanuvchi uni o'zgartira olmaydi.",
          ru: 'Проверки в браузере достаточно, потому что пользователь не может её изменить.',
        },
        answer: 'false',
        explain: {
          uz: "Brauzer tekshiruvini chetlab o'tish oson — so'rovni to'g'ridan-to'g'ri yuborish mumkin. Shuning uchun haqiqiy tekshirish serverda bo'ladi; brauzerdagisi faqat qulaylik uchun.",
          ru: 'Клиентскую проверку легко обойти — запрос можно отправить напрямую. Настоящая проверка идёт на сервере; браузерная нужна лишь для удобства.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Kiritmani tekshirishda nimani nazorat qilish kerak? (bir nechtasini tanlang)",
          ru: 'Что нужно контролировать при проверке ввода? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Tur (raqam, matn)', ru: 'Тип (число, текст)' },
          { id: 'b', uz: 'Uzunlik', ru: 'Длину' },
          { id: 'c', uz: 'Format (masalan, email)', ru: 'Формат (например, email)' },
          { id: 'd', uz: 'Faqat rang', ru: 'Только цвет' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Tur, uzunlik va format — kiritma kutilgan doirada ekanini bildiradi. Yaxshi tekshirilgan kiritma keyingi himoyalar (SQLi, XSS) uchun ham mustahkam asos bo'ladi.",
          ru: 'Тип, длина и формат показывают, что ввод в ожидаемых границах. Хорошо проверенный ввод — прочная основа и для других защит (SQLi, XSS).',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: "Tushunchani uning vazifasi bilan moslang",
          ru: 'Соотнесите понятие с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Validation', ru: 'Validation' }, right: { uz: "Shakl to'g'riligini tekshirish", ru: 'Проверка правильности формы' } },
          { id: 'p2', left: { uz: 'Encoding', ru: 'Encoding' }, right: { uz: "Ma'lumotni ishlatiladigan joyga xavfsiz joylashtirish", ru: 'Безопасная вставка данных туда, где они используются' } },
          { id: 'p3', left: { uz: 'Allowlist', ru: 'Allowlist' }, right: { uz: "Faqat to'g'ri shaklni qabul qilish", ru: 'Принимать только правильную форму' } },
          { id: 'p4', left: { uz: 'Client-side tekshirish', ru: 'Клиентская проверка' }, right: { uz: 'Faqat qulaylik, xavfsizlik emas', ru: 'Только удобство, не безопасность' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Validation shaklni tekshiradi, encoding joylashtirishni xavfsiz qiladi, allowlist faqat to'g'riini o'tkazadi, client-side tekshirish esa xavfsizlik kafolati emas.",
          ru: 'Validation проверяет форму, encoding делает вставку безопасной, allowlist пропускает только правильное, а клиентская проверка — не гарантия безопасности.',
        },
      },
    ],
  },

  {
    slug: 'csrf',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: "CSRF — begona saytdan so'rov", ru: 'CSRF — запрос с чужого сайта' },
    content: {
      uz: `## CSRF nima?

**CSRF (Cross-Site Request Forgery)** — tizimga kirgan foydalanuvchi nomidan, u bilmagan holda so'rov yuborish.

Tasavvur qiling: siz bank saytiga kirgansiz. Keyin boshqa (yovuz) saytga o'tdingiz. O'sha sayt yashirincha bankingizga "pul o'tkaz" so'rovini yubordi — brauzeringiz cookie'ni avtomatik qo'shadi va bank so'rovni sizdan kelgan deb o'ylaydi.

**Nega ishlaydi:** brauzer cookie'ni har so'rovga o'zi qo'shadi — sayt so'rov kimdan kelganini parol bilan emas, cookie bilan biladi.

**Himoya:**
- **CSRF token** — formaga yashirin, taxmin qilib bo'lmaydigan qiymat; usiz so'rov rad etiladi.
- **SameSite cookie** — cookie faqat shu saytdan kelgan so'rovga qo'shiladi.

> **Xavfsizlik:** muhim amallar (pul, parol almashtirish) CSRF token talab qilishi kerak.`,
      ru: `## Что такое CSRF

**CSRF (Cross-Site Request Forgery)** — отправка запроса от имени вошедшего пользователя без его ведома.

Представьте: вы вошли в банк. Затем перешли на другой (враждебный) сайт. Он тайком отправил в ваш банк запрос «перевести деньги» — браузер автоматически приложит cookie, и банк решит, что запрос от вас.

**Почему работает:** браузер сам прикладывает cookie к каждому запросу — сайт понимает, кто отправил запрос, по cookie, а не по паролю.

**Защита:**
- **CSRF-токен** — скрытое, непредсказуемое значение; без него запрос отклоняется.
- **SameSite cookie** — cookie прикладывается только к запросам с этого же сайта.

> **Безопасность:** важные действия (деньги, смена пароля) должны требовать CSRF-токен.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: "CSRF hujumida buzg'unchi nimaga tayanadi?",
          ru: 'На что опирается злоумышленник при CSRF?',
        },
        options: [
          { id: 'a', uz: "Brauzer cookie'ni so'rovga avtomatik qo'shishiga", ru: 'На то, что браузер сам прикладывает cookie к запросу' },
          { id: 'b', uz: 'Parolni bilishiga', ru: 'На знание пароля' },
          { id: 'c', uz: 'Serverning sekin ishlashiga', ru: 'На медленную работу сервера' },
          { id: 'd', uz: "HTTPS yo'qligiga", ru: 'На отсутствие HTTPS' },
        ],
        answer: 'a',
        explain: {
          uz: "CSRF brauzerning cookie'ni avtomatik qo'shish xususiyatidan foydalanadi. Buzg'unchi parolni bilmaydi — sayt so'rovni cookie bo'yicha tanidi.",
          ru: 'CSRF использует то, что браузер автоматически прикладывает cookie. Пароль злоумышленник не знает — сайт опознал запрос по cookie.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "HTTPS ishlatilsa CSRF hujumi butunlay to'xtaydi.",
          ru: 'Если используется HTTPS, CSRF полностью прекращается.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q — HTTPS trafikni shifrlaydi, lekin CSRF boshqa sababdan ishlaydi (cookie avtomatik yuboriladi). CSRF token va SameSite aynan shunga qarshi qaratilgan.",
          ru: 'Нет — HTTPS шифрует трафик, но CSRF работает по другой причине (cookie отправляется автоматически). Именно против этого направлены CSRF-токен и SameSite.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "CSRF dan himoyalanishga nima yordam beradi? (bir nechtasini tanlang)",
          ru: 'Что помогает защититься от CSRF? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'CSRF token', ru: 'CSRF-токен' },
          { id: 'b', uz: 'SameSite cookie', ru: 'SameSite cookie' },
          { id: 'c', uz: 'Muhim amallar uchun qayta tasdiqlash', ru: 'Повторное подтверждение для важных действий' },
          { id: 'd', uz: "Barcha o'zgartirishni GET orqali yuborish", ru: 'Отправлять все изменения через GET' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Token va SameSite cookie so'rov haqiqiy formadan kelganini bildiradi, qayta tasdiq qo'shimcha to'siq. O'zgartirishni GET'ga o'tkazish esa aksincha xavfni oshiradi.",
          ru: 'Токен и SameSite показывают, что запрос пришёл с настоящей формы, а повторное подтверждение — дополнительный барьер. Перевод изменений на GET, наоборот, повышает риск.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: "Tushunchani uning vazifasi bilan moslang",
          ru: 'Соотнесите понятие с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'CSRF token', ru: 'CSRF-токен' }, right: { uz: "Formaning haqiqiyligini isbotlaydi", ru: 'Подтверждает подлинность формы' } },
          { id: 'p2', left: { uz: 'SameSite cookie', ru: 'SameSite cookie' }, right: { uz: "Cookie boshqa saytdan kelmasin", ru: 'Чтобы cookie не приходил с другого сайта' } },
          { id: 'p3', left: { uz: 'CSRF', ru: 'CSRF' }, right: { uz: "Foydalanuvchi nomidan yashirin so'rov", ru: 'Скрытый запрос от имени пользователя' } },
          { id: 'p4', left: { uz: "O'zgartirishni faqat GET bilan", ru: 'Изменения только через GET' }, right: { uz: "Xatoni yanada xavfli qiladi", ru: 'Делает ошибку ещё опаснее' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Token va SameSite so'rovni himoyalaydi, CSRF ning o'zi hujum usuli, o'zgartirishni GET bilan yuborish esa himoyani buzadi.",
          ru: 'Токен и SameSite защищают запрос, сам CSRF — способ атаки, а изменение через GET ломает защиту.',
        },
      },
    ],
  },

  {
    slug: 'authentication-and-sessions',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Autentifikatsiya va seanslar', ru: 'Аутентификация и сессии' },
    content: {
      uz: `## Autentifikatsiya va seanslar

**Autentifikatsiya (authn)** — siz kimsiz? **Avtorizatsiya (authz)** — nima qilishga haqqingiz bor? Bu ikki xil narsa.

**Seans (session):** bir marta parol bilan kirasiz, keyin server sizni **cookie** bilan taniydi. Har so'rovda parol so'ralmaydi.

**Xavflar va himoya:**
- **Seans ID o'g'irlanishi** — ID taxmin qilib bo'lmaydigan bo'lishi kerak. \`HttpOnly\` cookie uni JavaScript'dan yashiradi.
- **Session fixation** — hujumchi oldindan ID beradi. Yechim: **kirgandan keyin** ID ni yangilash.
- **Chiqishdan keyin** seansni serverda bekor qilish kerak (shunchaki cookie o'chirish yetmaydi).

> **Xavfsizlik:** parol hech qachon URL yoki logda ko'rinmasin; seans cookie'lari \`HttpOnly\` + \`Secure\` bo'lsin.`,
      ru: `## Аутентификация и сессии

**Аутентификация (authn)** — кто вы? **Авторизация (authz)** — что вам разрешено? Это разные вещи.

**Сессия:** вы один раз входите по паролю, дальше сервер узнаёт вас по **cookie**. Пароль не спрашивается при каждом запросе.

**Риски и защита:**
- **Кража ID сессии** — ID не должен быть предсказуемым. Флаг \`HttpOnly\` прячет cookie от JavaScript.
- **Фиксация сессии** — злоумышленник заранее навязывает ID. Решение: **сменить ID после входа**.
- **После выхода** сессию нужно аннулировать на сервере (просто удалить cookie недостаточно).

> **Безопасность:** пароль не должен появляться в URL или логах; cookie сессии должны иметь \`HttpOnly\` + \`Secure\`.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Autentifikatsiya va avtorizatsiya orasidagi farq nima?',
          ru: 'В чём разница между аутентификацией и авторизацией?',
        },
        options: [
          { id: 'a', uz: 'Authn — siz kimsiz, authz — nimaga haqqingiz bor', ru: 'Authn — кто вы, authz — что вам разрешено' },
          { id: 'b', uz: 'Ikkalasi bir xil narsa', ru: 'Это одно и то же' },
          { id: 'c', uz: 'Authn — parol, authz — login', ru: 'Authn — пароль, authz — логин' },
          { id: 'd', uz: 'Authz faqat adminlar uchun', ru: 'Authz только для администраторов' },
        ],
        answer: 'a',
        explain: {
          uz: "Avval autentifikatsiya (kimligingizni tasdiqlash), keyin avtorizatsiya (ruxsatlaringiz). Biri ikkinchisini almashtirmaydi.",
          ru: 'Сначала аутентификация (подтверждение личности), затем авторизация (ваши права). Одно не заменяет другое.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Foydalanuvchi chiqqanda cookie'ni o'chirish yetarli, serverda seansni bekor qilish shart emas.",
          ru: 'При выходе достаточно удалить cookie, аннулировать сессию на сервере не нужно.',
        },
        answer: 'false',
        explain: {
          uz: "Cookie'ni o'chirish faqat brauzerda ishlaydi, lekin o'g'irlangan seans ID serverda hali ham amalda qoladi. Shuning uchun seansni serverda ham bekor qilish kerak.",
          ru: 'Удаление cookie действует только в браузере, но украденный ID сессии на сервере остаётся активным. Поэтому сессию нужно аннулировать и на сервере.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Seans xavfsizligi uchun qaysi choralar to'g'ri? (bir nechtasini tanlang)",
          ru: 'Какие меры для безопасности сессии верны? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Cookie'ga HttpOnly va Secure qo'yish", ru: 'Установить cookie HttpOnly и Secure' },
          { id: 'b', uz: 'Kirgandan keyin seans ID ni yangilash', ru: 'Обновлять ID сессии после входа' },
          { id: 'c', uz: "ID ni taxmin qilib bo'lmaydigan qilish", ru: 'Делать ID непредсказуемым' },
          { id: 'd', uz: "Seans ID ni URL'da yuborish", ru: 'Передавать ID сессии в URL' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "HttpOnly/Secure cookie'ni himoyalaydi, ID yangilash session fixation'ni to'xtatadi, tasodifiy ID taxminni qiyinlashtiradi. ID'ni URL'da yuborish esa uni log va tarixda oshkor qiladi.",
          ru: 'HttpOnly/Secure защищают cookie, смена ID останавливает фиксацию сессии, случайный ID усложняет подбор. Передача ID в URL, наоборот, раскрывает его в логах и истории.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "Seans ID ni JavaScript'dan yashiradigan cookie bayrog'i (inglizcha): ______",
          ru: 'Флаг cookie, скрывающий ID сессии от JavaScript (по-английски): ______',
        },
        answer: 'httponly',
        accepted: ['httponly', 'http only', 'http-only'],
        explain: {
          uz: "Bu — HttpOnly. U cookie'ni JavaScript o'qiy olmaydigan qiladi, shuning uchun XSS orqali seans ID ni o'g'irlash qiyinlashadi.",
          ru: 'Это HttpOnly. Он делает cookie недоступным для чтения из JavaScript, поэтому украсть ID сессии через XSS сложнее.',
        },
      },
    ],
  },

  {
    slug: 'broken-access-control',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Buzilgan ruxsat nazorati (IDOR)', ru: 'Нарушенный контроль доступа (IDOR)' },
    content: {
      uz: `## Buzilgan ruxsat nazorati (IDOR)

**IDOR (Insecure Direct Object Reference)** — boshqa odamning obyektiga to'g'ridan-to'g'ri murojaat qilish.

Misol: sizning hisobingiz \`?id=100\`. Raqamni \`101\` ga o'zgartirsangiz — boshqa odamning ma'lumotini ko'rasizmi? Agar ha bo'lsa, server **har so'rovda ruxsatni tekshirmayapti**.

**Asosiy xato:** server ID ni to'g'ri deb biladi, lekin "bu ID sizga tegishlimi?" deb so'ramaydi.

**Himoya:**
- **Har bir** so'rovda ruxsatni tekshirish (kim so'rayapti + nimaga haqqi bor).
- Obyekt egasini server tomonda aniqlash, ID ga ko'r-ko'rona ishonmaslik.
- Eng kam imtiyoz (least privilege) tamoyili.

> **Xavfsizlik:** foydalanuvchi kiritgan ID hech qachon ruxsat tekshiruvi o'rnini bosmaydi. "Tekshirilmagan" so'rov — eng ko'p uchraydigan zaifliklardan biri.`,
      ru: `## Нарушенный контроль доступа (IDOR)

**IDOR (Insecure Direct Object Reference)** — прямое обращение к чужому объекту.

Пример: ваш аккаунт — \`?id=100\`. Если заменить на \`101\`, увидите ли вы чужие данные? Если да, значит сервер **не проверяет права при каждом запросе**.

**Главная ошибка:** сервер считает ID корректным, но не спрашивает: «принадлежит ли этот ID вам?»

**Защита:**
- Проверять права при **каждом** запросе (кто запрашивает + что ему разрешено).
- Определять владельца объекта на сервере, не доверять ID вслепую.
- Принцип наименьших привилегий (least privilege).

> **Безопасность:** введённый пользователем ID никогда не заменяет проверку прав. «Непроверенный» запрос — одна из самых частых уязвимостей.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'IDOR zaifligining asosiy sababi nima?',
          ru: 'Какова основная причина уязвимости IDOR?',
        },
        options: [
          { id: 'a', uz: "Server har so'rovda ruxsatni tekshirmaydi", ru: 'Сервер не проверяет права при каждом запросе' },
          { id: 'b', uz: 'Parol juda qisqa', ru: 'Слишком короткий пароль' },
          { id: 'c', uz: "HTTPS yo'q", ru: 'Отсутствует HTTPS' },
          { id: 'd', uz: 'Baza sekin ishlaydi', ru: 'База работает медленно' },
        ],
        answer: 'a',
        explain: {
          uz: "IDOR aynan ruxsat tekshiruvi yetishmasligidan kelib chiqadi: server obyektni topadi, lekin 'bu so'rovchiga tegishlimi?' deb tekshirmaydi.",
          ru: 'IDOR возникает именно из-за нехватки проверки прав: сервер находит объект, но не проверяет «принадлежит ли он запрашивающему?».',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Foydalanuvchi ID sini uzun va tasodifiy qilish IDOR muammosini to'liq yechadi.",
          ru: 'Длинный и случайный ID пользователя полностью решает проблему IDOR.',
        },
        answer: 'false',
        explain: {
          uz: "Tasodifiy ID taxminni qiyinlashtiradi, lekin yechim emas — havola ulashilsa yoki ID oshkor bo'lsa, muammo qaytadi. Haqiqiy yechim — har so'rovda ruxsatni tekshirish.",
          ru: 'Случайный ID усложняет подбор, но это не решение: если ссылку перешлют или ID раскроется, проблема вернётся. Настоящее решение — проверять права при каждом запросе.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "IDOR dan himoyalanish uchun nima qilish kerak? (bir nechtasini tanlang)",
          ru: 'Что нужно делать для защиты от IDOR? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Har so'rovda ruxsatni tekshirish", ru: 'Проверять права при каждом запросе' },
          { id: 'b', uz: 'Obyekt egasini serverda aniqlash', ru: 'Определять владельца объекта на сервере' },
          { id: 'c', uz: "Least privilege qo'llash", ru: 'Применять least privilege' },
          { id: 'd', uz: "ID ni tekshirmasdan ishonish", ru: 'Доверять ID без проверки' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Ruxsat tekshiruvi, egasini serverda aniqlash va eng kam imtiyoz — uchtasi birga himoya beradi. ID'ga ko'r-ko'rona ishonish esa aynan zaiflikning sababi.",
          ru: 'Проверка прав, определение владельца на сервере и наименьшие привилегии вместе дают защиту. Доверие к ID без проверки — как раз причина уязвимости.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: "Tushunchani uning vazifasi bilan moslang",
          ru: 'Соотнесите понятие с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'IDOR', ru: 'IDOR' }, right: { uz: "Boshqa odam obyektiga murojaat", ru: 'Обращение к чужому объекту' } },
          { id: 'p2', left: { uz: 'Ruxsat tekshiruvi', ru: 'Проверка прав' }, right: { uz: "Har so'rovda bajarilishi kerak", ru: 'Должна выполняться при каждом запросе' } },
          { id: 'p3', left: { uz: 'Least privilege', ru: 'Least privilege' }, right: { uz: 'Faqat kerakli huquqni berish', ru: 'Давать только необходимые права' } },
          { id: 'p4', left: { uz: "ID'ga ko'r-ko'rona ishonish", ru: 'Доверие к ID вслепую' }, right: { uz: 'Zaiflikka olib keladigan xato', ru: 'Ошибка, ведущая к уязвимости' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "IDOR — hujum turi, ruxsat tekshiruvi va least privilege — himoya, ID'ga ko'r-ko'rona ishonish esa zaiflikning ildizi.",
          ru: 'IDOR — способ атаки, проверка прав и least privilege — защита, а слепое доверие к ID — корень уязвимости.',
        },
      },
    ],
  },

  {
    slug: 'security-headers',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Xavfsizlik sarlavhalari', ru: 'Заголовки безопасности' },
    content: {
      uz: `## Xavfsizlik sarlavhalari

Server javobiga qo'shiladigan **HTTP sarlavhalar** brauzerga himoya qoidalarini aytadi.

- **Content-Security-Policy (CSP)** — qaysi manbadan skript va uslub yuklash mumkin. XSS zararini keskin kamaytiradi.
- **Strict-Transport-Security (HSTS)** — brauzer saytga faqat HTTPS orqali ulanadi.
- **X-Content-Type-Options: nosniff** — brauzer fayl turini "o'zi taxmin qilmasin".
- **X-Frame-Options / frame-ancestors** — saytni begona \`<iframe>\` ichida ochib bo'lmaydi (clickjacking himoyasi).

> **Xavfsizlik:** sarlavhalar yagona davo emas, lekin arzon va kuchli qatlam. Ayniqsa CSP — XSS ga qarshi eng samarali himoyalardan biri.`,
      ru: `## Заголовки безопасности

**HTTP-заголовки** в ответе сервера сообщают браузеру правила защиты.

- **Content-Security-Policy (CSP)** — из каких источников можно грузить скрипты и стили. Резко снижает ущерб от XSS.
- **Strict-Transport-Security (HSTS)** — браузер подключается к сайту только по HTTPS.
- **X-Content-Type-Options: nosniff** — браузер не должен «угадывать» тип файла.
- **X-Frame-Options / frame-ancestors** — сайт нельзя открыть внутри чужого \`<iframe>\` (защита от clickjacking).

> **Безопасность:** заголовки — не единственное лекарство, но дешёвый и мощный слой. Особенно CSP — одна из самых эффективных защит от XSS.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Qaysi sarlavha XSS zararini kamaytirishga qaratilgan?',
          ru: 'Какой заголовок направлен на снижение ущерба от XSS?',
        },
        options: [
          { id: 'a', uz: 'Content-Security-Policy (CSP)', ru: 'Content-Security-Policy (CSP)' },
          { id: 'b', uz: 'X-Content-Type-Options', ru: 'X-Content-Type-Options' },
          { id: 'c', uz: 'Strict-Transport-Security (HSTS)', ru: 'Strict-Transport-Security (HSTS)' },
          { id: 'd', uz: 'Content-Length', ru: 'Content-Length' },
        ],
        answer: 'a',
        explain: {
          uz: "CSP qaysi manbalardan skript yuklash mumkinligini cheklaydi — shuning uchun kiritilgan begona skript ko'pincha ishlamaydi. Bu XSS ga qarshi eng kuchli qatlamlardan biri.",
          ru: 'CSP ограничивает источники, откуда можно грузить скрипты, — поэтому внедрённый чужой скрипт часто не срабатывает. Это один из сильнейших слоёв защиты от XSS.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: "Sarlavhani uning vazifasi bilan moslang",
          ru: 'Соотнесите заголовок с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'CSP', ru: 'CSP' }, right: { uz: 'Skript manbalarini cheklaydi', ru: 'Ограничивает источники скриптов' } },
          { id: 'p2', left: { uz: 'HSTS', ru: 'HSTS' }, right: { uz: 'Faqat HTTPS bilan ulanish', ru: 'Подключение только по HTTPS' } },
          { id: 'p3', left: { uz: 'X-Frame-Options', ru: 'X-Frame-Options' }, right: { uz: "Clickjacking'ni to'xtatadi", ru: 'Останавливает clickjacking' } },
          { id: 'p4', left: { uz: 'nosniff', ru: 'nosniff' }, right: { uz: 'Fayl turini taxmin qilmaslik', ru: 'Не угадывать тип файла' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Har sarlavha o'z vazifasini bajaradi: CSP manbalarni cheklaydi, HSTS HTTPS'ni majbur qiladi, X-Frame-Options iframe'ni bloklaydi, nosniff esa tur taxminini to'xtatadi.",
          ru: 'Каждый заголовок делает своё: CSP ограничивает источники, HSTS принуждает HTTPS, X-Frame-Options блокирует iframe, nosniff останавливает угадывание типа.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Xavfsizlik sarlavhalari SQL injection'ni to'g'ridan-to'g'ri to'xtatadi.",
          ru: 'Заголовки безопасности напрямую останавливают SQL injection.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q — sarlavhalar brauzer tomonidagi himoya (XSS, clickjacking, HTTPS majburlash). SQL injection server tomonida, parametrlangan so'rovlar bilan yechiladi.",
          ru: 'Нет — заголовки защищают на стороне браузера (XSS, clickjacking, принудительный HTTPS). SQL injection закрывается на сервере, параметризованными запросами.',
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: "Xavfsizlik sarlavhalari haqida qaysi gaplar to'g'ri? (bir nechtasini tanlang)",
          ru: 'Что верно про заголовки безопасности? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: "Server javobiga qo'shiladi", ru: 'Добавляются в ответ сервера' },
          { id: 'b', uz: 'Brauzerga himoya qoidalarini beradi', ru: 'Сообщают браузеру правила защиты' },
          { id: 'c', uz: 'XSS va clickjacking xavfini kamaytiradi', ru: 'Снижают риск XSS и clickjacking' },
          { id: 'd', uz: "Server kodidagi xatoni o'zi tuzatadi", ru: 'Сами исправляют ошибку в коде сервера' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Sarlavhalar server javobiga qo'shilib, brauzerga qoidalar beradi va bir necha xavfni kamaytiradi. Lekin ular server kodidagi xatoni o'zi tuzatmaydi — kod to'g'ri yozilishi kerak.",
          ru: 'Заголовки добавляются в ответ, сообщают браузеру правила и снижают ряд рисков. Но они не исправляют ошибку в коде сервера сами — код должен быть написан правильно.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-web-security',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Veb-xavfsizlik nazorati', ru: 'Проверка: Веб-безопасность' },
    content: {
      uz: `## 🏆 Nazorat

Veb-xavfsizlik bo'yicha bilimingizni tekshiring: SQLi, XSS, kiritma tekshiruvi, CSRF, seanslar, ruxsat nazorati, xavfsizlik sarlavhalari va phishing. Javobdan oldin o'ylang.`,
      ru: `## 🏆 Проверка

Проверьте знания по веб-безопасности: SQLi, XSS, проверка ввода, CSRF, сессии, контроль доступа, заголовки безопасности и фишинг. Подумайте перед ответом.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: `... WHERE user = '" + input + "'`,
        q: {
          uz: 'Dasturchi so\'rovni shunday yozgan. Nima xavfli?',
          ru: 'Программист написал запрос так. В чём опасность?',
        },
        options: [
          { id: 'a', uz: 'Foydalanuvchi matni to\'g\'ridan-to\'g\'ri so\'rov kodiga qo\'shiladi', ru: 'Текст пользователя напрямую добавляется в код запроса' },
          { id: 'b', uz: 'Kod juda sekin ishlaydi', ru: 'Код работает слишком медленно' },
          { id: 'c', uz: 'Kod faqat bir ma\'lumotlar bazasida ishlaydi', ru: 'Код работает только с одной базой данных' },
          { id: 'd', uz: 'Kod xavfsiz, chunki HTTPS ishlatilgan', ru: 'Код безопасен, потому что используется HTTPS' },
        ],
        answer: 'a',
        explain: {
          uz: 'Matn kod ichiga birlashtirilgan (concatenation) — bu SQLi ning sababi. Tuzatish: input ni so\'rovdan ajratib, parametrlangan so\'rov ishlatish. HTTPS esa bu yerdan muammoni yechmaydi.',
          ru: 'Текст склеивается с кодом (concatenation) — в этом причина SQLi. Решение: отделить ввод от запроса и использовать параметризованный запрос. HTTPS эту проблему не решает.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Himoya vositasini uning himoya qiladigan muammoqa moslang',
          ru: 'Соотнесите средство защиты с проблемой, от которой оно защищает',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Parametrlangan so\'rovlar', ru: 'Параметризованные запросы' }, right: { uz: 'SQL injection', ru: 'SQL injection' } },
          { id: 'p2', left: { uz: 'Escape/sanitization', ru: 'Экранирование/санитизация' }, right: { uz: 'XSS — matn kodga aylanmasin', ru: 'XSS — текст не должен стать кодом' } },
          { id: 'p3', left: { uz: '2FA (ikki bosqichli tasdiqlash)', ru: '2FA (двухфакторная аутентификация)' }, right: { uz: 'Parol o\'g\'irlanganda ham himoya', ru: 'Защита при украденном пароле' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Har bir muammo o\'z doriga davo: SQLi ga — parametrlar, XSS ga — ekranlash, o\'g\'irlangan parolga — ikkinchi bosqich. Bittasi boshqasini almashtirmaydi.',
          ru: 'У каждой проблемы своё лекарство: SQLi — параметры, XSS — экранирование, украденный пароль — второй фактор. Одно не заменяет другое.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: 'Reflected XSS xavfli matnni bazada saqlab qoladi va barchaga ko\'rinadi.',
          ru: 'Reflected XSS сохраняет опасный текст в базе и показывает его всем.',
        },
        answer: 'false',
        explain: {
          uz: 'Bu — Stored XSS belgisi. Reflected XSS saqlamaydi: xavfli matn havolada keladi, bir marta ko\'rinadi va yo\'qoladi. Ikkalasi ham xavfli, lekin tabiati boshqacha.',
          ru: 'Это признак Stored XSS. Reflected ничего не хранит: текст приходит в ссылке, один раз отображается и исчезает. Оба опасны, но механизм разный.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: 'Parol o\'g\'irlansa ham hisobni himoya qiladigan qo\'shimcha qatlam (qisqartma, inglizcha): ______',
          ru: 'Дополнительный слой, защищающий аккаунт при украденном пароле (сокращение, по-английски): ______',
        },
        answer: '2fa',
        accepted: ['two factor', 'two-factor', 'two factor authentication', 'двухфакторная аутентификация'],
        explain: {
          uz: 'Bu — **2FA** (ikkinchi bosqich: SMS, ilova yoki kalit). Phishing parolni o\'g\'irlashi mumkin, lekin telefonni yoki kalitni emas — shuning uchun 2FA phishing zararini sezilarli kamaytiradi.',
          ru: 'Это **2FA** (второй шаг: SMS, приложение или ключ). Фишинг может украсть пароль, но не телефон и не ключ — поэтому 2FA снижает эффект фишинга.',
        },
      },
      {
        id: 'e5',
        type: 'multi',
        q: {
          uz: 'Veb-ilovani xavfsiz qilish uchun qaysi amallar to\'g\'ri? (bir nechtasini tanlang)',
          ru: 'Что делает веб-приложение безопаснее? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Parametrlangan so\'rovlar ishlatish', ru: 'Использовать параметризованные запросы' },
          { id: 'b', uz: 'Chiqishdan oldin escape/sanitization', ru: 'Экранировать и санитизировать при выводе' },
          { id: 'c', uz: 'Kirishni 2FA bilan himoyalash', ru: 'Защищать вход с помощью 2FA' },
          { id: 'd', uz: 'Foydalanuvchi matnini HTMLga to\'g\'ridan-to\'g\'ri chiqarish', ru: 'Выводить текст пользователя прямо в HTML' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: 'Parametrlar SQLi ni, ekranlash XSS ni, 2FA esa o\'g\'irlangan kirishni yopadi. To\'g\'ridan-to\'g\'ri chiqarish esa aynan xavfli usul — u hamma himoyani bekor qiladi.',
          ru: 'Параметры закрывают SQLi, экранирование — XSS, 2FA — украденный вход. Прямой вывод в HTML как раз опасен и обнуляет защиту.',
        },
      },
    ],
  },
];
