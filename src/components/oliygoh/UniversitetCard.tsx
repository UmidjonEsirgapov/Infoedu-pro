import React from 'react';
import Link from 'next/link';
import { MapPin, Building2 } from 'lucide-react';
import { getViloyatLabel } from './utils';
import MyImage from '@/components/MyImage';

interface UniversitetCardProps {
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
    universitetTuri?: string | null;
  } | null;
}

const UniversitetCard: React.FC<UniversitetCardProps> = ({
  title,
  slug,
  featuredImage,
  oliygohMalumotlari,
}) => {
  const imageUrl = featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800';
  const viloyat = oliygohMalumotlari?.viloyat;
  const turi = oliygohMalumotlari?.universitetTuri;

  return (
    <Link href={`/oliygoh/${slug}`}>
      <div className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <MyImage
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          <div className="space-y-2">
            {viloyat && (
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                <span className="truncate">{getViloyatLabel(viloyat)}</span>
              </div>
            )}

            {turi && (
              <div className="flex items-center text-sm text-slate-600">
                <Building2 className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                <span className="truncate">{turi}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
              Batafsil ma'lumot →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UniversitetCard;

