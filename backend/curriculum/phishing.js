/**
 * Phishing & social engineering - DRAFT CONTENT (needs_review: true).
 *
 * The Uzbek and Russian text was drafted for beginners and has NOT been checked
 * by a proficient native speaker. It must be reviewed before production
 * release (see ../../CONTENT_REVIEW.md). All names, addresses and numbers are
 * fictional; domains use only example.* so nothing points at a real system.
 *
 * Complements `phishing-basics` (web-security): that lesson names the red
 * flags; these go on to reading a message, recognising tactics and reacting.
 */
module.exports = [
  {
    slug: 'read-the-message',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 25,
    title: { uz: 'Shubhali xabarni o‘qish', ru: 'Как читать подозрительное сообщение' },
    content: {
      uz: `## Xabarni 4 qadamda tekshiring

Misol (xayoliy): *«Hurmatli mijoz, hisobingiz bloklandi. 1 soat ichida https://bank-tekshiruv.example.net/kirish havolasida tasdiqlang.»*

1. **Kim yubordi?** Ko'rinadigan ism emas, to'liq manzilga qarang.
2. **Havola qayerga olib boradi?** Bosishdan oldin manzilni ko'ring - u bank saytiga o'xshashmi?
3. **Nima so'rayapti?** Parol, SMS-kod yoki karta ma'lumotini hech bir rasmiy xizmat xat orqali so'ramaydi.
4. **Qanday his qildiryapti?** Shoshilinch yoki qo'rquv - bu hujumchining quroli.

Shubha bo'lsa: xabarga javob bermang, rasmiy ilova yoki saytni o'zingiz oching.`,
      ru: `## Проверьте сообщение за 4 шага

Пример (вымышленный): *«Уважаемый клиент, ваш счёт заблокирован. Подтвердите в течение часа: https://bank-tekshiruv.example.net/kirish»*

1. **Кто отправил?** Смотрите на полный адрес, а не на отображаемое имя.
2. **Куда ведёт ссылка?** Прочитайте адрес до нажатия - похож ли он на сайт банка?
3. **Что просят?** Ни одна настоящая служба не просит пароль, SMS-код или данные карты по письму.
4. **Какие эмоции вызывает?** Спешка и страх - инструменты злоумышленника.

Сомневаетесь - не отвечайте, откройте официальное приложение или сайт сами.`,
    },
    exercises: [
      {
        id: 'e1', type: 'multi',
        q: { uz: 'Yuqoridagi namunada qaysi belgilar shubhali?', ru: 'Какие признаки в примере выше подозрительны?' },
        options: [
          { id: 'a', uz: '1 soatlik muddat (shoshilinch)', ru: 'Срок в 1 час (срочность)' },
          { id: 'b', uz: 'Bank nomiga o‘xshash, lekin begona domen', ru: 'Домен похож на банк, но чужой' },
          { id: 'c', uz: 'Xabar o‘zbek tilida yozilgan', ru: 'Сообщение написано на узбекском' },
          { id: 'd', uz: '«Hurmatli mijoz» - shaxsiy ism yo‘q', ru: '«Уважаемый клиент» - нет личного имени' },
        ],
        answers: ['a', 'b', 'd'],
        explain: {
          uz: 'Shoshilinchlik, begona domen va umumiy murojaat - klassik belgilar. Til esa o‘z-o‘zidan shubha tug‘dirmaydi.',
          ru: 'Срочность, чужой домен и безличное обращение - классические признаки. Язык сам по себе подозрений не вызывает.',
        },
      },
      {
        id: 'e2', type: 'mc',
        q: { uz: 'Havola ustiga bosmasdan uning manzilini qanday ko‘rish mumkin?', ru: 'Как увидеть адрес ссылки, не нажимая на неё?' },
        options: [
          { id: 'a', uz: 'Sichqonchani ustiga olib borish (yoki telefonda uzoq bosish)', ru: 'Навести курсор (или долго нажать на телефоне)' },
          { id: 'b', uz: 'Havolani ikki marta bosish', ru: 'Нажать на ссылку дважды' },
          { id: 'c', uz: 'Xabarni do‘stlarga yuborish', ru: 'Переслать сообщение друзьям' },
        ],
        answer: 'a',
        explain: {
          uz: 'Manzilni ko‘rish xavfsiz: bosmaguningizcha hech narsa ochilmaydi.',
          ru: 'Просмотр адреса безопасен: пока вы не нажали, ничего не открывается.',
        },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'Rasmiy xizmat SMS-kodingizni xat orqali so‘rashi mumkin.', ru: 'Настоящая служба может запросить ваш SMS-код по письму.' },
        answer: 'false',
        explain: {
          uz: 'Bir martalik kod faqat sizniki. Uni so‘ragan har qanday xabar - firibgarlik belgisi.',
          ru: 'Одноразовый код - только ваш. Любое сообщение с просьбой назвать его - признак мошенничества.',
        },
      },
      {
        id: 'e4', type: 'order',
        q: { uz: 'Shubhali xabarni tekshirish tartibini joylashtiring.', ru: 'Расставьте порядок проверки подозрительного сообщения.' },
        items: [
          { id: 'i1', uz: 'To‘liq jo‘natuvchi manzilini ko‘rish', ru: 'Посмотреть полный адрес отправителя' },
          { id: 'i2', uz: 'Havola manzilini bosmasdan o‘qish', ru: 'Прочитать адрес ссылки, не нажимая' },
          { id: 'i3', uz: 'Nima so‘ralayotganini baholash', ru: 'Оценить, что у вас просят' },
          { id: 'i4', uz: 'Rasmiy sayt yoki ilovani o‘zingiz ochish', ru: 'Открыть официальный сайт или приложение самостоятельно' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval manba, keyin havola, keyin so‘rov - oxirida mustaqil tasdiq.',
          ru: 'Сначала источник, затем ссылка, затем запрос - в конце независимое подтверждение.',
        },
      },
    ],
  },
  {
    slug: 'social-engineering-tactics',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 25,
    title: { uz: 'Ijtimoiy muhandislik usullari', ru: 'Приёмы социальной инженерии' },
    content: {
      uz: `## Hujumchi odamga ta'sir qiladi

Ijtimoiy muhandislik - texnikani emas, **ishonchni** buzish.

- **Pretexting:** yolg'on bahona. «Men IT bo'limdanman, parolingiz kerak.»
- **Vishing:** telefon orqali aldash. «Bank xavfsizlik xizmati» deb qo'ng'iroq qilish.
- **Baiting:** o'ljaga tashlangan «o'lja» - yo'lda topilgan USB-fleshka.
- **Tailgating:** ruxsatli odamning ortidan eshikdan o'tib ketish.

Umumiy qoida: **to'xtang, o'zingiz qayta qo'ng'iroq qiling** (rasmiy raqamga), va hech qachon parol yoki kodni aytmang.`,
      ru: `## Злоумышленник воздействует на человека

Социальная инженерия - это взлом не техники, а **доверия**.

- **Претекстинг:** выдуманный предлог. «Я из IT-отдела, нужен ваш пароль».
- **Вишинг:** обман по телефону. Звонок от «службы безопасности банка».
- **Бейтинг:** приманка - найденная на улице флешка.
- **Tailgating:** проход в дверь следом за сотрудником с допуском.

Общее правило: **остановитесь, перезвоните сами** (по официальному номеру) и никогда не называйте пароль или код.`,
    },
    exercises: [
      {
        id: 'e1', type: 'match',
        q: { uz: 'Usulni uning tavsifi bilan moslang.', ru: 'Сопоставьте приём с описанием.' },
        pairs: [
          { id: 'p1', left: { uz: 'Vishing', ru: 'Вишинг' }, right: { uz: 'Telefon orqali aldash', ru: 'Обман по телефону' } },
          { id: 'p2', left: { uz: 'Baiting', ru: 'Бейтинг' }, right: { uz: 'Topilgan USB bilan jalb qilish', ru: 'Приманка в виде найденной флешки' } },
          { id: 'p3', left: { uz: 'Tailgating', ru: 'Tailgating' }, right: { uz: 'Birovning ortidan ruxsatsiz kirish', ru: 'Проход следом за сотрудником без допуска' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: {
          uz: 'Har bir usul odamning ishonchi yoki qiziquvchanligiga tayanadi.',
          ru: 'Каждый приём опирается на доверие или любопытство человека.',
        },
      },
      {
        id: 'e2', type: 'mc',
        q: {
          uz: 'Qo‘ng‘iroq qiluvchi «bank xavfsizlik xizmati»man deb SMS-kodni so‘radi. Eng to‘g‘ri harakat?',
          ru: 'Звонящий представился «службой безопасности банка» и просит SMS-код. Что делать?',
        },
        options: [
          { id: 'a', uz: 'Qo‘ng‘iroqni tugatib, kartadagi rasmiy raqamga o‘zim qo‘ng‘iroq qilaman', ru: 'Завершить звонок и самому позвонить по официальному номеру' },
          { id: 'b', uz: 'Kodni aytaman - ular bank-ku', ru: 'Назвать код - это же банк' },
          { id: 'c', uz: 'Kodning faqat yarmini aytaman', ru: 'Назвать только половину кода' },
        ],
        answer: 'a',
        explain: {
          uz: 'Raqamni siz tanlasangiz, hujumchi aralasha olmaydi. Kodni hech kimga aytmang - yarmini ham.',
          ru: 'Когда номер выбираете вы, злоумышленник не может вмешаться. Код нельзя называть никому, даже частично.',
        },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'Yo‘lda topilgan USB-fleshkani kompyuterga ulab ko‘rish xavfsiz.', ru: 'Подключать найденную на улице флешку к компьютеру безопасно.' },
        answer: 'false',
        explain: {
          uz: 'Fleshka zararli dastur tashishi mumkin. Uni IT mutaxassisiga topshiring.',
          ru: 'Флешка может нести вредоносную программу. Передайте её IT-специалисту.',
        },
      },
    ],
  },
  {
    slug: 'links-and-attachments',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 25,
    title: { uz: 'Havolalar va fayllar', ru: 'Ссылки и вложения' },
    content: {
      uz: `## Manzilning tuzilishi

\`https://hisob.bank.example.com/kirish\`

Haqiqiy xo'jayin - **oxirgi ikki bo'lak** (\`example.com\`). \`hisob.bank\` esa shunchaki old qo'shimcha.

Aldamchi: \`https://bank.example.com.kirish-tasdiq.example.net\` - bu \`example.net\` saytiga tegishli!

**Fayllar:** \`hisob.pdf.exe\` aslida dastur. Kutilmagan \`.exe\`, \`.js\`, \`.scr\` va makroli ofis fayllarini ochmang.

**QR-kod** ham havola: skanerlashdan oldin ko'rinadigan manzilni tekshiring.`,
      ru: `## Строение адреса

\`https://hisob.bank.example.com/kirish\`

Настоящий владелец - **последние две части** (\`example.com\`). Часть \`hisob.bank\` - лишь приставка.

Обман: \`https://bank.example.com.kirish-tasdiq.example.net\` - это сайт \`example.net\`!

**Файлы:** \`hisob.pdf.exe\` - на самом деле программа. Не открывайте неожиданные \`.exe\`, \`.js\`, \`.scr\` и офисные файлы с макросами.

**QR-код** - тоже ссылка: перед переходом проверьте показанный адрес.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: {
          uz: 'Qaysi manzil haqiqatan \`example.com\` ga tegishli?',
          ru: 'Какой адрес действительно принадлежит \`example.com\`?',
        },
        options: [
          { id: 'a', uz: 'https://support.example.com/help', ru: 'https://support.example.com/help' },
          { id: 'b', uz: 'https://example.com.support-login.example.net', ru: 'https://example.com.support-login.example.net' },
          { id: 'c', uz: 'https://support-example.com.example.org', ru: 'https://support-example.com.example.org' },
        ],
        answer: 'a',
        explain: {
          uz: 'Domen oxiridan o‘qiladi: a) \`example.com\`, b) \`example.net\`, c) \`example.org\`.',
          ru: 'Домен читается с конца: a) \`example.com\`, b) \`example.net\`, c) \`example.org\`.',
        },
      },
      {
        id: 'e2', type: 'multi',
        q: { uz: 'Qaysi fayllar ehtiyotkorlikni talab qiladi?', ru: 'Какие файлы требуют осторожности?' },
        options: [
          { id: 'a', uz: 'hisob.pdf.exe', ru: 'hisob.pdf.exe' },
          { id: 'b', uz: 'rasm.jpg (do‘stingizdan, kutilgan)', ru: 'rasm.jpg (от друга, ожидаемый)' },
          { id: 'c', uz: 'taklif.docm (noma’lum jo‘natuvchi)', ru: 'taklif.docm (неизвестный отправитель)' },
          { id: 'd', uz: 'yangilanish.scr', ru: 'yangilanish.scr' },
        ],
        answers: ['a', 'c', 'd'],
        explain: {
          uz: 'Bajariladigan kengaytmalar va makroli hujjatlar ayniqsa xavfli, ayniqsa kutilmaganda kelsa.',
          ru: 'Исполняемые расширения и документы с макросами особенно опасны, если пришли неожиданно.',
        },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'QR-kodni skanerlash havolani bosish bilan bir xil xavf tug‘diradi.', ru: 'Сканирование QR-кода несёт тот же риск, что и нажатие на ссылку.' },
        answer: 'true',
        explain: {
          uz: 'QR - havolaning boshqa ko‘rinishi. Ochishdan oldin manzilni tekshiring.',
          ru: 'QR - это та же ссылка в другом виде. Проверьте адрес перед открытием.',
        },
      },
    ],
  },
  {
    slug: 'checkpoint-phishing',
    kind: 'checkpoint',
    needs_review: true,
    xp_reward: 50,
    title: { uz: 'Nazorat: phishing va ijtimoiy muhandislik', ru: 'Контроль: фишинг и социальная инженерия' },
    content: {
      uz: `## Nazorat nuqtasi

Bu bo'limda siz xabarni tekshirish, ijtimoiy muhandislik usullari va havolalar/fayllar bilan ishlash qoidalarini mustahkamlaysiz. Esda tuting: **to'xtang, tekshiring, mustaqil tasdiqlang.**`,
      ru: `## Контрольная точка

Здесь вы закрепите проверку сообщений, приёмы социальной инженерии и правила работы со ссылками и файлами. Помните: **остановитесь, проверьте, подтвердите самостоятельно.**`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Xabardagi eng ishonchli tekshirish usuli qaysi?', ru: 'Какой способ проверки сообщения самый надёжный?' },
        options: [
          { id: 'a', uz: 'Rasmiy ilovani o‘zim ochib tekshiraman', ru: 'Открыть официальное приложение самому' },
          { id: 'b', uz: 'Xabardagi havola orqali kirib ko‘raman', ru: 'Зайти по ссылке из сообщения' },
          { id: 'c', uz: 'Xabardagi raqamga qo‘ng‘iroq qilaman', ru: 'Позвонить по номеру из сообщения' },
        ],
        answer: 'a',
        explain: {
          uz: 'Xabardagi havola va raqamni hujumchi tanlagan. Mustaqil kanal - ishonchli.',
          ru: 'Ссылку и номер в сообщении выбрал злоумышленник. Независимый канал надёжен.',
        },
      },
      {
        id: 'e2', type: 'match',
        q: { uz: 'Vaziyatni to‘g‘ri javob bilan moslang.', ru: 'Сопоставьте ситуацию с правильным ответом.' },
        pairs: [
          { id: 'p1', left: { uz: 'Noma’lum \`.exe\` ilova', ru: 'Неожиданный \`.exe\`' }, right: { uz: 'Ochmaslik, IT’ga xabar berish', ru: 'Не открывать, сообщить в IT' } },
          { id: 'p2', left: { uz: 'Kodni so‘ragan qo‘ng‘iroq', ru: 'Звонок с просьбой назвать код' }, right: { uz: 'Tugatib, rasmiy raqamga qo‘ng‘iroq', ru: 'Завершить и перезвонить по официальному номеру' } },
          { id: 'p3', left: { uz: 'Topilgan fleshka', ru: 'Найденная флешка' }, right: { uz: 'Ulamaslik, topshirish', ru: 'Не подключать, передать' } },
        ],
        match_answer: { p1: 'p1', p2: 'p2', p3: 'p3' },
        explain: { uz: 'Har holatda sizni to‘xtatadigan oddiy qoida bor.', ru: 'В каждой ситуации есть простое правило, которое вас останавливает.' },
      },
      {
        id: 'e3', type: 'multi',
        q: { uz: 'Phishing xabarining odatiy belgilari qaysilar?', ru: 'Какие признаки типичны для фишингового сообщения?' },
        options: [
          { id: 'a', uz: 'Shoshilinch muddat', ru: 'Срочный срок' },
          { id: 'b', uz: 'Shaxsiy ismingiz bilan murojaat', ru: 'Обращение по вашему имени' },
          { id: 'c', uz: 'Begona domenga havola', ru: 'Ссылка на чужой домен' },
          { id: 'd', uz: 'Parol yoki kod so‘rovi', ru: 'Просьба о пароле или коде' },
        ],
        answers: ['a', 'c', 'd'],
        explain: {
          uz: 'Shaxsiy ism ishonchli ko‘rinishi mumkin, lekin o‘z-o‘zidan xavfsizlik belgisi emas; qolganlari qizil bayroqlar.',
          ru: 'Обращение по имени может выглядеть убедительно, но само по себе безопасность не доказывает; остальное - красные флаги.',
        },
      },
      {
        id: 'e4', type: 'order',
        q: { uz: 'Havolani bosib qo‘yganingizdan keyingi harakatlarni tartiblang.', ru: 'Расставьте действия после того, как вы нажали на ссылку.' },
        items: [
          { id: 'i1', uz: 'Hech narsa kiritmay sahifani yopish', ru: 'Закрыть страницу, ничего не вводя' },
          { id: 'i2', uz: 'Agar parol kiritgan bo‘lsangiz, uni darhol almashtirish', ru: 'Если вводили пароль - сразу сменить его' },
          { id: 'i3', uz: 'Ikki bosqichli tasdiqni yoqish/tekshirish', ru: 'Включить или проверить двухэтапную защиту' },
          { id: 'i4', uz: 'Xabarni IT yoki xizmat qo‘llab-quvvatlashiga yetkazish', ru: 'Сообщить о письме в IT или поддержку' },
        ],
        order: ['i1', 'i2', 'i3', 'i4'],
        explain: {
          uz: 'Avval zararni to‘xtating, keyin himoyani kuchaytiring, so‘ng xabar bering.',
          ru: 'Сначала остановите ущерб, затем усильте защиту, после сообщите.',
        },
      },
    ],
  },
];
