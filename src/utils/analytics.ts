import { event } from 'nextjs-google-analytics'

/** GA4 event categories — bo‘limlar bo‘yicha filtrlash uchun */
export const GA_CATEGORIES = {
  Textbooks: 'Textbooks',
  Navigation: 'Navigation',
  Outbound: 'Outbound',
  University: 'University',
} as const

/** Tugma/havola bosilishini GA ga yuborish */
export function trackButtonClick(
  category: string,
  label: string,
  value?: number
): void {
  if (typeof window === 'undefined') return
  event('click', {
    category,
    label,
    ...(value !== undefined && { value }),
  })
}

/**
 * Telegram kanal havolasini ochish (kanalni ko‘rish) — barcha Telegram CTA lar uchun.
 * source: qayerdan bosilgani (textbook_page, post_banner, university_contact, oliygoh_banner).
 * context: ixtiyoriy (masalan darslik slug, oliygoh nomi).
 */
export function trackTelegramChannelView(
  source: 'textbook_page' | 'post_banner' | 'university_contact' | 'oliygoh_banner',
  context?: string
): void {
  if (typeof window === 'undefined') return
  const label = context ? `telegram_channel_view_${source}_${context}` : `telegram_channel_view_${source}`
  event('click', {
    category: GA_CATEGORIES.Outbound,
    label,
  })
}

export { event as gaEvent }
