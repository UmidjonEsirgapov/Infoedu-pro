import React from 'react';

interface SEOContentExpanderProps {
  title: string;
  sinf: number | string;
}

export default function SEOContentExpander({ title, sinf }: SEOContentExpanderProps) {
  return (
    <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
      {/* Section 1: Contextual H2 Header */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">
          O'zbekiston maktablarida {title} fanining o'rni
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Ushbu <strong>{title}</strong> darsligi <strong>{sinf}-sinf</strong> o'quv dasturidagi eng muhim manbalardan biridir. Yangi o'quv yilida ushbu fan orqali o'quvchilar nafaqat nazariy bilimlarini oshiradilar, balki amaliy ko'nikmalarni ham shakllantiradilar. Kitob O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi tomonidan tasdiqlangan standartlarga to'liq javob beradi.
        </p>
      </section>

      {/* Section 2: Benefits List */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">
          Nega elektron (PDF) darslikdan foydalanish qulay?
        </h2>
        <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-slate-600 dark:text-slate-400">
          <li>
            <strong>Mobillik:</strong> Kitob har doim yoningizda – telefon yoki planshet orqali istalgan joyda o'qish mumkin.
          </li>
          <li>
            <strong>Qidiruv:</strong> PDF formatdagi <strong>{title}</strong> kitobidan kerakli mavzuni tezda topish imkoniyati mavjud.
          </li>
          <li>
            <strong>Sifat:</strong> Asl nusxadagi yuqori sifatli rasmlar va chizmalar saqlanib qolgan.
          </li>
          <li>
            <strong>Tejamkorlik:</strong> Kitobni bepul yuklab olish orqali oilaviy byudjetni tejashingiz mumkin.
          </li>
        </ul>
      </section>

      {/* Section 3: Exam Preparation */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">
          {title} – OTMga kirish imtihonlari uchun tayyorgarlik
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Abituriyentlar uchun <strong>{sinf}-sinf {title}</strong> darsligi DTM (Bilimni baholash agentligi) testlariga tayyorlanishda asosiy manba hisoblanadi. Ushbu kitobdagi mavzular kirish imtihonlari savollariga kiritilgan bo'lib, uni chuqur o'zlashtirish yuqori ball olish imkoniyatini oshiradi.
        </p>
      </section>
    </div>
  );
}
