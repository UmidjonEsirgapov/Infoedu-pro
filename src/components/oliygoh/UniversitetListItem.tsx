import React, { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import { getViloyatLabel } from './utils';
import MyImage from '@/components/MyImage';

interface UniversitetListItemProps {
  title: string;
  slug: string;
  featuredImage?: {
    node?: {
      sourceUrl: string;
      altText?: string | null;
    } | null;
  } | null;
  oliygohMalumotlari?: {
    viloyat?: string | string[] | null;
    universitetTuri?: string | string[] | null;
  } | null;
}

const UniversitetListItem: React.FC<UniversitetListItemProps> = ({
  title,
  slug,
  featuredImage,
  oliygohMalumotlari,
}) => {
  const imageUrl = featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400';
  
  // Memoize viloyat va turi calculations
  const { viloyat, turi } = useMemo(() => {
    const viloyatRaw = oliygohMalumotlari?.viloyat;
    const turiRaw = oliygohMalumotlari?.universitetTuri;
    
    const viloyat = Array.isArray(viloyatRaw) 
      ? viloyatRaw.find(v => v && typeof v === 'string') || viloyatRaw[0] 
      : viloyatRaw;
    const turi = Array.isArray(turiRaw)
      ? turiRaw.find(t => t && typeof t === 'string') || turiRaw[0]
      : turiRaw;
    
    return { viloyat, turi };
  }, [oliygohMalumotlari]);

  return (
    <Link href={`/oliygoh/${slug}`} className="touch-manipulation block" prefetch={false}>
      <div className="group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden active:scale-[0.98]">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
        
        <div className="relative flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-44 md:w-52 lg:w-60 h-48 sm:h-auto sm:min-h-[160px] md:min-h-[180px] flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
            <MyImage
              src={imageUrl}
              alt={title}
              fill
              loading="lazy"
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 176px, (max-width: 1024px) 208px, 240px"
            />
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col justify-between min-h-[160px] sm:min-h-0">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                {title}
              </h3>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
                {viloyat && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs sm:text-sm font-medium border border-blue-200 dark:border-blue-800/30">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{getViloyatLabel(viloyat)}</span>
                  </div>
                )}

                {turi && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs sm:text-sm font-medium border border-indigo-200 dark:border-indigo-800/30">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{typeof turi === 'string' ? turi : Array.isArray(turi) ? turi[0] || '' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                <span>Batafsil ma'lumot</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Ko'rish →
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(UniversitetListItem);

