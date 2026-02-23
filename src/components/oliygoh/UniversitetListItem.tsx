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

  const turiStr = typeof turi === 'string' ? turi : Array.isArray(turi) ? turi[0] || '' : ''

  return (
    <Link href={`/oliygoh/${slug}`} className="touch-manipulation block active:opacity-95" prefetch={false}>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg active:scale-[0.995] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-xl">
        <div className="relative flex flex-col sm:flex-row">
          {/* Rasm — mobil: ustida, desktop: chapda */}
          <div className="relative aspect-[16/10] w-full flex-shrink-0 sm:aspect-auto sm:h-auto sm:w-40 md:w-48 lg:w-56 sm:min-h-[140px] md:min-h-[160px] bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
            <MyImage
              src={imageUrl}
              alt={title}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 224px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:from-transparent" />
          </div>

          {/* Matn va CTA */}
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400 sm:text-xl">
              {title}
            </h3>

            <div className="mb-4 flex flex-wrap gap-2">
              {viloyat && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700/80 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate max-w-[140px] sm:max-w-none">{getViloyatLabel(viloyat)}</span>
                </span>
              )}
              {turiStr && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700/80 dark:text-slate-300">
                  <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{turiStr}</span>
                </span>
              )}
            </div>

            <div className="mt-auto flex min-h-[44px] items-center font-medium text-blue-600 dark:text-blue-400">
              <span className="text-sm">Batafsil ma'lumot</span>
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(UniversitetListItem);

