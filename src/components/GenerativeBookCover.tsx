import React from 'react';

interface GenerativeBookCoverProps {
  sinf: number | string;
  title: string;
  className?: string;
}

/**
 * Helper function to get gradient class based on subject keywords
 */
export function getGradientBySubject(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Matematika, Algebra, Geometriya
  if (
    titleLower.includes('matematika') ||
    titleLower.includes('algebra') ||
    titleLower.includes('geometriya') ||
    titleLower.includes('matematik')
  ) {
    return 'bg-gradient-to-br from-blue-600 to-blue-800';
  }
  
  // Ona tili, Adabiyot
  if (
    titleLower.includes('ona tili') ||
    titleLower.includes('adabiyot') ||
    titleLower.includes('til')
  ) {
    return 'bg-gradient-to-br from-green-600 to-green-800';
  }
  
  // Tarix, Huquq
  if (
    titleLower.includes('tarix') ||
    titleLower.includes('huquq') ||
    titleLower.includes('jamiyat')
  ) {
    return 'bg-gradient-to-br from-amber-700 to-orange-900';
  }
  
  // Fizika, Kimyo
  if (
    titleLower.includes('fizika') ||
    titleLower.includes('kimyo') ||
    titleLower.includes('biologiya')
  ) {
    return 'bg-gradient-to-br from-purple-600 to-indigo-900';
  }
  
  // Default
  return 'bg-gradient-to-br from-slate-600 to-slate-800';
}

/**
 * Extract subject name from title (removes class number and common words)
 */
function extractSubjectName(title: string): string {
  // Remove class numbers and common words
  let subject = title
    .replace(/\d+-sinf/gi, '')
    .replace(/\d+ sinf/gi, '')
    .replace(/darslik/gi, '')
    .replace(/uchun/gi, '')
    .trim();
  
  // If empty, use first meaningful word
  if (!subject || subject.length < 3) {
    const words = title.split(/\s+/);
    subject = words.find(w => w.length > 3) || title;
  }
  
  return subject;
}

export default function GenerativeBookCover({
  sinf,
  title,
  className = '',
}: GenerativeBookCoverProps) {
  const gradientClass = getGradientBySubject(title);
  const subjectName = extractSubjectName(title);

  return (
    <div
      className={`relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl ${gradientClass} ${className}`}
      style={{
        transform: 'perspective(1000px) rotateY(-5deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Book Spine (Left side) */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-white/20" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
        {/* Class Number */}
        <div className="text-8xl sm:text-9xl font-black mb-4 drop-shadow-2xl">
          {sinf}
        </div>
        
        {/* Subject Name */}
        <div className="text-lg sm:text-xl font-bold text-center px-4 drop-shadow-lg">
          {subjectName}
        </div>
        
        {/* PDF Badge */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
            PDF
          </span>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
    </div>
  );
}
