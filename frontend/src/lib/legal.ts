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
        'CyberQalqon oʻquvchilarni kiber xavfsizlik boʻyicha qisqa darslar orqali oʻqitish uchun moʻljallangan taʼlim platformasi. Quyida platforma qanday maʼlumot toʻplashi haqida bildiriladi.',
      ],
      sections: [
        {
          heading: 'Qanday maʼlumot saqlanadi',
          paragraphs: [],
          bullets: [
            'Telegram orqali kirishda - Telegram identifikatori, username va ism',
            'Oddiy roʻyxatdan oʻtishda - username, parolning xesh koʻrinishi va ism',
            'Parol hech qachon ochiq koʻrinishda saqlanmaydi',
            'Avatar rasm emas, emoji belgi sifatida saqlanadi',
            'Elektron pochta va telefon raqami talab qilinmaydi va yigʻilmaydi',
          ],
        },
        {
          heading: 'Nima uchun ishlatiladi',
          paragraphs: [
            'Maʼlumotlar faqat platformaning ishlashi uchun ishlatiladi: hisobga kirish, darslar koʻrsatish, javoblar baholanishi va reytingni shakllantirish.',
          ],
        },
        {
          heading: 'Reyting',
          paragraphs: [
            'Reyting ochiq. Ismingiz, avatar emojingiz va XP miqdoringiz boshqa foydalanuvchilar koʻradi. Xohlasangiz, oʻz maʼlumotlaringizni koʻrsatmasdan reytingda qolishingiz mumkin - bunda faqat ism oʻrniga avatar belgisi koʻrsatiladi.',
          ],
        },
        {
          heading: 'Xotira va uzatish',
          paragraphs: [
            'Maʼlumotlar uchinchi tomonlarga sotilmaydi. Hech qanday reklama yoki uchinchi tomon kuzatuv skriptlari yuklanmaydi.',
          ],
        },
        {
          heading: 'Oʻchirish',
          paragraphs: [
            'Hisobingizni butunlay oʻchirishni soʻrashingiz mumkin. Barcha oʻquv maʼlumotlari va reytingdagi yozuvlar oʻchiriladi.',
          ],
        },
      ],
      note: NOTE_UZ,
    },
    ru: {
      title: 'Политика конфиденциальности',
      updated: 'Последнее изменение: 2026',
      intro: [
        'CyberQalqon - образовательная платформа для обучения кибербезопасности с помощью коротких уроков. Ниже описано, какие данные собирает платформа.',
      ],
      sections: [
        {
          heading: 'Какие данные хранятся',
          paragraphs: [],
          bullets: [
            'При входе через Telegram - идентификатор Telegram, username и имя',
            'При обычной регистрации - username, хеш пароля и имя',
            'Пароль никогда не хранится в открытом виде',
            'Аватар хранится не как изображение, а как emoji-символ',
            'Электронная почта и номер телефона не требуются и не собираются',
          ],
        },
        {
          heading: 'Для чего используется',
          paragraphs: [
            'Данные используются только для работы платформы: вход в аккаунт, показ уроков, проверка ответов и формирование рейтинга.',
          ],
        },
        {
          heading: 'Рейтинг',
          paragraphs: [
            'Рейтинг открыт. Ваше имя, emoji-аватар и количество XP видят другие пользователи. При желании вы можете оставаться в рейтинге, не показывая свои данные - тогда вместо имени отображается только символ аватара.',
          ],
        },
        {
          heading: 'Хранение и передача',
          paragraphs: [
            'Данные не продаются третьим лицам. Никакая реклама и сторонние скрипты отслеживания не загружаются.',
          ],
        },
        {
          heading: 'Удаление',
          paragraphs: [
            'Вы можете запросить полное удаление аккаунта. Все учебные данные и записи в рейтинге будут удалены.',
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
