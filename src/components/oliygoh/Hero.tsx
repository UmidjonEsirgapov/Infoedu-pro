import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { getViloyatLabel } from './utils';
import MyImage from '@/components/MyImage';

interface HeroProps {
  title: string;
  bgImage: string;
  viloyat?: string | string[] | null;
}

const Hero: React.FC<HeroProps> = ({ title, bgImage, viloyat }) => {
  const academicYear = useMemo(() => {
    const currentYear = new Date().getFullYear(); 
    const nextYear = currentYear + 1;
    return `${currentYear}-${nextYear}`;
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-8">
          
          {/* Matn qismi */}
          <div className="flex-1 flex flex-col justify-center order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-4">
              {title} <br />
              <span className="text-blue-600 dark:text-blue-400 block mt-2 text-2xl lg:text-4xl">
                Kirish ballari {academicYear}
              </span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-6 max-w-2xl">
              {title} bo'yicha {academicYear} o'quv yili uchun o'tish ballari, qabul kvotalari va ta'lim yo'nalishlari haqida to'liq ma'lumotlar bazasi.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-slate-400 dark:text-slate-500" />
                {getViloyatLabel(viloyat)}
              </div>
            </div>
          </div>

          {/* Rasm qismi */}
          <div className="lg:w-1/2 order-1 lg:order-2">
            <div className="relative h-64 md:h-80 lg:h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 group">
               <MyImage
                 src={bgImage}
                 alt={title}
                 fill
                 priority
                 className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                 sizes="(max-width: 768px) 100vw, 50vw"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
               
               <div className="absolute bottom-4 left-4 text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                 <p className="font-medium text-sm text-white/90">{title} binosi</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default React.memo(Hero);
