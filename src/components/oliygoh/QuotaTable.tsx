import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

interface QuotaItem {
  dirnm?: string;
  dirid?: string;
  name?: string;
  code?: string;
  ballgr?: string | number;
  ballk?: string | number;
  grantScore?: string | number;
  contractScore?: string | number;
  grantnm?: string | number;
  contractnm?: string | number;
  grantQuota?: string | number;
  contractQuota?: string | number;
  langnm?: string;
  lang?: string;
  emnm?: string;
  mode?: string;
}

interface QuotaTableProps {
  quotas: QuotaItem[];
}

const QuotaTable: React.FC<QuotaTableProps> = ({ quotas }) => {
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedLang, setSelectedLang] = useState(''); 

  const filteredData = useMemo(() => {
    if (!quotas || !Array.isArray(quotas) || quotas.length === 0) {
      return [];
    }
    
    let data = [...quotas];
    
    // Normalize funksiyasi: apostroflarni birlashtirish
    const normalizeLang = (str: string) => {
      if (!str) return '';
      return str.trim().replace(/[''`ʻʼ]/g, "'");
    };
    
    // Til bo'yicha filtr (langnm maydoni) - faqat tanlangan bo'lsa
    if (selectedLang && selectedLang.trim() !== '') {
      const normalizedSelectedLang = normalizeLang(selectedLang);
      data = data.filter(item => {
        const itemLang = item.langnm || item.lang;
        if (!itemLang) return false;
        const normalizedItemLang = normalizeLang(itemLang);
        return normalizedItemLang === normalizedSelectedLang;
      });
    }
    
    // Ta'lim shakli bo'yicha filtr (emnm maydoni) - faqat tanlangan bo'lsa
    if (selectedMode && selectedMode.trim() !== '') {
      data = data.filter(item => {
        const itemMode = item.emnm || item.mode;
        return itemMode && itemMode.trim() === selectedMode.trim();
      });
    }
    
    return data;
  }, [quotas, selectedLang, selectedMode]);

  // Ball qiymatini formatlash funksiyasi
  const formatBall = (ballValue: string | number | undefined | null): { value: string; hasValue: boolean } => {
    if (!ballValue || ballValue === '' || ballValue === null || ballValue === undefined || 
        ballValue === '0' || ballValue === 0 || ballValue === '0.0' || ballValue === 0.0) {
      return { value: '-', hasValue: false };
    }
    const ballNum = parseFloat(String(ballValue));
    const hasValue = !isNaN(ballNum) && ballNum > 0;
    return {
      value: hasValue ? ballNum.toFixed(1) : '-',
      hasValue
    };
  };

  // Kvota qiymatini formatlash funksiyasi
  const formatQuota = (quotaValue: string | number | undefined | null): string => {
    if (!quotaValue || quotaValue === '' || quotaValue === null || quotaValue === undefined || 
        quotaValue === '0' || quotaValue === 0) {
      return '-';
    }
    return String(quotaValue);
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Kirish ballari va qabul kvotalari</h2>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
           {/* Ta'lim shakli */}
           <div className="relative flex-1 sm:flex-none">
             <select 
               value={selectedMode}
               onChange={(e) => setSelectedMode(e.target.value)}
               className="w-full appearance-none bg-slate-50 border border-slate-200 text-blue-600 font-medium py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
             >
               <option value="">Barchasi</option>
               <option value="Kunduzgi">Kunduzgi</option>
               <option value="Kechki">Kechki</option>
               <option value="Sirtqi">Sirtqi</option>
               <option value="Masofaviy">Masofaviy</option>
             </select>
             <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
           </div>

           {/* Til */}
           <div className="relative flex-1 sm:flex-none">
             <select 
               value={selectedLang}
               onChange={(e) => setSelectedLang(e.target.value)}
               className="w-full appearance-none bg-slate-50 border border-slate-200 text-blue-600 font-medium py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
             >
               <option value="">Barchasi</option>
               <option value="O`zbek">O'zbek</option>
               <option value="Rus">Rus</option>
               <option value="Qoraqalpoq">Qoraqalpoq</option>
             </select>
             <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
           </div>
        </div>
      </div>

      {/* Jadval */}
      <div className="hidden md:block relative overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-white sticky top-0 z-20">
            <tr>
              <th className="py-4 px-6 font-semibold text-slate-500 text-sm border-b border-slate-200 bg-slate-50 w-2/5 rounded-tl-lg">Mutaxassislik</th>
              <th className="py-4 px-6 font-semibold text-green-700 text-sm border-b border-slate-200 bg-green-50 w-3/10 border-l border-slate-200">Grant</th>
              <th className="py-4 px-6 font-semibold text-blue-700 text-sm border-b border-slate-200 bg-blue-50 w-3/10 border-l border-slate-200 rounded-tr-lg">Shartnoma</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredData.length > 0 ? (
              filteredData.map((item, index: number) => {
                const grantBall = formatBall(item.ballgr || item.grantScore);
                const contractBall = formatBall(item.ballk || item.contractScore);
                const grantQuota = formatQuota(item.grantnm || item.grantQuota);
                const contractQuota = formatQuota(item.contractnm || item.contractQuota);

                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-6 border-b border-slate-100 align-top">
                      <div className="font-bold text-slate-800 text-base mb-1">{item.dirnm || item.name || '-'}</div>
                      <div className="text-slate-400 text-sm font-mono">{item.dirid || item.code || '-'}</div>
                    </td>
                    <td className="py-5 px-6 border-b border-slate-100 border-l border-slate-100 align-top bg-green-50/5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Ball</span>
                          <span className={`text-xl font-bold ${grantBall.hasValue ? 'text-slate-800' : 'text-slate-300'}`}>
                            {grantBall.value}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 border-dashed">
                          <span className="text-xs text-slate-400">Kvota</span>
                          <span className="text-sm font-medium text-slate-600">{grantQuota}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 border-b border-slate-100 border-l border-slate-100 align-top bg-blue-50/5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Ball</span>
                          <span className={`text-xl font-bold ${contractBall.hasValue ? 'text-slate-800' : 'text-slate-300'}`}>
                            {contractBall.value}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 border-dashed">
                          <span className="text-xs text-slate-400">Kvota</span>
                          <span className="text-sm font-medium text-slate-600">{contractQuota}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-500">
                  {selectedMode || selectedLang 
                    ? `"${selectedMode || 'Barchasi'}" va "${selectedLang || 'Barchasi'}" tili uchun ma'lumot topilmadi.`
                    : "Ma'lumot topilmadi."
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotaTable;
