import type { Lang } from './i18n';

/**
 * Long-form legal copy, kept out of the UI dictionary because it is prose, not
 * chrome. Structured so both locales share one renderer and stay in lockstep.
 * Uzbek is the source text; Russian is a direct translation.
 */
export type LegalKind = 'privacy' | 'terms';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
  note: string;
}

const NOTE_UZ =
  'Ushbu matn texnik topshiriq asosida tayyorlangan va huquqiy tekshiruvdan oʻtmagan. Ishga tushirishdan oldin huquqchi tomonidan koʻrib chiqilishi lozim.';
const NOTE_RU =
  'Этот текст подготовлен на основе технического задания и не проходил юридическую проверку. Перед запуском его должен проверить юрист.';

export const LEGAL: Record<LegalKind, Record<Lang, LegalDoc>> = {
  privacy: {
    uz: {
      title: 'Maxfiylik siyosati',
      updated: 'Oxirgi tahrir: 2026',
      intro: [
        'CyberQalqon oʻquvchilarni kiber xavfsizlik boʻyicha dars va topshiriqlar orqali oʻqitish uchun moʻljallangan taʼlim platformasi. Quyida platforma qanday maʼlumot toʻplashi va u qayerga yuborilishi bayon qilingan.',
      ],
      sections: [
        {
          heading: 'Qanday maʼlumot saqlanadi',
          paragraphs: [],
          bullets: [
            'Roʻyxatdan oʻtishda: username, elektron pochta manzili, ism va parolning xesh koʻrinishi (bcrypt)',
            'Parol hech qachon ochiq koʻrinishda saqlanmaydi',
            'Oʻquv faoliyati: javoblar, bajarilgan darslar, nazorat natijalari, XP, seriya va yutuqlar',
            'Kod masalalarini topshirganingizda: kodingiz va natija hisobingiz bilan birga saqlanadi',
            'Brauzeringizda: kirish tokeni, til va mavzu sozlamalari, tugallanmagan kod qoralamasi',
            'Yosh guruhi (masalan, 8-12), agar tanlasangiz. Tugʻilgan sana soʻralmaydi va saqlanmaydi',
            'Telefon raqami talab qilinmaydi va yigʻilmaydi',
          ],
        },
        {
          heading: 'Nima uchun ishlatiladi',
          paragraphs: [
            'Maʼlumotlar faqat platformaning ishlashi uchun ishlatiladi: hisobga kirish, darslar koʻrsatish, javoblar baholanishi, taraqqiyotni saqlash va reytingni shakllantirish. Elektron pochta faqat parolni tiklash xatini yuborish uchun ishlatiladi.',
          ],
        },
        {
          heading: 'Reyting',
          paragraphs: [
            'Reyting ochiq. Ismingiz va XP miqdoringiz boshqa foydalanuvchilarga koʻrinadi. Profil sozlamalarida reytingda koʻrinmaslikni tanlashingiz mumkin.',
          ],
        },
        {
          heading: 'Bolalar va oʻsmirlar',
          paragraphs: [
            'Yosh guruhini tanlash ixtiyoriy va faqat mos oʻquv yoʻlini koʻrsatish uchun xizmat qiladi. 13 yoshgacha boʻlgan bolalar uchun hisobni ota-onasi yoki vasiysi ochishi tavsiya etiladi; 1-4 yosh boʻlimi ota-onalar uchun yozilgan.',
            'Bolalar va oʻsmirlar (18 yoshgacha) hisobi hech qachon ommaviy reytingda koʻrsatilmaydi va 13 yoshgacha kod topshiriqlari berilmaydi. Bu qoidalar serverda ham tekshiriladi.',
          ],
        },
        {
          heading: 'Uchinchi tomon xizmatlari',
          paragraphs: [
            'Quyidagi xizmatlar bilan aloqa qilinadi. Hech qanday reklama yoki kuzatuv skriptlari yuklanmaydi va maʼlumotlar sotilmaydi.',
          ],
          bullets: [
            'Parol tekshiruvi: roʻyxatdan oʻtishda Have I Been Pwned xizmati parol oshkor boʻlgan-boʻlmaganini aytadi. Parolning oʻzi yuborilmaydi: faqat SHA-1 xeshining dastlabki 5 belgisi yuboriladi',
            'Kod masalalari: Python ishga tushirish fayllari (Pyodide) jsDelivr tarmogʻidan yuklanadi. Kodingiz qurilmangizda bajariladi',
            'Joylashtirish: sayt GitHub Pages da, server va maʼlumotlar bazasi Render da joylashgan',
            'Parolni tiklash xati Resend xizmati orqali yuboriladi (sozlangan boʻlsa)',
          ],
        },
        {
          heading: 'Oʻchirish',
          paragraphs: [
            'Hisobingizni profil sozlamalaridan istalgan vaqtda butunlay oʻchirishingiz mumkin. Barcha oʻquv maʼlumotlari, topshirilgan kodlar va reytingdagi yozuvlar oʻchiriladi.',
          ],
        },
      ],
      note: NOTE_UZ,
    },
    ru: {
      title: 'Политика конфиденциальности',
      updated: 'Последнее изменение: 2026',
      intro: [
        'CyberQalqon - образовательная платформа для обучения кибербезопасности с помощью уроков и заданий. Ниже описано, какие данные собирает платформа и куда они передаются.',
      ],
      sections: [
        {
          heading: 'Какие данные хранятся',
          paragraphs: [],
          bullets: [
            'При регистрации: username, адрес электронной почты, имя и хеш пароля (bcrypt)',
            'Пароль никогда не хранится в открытом виде',
            'Учебная активность: ответы, пройденные уроки, результаты проверок, XP, серия и достижения',
            'При отправке решений задач на код: ваш код и результат сохраняются в аккаунте',
            'В вашем браузере: токен входа, настройки языка и темы, черновик незавершённого кода',
            'Возрастная группа (например, 8-12), если вы её выберете. Дата рождения не запрашивается и не хранится',
            'Номер телефона не требуется и не собирается',
          ],
        },
        {
          heading: 'Для чего используется',
          paragraphs: [
            'Данные используются только для работы платформы: вход в аккаунт, показ уроков, проверка ответов, сохранение прогресса и формирование рейтинга. Электронная почта используется только для отправки письма со ссылкой на сброс пароля.',
          ],
        },
        {
          heading: 'Рейтинг',
          paragraphs: [
            'Рейтинг открыт. Ваше имя и количество XP видят другие пользователи. В настройках профиля можно отключить показ в рейтинге.',
          ],
        },
        {
          heading: 'Дети и подростки',
          paragraphs: [
            'Выбор возрастной группы необязателен и нужен только для показа подходящего пути обучения. Для детей до 13 лет аккаунт рекомендуется создавать родителю или опекуну; раздел для возраста 1-4 написан для родителей.',
            'Аккаунты детей и подростков (до 18 лет) никогда не показываются в публичном рейтинге, а детям до 13 лет не предлагаются задачи с кодом. Эти правила проверяются и на сервере.',
          ],
        },
        {
          heading: 'Сторонние сервисы',
          paragraphs: [
            'Платформа обращается к перечисленным ниже сервисам. Реклама и скрипты отслеживания не загружаются, данные не продаются.',
          ],
          bullets: [
            'Проверка пароля: при регистрации сервис Have I Been Pwned сообщает, встречался ли пароль в утечках. Сам пароль не отправляется: передаются только первые 5 символов SHA-1 хеша',
            'Задачи на код: файлы для запуска Python (Pyodide) загружаются из сети jsDelivr. Ваш код выполняется на вашем устройстве',
            'Размещение: сайт находится на GitHub Pages, сервер и база данных на Render',
            'Письмо для сброса пароля отправляется через сервис Resend (если он настроен)',
          ],
        },
        {
          heading: 'Удаление',
          paragraphs: [
            'Вы можете в любой момент полностью удалить аккаунт в настройках профиля. Все учебные данные, отправленный код и записи в рейтинге будут удалены.',
          ],
        },
      ],
      note: NOTE_RU,
    },
  },
  terms: {
    uz: {
      title: 'Foydalanish shartlari',
      updated: 'Oxirgi tahrir: 2026',
      intro: [],
      sections: [
        {
          heading: 'Platforma nima uchun',
          paragraphs: [
            'CyberQalqon - oʻquv quroli. U maʼlumotnoma, ilmiy maʼlumotnoma yoki professional sertifikat emas. Platforma professional kiberxavfsizlik malakasi bermaydi.',
          ],
        },
        {
          heading: 'Oʻquv materiallari',
          paragraphs: [
            'Darslar va savollar oʻquv maqsadida yozilgan. Materiallarni koʻpaytirish, tahrirlash yoki boshqa manbalarda ishlatishda ularning manbasini koʻrsating.',
          ],
        },
        {
          heading: 'Etik hatti',
          paragraphs: [],
          bullets: [
            'Platformani oʻquv maqsadida ishlatish',
            'Boshqa foydalanuvchilarning hisoblari yoki natijalariga aralashmaslik',
            'Botlar yoki avtomatik soʻrovlar orqali reytingni sunʼiy oshirishga urinish',
          ],
        },
        {
          heading: 'Reyting',
          paragraphs: [
            'Reyting natijalar avtomatik hisoblanadi. Texnik nosozlik yoki xato natija aniqlansa, platforma reytingni tuzatish huquqini saqlaydi.',
          ],
        },
        {
          heading: 'Mavjudlik',
          paragraphs: [
            'Platforma begona va oʻzgarish mumkin. Modullar, XP qiymatlari va reyting qoidalari oʻzgartirilishi mumkin.',
          ],
        },
      ],
      note: NOTE_UZ,
    },
    ru: {
      title: 'Условия использования',
      updated: 'Последнее изменение: 2026',
      intro: [],
      sections: [
        {
          heading: 'Назначение платформы',
          paragraphs: [
            'CyberQalqon - учебный инструмент. Это не справочник, не академическое пособие и не профессиональный сертификат. Платформа не даёт профессиональной квалификации в области кибербезопасности.',
          ],
        },
        {
          heading: 'Учебные материалы',
          paragraphs: [
            'Уроки и вопросы написаны в учебных целях. При копировании, редактировании или использовании материалов в других источниках указывайте их источник.',
          ],
        },
        {
          heading: 'Кодекс этики',
          paragraphs: [],
          bullets: [
            'Использовать платформу в учебных целях',
            'Не вмешиваться в аккаунты или результаты других пользователей',
            'Не пытаться искусственно поднять рейтинг с помощью ботов или автоматических запросов',
          ],
        },
        {
          heading: 'Рейтинг',
          paragraphs: [
            'Рейтинг рассчитывается автоматически. При обнаружении технической неисправности или ошибочного результата платформа сохраняет право скорректировать рейтинг.',
          ],
        },
        {
          heading: 'Доступность',
          paragraphs: [
            'Платформа доступна и может меняться. Модули, значения XP и правила рейтинга могут изменяться.',
          ],
        },
      ],
      note: NOTE_RU,
    },
  },
};
