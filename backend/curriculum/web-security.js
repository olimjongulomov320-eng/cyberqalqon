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
    slug: 'checkpoint-web-security',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Veb-xavfsizlik nazorati', ru: 'Проверка: Веб-безопасность' },
    content: {
      uz: `## 🏆 Nazorat

Veb-xavfsizlik bo'yicha bilimingizni tekshiring: SQLi, XSS va phishing savollari birgalikda beriladi. Javobdan oldin o'ylang.`,
      ru: `## 🏆 Проверка

Проверьте знания по веб-безопасности: вопросы по SQLi, XSS и фишингу даны вместе. Подумайте перед ответом.`,
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
