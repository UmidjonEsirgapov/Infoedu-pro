import React from 'react';
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
  const viloyatRaw = oliygohMalumotlari?.viloyat;
  const turiRaw = oliygohMalumotlari?.universitetTuri;
  
  // Handle arrays - take first non-null value
  const viloyat = Array.isArray(viloyatRaw) 
    ? viloyatRaw.find(v => v && typeof v === 'string') || viloyatRaw[0] 
    : viloyatRaw;
  const turi = Array.isArray(turiRaw)
    ? turiRaw.find(t => t && typeof t === 'string') || turiRaw[0]
    : turiRaw;

  return (
    <Link href={`/oliygoh/${slug}`}>
      <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 lg:w-56 h-48 sm:h-auto flex-shrink-0 bg-slate-100 dark:bg-slate-700">
            <MyImage
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 192px, 224px"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {title}
              </h3>

              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                {viloyat && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span>{getViloyatLabel(viloyat)}</span>
                  </div>
                )}

                {turi && (
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span>{typeof turi === 'string' ? turi : Array.isArray(turi) ? turi[0] || '' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
              <span>Batafsil ma'lumot</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UniversitetListItem;

