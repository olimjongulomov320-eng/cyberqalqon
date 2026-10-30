/**
 * Age group 5-7 - DRAFT CONTENT (needs_review: true).
 *
 * Written to be read WITH a grown-up: very short sentences, one idea per
 * lesson, three-way choices at most. The Uzbek and Russian text has NOT been
 * checked by a native speaker or an early-years educator and must be before
 * release (see ../../CONTENT_REVIEW.md). Nothing here frightens: when
 * something feels wrong, the answer is always "stop and tell a grown-up".
 */
module.exports = [
  {
    slug: 'secret-words',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 10,
    title: { uz: 'Maxfiy so‘z', ru: 'Секретное слово' },
    content: {
      uz: `## Maxfiy so‘z

**Parol** - bu maxfiy so‘z. U tish cho‘tkasi kabi: **faqat sening**.

- Parolni hech kimga aytmaysan.
- Hatto eng yaqin do‘stingga ham.
- Faqat mama yoki dada bilishi mumkin.

> Kimdir parolingni so‘rasa: **«Yo‘q!»** deb ayt va kattaga ayt.`,
      ru: `## Секретное слово

**Пароль** - это секретное слово. Он как зубная щётка: **только твой**.

- Пароль никому не говоришь.
- Даже лучшему другу.
- Знать его могут только мама или папа.

> Если кто-то просит твой пароль: скажи **«Нет!»** и расскажи взрослому.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Maxfiy so‘zni kimga aytish mumkin?', ru: 'Кому можно сказать секретное слово?' },
        options: [
          { id: 'a', uz: 'Mama yoki dadaga', ru: 'Маме или папе' },
          { id: 'b', uz: 'Yangi do‘stimga', ru: 'Новому другу' },
          { id: 'c', uz: 'Hammaga', ru: 'Всем' },
        ],
        answer: 'a',
        explain: { uz: 'Parolni faqat ishongan kattang bilishi mumkin.', ru: 'Пароль может знать только взрослый, которому ты доверяешь.' },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Do‘stingga parolingni aytsa bo‘ladi.', ru: 'Другу можно сказать свой пароль.' },
        answer: 'false',
        explain: { uz: 'Parol faqat seniki. Do‘sting bilan ham bo‘lishmaysan.', ru: 'Пароль только твой. Им не делятся даже с другом.' },
      },
      {
        id: 'e3', type: 'mc',
        q: { uz: 'Parol kimniki?', ru: 'Чей пароль?' },
        options: [
          { id: 'a', uz: 'Faqat meniki', ru: 'Только мой' },
          { id: 'b', uz: 'Hammaniki', ru: 'Общий' },
          { id: 'c', uz: 'Do‘stimniki', ru: 'Друга' },
        ],
        answer: 'a',
        explain: { uz: 'Tish cho‘tkasi kabi, parol ham faqat sening.', ru: 'Как зубная щётка, пароль только твой.' },
      },
    ],
  },

  {
    slug: 'ask-a-grown-up',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 10,
    title: { uz: 'Avval kattadan so‘ra', ru: 'Сначала спроси взрослого' },
    content: {
      uz: `## To‘xta - so‘ra

Ekranda yangi narsa chiqsa:

1. **To‘xta.** Hech narsani bosma.
2. **Kattaga ko‘rsat.**
3. **Javobini kut.**

Yangi o‘yin yuklash, rasm yuborish, notanish bilan gaplashish - hammasi uchun **avval kattadan so‘ra**.`,
      ru: `## Стоп - спроси

Если на экране появилось что-то новое:

1. **Остановись.** Ничего не нажимай.
2. **Покажи взрослому.**
3. **Дождись ответа.**

Скачать игру, отправить фото, поговорить с незнакомцем - всё это **сначала спроси у взрослого**.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Ekranda «Sovg‘a yutding!» deb chiqdi. Nima qilasan?', ru: 'На экране написано «Ты выиграл подарок!». Что делаешь?' },
        options: [
          { id: 'a', uz: 'Kattaga ko‘rsataman', ru: 'Показываю взрослому' },
          { id: 'b', uz: 'Bosaman', ru: 'Нажимаю' },
          { id: 'c', uz: 'Do‘stimga yuboraman', ru: 'Отправляю другу' },
        ],
        answer: 'a',
        explain: { uz: 'Bunday yozuvlar aldash uchun bo‘ladi. Kattaga ko‘rsatish - to‘g‘ri yo‘l.', ru: 'Такие надписи нужны, чтобы обмануть. Показать взрослому - верный путь.' },
      },
      {
        id: 'e2', type: 'order',
        q: { uz: 'Ekranda yangi narsa chiqsa, tartibni joylashtir.', ru: 'Если на экране появилось новое, расставь по порядку.' },
        items: [
          { id: 'i1', uz: 'To‘xtayman', ru: 'Останавливаюсь' },
          { id: 'i2', uz: 'Kattaga ko‘rsataman', ru: 'Показываю взрослому' },
          { id: 'i3', uz: 'Javobini kutaman', ru: 'Жду ответа' },
        ],
        order: ['i1', 'i2', 'i3'],
        explain: { uz: 'Avval to‘xta, keyin ko‘rsat, keyin kut.', ru: 'Сначала стоп, потом покажи, потом жди.' },
      },
      {
        id: 'e3', type: 'tf',
        q: { uz: 'Yangi o‘yinni o‘zing yuklab olsang bo‘ladi.', ru: 'Новую игру можно скачать самому.' },
        answer: 'false',
        explain: { uz: 'Yangi o‘yinni avval kattadan so‘rab, u bilan birga yuklaysan.', ru: 'Новую игру скачиваешь вместе со взрослым, после того как спросил.' },
      },
    ],
  },

  {
    slug: 'what-to-say',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 10,
    title: { uz: 'Nimani aytish mumkin?', ru: 'Что можно рассказывать?' },
    content: {
      uz: `## Maxfiy narsalar

Ba‘zi narsalar **faqat oilangniki**. Ularni notanishga aytmaysan:

- uyingning manzili;
- telefon raqami;
- maktabing yoki bog‘chang nomi;
- o‘zingning rasmlaring.

Notanish sendan shularni so‘rasa: **aytma** va kattaga ayt.`,
      ru: `## Секретные вещи

Кое-что **принадлежит только твоей семье**. Незнакомцу это не говорят:

- адрес дома;
- номер телефона;
- название школы или садика;
- твои фотографии.

Если незнакомец просит это: **не говори** и расскажи взрослому.`,
    },
    exercises: [
      {
        id: 'e1', type: 'multi',
        q: { uz: 'Internetda notanishga nimani aytib bo‘lmaydi? (bir nechtasini tanla)', ru: 'Что нельзя говорить незнакомцу в интернете? (выбери несколько)' },
        options: [
          { id: 'a', uz: 'Uyimning manzili', ru: 'Адрес моего дома' },
          { id: 'b', uz: 'Sevimli multfilmim', ru: 'Мой любимый мультфильм' },
          { id: 'c', uz: 'Telefon raqamim', ru: 'Мой номер телефона' },
          { id: 'd', uz: 'Maktabimning nomi', ru: 'Название моей школы' },
        ],
        answers: ['a', 'c', 'd'],
        explain: { uz: 'Manzil, telefon va maktab nomi seni topishga yordam beradi. Shuning uchun ularni aytmaysan.', ru: 'Адрес, телефон и школа помогают найти тебя. Поэтому их не говорят.' },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Notanish odamga uyingning manzilini aytsa bo‘ladi.', ru: 'Незнакомому человеку можно сказать адрес дома.' },
        answer: 'false',
        explain: { uz: 'Manzilni faqat oilang biladi.', ru: 'Адрес знает только твоя семья.' },
      },
      {
        id: 'e3', type: 'mc',
        q: { uz: 'Notanish sendan rasm so‘radi. Nima qilasan?', ru: 'Незнакомец просит у тебя фото. Что делаешь?' },
        options: [
          { id: 'a', uz: 'Yubormayman, kattaga aytaman', ru: 'Не отправляю, говорю взрослому' },
          { id: 'b', uz: 'Yuboraman', ru: 'Отправляю' },
          { id: 'c', uz: 'Ertaga yuboraman', ru: 'Отправлю завтра' },
        ],
        answer: 'a',
        explain: { uz: 'Rasmni notanishga yubormaysan. Kattaga aytish - to‘g‘ri.', ru: 'Фото незнакомцу не отправляют. Сказать взрослому - правильно.' },
      },
    ],
  },

  {
    slug: 'be-kind-online',
    kind: 'lesson',
    needs_review: true,
    xp_reward: 10,
    title: { uz: 'Internetda mehribon bo‘l', ru: 'Будь добрым в интернете' },
    content: {
      uz: `## Mehribon bo‘l

Internetdagi odamlar ham **haqiqiy odamlar**. Ularning ham his-tuyg‘usi bor.

- Yaxshi so‘zlar yoz.
- Kulgi uchun birovni xafa qilma.

Agar kimdir senga yomon so‘z yozsa yoki qo‘rqitsa:

1. Ekranni yop.
2. Kattaga ayt.

> Bu sening aybing **emas**.`,
      ru: `## Будь добрым

Люди в интернете - тоже **настоящие люди**. У них тоже есть чувства.

- Пиши добрые слова.
- Не обижай других ради смеха.

Если кто-то написал тебе злое или напугал:

1. Закрой экран.
2. Расскажи взрослому.

> Ты ни в чём **не виноват**.`,
    },
    exercises: [
      {
        id: 'e1', type: 'mc',
        q: { uz: 'Kimdir senga yomon so‘z yozdi. Nima qilasan?', ru: 'Кто-то написал тебе злое слово. Что делаешь?' },
        options: [
          { id: 'a', uz: 'Kattaga aytaman', ru: 'Говорю взрослому' },
          { id: 'b', uz: 'Men ham yomon yozaman', ru: 'Пишу злое в ответ' },
          { id: 'c', uz: 'Hech kimga aytmayman', ru: 'Никому не говорю' },
        ],
        answer: 'a',
        explain: { uz: 'Kattaga aytsang, u senga yordam beradi.', ru: 'Если скажешь взрослому, он поможет.' },
      },
      {
        id: 'e2', type: 'tf',
        q: { uz: 'Internetda ham do‘stlarga mehribon bo‘lish kerak.', ru: 'В интернете тоже нужно быть добрым с друзьями.' },
        answer: 'true',
        explain: { uz: 'Ekran ortida ham haqiqiy odam bor.', ru: 'За экраном тоже настоящий человек.' },
      },
      {
        id: 'e3', type: 'mc',
        q: { uz: 'Ekranda qo‘rqinchli narsa chiqdi. Nima qilasan?', ru: 'На экране появилось страшное. Что делаешь?' },
        options: [
          { id: 'a', uz: 'Ekranni yopib, kattaga aytaman', ru: 'Закрываю экран и говорю взрослому' },
          { id: 'b', uz: 'Qarab turaman', ru: 'Продолжаю смотреть' },
          { id: 'c', uz: 'Yashiraman', ru: 'Прячу' },
        ],
        answer: 'a',
        explain: { uz: 'Qo‘rqsang, to‘xta va kattaga ayt. Sen to‘g‘ri qilding.', ru: 'Если страшно, остановись и скажи взрослому. Ты поступил правильно.' },
      },
    ],
  },
];
