/**
 * Google Tag Manager dataLayer — sayt ichidagi harakatlarni GTM orqali yuborish.
 * GTM container yuklangan bo'lsa, dataLayer.push() ishlatiladi.
 *
 * Milliy sertifikat sahifasi — GTM sozlash:
 * 1. Trigger: Custom Event, Event name: milliy_sertifikat_fan_filter → fan_nomi (Data Layer Variable) bilan qaysi fanga filtr qilinganini ko'rasiz.
 * 2. Trigger: Custom Event, Event name: milliy_sertifikat_card_click → fanlar, imtihon_sanalari, imtihon_sarlavha (DLV) bilan qaysi kartochka bosilganini ko'rasiz.
 * GA4 Tag da Event name: milliy_sertifikat_fan_filter yoki milliy_sertifikat_card_click, Parameters: fan_nomi / fanlar va boshqa o'zgaruvchilar.
 */

declare global {
	interface Window {
		dataLayer?: Record<string, unknown>[]
	}
}

export function pushDataLayer(event: string, params?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return
	window.dataLayer = window.dataLayer ?? []
	window.dataLayer.push({
		event,
		...params,
	})
}

/** Milliy sertifikat sahifasida fan bo'yicha filtrlash tugmasi bosilganda */
export function pushMilliySertifikatFanFilter(fanNomi: string): void {
	pushDataLayer('milliy_sertifikat_fan_filter', {
		fan_nomi: fanNomi,
		page: '/milliy-sertifikat-sanalari',
	})
}

/** Milliy sertifikat sahifasida imtihon kartochkasi bosilganda (qaysi fanlar bo'yicha qiziqish) */
export function pushMilliySertifikatCardClick(params: {
	fanlar: string[]
	imtihon_sanalari?: string
	imtihon_sarlavha?: string
}): void {
	pushDataLayer('milliy_sertifikat_card_click', {
		...params,
		page: '/milliy-sertifikat-sanalari',
	})
}
