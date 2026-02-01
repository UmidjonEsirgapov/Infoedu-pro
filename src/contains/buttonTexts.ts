/**
 * Tugma matnlari - barcha UI tugmalaridagi matnlar shu yerda
 * Oson o'zgartirish uchun markazlashtirilgan
 */

export const BUTTON_TEXTS = {
  // Darsliklar bo'limi
  downloadPdf: 'Yuklab olish (PDF)',
  downloadViaTelegram: 'Telegram orqali yuklab olish',
  
  // Telegram reklama matnlari
  telegramSubscribe: 'Telegram kanalga a\'zo bo\'ling',
  telegramSubscribeDescription: 'Yangiliklarni Telegram kanalimizda kuzatib boring',
  
  // Boshqa tugmalar
  backToClassPage: 'Sinf sahifasiga qaytish',
  allClasses: 'Barcha sinflar',
  clearFilters: 'Filtrlarni tozalash',
  
  // Universitetlar bo'limi
  allInstitutions: 'Barcha muassasalar',
  resultsFound: 'ta natija topildi',
  page: 'Sahifa',
  total: 'Jami',
  
  // Xatolik matnlari
  fileNotFound: 'PDF fayl mavjud emas',
  nothingFound: 'Hech narsa topilmadi',
  textbooksNotFound: 'Darsliklar topilmadi',
} as const;

// Telegram havolalari
export const TELEGRAM_LINKS = {
  channel: 'https://t.me/+N0iZB3Ypnhk3MDUy',
  oldChannel: 'https://t.me/info_edu_uz', // Eski kanal (agar kerak bo'lsa)
} as const;
