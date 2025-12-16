import React from 'react';
import Link from 'next/link';
import { MapPin, GraduationCap } from 'lucide-react';
import { getViloyatLabel } from './utils';

interface OliygohCardProps {
  title: string;
  slug: string;
  featuredImage?: string | null;
  viloyat?: string | string[] | null;
  excerpt?: string | null;
  universitetTuri?: string[] | null;
}

const OliygohCard: React.FC<OliygohCardProps> = ({
  title,
  slug,
  featuredImage,
  viloyat,
  excerpt,
  universitetTuri,
}) => {
  const imageUrl = featuredImage || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800';
  const excerptText = excerpt 
    ? excerpt.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
    : `${title} bo'yicha kirish ballari, qabul kvotalari va batafsil ma'lumotlar.`;

  return (
    <Link href={`/oliygoh/${slug}`}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {excerptText}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {viloyat && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span>{getViloyatLabel(viloyat)}</span>
              </div>
            )}
            {universitetTuri && universitetTuri.length > 0 && (
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-1.5" />
                <span>{universitetTuri[0]}</span>
              </div>
            )}
          </div>

          {/* Read More */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-blue-600 font-medium text-sm group-hover:underline">
              Batafsil ma'lumot →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OliygohCard;
