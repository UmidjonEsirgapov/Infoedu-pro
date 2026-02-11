/**
 * Milliy sertifikat imtihonlari — GraphQL (imtihonTafsilotlari) strukturasi.
 * fanlar endi massiv: har bir elementda fan_nomi bor.
 */

/** Bitta fan (badge uchun) */
export interface FanItem {
	fan_nomi: string
}

/** GraphQL dan keladigan qator (raw node) */
export interface ImtihonTafsilotlariRaw {
	royxatSana?: string | null
	tolovSana?: string | null
	imtihonSanalari?: string | null
	/** Massiv: [{ fan_nomi: "..." }] yoki eski string */
	fanlar?: FanItemRaw[] | string | null
}

export type FanItemRaw = { fan_nomi?: string | null }

export interface ImtihonNodeRaw {
	title?: string | null
	imtihonTafsilotlari?: ImtihonTafsilotlariRaw | null
}

/** Sahifa va komponentlarda ishlatiladigan normalizatsiya qilingan tur */
export interface MilliySertifikatImtihon {
	id: number
	title: string
	royxatSana: string
	tolovSana: string
	imtihonSanalari: string
	/** Fanlar ro'yxati — har biri fan_nomi bilan Badge */
	fanlar: FanItem[]
}

export const MILLIY_SERTIFIKAT_PRICE = '556 200 so\'m'
export const MY_GOV_UZ_REGISTER_URL = 'https://my.gov.uz/uz/service/891'
