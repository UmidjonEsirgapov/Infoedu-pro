import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { VILOYAT_LABELS, getViloyatLabel } from './utils';

interface FilterState {
  search: string;
  viloyat: string;
  turi: string;
}

interface UniversitetFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  allUniversities: any[];
}

const UniversitetFilters: React.FC<UniversitetFiltersProps> = ({
  onFilterChange,
  allUniversities,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    viloyat: '',
    turi: '',
  });

  // Get unique viloyatlar and turlar from universities
  const viloyatlar = useMemo(() => {
    const vilSet = new Set<string>();
    allUniversities.forEach((u: any) => {
      // Get viloyat from oliygohMalumotlari
      const vil = u.oliygohMalumotlari?.viloyat;
      if (vil) {
        if (Array.isArray(vil)) {
          vil.forEach((v: string | null) => {
            if (v && typeof v === 'string' && v.trim()) {
              vilSet.add(v.trim());
            }
          });
        } else if (typeof vil === 'string' && vil.trim()) {
          vilSet.add(vil.trim());
        }
      }
    });
    const sorted = Array.from(vilSet).sort();
    return sorted;
  }, [allUniversities]);

  const turlar = useMemo(() => {
    const turSet = new Set<string>();
    allUniversities.forEach((u: any) => {
      const tur = u.oliygohMalumotlari?.universitetTuri;
      if (tur) {
        if (Array.isArray(tur)) {
          tur.forEach((t: string | null) => {
            if (t && typeof t === 'string' && t.trim()) {
              turSet.add(t.trim());
            }
          });
        } else if (typeof tur === 'string' && tur.trim()) {
          turSet.add(tur.trim());
        }
      }
    });
    const sorted = Array.from(turSet).sort();
    return sorted;
  }, [allUniversities]);

  const handleChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { search: '', viloyat: '', turi: '' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = filters.search || filters.viloyat || filters.turi;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 md:p-7 shadow-lg">
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Filtrlash</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Qidiruv va filtrlash</p>
      </div>

      {/* Search */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
          Qidirish
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Universitet nomi..."
            className="w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 touch-manipulation hover:border-slate-300 dark:hover:border-slate-500"
          />
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 mb-5 sm:mb-6">
        {/* Viloyat Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 text-blue-500" />
            Viloyat
          </label>
          <select
            value={filters.viloyat}
            onChange={(e) => handleChange('viloyat', e.target.value)}
            className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 touch-manipulation hover:border-slate-300 dark:hover:border-slate-500 appearance-none cursor-pointer"
          >
            <option value="">Barcha viloyatlar</option>
            {viloyatlar.map((vil) => (
              <option key={vil} value={vil}>
                {getViloyatLabel(vil)}
              </option>
            ))}
          </select>
        </div>

        {/* Universitet Turi Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 text-indigo-500" />
            Universitet turi
          </label>
          <select
            value={filters.turi}
            onChange={(e) => handleChange('turi', e.target.value)}
            className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 touch-manipulation hover:border-slate-300 dark:hover:border-slate-500 appearance-none cursor-pointer"
          >
            <option value="">Barcha turlar</option>
            {turlar.map((tur) => (
              <option key={tur} value={tur}>
                {tur}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 text-red-600 dark:text-red-400 font-semibold text-sm rounded-xl border-2 border-red-200 dark:border-red-800/30 transition-all touch-manipulation transform hover:scale-105 active:scale-95"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
          Filtrlarni tozalash
        </button>
      )}
    </div>
  );
};

export default React.memo(UniversitetFilters);

