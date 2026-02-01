import React from 'react';

interface ClassSeoContentProps {
  classNumber: number | string;
}

export default function ClassSeoContent({ classNumber }: ClassSeoContentProps) {
  const isHighSchool = [9, 10, 11].includes(Number(classNumber));

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Section 1: Advantages */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">
          {classNumber}-sinf uchun elektron darsliklarning afzalligi
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Zamon talabiga ko'ra, <strong>{classNumber}-sinf</strong> o'quvchilari endi og'ir kitoblarni ko'tarib yurishlari shart emas. Bizning saytda barcha fanlardan tasdiqlangan nusxalar mavjud. Har bir darslik O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi tomonidan tasdiqlangan standartlarga mos keladi. Elektron formatda o'qish qulayligi, qidiruv imkoniyati va bepul yuklab olish imkoniyati sizga vaqtingizni tejashga yordam beradi.
        </p>
      </section>

      {/* Section 2: How to Download */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">
          Qanday yuklab olish mumkin?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Kerakli fanni tanlang va <strong>'Yuklab olish'</strong> tugmasini bosing. Barcha fayllar TAS-IX tizimida joylashgan bo'lib, tez va trafikni tejagan holda yuklanadi. PDF formatidagi darsliklarni telefon, planshet yoki kompyuteringizda o'qishingiz mumkin. Har bir fayl yuqori sifatli skanerlangan nusxa bo'lib, asl kitobdagi barcha rasmlar va chizmalar saqlanib qolgan.
        </p>
      </section>

      {/* Section 3: Exam Preparation (Only for 9, 10, 11) */}
      {isHighSchool && (
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">
            OTMga tayyorgarlik
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Ushbu darsliklar oliy o'quv yurtlariga kirish imtihonlariga tayyorlanish uchun eng ishonchli manbadir. <strong>{classNumber}-sinf</strong> o'quv dasturidagi barcha mavzular DTM (Bilimni baholash agentligi) testlariga asos bo'lib xizmat qiladi. Darsliklarni chuqur o'zlashtirish orqali yuqori ball olish imkoniyatini oshirishingiz mumkin.
          </p>
        </section>
      )}
    </div>
  );
}
