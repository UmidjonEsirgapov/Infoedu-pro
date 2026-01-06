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
  universityName?: string;
}

const QuotaTable: React.FC<QuotaTableProps> = ({ quotas, universityName }) => {
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
    <div className="mt-6 sm:mt-8 md:mt-10">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-5 md:mb-6">
        {universityName ? `${universityName} kirish ballari va qabul kvotalari` : 'Kirish ballari va qabul kvotalari'}
      </h2>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-7 md:mb-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">
           {/* Ta'lim shakli */}
           <div className="relative flex-1 sm:flex-none min-w-[140px]">
             <select 
               value={selectedMode}
               onChange={(e) => setSelectedMode(e.target.value)}
               className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 font-medium py-2.5 sm:py-2.5 pl-3 sm:pl-4 pr-9 sm:pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs sm:text-sm touch-manipulation"
             >
               <option value="">Barchasi</option>
               <option value="Kunduzgi">Kunduzgi</option>
               <option value="Kechki">Kechki</option>
               <option value="Sirtqi">Sirtqi</option>
               <option value="Masofaviy">Masofaviy</option>
             </select>
             <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>

           {/* Til */}
           <div className="relative flex-1 sm:flex-none min-w-[140px]">
             <select 
               value={selectedLang}
               onChange={(e) => setSelectedLang(e.target.value)}
               className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 font-medium py-2.5 sm:py-2.5 pl-3 sm:pl-4 pr-9 sm:pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs sm:text-sm touch-manipulation"
             >
               <option value="">Barchasi</option>
               <option value="O`zbek">O'zbek</option>
               <option value="Rus">Rus</option>
               <option value="Qoraqalpoq">Qoraqalpoq</option>
             </select>
             <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>
        </div>
      </div>

      {/* Desktop Jadval */}
      <div className="hidden md:block relative overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-white dark:bg-slate-800 sticky top-0 z-20">
            <tr>
              <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 w-2/5 rounded-tl-lg">Mutaxassislik</th>
              <th className="py-4 px-6 font-semibold text-green-700 dark:text-green-400 text-sm border-b border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/20 w-3/10 border-l border-slate-200 dark:border-slate-700">Grant</th>
              <th className="py-4 px-6 font-semibold text-blue-700 dark:text-blue-400 text-sm border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 w-3/10 border-l border-slate-200 dark:border-slate-700 rounded-tr-lg">Shartnoma</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800">
            {filteredData.length > 0 ? (
              filteredData.map((item, index: number) => {
                const grantBall = formatBall(item.ballgr || item.grantScore);
                const contractBall = formatBall(item.ballk || item.contractScore);
                const grantQuota = formatQuota(item.grantnm || item.grantQuota);
                const contractQuota = formatQuota(item.contractnm || item.contractQuota);

                return (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-5 px-6 border-b border-slate-100 dark:border-slate-700 align-top">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{item.dirnm || item.name || '-'}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-sm font-mono">{item.dirid || item.code || '-'}</div>
                    </td>
                    <td className="py-5 px-6 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100 dark:border-slate-700 align-top bg-green-50/5 dark:bg-green-900/10">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 dark:text-slate-500">Ball</span>
                          <span className={`text-xl font-bold ${grantBall.hasValue ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                            {grantBall.value}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-700 border-dashed">
                          <span className="text-xs text-slate-400 dark:text-slate-500">Kvota</span>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{grantQuota}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100 dark:border-slate-700 align-top bg-blue-50/5 dark:bg-blue-900/10">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 dark:text-slate-500">Ball</span>
                          <span className={`text-xl font-bold ${contractBall.hasValue ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                            {contractBall.value}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-700 border-dashed">
                          <span className="text-xs text-slate-400 dark:text-slate-500">Kvota</span>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{contractQuota}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-500 dark:text-slate-400">
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((item, index: number) => {
            const grantBall = formatBall(item.ballgr || item.grantScore);
            const contractBall = formatBall(item.ballk || item.contractScore);
            const grantQuota = formatQuota(item.grantnm || item.grantQuota);
            const contractQuota = formatQuota(item.contractnm || item.contractQuota);

            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                {/* Mutaxassislik nomi */}
                <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base mb-1">{item.dirnm || item.name || '-'}</div>
                  <div className="text-slate-400 dark:text-slate-500 text-xs font-mono">{item.dirid || item.code || '-'}</div>
                </div>

                {/* Grant va Shartnoma */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Grant */}
                  <div className="bg-green-50/30 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800/30">
                    <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-2">Grant</div>
                    <div className="mb-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ball</div>
                      <div className={`text-lg sm:text-xl font-bold ${grantBall.hasValue ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                        {grantBall.value}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Kvota</div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{grantQuota}</div>
                    </div>
                  </div>

                  {/* Shartnoma */}
                  <div className="bg-blue-50/30 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">Shartnoma</div>
                    <div className="mb-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ball</div>
                      <div className={`text-lg sm:text-xl font-bold ${contractBall.hasValue ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                        {contractBall.value}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Kvota</div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{contractQuota}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {selectedMode || selectedLang 
                ? `"${selectedMode || 'Barchasi'}" va "${selectedLang || 'Barchasi'}" tili uchun ma'lumot topilmadi.`
                : "Ma'lumot topilmadi."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(QuotaTable);
