'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface OliygohFAQInfo {
  manzil?: string | null;
  yotoqxonaBormi?: string | boolean | null;
}

interface OliygohFAQProps {
  universityName: string;
  info?: OliygohFAQInfo;
}

const FAQ_ITEMS = [
  {
    questionKey: 'contract_price',
    getQuestion: (name: string) => `${name} kontrakt narxi qancha?`,
    answer: (
      <>
        <ul className="space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong className="text-slate-800 dark:text-slate-200">Gumanitar va pedagogika</strong> — 6 400 000 – 7 500 000 so&apos;m</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Texnika, qishloq xo&apos;jaligi</strong> — 7 000 000 – 8 000 000 so&apos;m</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Iqtisod, huquq va tibbiyot</strong> — 9 000 000 – 14 000 000 so&apos;m</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Masofaviy va sirtqi ta&apos;lim</strong> — Kunduzgi shaklga nisbatan 10–20% arzonroq</li>
        </ul>
      </>
    ),
  },
  {
    questionKey: 'documents_start',
    getQuestion: () => 'Oliygohlarga hujjat topshirish qachon boshlanadi?',
    answer: (
      <p className="text-slate-600 dark:text-slate-300">
        Odatda qabul jarayonlari har yili iyun oyining ikkinchi yarmidan boshlanib, iyul oyining o&apos;rtalariga qadar davom etadi. Hujjatlar <a href="https://my.uzbmb.uz" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">my.uzbmb.uz</a> portali orqali onlayn qabul qilinadi.
      </p>
    ),
  },
  {
    questionKey: 'installments',
    getQuestion: () => "Kontrakt pulini bo'lib to'lash imkoniyati bormi?",
    answer: (
      <p className="text-slate-600 dark:text-slate-300">
        Ha, O&apos;zbekistonda talabalar shartnoma summasini yil davomida kamida 4 qismga bo&apos;lib to&apos;lashlari mumkin. Birinchi chorak to&apos;lovi odatda 1-oktabrgacha amalga oshiriladi.
      </p>
    ),
  },
  {
    questionKey: 'exam_subjects',
    getQuestion: (name: string) => `${name}ga kirish uchun qaysi fanlardan imtihon topshiriladi?`,
    answer: (
      <p className="text-slate-600 dark:text-slate-300">
        O&apos;zbekiston oliy ta&apos;lim muassasalariga kirish uchun odatda O&apos;zbek tili (yoki ona tili), Matematika va yo&apos;nalishga qarab uchinchi fan (Tarix, Biologiya, Kimyo, Fizika, Adabiyot va boshqalar) bo&apos;yicha davlat test sinovlaridan o&apos;tish talab qilinadi. Aniq fanlar har bir yo&apos;nalish uchun Oliy ta&apos;lim, fan va innovatsiyalar vazirligi qoidalariga muvofiq belgilanadi.
      </p>
    ),
  },
  {
    questionKey: 'address',
    getQuestion: (name: string) => `${name} manzili qayerda?`,
    answer: (info?: OliygohFAQInfo) => (
      <p className="text-slate-600 dark:text-slate-300">
        {info?.manzil ? info.manzil : (info ? "Ma'lumot bazada kiritilmagan." : "Oliygoh manzili sahifaning \"Qabul Komissiyasi\" blokida ko'rsatiladi.")}
      </p>
    ),
  },
  {
    questionKey: 'dormitory',
    getQuestion: (name: string) => `${name} yotoqxonasi bormi?`,
    answer: (info?: OliygohFAQInfo) => {
      const has = info?.yotoqxonaBormi;
      const text = has === true || (typeof has === 'string' && has.toLowerCase() !== 'yo\'q' && has !== '')
        ? "Ha, oliygohda talabalar uchun yotoqxona mavjud."
        : has === false || (typeof has === 'string' && (has.toLowerCase() === 'yo\'q' || has === ''))
          ? "Yotoqxona haqida ma'lumotni qabul komissiyasidan so'rashingiz mumkin."
          : "Yotoqxona haqida ma'lumotni oliygoh qabul komissiyasi yoki rasmiy sayt orqali tekshirishingiz mumkin.";
      return <p className="text-slate-600 dark:text-slate-300">{text}</p>;
    },
  },
];

const OliygohFAQ: React.FC<OliygohFAQProps> = ({ universityName, info }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const renderAnswer = (item: (typeof FAQ_ITEMS)[0]) => {
    if (typeof item.answer === 'function') {
      return (item.answer as (info?: OliygohFAQInfo) => React.ReactNode)(info);
    }
    return item.answer;
  };

  return (
    <section className="mt-10 sm:mt-12 md:mt-14 pt-8 sm:pt-10 border-t border-slate-200 dark:border-slate-700">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        Tez-tez beriladigan savollar
      </h2>
      <div className="space-y-2 sm:space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.questionKey}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 overflow-hidden transition-colors hover:border-slate-300 dark:hover:border-slate-600"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-3 text-left py-4 px-4 sm:px-5 font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
                aria-expanded={isOpen}
              >
                <span className="flex-1 pr-2">{item.getQuestion(universityName)}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <div className="text-sm sm:text-base leading-relaxed">
                      {renderAnswer(item)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OliygohFAQ;
