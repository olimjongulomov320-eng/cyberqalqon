/**
 * Curriculum - IT fundamentals path › Domain: Programming (Python for security)
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
 *   - Python samples appear only to ILLUSTRATE correct, defensive code.
 *   - Exercise ids: e1..eN in delivery order.
 *   - Uzbek: simple, modern Uzbek Latin. Russian: natural, not machine-translated.
 *   - Any string containing an apostrophe MUST be double-quoted (or a template
 *     literal) - a straight ' inside a single-quoted string breaks the file.
 */

module.exports = [
  {
    slug: 'why-programming-for-security',
    kind: 'lesson',
    xp_reward: 20,
    title: { uz: "Nega xavfsizlikda dasturlash kerak?", ru: 'Зачем программирование в безопасности' },
    content: {
      uz: `## Nega xavfsizlikda dasturlash kerak?

Xavfsizlik ishi ko'p takrorlanadi: minglab log qatori, yuzlab fayl, bir xil tekshiruv.

**Qo'lda qilish muammosi:**
- Sekin va zerikarli - odam charchaydi va xato qiladi.
- Katta hajmda imkonsiz: million qator logni qo'lda o'qib bo'lmaydi.

**Dastur nima beradi:**
- **Tezlik** - kompyuter sekundiga minglab yozuvni ko'radi.
- **Takrorlanuvchanlik** - bir marta yozilgan skript har doim bir xil ishlaydi.
- **Aniqlik** - na charchoq, na e'tiborsizlik.

> **Xavfsizlik:** "avtomatlashtirilmagan" ish katta hajmda bajarilmaydi. Shuning uchun xavfsizlik mutaxassisi ozgina bo'lsa ham dasturlashni bilishi kerak.`,
      ru: `## Зачем программирование в безопасности

Работа в безопасности часто повторяется: тысячи строк логов, сотни файлов, одни и те же проверки.

**Проблема ручной работы:**
- Медленно и скучно - человек устаёт и ошибается.
- В большом объёме невозможно: миллион строк логов вручную не прочитать.

**Что даёт программа:**
- **Скорость** - компьютер просматривает тысячи записей в секунду.
- **Повторяемость** - написанный скрипт всегда работает одинаково.
- **Точность** - нет усталости и невнимательности.

> **Безопасность:** «неавтоматизированную» работу в большом объёме не выполнить. Поэтому специалист по безопасности должен хотя бы немного знать программирование.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        q: {
          uz: 'Nega xavfsizlikda dasturlash muhim?',
          ru: 'Почему программирование важно в безопасности?',
        },
        options: [
          { id: 'a', uz: "Takrorlanuvchi ishni tez va xatosiz avtomatlashtirish uchun", ru: 'Чтобы автоматизировать повторяющуюся работу быстро и без ошибок' },
          { id: 'b', uz: "Faqat o'yin yozish uchun", ru: 'Только чтобы писать игры' },
          { id: 'c', uz: "Chunki loglar o'zi o'qiladi", ru: 'Потому что логи читаются сами' },
          { id: 'd', uz: "Dizayn chiroyli bo'lishi uchun", ru: 'Чтобы дизайн был красивым' },
        ],
        answer: 'a',
        explain: {
          uz: "Dasturlash katta hajmdagi takrorlanuvchi ishni avtomatlashtiradi: tez, bir xil va xatosiz. Bu xavfsizlik tahlilida juda qo'l keladi.",
          ru: 'Программирование автоматизирует большой объём повторяющейся работы: быстро, одинаково и без ошибок. В анализе безопасности это очень помогает.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        q: {
          uz: "Million qator logni qo'lda ko'zdan kechirish dastur yozishdan ishonchliroq.",
          ru: 'Просматривать миллион строк логов вручную надёжнее, чем написать программу.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - odam tez charchaydi va muhim yozuvni o'tkazib yuboradi. Dastur minglab yozuvni sekund ichida bir xil aniqlik bilan ko'radi.",
          ru: 'Нет - человек быстро устаёт и пропускает важную запись. Программа просматривает тысячи записей за секунду с одинаковой точностью.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Dasturning qo'lda ishlashdan afzalliklari qaysilar? (bir nechtasini tanlang)",
          ru: 'В чём преимущества программы перед ручной работой? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Tezlik', ru: 'Скорость' },
          { id: 'b', uz: 'Takrorlanuvchanlik', ru: 'Повторяемость' },
          { id: 'c', uz: 'Aniqlik (charchamaydi)', ru: 'Точность (не устаёт)' },
          { id: 'd', uz: 'Har doim qimmatroq', ru: 'Всегда дороже' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Tezlik, takrorlanuvchanlik va aniqlik - dasturning asosiy afzalliklari. Dastur odamdan farqli charchamaydi va bir xil ishlaydi.",
          ru: 'Скорость, повторяемость и точность - главные преимущества программы. В отличие от человека она не устаёт и работает одинаково.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: "Tushunchani uning ma'nosi bilan moslang",
          ru: 'Соотнесите понятие с его значением',
        },
        pairs: [
          { id: 'p1', left: { uz: 'Avtomatlashtirish', ru: 'Автоматизация' }, right: { uz: 'Bir xil ishni dastur bajarsin', ru: 'Пусть одинаковую работу делает программа' } },
          { id: 'p2', left: { uz: 'Log tahlili', ru: 'Анализ логов' }, right: { uz: "Minglab yozuvni ko'zdan kechirish", ru: 'Просмотр тысяч записей' } },
          { id: 'p3', left: { uz: 'Takrorlanuvchanlik', ru: 'Повторяемость' }, right: { uz: 'Har doim bir xil natija', ru: 'Всегда один и тот же результат' } },
          { id: 'p4', left: { uz: 'Inson xatosi', ru: 'Ошибка человека' }, right: { uz: "Charchoqdan kelib chiqadi", ru: 'Возникает из-за усталости' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Avtomatlashtirish ishni dasturga o'tkazadi, log tahlili uni katta hajmda talab qiladi, takrorlanuvchanlik barqaror natija beradi, charchoq esa inson xatosiga olib keladi.",
          ru: 'Автоматизация передаёт работу программе, анализ логов требует её в большом объёме, повторяемость даёт стабильный результат, а усталость ведёт к ошибкам человека.',
        },
      },
    ],
  },

  {
    slug: 'python-basics',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Python asoslari', ru: 'Основы Python' },
    content: {
      uz: `## Python asoslari

**Python** - o'qishga oson va xavfsizlik skriptlarida keng ishlatiladigan til.

**O'zgaruvchi (variable)** - qiymat saqlanadigan nom:

\`\`\`python
port = 22
host = "10.0.0.1"
is_open = True
\`\`\`

**Asosiy turlar:**
- **int** - butun son (\`22\`)
- **str** - matn (\`"10.0.0.1"\`)
- **bool** - mantiqiy (\`True\` / \`False\`)

**Chiqarish:** \`print(host)\` ekranga qiymat chiqaradi. Matn va sonni birlashtirish uchun f-string: \`print(f"{host}:{port}")\`.

> **Xavfsizlik:** Python xatoni yashirmaydi - u \`NameError\`, \`TypeError\` kabi aniq xabar beradi. Xatoni o'qish - dasturlashning muhim qismi.`,
      ru: `## Основы Python

**Python** - простой для чтения язык, широко используемый в скриптах безопасности.

**Переменная (variable)** - имя, под которым хранится значение:

\`\`\`python
port = 22
host = "10.0.0.1"
is_open = True
\`\`\`

**Основные типы:**
- **int** - целое число (\`22\`)
- **str** - строка (\`"10.0.0.1"\`)
- **bool** - логический (\`True\` / \`False\`)

**Вывод:** \`print(host)\` печатает значение. Чтобы соединить текст и число, используют f-строку: \`print(f"{host}:{port}")\`.

> **Безопасность:** Python не прячет ошибки - он сообщает о них точно (\`NameError\`, \`TypeError\` и т. д.). Чтение ошибок - важная часть программирования.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'port = 22',
        q: {
          uz: 'Yuqoridagi qatorda `port` nima?',
          ru: 'Что такое `port` в строке выше?',
        },
        options: [
          { id: 'a', uz: "O'zgaruvchi (qiymat saqlaydigan nom)", ru: 'Переменная (имя, хранящее значение)' },
          { id: 'b', uz: 'Funksiya', ru: 'Функция' },
          { id: 'c', uz: 'Fayl nomi', ru: 'Имя файла' },
          { id: 'd', uz: 'Xato', ru: 'Ошибка' },
        ],
        answer: 'a',
        explain: {
          uz: "`port` - o'zgaruvchi: unga 22 qiymati saqlandi. Keyin `port` deb yozsak, Python 22 ni oladi.",
          ru: '`port` - переменная: в неё сохранили значение 22. Дальше, написав `port`, Python берёт 22.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        code: 'type(22)      # int\ntype("22")    # str',
        q: {
          uz: 'Yuqoridagi ikki qiymat Python uchun bir xil turmi?',
          ru: 'Эти два значения для Python - один и тот же тип?',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - `22` bu int (son), `\"22\"` bu str (matn). Tur har xil bo'lsa, amallar ham boshqacha ishlaydi.",
          ru: 'Нет - `22` это int (число), а `"22"` это str (строка). Если тип разный, операции работают иначе.',
        },
      },
      {
        id: 'e3',
        type: 'multi',
        q: {
          uz: "Quyidagilardan qaysilari Python'dagi matn (str) turiga misol? (bir nechtasini tanlang)",
          ru: 'Что из перечисленного - пример строки (str) в Python? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: '"10.0.0.1"', ru: '"10.0.0.1"' },
          { id: 'b', uz: '"admin"', ru: '"admin"' },
          { id: 'c', uz: '22', ru: '22' },
          { id: 'd', uz: '"xato"', ru: '"xato"' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: "Qo'shtirnoq ichidagi qiymat - str (matn). `22` esa qo'shtirnoqsiz, ya'ni int (son).",
          ru: 'Значение в кавычках - это str (строка). А `22` без кавычек - уже int (число).',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Turni uning tavsifi bilan moslang',
          ru: 'Соотнесите тип с его описанием',
        },
        pairs: [
          { id: 'p1', left: { uz: 'int', ru: 'int' }, right: { uz: 'Butun son', ru: 'Целое число' } },
          { id: 'p2', left: { uz: 'str', ru: 'str' }, right: { uz: 'Matn', ru: 'Строка' } },
          { id: 'p3', left: { uz: 'bool', ru: 'bool' }, right: { uz: 'True yoki False', ru: 'True или False' } },
          { id: 'p4', left: { uz: 'print()', ru: 'print()' }, right: { uz: 'Ekranga chiqaradi', ru: 'Выводит на экран' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "int - son, str - matn, bool - mantiqiy qiymat, print() esa natijani ekranga chiqaradi.",
          ru: 'int - число, str - строка, bool - логическое значение, а print() выводит результат на экран.',
        },
      },
    ],
  },

  {
    slug: 'python-control-flow',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Shartlar va takrorlash', ru: 'Условия и циклы' },
    content: {
      uz: `## Shartlar va takrorlash

**Shart (if)** - holatga qarab qaror qabul qiladi:

\`\`\`python
if port == 22:
    print("SSH")
elif port == 80:
    print("HTTP")
else:
    print("boshqa")
\`\`\`

**Takrorlash (for)** - ro'yxatdagi har bir element ustida ishlaydi:

\`\`\`python
for port in [22, 80, 443]:
    print(port)
\`\`\`

**Eslatma:** Python'da **indentatsiya** (bo'sh joy) shart - blok aynan shu bilan belgilanadi. Noto'g'ri jadval xato beradi.

> **Xavfsizlik:** "har bir qatorni tekshir" turidagi ish aynan \`for\` bilan bajariladi - 1000 log qatorini bitta siklda ko'rish mumkin.`,
      ru: `## Условия и циклы

**Условие (if)** - принимает решение в зависимости от ситуации:

\`\`\`python
if port == 22:
    print("SSH")
elif port == 80:
    print("HTTP")
else:
    print("другой")
\`\`\`

**Цикл (for)** - проходит по каждому элементу списка:

\`\`\`python
for port in [22, 80, 443]:
    print(port)
\`\`\`

**Важно:** в Python **отступы** обязательны - именно они задают блок. Неверный отступ даёт ошибку.

> **Безопасность:** работа вида «проверить каждую строку» выполняется именно через \`for\` - тысячи строк логов можно обработать одним циклом.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'if port == 22:',
        q: {
          uz: 'Yuqoridagi qator nima qiladi?',
          ru: 'Что делает строка выше?',
        },
        options: [
          { id: 'a', uz: "port 22 ga teng bo'lsa, keyingi blokni bajaradi", ru: 'Если port равен 22, выполняет следующий блок' },
          { id: 'b', uz: "port ni 22 ga o'zgartiradi", ru: 'Меняет port на 22' },
          { id: 'c', uz: "port ni o'chiradi", ru: 'Удаляет port' },
          { id: 'd', uz: 'Faqat izoh yozadi', ru: 'Просто пишет комментарий' },
        ],
        answer: 'a',
        explain: {
          uz: "`==` - solishtirish (tengmi?), `=` esa qiymat berish. `if` shart rost bo'lsagina keyingi blokni bajaradi.",
          ru: '`==` - сравнение (равно ли?), а `=` - присваивание значения. `if` выполняет следующий блок, только если условие истинно.',
        },
      },
      {
        id: 'e2',
        type: 'order',
        q: {
          uz: "Port tekshiruvi mantig'ini to'g'ri tartibda joylang (birinchisi - birinchi qadam)",
          ru: 'Расставьте логику проверки порта по порядку (первый - самый первый)',
        },
        items: [
          { id: 'i1', uz: 'Tekshiriladigan port olinadi', ru: 'Берётся проверяемый порт' },
          { id: 'i2', uz: 'Port ochiqmi - tekshiriladi', ru: 'Проверяется, открыт ли порт' },
          { id: 'i3', uz: 'Natija yozib boriladi', ru: 'Результат записывается' },
          { id: 'i4', uz: "Keyingi portga o'tiladi", ru: 'Переход к следующему порту' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Avval port olinadi, keyin tekshiriladi, natija yoziladi va keyingi portga o'tiladi - bu `for` sikl mantig'i.",
          ru: 'Сначала порт берётся, затем проверяется, результат записывается и происходит переход к следующему порту - это логика цикла `for`.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Python'da indentatsiya (bo'sh joy) shunchaki chiroy uchun, kodga ta'sir qilmaydi.",
          ru: 'В Python отступы (пробелы) - только для красоты, на код не влияют.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - Python'da indentatsiya blokni belgilaydi. Noto'g'ri jadval xatoga yoki noto'g'ri mantiqqa olib keladi; u boshqa tillardagi `{ }` o'rnini egallaydi.",
          ru: 'Нет - в Python отступы задают блок. Неверный отступ ведёт к ошибке или неверной логике; он заменяет `{ }` из других языков.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Belgini uning vazifasi bilan moslang',
          ru: 'Соотнесите обозначение с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'if / else', ru: 'if / else' }, right: { uz: 'Shartga qarab tanlash', ru: 'Выбор в зависимости от условия' } },
          { id: 'p2', left: { uz: 'for', ru: 'for' }, right: { uz: "Ro'yxatni aylanib chiqish", ru: 'Перебор списка' } },
          { id: 'p3', left: { uz: '==', ru: '==' }, right: { uz: 'Tenglikni solishtirish', ru: 'Сравнение на равенство' } },
          { id: 'p4', left: { uz: '=', ru: '=' }, right: { uz: 'Qiymat berish', ru: 'Присваивание значения' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "if/else shart bo'yicha qaror qiladi, for ro'yxatni aylanadi, == solishtiradi, = esa qiymat saqlaydi. == va = ni aralashtirish - keng tarqalgan xato.",
          ru: 'if/else принимает решение по условию, for перебирает список, == сравнивает, а = сохраняет значение. Путать == и = - частая ошибка.',
        },
      },
    ],
  },

  {
    slug: 'python-data-structures',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: "Ro'yxat va lug'at", ru: 'Списки и словари' },
    content: {
      uz: `## Ro'yxat va lug'at

**Ro'yxat (list)** - tartiblangan qiymatlar to'plami:

\`\`\`python
ports = [22, 80, 443]
print(ports[0])   # 22  (indeks 0 dan boshlanadi)
\`\`\`

**Lug'at (dict)** - kalit → qiymat juftliklari:

\`\`\`python
host = {"ip": "10.0.0.1", "port": 22}
print(host["ip"])           # 10.0.0.1
print(host.get("os", "?"))  # kalit yo'q bo'lsa - "?"
\`\`\`

**Nega muhim:** dict bilan IP → ma'lumot kabi yozuvlar qulay saqlanadi; list bilan bir xil turdagi ko'p qiymat.

> **Xavfsizlik:** log tahlilida har bir yozuvni dict sifatida saqlash (\`{"user": "admin", "result": "fail"}\`) keyin sanash va filtrlashni juda osonlashtiradi.`,
      ru: `## Списки и словари

**Список (list)** - упорядоченный набор значений:

\`\`\`python
ports = [22, 80, 443]
print(ports[0])   # 22  (индекс начинается с 0)
\`\`\`

**Словарь (dict)** - пары «ключ → значение»:

\`\`\`python
host = {"ip": "10.0.0.1", "port": 22}
print(host["ip"])           # 10.0.0.1
print(host.get("os", "?"))  # если ключа нет - "?"
\`\`\`

**Почему важно:** словарь удобен для записей вида «IP → данные», а список - для множества однотипных значений.

> **Безопасность:** при анализе логов хранить каждую запись как словарь (\`{"user": "admin", "result": "fail"}\`) сильно упрощает подсчёт и фильтрацию.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'ports = [22, 80, 443]',
        q: {
          uz: "Yuqoridagi ro'yxatda `ports[1]` qiymati nechchi?",
          ru: 'Чему равно `ports[1]` в списке выше?',
        },
        options: [
          { id: 'a', uz: '80', ru: '80' },
          { id: 'b', uz: '22', ru: '22' },
          { id: 'c', uz: '443', ru: '443' },
          { id: 'd', uz: 'Xato beradi', ru: 'Выдаёт ошибку' },
        ],
        answer: 'a',
        explain: {
          uz: "Indeks 0 dan boshlanadi: `ports[0]` = 22, `ports[1]` = 80, `ports[2]` = 443. Noldan boshlanish - ko'p uchraydigan chalkashlik.",
          ru: 'Индекс начинается с 0: `ports[0]` = 22, `ports[1]` = 80, `ports[2]` = 443. Начало с нуля - частая путаница.',
        },
      },
      {
        id: 'e2',
        type: 'mc',
        code: 'host = {"ip": "10.0.0.1"}',
        q: {
          uz: "Yuqoridagi lug'atda `\"ip\"` nima deb ataladi?",
          ru: 'Как называется `"ip"` в словаре выше?',
        },
        options: [
          { id: 'a', uz: 'Kalit (key)', ru: 'Ключ (key)' },
          { id: 'b', uz: 'Qiymat (value)', ru: 'Значение (value)' },
          { id: 'c', uz: 'Indeks', ru: 'Индекс' },
          { id: 'd', uz: 'Funksiya', ru: 'Функция' },
        ],
        answer: 'a',
        explain: {
          uz: "Lug'atda `\"ip\"` - kalit, `\"10.0.0.1\"` - qiymat. Kalit orqali qiymatga murojaat qilinadi.",
          ru: 'В словаре `"ip"` - ключ, а `"10.0.0.1"` - значение. К значению обращаются по ключу.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Ro'yxatdagi birinchi element indeksi 1 ga teng.",
          ru: 'Индекс первого элемента списка равен 1.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - Python'da indeks 0 dan boshlanadi. Birinchi element `list[0]`. Bu - eng ko'p uchraydigan xatolardan biri.",
          ru: 'Нет - в Python индекс начинается с 0. Первый элемент - `list[0]`. Это одна из самых частых ошибок.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Tushunchani uning tavsifi bilan moslang',
          ru: 'Соотнесите понятие с его описанием',
        },
        pairs: [
          { id: 'p1', left: { uz: 'list', ru: 'list' }, right: { uz: "Tartiblangan qiymatlar to'plami", ru: 'Упорядоченный набор значений' } },
          { id: 'p2', left: { uz: 'dict', ru: 'dict' }, right: { uz: 'Kalit → qiymat juftliklari', ru: 'Пары «ключ → значение»' } },
          { id: 'p3', left: { uz: 'indeks', ru: 'индекс' }, right: { uz: "Elementning o'rni (0 dan boshlanadi)", ru: 'Позиция элемента (начинается с 0)' } },
          { id: 'p4', left: { uz: '.get(kalit, standart)', ru: '.get(ключ, по умолчанию)' }, right: { uz: "Kalit yo'q bo'lsa standart qiymat", ru: 'Если ключа нет - значение по умолчанию' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "list tartiblangan to'plam, dict kalit-qiymat jadvali, indeks element o'rnini bildiradi, .get() esa kalit yo'q bo'lsa xato bermaydi.",
          ru: 'list - упорядоченный набор, dict - таблица ключ-значение, индекс задаёт позицию, а .get() не даёт ошибки, если ключа нет.',
        },
      },
    ],
  },

  {
    slug: 'python-functions',
    kind: 'lesson',
    xp_reward: 25,
    title: { uz: 'Funksiyalar', ru: 'Функции' },
    content: {
      uz: `## Funksiyalar

**Funksiya** - nom berilgan, qayta ishlatiladigan kod bo'lagi:

\`\`\`python
def is_ssh_port(port):
    return port == 22

print(is_ssh_port(22))   # True
print(is_ssh_port(80))   # False
\`\`\`

- **def** - funksiyani e'lon qiladi.
- **parametr** (\`port\`) - funksiyaga beriladigan kirish.
- **return** - natijani qaytaradi.

**Nega kerak:** bir xil kodni takrorlamaslik uchun. Bir joyda tuzatsangiz - hamma joyda tuzaladi.

> **Xavfsizlik:** "bu port xavflimi?" kabi tekshiruvni funksiyaga olsangiz, uni butun skriptda bir xil mantiq bilan ishlatasiz.`,
      ru: `## Функции

**Функция** - именованный, многократно используемый кусок кода:

\`\`\`python
def is_ssh_port(port):
    return port == 22

print(is_ssh_port(22))   # True
print(is_ssh_port(80))   # False
\`\`\`

- **def** - объявляет функцию.
- **параметр** (\`port\`) - вход, передаваемый функции.
- **return** - возвращает результат.

**Зачем нужны:** чтобы не повторять один и тот же код. Исправите в одном месте - исправится везде.

> **Безопасность:** если вынести проверку вида «опасен ли этот порт?» в функцию, её можно одинаково применять по всему скрипту.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'def is_ssh_port(port):\n    return port == 22',
        q: {
          uz: 'Funksiyada `return` nima qiladi?',
          ru: 'Что делает `return` в функции?',
        },
        options: [
          { id: 'a', uz: 'Natijani qaytaradi', ru: 'Возвращает результат' },
          { id: 'b', uz: "Funksiyani o'chiradi", ru: 'Удаляет функцию' },
          { id: 'c', uz: 'Ekranga chiqaradi', ru: 'Выводит на экран' },
          { id: 'd', uz: 'Faylni saqlaydi', ru: 'Сохраняет файл' },
        ],
        answer: 'a',
        explain: {
          uz: "`return` funksiyaning natijasini qaytaradi - shu natijani o'zgaruvchiga olib, keyin ishlatish mumkin. `print` esa faqat ekranga chiqaradi.",
          ru: '`return` возвращает результат функции - его можно сохранить в переменную и использовать дальше. А `print` лишь выводит на экран.',
        },
      },
      {
        id: 'e2',
        type: 'order',
        q: {
          uz: 'Funksiyani ishlatish tartibini joylang (birinchisi - birinchi qadam)',
          ru: 'Расставьте порядок использования функции (первый - самый первый)',
        },
        items: [
          { id: 'i1', uz: "Funksiya `def` bilan e'lon qilinadi", ru: 'Функция объявляется через `def`' },
          { id: 'i2', uz: 'Funksiya chaqiriladi (nom + qavs)', ru: 'Функция вызывается (имя + скобки)' },
          { id: 'i3', uz: 'Parametrlar uzatiladi', ru: 'Передаются параметры' },
          { id: 'i4', uz: '`return` natijani qaytaradi', ru: '`return` возвращает результат' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Avval funksiya e'lon qilinadi, keyin chaqiriladi va unga parametrlar uzatiladi, natija esa `return` bilan qaytadi.",
          ru: 'Сначала функцию объявляют, затем вызывают и передают параметры, а результат возвращается через `return`.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Bir xil kodni funksiyaga olish kodni qisqartiradi va xatoni tuzatishni osonlashtiradi.",
          ru: 'Вынесение повторяющегося кода в функцию сокращает код и упрощает исправление ошибок.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - funksiya bir marta yoziladi va qayta ishlatiladi. Xato bo'lsa, bir joyda tuzatasiz - nusxalarni qidirish shart emas.",
          ru: 'Верно - функция пишется один раз и используется многократно. При ошибке исправляете в одном месте - искать копии не нужно.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Elementni uning vazifasi bilan moslang',
          ru: 'Соотнесите элемент с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'def', ru: 'def' }, right: { uz: "Funksiyani e'lon qiladi", ru: 'Объявляет функцию' } },
          { id: 'p2', left: { uz: 'parametr', ru: 'параметр' }, right: { uz: 'Funksiyaga beriladigan kirish', ru: 'Вход, передаваемый функции' } },
          { id: 'p3', left: { uz: 'return', ru: 'return' }, right: { uz: 'Natijani qaytaradi', ru: 'Возвращает результат' } },
          { id: 'p4', left: { uz: 'chaqiruv (call)', ru: 'вызов (call)' }, right: { uz: 'Funksiyani ishga tushirish', ru: 'Запуск функции' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "def funksiyani e'lon qiladi, parametr kirishni beradi, return natijani qaytaradi, chaqiruv esa uni ishga tushiradi.",
          ru: 'def объявляет функцию, параметр задаёт вход, return возвращает результат, а вызов запускает функцию.',
        },
      },
    ],
  },

  {
    slug: 'python-files-and-errors',
    kind: 'lesson',
    xp_reward: 30,
    title: { uz: 'Fayllar va xatolar', ru: 'Файлы и ошибки' },
    content: {
      uz: `## Fayllar va xatolar

**Fayl o'qish** - log tahlilining asosi:

\`\`\`python
with open("access.log") as f:
    for line in f:
        print(line.strip())
\`\`\`

- **with** - faylni ochadi va oxirida avtomatik yopadi.
- **for line in f** - har bir qatorni bittalab beradi (butun faylni xotiraga yuklamaydi).

**Xatolarni ushlash (try/except):**

\`\`\`python
try:
    n = int("abc")
except ValueError:
    print("bu son emas")
\`\`\`

**Nega muhim:** real fayllar buzuq, yo'q yoki kutilmagan bo'ladi. \`try/except\` skriptni to'xtab qolishdan saqlaydi.

> **Xavfsizlik:** log faylni qatorma-qator o'qish millionlab yozuvni ham muammosiz tahlil qilish imkonini beradi.`,
      ru: `## Файлы и ошибки

**Чтение файла** - основа анализа логов:

\`\`\`python
with open("access.log") as f:
    for line in f:
        print(line.strip())
\`\`\`

- **with** - открывает файл и автоматически закрывает его в конце.
- **for line in f** - отдаёт по одной строке (не загружает весь файл в память).

**Обработка ошибок (try/except):**

\`\`\`python
try:
    n = int("abc")
except ValueError:
    print("это не число")
\`\`\`

**Почему важно:** реальные файлы бывают повреждёнными, отсутствующими или неожиданными. \`try/except\` не даёт скрипту упасть.

> **Безопасность:** чтение лога построчно позволяет разбирать даже миллионы записей без проблем.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'with open("access.log") as f:\n    for line in f:\n        print(line.strip())',
        q: {
          uz: "Log faylni xotirani to'ldirmasdan o'qishning to'g'ri yo'li qaysi?",
          ru: 'Какой способ чтения лога не заполняет память?',
        },
        options: [
          { id: 'a', uz: 'Faylni qatorma-qator oqish (for line in f)', ru: 'Читать файл построчно (for line in f)' },
          { id: 'b', uz: "Butun faylni bitta katta qatorga aylantirish", ru: 'Превратить весь файл в одну большую строку' },
          { id: 'c', uz: "Faylni qo'lda nusxalash", ru: 'Копировать файл вручную' },
          { id: 'd', uz: 'Faylni umuman ochmaslik', ru: 'Вообще не открывать файл' },
        ],
        answer: 'a',
        explain: {
          uz: "`with open` faylni avtomatik yopadi, `for line in f` esa qatorma-qator o'qiydi - shu sababli katta fayl ham xotirani to'ldirmaydi.",
          ru: '`with open` закрывает файл автоматически, а `for line in f` читает построчно - поэтому даже большой файл не заполняет память.',
        },
      },
      {
        id: 'e2',
        type: 'tf',
        code: 'try:\n    n = int("abc")\nexcept ValueError:\n    print("bu son emas")',
        q: {
          uz: '`try/except` dasturni xatodan keyin ham davom ettirishga yordam beradi.',
          ru: '`try/except` помогает программе продолжить работу после ошибки.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - `try` ichida xato yuz bersa, `except` uni ushlaydi va dastur to'xtamaydi. Bu ayniqsa noto'g'ri kiritmada muhim.",
          ru: 'Верно - если внутри `try` возникает ошибка, `except` её перехватывает, и программа не останавливается. Особенно важно при неверном вводе.',
        },
      },
      {
        id: 'e3',
        type: 'order',
        q: {
          uz: "Faylni o'qish va tahlil qilish tartibini joylang",
          ru: 'Расставьте порядок чтения и анализа файла',
        },
        items: [
          { id: 'i1', uz: 'Fayl `open` bilan ochiladi', ru: 'Файл открывается через `open`' },
          { id: 'i2', uz: 'Har bir qator oqiladi', ru: 'Читается каждая строка' },
          { id: 'i3', uz: 'Qator tahlil qilinadi (filtr/sanoq)', ru: 'Строка обрабатывается (фильтр/подсчёт)' },
          { id: 'i4', uz: 'Fayl yopiladi', ru: 'Файл закрывается' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: "Ochish → o'qish → tahlil → yopish. `with` ishlatilsa, yopish avtomatik bo'ladi.",
          ru: 'Открыть → читать → обработать → закрыть. При использовании `with` закрытие происходит автоматически.',
        },
      },
      {
        id: 'e4',
        type: 'match',
        q: {
          uz: 'Elementni uning vazifasi bilan moslang',
          ru: 'Соотнесите элемент с его задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'with open(...)', ru: 'with open(...)' }, right: { uz: 'Faylni ochadi va avtomatik yopadi', ru: 'Открывает файл и закрывает автоматически' } },
          { id: 'p2', left: { uz: 'for line in f', ru: 'for line in f' }, right: { uz: 'Qatorma-qator oqiydi', ru: 'Читает построчно' } },
          { id: 'p3', left: { uz: 'try/except', ru: 'try/except' }, right: { uz: 'Xatoni ushlab, davom ettiradi', ru: 'Перехватывает ошибку и продолжает' } },
          { id: 'p4', left: { uz: 'ValueError', ru: 'ValueError' }, right: { uz: "Noto'g'ri qiymat turi xatosi", ru: 'Ошибка неверного типа значения' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "with faylni boshqaradi, for har qatorni beradi, try/except xatoni ushlaydi, ValueError esa noto'g'ri qiymatda chiqadi.",
          ru: 'with управляет файлом, for отдаёт каждую строку, try/except перехватывает ошибку, а ValueError возникает при неверном значении.',
        },
      },
    ],
  },

  {
    slug: 'python-security-scripting',
    kind: 'lesson',
    xp_reward: 35,
    title: { uz: 'Amaliyot: log tahlili', ru: 'Практика: анализ логов' },
    content: {
      uz: `## Amaliyot: muvaffaqiyatsiz kirishlarni sanash

Tasavvur qiling, log faylda yozuvlar bor. Maqsad - "FAIL" bo'lgan qatorlarni sanash:

\`\`\`python
fails = 0
with open("access.log") as f:
    for line in f:
        if "FAIL" in line:
            fails += 1
print(f"Failed logins: {fails}")
\`\`\`

- **\`"FAIL" in line\`** - matn qatorda bormi, deb tekshiradi.
- **\`fails += 1\`** - hisoblagichni bittaga oshiradi.
- **f-string** - natijani chiroyli chiqaradi.

Shu usul bilan: eng ko'p urinish qilgan IP ni topish, tunda bo'lgan hodisalarni filtrlash va hokazo mumkin.

> **Xavfsizlik:** ko'p muvaffaqiyatsiz kirish - brute force belgisi bo'lishi mumkin. Skript buni tez ko'rsatadi, inson esa sekin payqaydi.`,
      ru: `## Практика: подсчёт неудачных входов

Представьте, что в лог-файле есть записи. Цель - посчитать строки со словом "FAIL":

\`\`\`python
fails = 0
with open("access.log") as f:
    for line in f:
        if "FAIL" in line:
            fails += 1
print(f"Failed logins: {fails}")
\`\`\`

- **\`"FAIL" in line\`** - проверяет, есть ли текст в строке.
- **\`fails += 1\`** - увеличивает счётчик на единицу.
- **f-строка** - аккуратно выводит результат.

Тем же способом можно найти IP с наибольшим числом попыток, отфильтровать ночные события и т. д.

> **Безопасность:** много неудачных входов может быть признаком brute force. Скрипт покажет это быстро, а человек заметит поздно.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'if "FAIL" in line:',
        q: {
          uz: 'Yuqoridagi qator nima qiladi?',
          ru: 'Что делает строка выше?',
        },
        options: [
          { id: 'a', uz: "Qatorda FAIL bor-yo'qligini tekshiradi", ru: 'Проверяет, есть ли FAIL в строке' },
          { id: 'b', uz: "FAIL ni qatordan o'chiradi", ru: 'Удаляет FAIL из строки' },
          { id: 'c', uz: 'Faylni yopadi', ru: 'Закрывает файл' },
          { id: 'd', uz: 'Sonni oshiradi', ru: 'Увеличивает число' },
        ],
        answer: 'a',
        explain: {
          uz: "`in` operatori matn yoki element mavjudligini tekshiradi. Rost bo'lsa, `if` bloki bajariladi - shu yerda hisoblagich oshiriladi.",
          ru: 'Оператор `in` проверяет наличие текста или элемента. Если истина, выполняется блок `if` - там и увеличивается счётчик.',
        },
      },
      {
        id: 'e2',
        type: 'order',
        q: {
          uz: 'Log tahlil skriptining mantiqiy tartibini joylang',
          ru: 'Расставьте логический порядок скрипта анализа логов',
        },
        items: [
          { id: 'i1', uz: 'Hisoblagich nolga tenglanadi (`fails = 0`)', ru: 'Счётчик обнуляется (`fails = 0`)' },
          { id: 'i2', uz: 'Log fayl ochiladi', ru: 'Открывается лог-файл' },
          { id: 'i3', uz: 'Har bir qator FAIL uchun tekshiriladi', ru: 'Каждая строка проверяется на FAIL' },
          { id: 'i4', uz: "FAIL bo'lsa hisoblagich oshiriladi", ru: 'Если есть FAIL - счётчик увеличивается' },
          { id: 'i5', uz: 'Natija chiqariladi', ru: 'Результат выводится' },
        ],
        order: ['i1', 'i2', 'i3', 'i4', 'i5'],
        explain: {
          uz: "Avval hisoblagich nolga tenglanadi, fayl ochiladi, har qator tekshiriladi, topilganlar sanaladi va oxirida natija chiqariladi.",
          ru: 'Сначала счётчик обнуляется, файл открывается, каждая строка проверяется, найденное считается и в конце выводится результат.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Bitta IP dan juda ko'p muvaffaqiyatsiz kirish brute force belgisi bo'lishi mumkin.",
          ru: 'Множество неудачных входов с одного IP может быть признаком brute force.',
        },
        answer: 'true',
        explain: {
          uz: "To'g'ri - bu brute force (yoki parol terish) belgisidir. Shuning uchun bunday signallarni avtomatik sanash va kuzatish muhim.",
          ru: 'Верно - это признак brute force (или подбора пароля). Поэтому важно автоматически считать и отслеживать такие сигналы.',
        },
      },
      {
        id: 'e4',
        type: 'multi',
        q: {
          uz: 'Log tahlili skripti nimalarni aniqlashga yordam beradi? (bir nechtasini tanlang)',
          ru: 'Что помогает выявить скрипт анализа логов? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Muvaffaqiyatsiz kirishlar sonini', ru: 'Число неудачных входов' },
          { id: 'b', uz: "Eng ko'p urinish qilgan IP ni", ru: 'IP с наибольшим числом попыток' },
          { id: 'c', uz: 'Kutilmagan vaqtdagi hodisalarni', ru: 'События в неожиданное время' },
          { id: 'd', uz: "Foydalanuvchining parolini", ru: 'Пароль пользователя' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Skript muvaffaqiyatsiz kirishlarni, shubhali IP ni va kutilmagan vaqtni ko'rsatadi. Parolni esa log hech qachon saqlamasligi kerak.",
          ru: 'Скрипт показывает неудачные входы, подозрительный IP и неожиданное время. А пароль лог хранить не должен никогда.',
        },
      },
    ],
  },

  {
    slug: 'checkpoint-programming',
    kind: 'checkpoint',
    xp_reward: 50,
    title: { uz: 'Dasturlash nazorati', ru: 'Проверка: Программирование' },
    content: {
      uz: `## 🏆 Nazorat

Dasturlash bo'yicha bilimingizni tekshiring: o'zgaruvchi va turlar, shart va sikl, ro'yxat/lug'at, funksiya, fayl o'qish va log tahlili. Javobdan oldin o'ylang.`,
      ru: `## 🏆 Проверка

Проверьте знания по программированию: переменные и типы, условия и циклы, списки/словари, функции, чтение файлов и анализ логов. Подумайте перед ответом.`,
    },
    exercises: [
      {
        id: 'e1',
        type: 'mc',
        code: 'for line in f:\n    if "FAIL" in line:\n        fails += 1',
        q: {
          uz: "Bu kod bo'lagi nima qiladi?",
          ru: 'Что делает этот фрагмент кода?',
        },
        options: [
          { id: 'a', uz: 'Fayldagi FAIL qatorlarni sanaydi', ru: 'Считает строки с FAIL в файле' },
          { id: 'b', uz: "Fayldagi FAIL larni o'chiradi", ru: 'Удаляет FAIL из файла' },
          { id: 'c', uz: 'Faylni yopadi', ru: 'Закрывает файл' },
          { id: 'd', uz: 'Yangi fayl yaratadi', ru: 'Создаёт новый файл' },
        ],
        answer: 'a',
        explain: {
          uz: "Kod har bir qatorni tekshiradi va FAIL bo'lganlarini sanaydi (`fails += 1`). Bu - log tahlilidagi eng keng tarqalgan qolip.",
          ru: 'Код проверяет каждую строку и считает строки с FAIL (`fails += 1`). Это самый распространённый приём анализа логов.',
        },
      },
      {
        id: 'e2',
        type: 'match',
        q: {
          uz: 'Guruhni uning vazifasi bilan moslang',
          ru: 'Соотнесите группу с её задачей',
        },
        pairs: [
          { id: 'p1', left: { uz: 'int / str / bool', ru: 'int / str / bool' }, right: { uz: 'Asosiy turlar', ru: 'Основные типы' } },
          { id: 'p2', left: { uz: 'list / dict', ru: 'list / dict' }, right: { uz: "Ro'yxat va lug'at", ru: 'Список и словарь' } },
          { id: 'p3', left: { uz: 'def / return', ru: 'def / return' }, right: { uz: "Funksiyani e'lon qilish va qaytarish", ru: 'Объявление функции и возврат' } },
          { id: 'p4', left: { uz: 'try / except', ru: 'try / except' }, right: { uz: 'Xatoni ushlash', ru: 'Перехват ошибки' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
        explain: {
          uz: "Har guruh o'z vazifasini bajaradi: turlar, to'plamlar, funksiya va xato boshqaruvi.",
          ru: 'Каждая группа делает своё: типы, коллекции, функции и обработка ошибок.',
        },
      },
      {
        id: 'e3',
        type: 'tf',
        q: {
          uz: "Python'da ro'yxat indeksi 1 dan boshlanadi.",
          ru: 'В Python индекс списка начинается с 1.',
        },
        answer: 'false',
        explain: {
          uz: "Yo'q - indeks 0 dan boshlanadi. Birinchi element `list[0]`, ikkinchisi `list[1]`.",
          ru: 'Нет - индекс начинается с 0. Первый элемент `list[0]`, второй - `list[1]`.',
        },
      },
      {
        id: 'e4',
        type: 'input',
        q: {
          uz: "Faylni ochib, oxirida avtomatik yopadigan kalit so'z (inglizcha): ______",
          ru: 'Ключевое слово, которое открывает файл и автоматически закрывает его (по-английски): ______',
        },
        answer: 'with',
        accepted: ['with'],
        explain: {
          uz: "`with open(...) as f:` - faylni boshqaradi va oxirida avtomatik yopadi. Bu resursni xavfsiz boshqarishning standart usuli.",
          ru: '`with open(...) as f:` - управляет файлом и закрывает его автоматически. Это стандартный способ безопасной работы с ресурсами.',
        },
      },
      {
        id: 'e5',
        type: 'multi',
        q: {
          uz: "Yaxshi log tahlil skripti uchun qaysilar to'g'ri? (bir nechtasini tanlang)",
          ru: 'Что верно для хорошего скрипта анализа логов? (выберите несколько)',
        },
        options: [
          { id: 'a', uz: 'Faylni qatorma-qator oqish', ru: 'Читать файл построчно' },
          { id: 'b', uz: 'Xatolarni try/except bilan ushlash', ru: 'Перехватывать ошибки через try/except' },
          { id: 'c', uz: 'Natijani sanash va chiqarish', ru: 'Считать и выводить результат' },
          { id: 'd', uz: 'Parolni ekranga chiqarish', ru: 'Выводить пароль на экран' },
        ],
        answers: ['a', 'b', 'c'],
        explain: {
          uz: "Qatorma-qator o'qish, xatoni ushlash va sanab chiqarish - to'g'ri skript belgilari. Parolni chiqarish esa xavfsizlikka zid.",
          ru: 'Построчное чтение, перехват ошибок и подсчёт с выводом - признаки правильного скрипта. А вывод пароля противоречит безопасности.',
        },
      },
    ],
  },
];
