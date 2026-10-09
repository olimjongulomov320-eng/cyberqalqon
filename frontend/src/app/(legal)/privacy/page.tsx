import LegalPage from '@/components/LegalPage';

export const metadata = { title: 'Maxfiylik siyosati' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Maxfiylik siyosati" updated="Oxirgi tahrir: 2026">
      <p>
        CyberQalqon oʻquvchilarni kiber xavfsizlik boʻyicha qisqa darslar orqali oʻqitish uchun
        moʻljallangan taʼlim platformasi. Quyida platforma qanday maʼlumot toʻplashi haqida
        bildiriladi.
      </p>

      <h2 className="text-base font-bold text-white">Qanday maʼlumot saqlanadi</h2>
      <ul>
        <li>Telegram orqali kirishda — Telegram identifikatori, username va ism</li>
        <li>Oddiy roʻyxatdan oʻtishda — username, parolning xesh koʻrinishi va ism</li>
        <li>Parol hech qachon ochiq koʻrinishda saqlanmaydi</li>
        <li>Avatar rasm emas, emoji belgi sifatida saqlanadi</li>
        <li>Elektron pochta va telefon raqami talab qilinmaydi va yigʻilmaydi</li>
      </ul>

      <h2 className="text-base font-bold text-white">Nima uchun ishlatiladi</h2>
      <p>
        Maʼlumotlar faqat platformaning ishlashi uchun ishlatiladi: hisobga kirish, darslar
        koʻrsatish, javoblar baholanishi va reytingni shakllantirish.
      </p>

      <h2 className="text-base font-bold text-white">Reyting</h2>
      <p>
        Reyting ochiq. Ismingiz, avatar emojingiz va XP miqdoringiz boshqa foydalanuvchilar
        koʻradi. Xohlasangiz, oʻz maʼlumotlaringizni koʻrsatmasdan reytingda qolishingiz mumkin —
        bunda faqat ism oʻrniga avatar belgisi koʻrsatiladi.
      </p>

      <h2 className="text-base font-bold text-white">Xotira va uzatish</h2>
      <p>
        Maʼlumotlar uchinchi tomonlarga sotilmaydi. Hech qanday reklama yoki uchinchi tomon
        kuzatuv skriptlari yuklanmaydi.
      </p>

      <h2 className="text-base font-bold text-white">Oʻchirish</h2>
      <p>
        Hisobingizni butunlay oʻchirishni soʻrashingiz mumkin. Barcha oʻquv maʼlumotlari va
        reytingdagi yozuvlar oʻchiriladi.
      </p>

      <blockquote>
        Ushbu matn texnik topshiriq asosida tayyorlangan va huquqiy tekshiruvdan oʻtmagan.
        Ishga tushirishdan oldin huquqchi tomonidan koʻrib chiqilishi lozim.
      </blockquote>
    </LegalPage>
  );
}
