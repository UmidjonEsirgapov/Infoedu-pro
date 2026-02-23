import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building2, X, Filter } from 'lucide-react';
import { getViloyatLabel } from './utils';

export interface FilterState {
  search: string;
  viloyat: string;
  turi: string;
}

interface UniversitetFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  allUniversities: any[];
  variant?: 'sidebar' | 'inline';
  value?: FilterState;
}

const defaultFilters: FilterState = { search: '', viloyat: '', turi: '' };

const UniversitetFilters: React.FC<UniversitetFiltersProps> = ({
  onFilterChange,
  allUniversities,
  variant = 'sidebar',
  value: controlledValue,
}) => {
  const [internalFilters, setInternalFilters] = useState<FilterState>(defaultFilters);
  const isControlled = controlledValue !== undefined;
  const filters = isControlled ? controlledValue : internalFilters;

  const setFilters = (next: FilterState) => {
    if (!isControlled) setInternalFilters(next);
    onFilterChange(next);
  };

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

  const hasActiveFilters = Boolean(filters.search || filters.viloyat || filters.turi);

  const inputBase = "rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm";
  const selectBase = inputBase + " appearance-none cursor-pointer py-2.5 px-3 pr-9";

  if (variant === 'inline') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center">
            {/* Search — full width on mobile */}
            <div className="relative flex-1 min-w-0 w-full sm:max-w-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                placeholder="Universitet nomi bo'yicha qidirish..."
                className={inputBase + " w-full pl-10 pr-4 py-3 min-h-[44px] sm:min-h-0 sm:py-2.5"}
                aria-label="Qidirish"
              />
            </div>
            {/* Viloyat + Turi — on mobile: 2 columns grid, on sm+: row */}
            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 sm:items-center w-full sm:w-auto">
              <div className="relative min-w-0 sm:flex-initial sm:min-w-[160px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <select
                  value={filters.viloyat}
                  onChange={(e) => handleChange('viloyat', e.target.value)}
                  className={selectBase + " w-full pl-9 min-h-[44px] sm:min-h-0 py-3 sm:py-2.5"}
                  aria-label="Viloyat"
                >
                  <option value="">Barcha viloyatlar</option>
                  {viloyatlar.map((vil) => (
                    <option key={vil} value={vil}>{getViloyatLabel(vil)}</option>
                  ))}
                </select>
              </div>
              <div className="relative min-w-0 sm:flex-initial sm:min-w-[140px]">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <select
                  value={filters.turi}
                  onChange={(e) => handleChange('turi', e.target.value)}
                  className={selectBase + " w-full pl-9 min-h-[44px] sm:min-h-0 py-3 sm:py-2.5"}
                  aria-label="Universitet turi"
                >
                  <option value="">Barcha turlar</option>
                  {turlar.map((tur) => (
                    <option key={tur} value={tur}>{tur}</option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-[375px]:col-span-2 flex items-center justify-center gap-1.5 px-3 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 active:bg-slate-200 dark:active:bg-slate-600 text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 shrink-0"
                  aria-label="Filtrlarni tozalash"
                >
                  <X className="w-4 h-4" />
                  Tozalash
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 md:p-7 shadow-lg w-full">
      <div className="mb-5 sm:mb-6 flex items-center gap-2">
        <Filter className="w-5 h-5 text-slate-500" />
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Filtrlash</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Qidiruv va filtrlash</p>
        </div>
      </div>
      <div className="mb-5 sm:mb-6">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Qidirish</label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Universitet nomi..."
            className={inputBase + " w-full pl-10 pr-4 py-3"}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-5 sm:mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" /> Viloyat
          </label>
          <select
            value={filters.viloyat}
            onChange={(e) => handleChange('viloyat', e.target.value)}
            className={selectBase + " w-full px-4 py-3"}
          >
            <option value="">Barcha viloyatlar</option>
            {viloyatlar.map((vil) => (
              <option key={vil} value={vil}>{getViloyatLabel(vil)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-indigo-500" /> Universitet turi
          </label>
          <select
            value={filters.turi}
            onChange={(e) => handleChange('turi', e.target.value)}
            className={selectBase + " w-full px-4 py-3"}
          >
            <option value="">Barcha turlar</option>
            {turlar.map((tur) => (
              <option key={tur} value={tur}>{tur}</option>
            ))}
          </select>
        </div>
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <X className="w-4 h-4" />
          Filtrlarni tozalash
        </button>
      )}
    </div>
  );
};

export default React.memo(UniversitetFilters);

