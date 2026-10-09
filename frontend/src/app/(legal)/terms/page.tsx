import LegalPage from '@/components/LegalPage';

export const metadata = { title: 'Foydalanish shartlari' };

export default function TermsPage() {
  return (
    <LegalPage title="Foydalanish shartlari" updated="Oxirgi tahrir: 2026">
      <h2 className="text-base font-bold text-white">Platforma nima uchun</h2>
      <p>
        CyberQalqon — oʻquv quroli. U maʼlumotnoma, ilmiy maʼlumotnoma yoki professional
        sertifikat emas. Platforma professional kiberxavfsizlik malakasi bermaydi.
      </p>

      <h2 className="text-base font-bold text-white">Oʻquv materiallari</h2>
      <p>
        Darslar va savollar oʻquv maqsadida yozilgan. Materiallarni koʻpaytirish, tahrirlash yoki
        boshqa manbalarda ishlatishda ularning manbasini koʻrsating.
      </p>

      <h2 className="text-base font-bold text-white">Etik hatti</h2>
      <ul>
        <li>Platformani oʻquv maqsadida ishlatish</li>
        <li>Boshqa foydalanuvchilarning hisoblari yoki natijalariga aralashmaslik</li>
        <li>Botlar yoki avtomatik soʻrovlar orqali reytingni sunʼiy oshirishga urinish</li>
      </ul>

      <h2 className="text-base font-bold text-white">Reyting</h2>
      <p>
        Reyting natijalar avtomatik hisoblanadi. Texnik nosozlik yoki xato natija aniqlansa,
        platforma reytingni tuzatish huquqini saqlaydi.
      </p>

      <h2 className="text-base font-bold text-white">Mavjudlik</h2>
      <p>
        Platforma begona va oʻzgarish mumkin. Modullar, XP qiymatlari va reyting qoidalari
        oʻzgartirilishi mumkin.
      </p>

      <blockquote>
        Ushbu matn texnik topshiriq asosida tayyorlangan va huquqiy tekshiruvdan oʻtmagan.
        Ishga tushirishdan oldin huquqchi tomonidan koʻrib chiqilishi lozim.
      </blockquote>
    </LegalPage>
  );
}
