// Viloyat kodlarini label'larga o'girish mapping
export const VILOYAT_LABELS: Record<string, string> = {
  andijon: "Andijon viloyati",
  buxoro: "Buxoro viloyati",
  fargona: "Farg'ona viloyati",
  jizzax: "Jizzax viloyati",
  namangan: "Namangan viloyati",
  navoiy: "Navoiy viloyati",
  qashqadaryo: "Qashqadaryo viloyati",
  samarqand: "Samarqand viloyati",
  sirdaryo: "Sirdaryo viloyati",
  surxondaryo: "Surxondaryo viloyati",
  toshkent: "Toshkent viloyati",
  xorazm: "Xorazm viloyati",
  qoraqalpogiston: "Qoraqalpog'iston Respublikasi",
  toshkent_shahar: "Toshkent shahri",
};

// Viloyat kodini label'ga o'girish funksiyasi
export const getViloyatLabel = (viloyatCode: string | string[] | null | undefined): string => {
  if (!viloyatCode) return "Viloyat kiritilmagan";
  
  // Agar array bo'lsa, birinchi null bo'lmagan elementni olamiz
  let code: string | null = null;
  if (Array.isArray(viloyatCode)) {
    // Array ichidan birinchi null bo'lmagan elementni topamiz
    const validItem = viloyatCode.find((item) => item && typeof item === 'string' && item.trim());
    code = validItem || null;
  } else if (typeof viloyatCode === 'string') {
    code = viloyatCode;
  }
  
  if (!code || !code.trim()) return "Viloyat kiritilmagan";
  
  // Kodni to'g'ri formatda olamiz (katta-kichik harflarni e'tiborsiz)
  const normalizedCode = code.toLowerCase().trim();
  
  // Mapping'dan label'ni topamiz
  const label = VILOYAT_LABELS[normalizedCode];
  
  return label || code; // Agar topilmasa, asl kodni qaytaramiz
};
