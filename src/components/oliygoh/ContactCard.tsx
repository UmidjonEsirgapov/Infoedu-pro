import React from 'react';
import { MapPin, Phone, Globe, Send } from 'lucide-react';

interface ContactInfo {
  telefon?: string | null;
  telegramKanal?: string | null;
  manzil?: string | null;
  rasmiySayt?: string | null;
}

interface ContactCardProps {
  info: ContactInfo;
}

const ContactCard: React.FC<ContactCardProps> = ({ info }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-900 dark:bg-slate-950 p-4 sm:p-5 md:p-6 text-white">
        <h3 className="text-base sm:text-lg font-bold">Qabul Komissiyasi</h3>
        <p className="text-slate-300 dark:text-slate-400 text-xs mt-1">Savollaringiz bormi? Biz bilan bog'laning</p>
      </div>

      <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           {info.telefon && (
               <a href={`tel:${info.telefon}`} className="flex items-center justify-center gap-2 sm:gap-3 w-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold py-3 sm:py-3.5 rounded-lg sm:rounded-xl transition-all border border-blue-200 dark:border-blue-800 text-sm sm:text-base touch-manipulation">
                 <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">{info.telefon}</span>
               </a>
           )}
           {info.telegramKanal && (
               <a href={info.telegramKanal} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 sm:gap-3 w-full bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-bold py-3 sm:py-3.5 rounded-lg sm:rounded-xl transition-all border border-sky-200 dark:border-sky-800 text-sm sm:text-base touch-manipulation">
                 <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">Telegram orqali yozish</span>
               </a>
           )}
        </div>
        <hr className="border-slate-100 dark:border-slate-700" />
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5 sm:mt-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Manzil</p>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{info.manzil || "Manzil kiritilmagan"}</p>
            </div>
          </div>
          {info.rasmiySayt && (
              <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5 sm:mt-1">
                      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Web-sayt</p>
                      <a href={info.rasmiySayt} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline break-all">Rasmiy saytga o'tish</a>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContactCard);
