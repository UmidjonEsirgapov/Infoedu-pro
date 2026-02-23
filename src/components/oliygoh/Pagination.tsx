import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  baseUrl?: string;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  baseUrl = '/oliygoh'
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Barcha sahifalarni ko'rsatish
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Birinchi sahifa
      pages.push(1);
      
      if (currentPage <= 3) {
        // Avvalgi sahifalar
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Keyingi sahifalar
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // O'rtada
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-10 px-1" aria-label="Sahifalash">
      {/* Oldingi sahifa */}
      <button
        onClick={(e) => handlePageClick(currentPage - 1, e)}
        disabled={currentPage === 1}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-95"
        aria-label="Oldingi sahifa"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Sahifa raqamlari */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 sm:px-3 py-2 text-slate-500 dark:text-slate-400 text-sm"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={(e) => handlePageClick(pageNum, e)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all touch-manipulation active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              aria-label={`Sahifa ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Keyingi sahifa */}
      <button
        onClick={(e) => handlePageClick(currentPage + 1, e)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-95"
        aria-label="Keyingi sahifa"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};

export default React.memo(Pagination);

