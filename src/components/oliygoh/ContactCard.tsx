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
    <aside className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
        <div className="bg-slate-900 p-6 text-white">
          <h3 className="text-lg font-bold">Qabul Komissiyasi</h3>
          <p className="text-slate-300 text-xs mt-1">Savollaringiz bormi? Biz bilan bog'laning</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-3">
             {info.telefon && (
                 <a href={`tel:${info.telefon}`} className="flex items-center justify-center gap-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3.5 rounded-xl transition-all border border-blue-200">
                   <Phone className="w-5 h-5" /> {info.telefon}
                 </a>
             )}
             {info.telegramKanal && (
                 <a href={info.telegramKanal} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold py-3.5 rounded-xl transition-all border border-sky-200">
                   <Send className="w-5 h-5" /> Telegram orqali yozish
                 </a>
             )}
          </div>
          <hr className="border-slate-100" />
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0 mt-1">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Manzil</p>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">{info.manzil || "Manzil kiritilmagan"}</p>
              </div>
            </div>
            {info.rasmiySayt && (
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0 mt-1">
                        <Globe className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Web-sayt</p>
                        <a href={info.rasmiySayt} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-medium hover:underline">Rasmiy saytga o'tish</a>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ContactCard;
