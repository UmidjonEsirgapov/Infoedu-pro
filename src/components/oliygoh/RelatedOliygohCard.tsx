import React from 'react';
import Link from 'next/link';
import MyImage from '@/components/MyImage';

interface RelatedOliygohCardProps {
  title: string;
  slug: string;
  featuredImage?: {
    node?: {
      sourceUrl: string;
      altText?: string | null;
    } | null;
  } | null;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400';

const RelatedOliygohCard: React.FC<RelatedOliygohCardProps> = ({ title, slug, featuredImage }) => {
  const imageUrl = featuredImage?.node?.sourceUrl || DEFAULT_IMAGE;

  return (
    <Link
      href={`/oliygoh/${slug}`}
      className="group block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/10 transition-all duration-300 active:scale-[0.99]"
      prefetch={false}
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <MyImage
          src={imageUrl}
          alt={title}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {title}
        </h3>
      </div>
    </Link>
  );
};

export default React.memo(RelatedOliygohCard);
