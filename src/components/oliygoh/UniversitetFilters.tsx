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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Qidirish
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Universitet nomi bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        {/* Viloyat Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Viloyat
          </label>
          <select
            value={filters.viloyat}
            onChange={(e) => handleChange('viloyat', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            Universitet turi
          </label>
          <select
            value={filters.turi}
            onChange={(e) => handleChange('turi', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
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
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
          Filtrlarni tozalash
        </button>
      )}
    </div>
  );
};

export default UniversitetFilters;

