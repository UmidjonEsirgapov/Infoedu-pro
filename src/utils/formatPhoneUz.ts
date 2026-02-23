/**
 * Backend dan keladigan +998999567271 formatini
 * ko'rsatish uchun +998 (99) 956-72-71 qilib formatlaydi.
 */
export function formatPhoneUz(raw: string | null | undefined): string {
  if (raw == null || raw === '') return '';
  const digits = raw.replace(/\D/g, '');
  // 12 raqam: 998 + 2 (operator) + 7 (abonent)
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
  }
  // 9 raqam: 99 9567271 — 998 qo'shib formatlash
  if (digits.length === 9) {
    return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
  }
  return raw;
}
