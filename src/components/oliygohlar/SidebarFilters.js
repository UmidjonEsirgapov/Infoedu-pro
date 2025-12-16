import React, { useState } from 'react';
import ButtonPrimary from '@/components/Button/ButtonPrimary';

// Rasmda ko'rsatilgan filter ma'lumotlari
const FILTERS = {
  regions: [
    "Toshkent shahri", "Toshkent viloyati", "Andijon viloyati", "Buxoro viloyati",
    "Fargʻona viloyati", "Jizzax viloyati", "Xorazm viloyati", "Namangan viloyati",
    "Navoiy viloyati", "Qashqadaryo viloyati", "Qoraqalpogʻiston", "Samarqand viloyati",
    "Sirdaryo viloyati", "Surxondaryo viloyati"
  ],
  forms: ["Kunduzgi", "Sirtqi", "Kechki", "Masofaviy"], // Ta'lim shakli
  langs: ["O'zbek", "Rus", "Ingliz", "Qoraqalpoq"],    // Ta'lim tili
  types: ["Davlat", "Xususiy", "Xorijiy"]               // OTM turi
};

// Kichik yordamchi komponent: Ochilib-yopiladigan menyu
const FilterSection = ({ title, children, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800 py-5 last:border-0">
      <button 
        className="flex items-center justify-between w-full group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-200">{title}</h4>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-neutral-400 group-hover:text-blue-600`}>
          ▼
        </span>
      </button>
      {isOpen && <div className="mt-4 animate-fadeIn">{children}</div>}
    </div>
  );
};

const SidebarFilters = ({ 
  filters,    // Hamma filter statelari shu obyekt ichida
  setFilters, // Hamma filterni o'zgartiruvchi funksiya
  onClear 
}) => {

  // Universal o'zgartirish funksiyasi
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sticky top-24 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">Filter</h3>
        <button onClick={onClear} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100">
          Tozalash
        </button>
      </div>

      {/* 1. O'rtacha Kirish Bali (Slider) */}
      <FilterSection title="Kirish bali (min)" isOpenDefault={true}>
        <div className="mb-2">
           <div className="flex justify-between text-sm font-medium mb-2">
             <span>56.7</span>
             <span className="text-blue-600">{filters.minScore}</span>
             <span>189.0</span>
           </div>
           <input 
            type="range" min="56" max="189" step="1"
            value={filters.minScore} 
            onChange={(e) => handleChange('minScore', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </FilterSection>

      {/* 2. Manzil */}
      <FilterSection title="Manzil" isOpenDefault={true}>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" name="region" 
              checked={filters.region === ""}
              onChange={() => handleChange('region', "")}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className={filters.region === "" ? "text-blue-600 font-medium" : "text-neutral-600"}>Barchasi</span>
          </label>
          {FILTERS.regions.map((region) => (
            <label key={region} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" name="region" 
                checked={filters.region === region}
                onChange={() => handleChange('region', region)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-600">{region}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* 3. OTM Turi */}
      <FilterSection title="OTM turi">
        <div className="space-y-2">
           <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="type" checked={filters.type === ""} onChange={() => handleChange('type', "")} className="text-blue-600"/>
            <span className={filters.type === "" ? "text-blue-600" : "text-neutral-600"}>Barchasi</span>
          </label>
          {FILTERS.types.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="type" checked={filters.type === type} onChange={() => handleChange('type', type)} className="text-blue-600"/>
              <span className="text-sm text-neutral-600">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* 4. Ta'lim Shakli */}
      <FilterSection title="Ta'lim shakli">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="form" checked={filters.form === ""} onChange={() => handleChange('form', "")} className="text-blue-600"/>
            <span className={filters.form === "" ? "text-blue-600" : "text-neutral-600"}>Barchasi</span>
          </label>
          {FILTERS.forms.map((form) => (
            <label key={form} className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="form" checked={filters.form === form} onChange={() => handleChange('form', form)} className="text-blue-600"/>
              <span className="text-sm text-neutral-600">{form}</span>
            </label>
          ))}
        </div>
      </FilterSection>

       {/* 5. Ta'lim Tili */}
       <FilterSection title="Ta'lim tili">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="lang" checked={filters.lang === ""} onChange={() => handleChange('lang', "")} className="text-blue-600"/>
            <span className={filters.lang === "" ? "text-blue-600" : "text-neutral-600"}>Barchasi</span>
          </label>
          {FILTERS.langs.map((lang) => (
            <label key={lang} className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="lang" checked={filters.lang === lang} onChange={() => handleChange('lang', lang)} className="text-blue-600"/>
              <span className="text-sm text-neutral-600">{lang}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="mt-6">
        <ButtonPrimary className="w-full rounded-xl" onClick={() => {}}>Natijani ko'rish</ButtonPrimary>
      </div>
    </div>
  );
};

export default SidebarFilters;