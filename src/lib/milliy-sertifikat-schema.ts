import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'
import { FAQ_ITEMS_EDTECH } from '@/components/milliy-sertifikat/MilliySertifikatEdTechFAQ'

const SITE_URL = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, '') || ''
const PAGE_PATH = '/milliy-sertifikat-sanalari'

/**
 * Har bir imtihon uchun to'liq EducationEvent JSON-LD (Technical SEO).
 */
export function buildEducationEventSchema(
	item: MilliySertifikatImtihon,
	_index: number
): object {
	const name = item.title
		? `Milliy sertifikat imtihoni — ${item.title}`
		: 'Milliy sertifikat imtihoni'
	const fanlarText =
		item.fanlar?.length > 0
			? item.fanlar.map((f) => f.fan_nomi).join(', ')
			: ''
	const description = [
		item.imtihonSanalari && `Imtihon sanalari: ${item.imtihonSanalari}.`,
		fanlarText && `Fanlar: ${fanlarText}.`,
		"Milliy sertifikat test sinovlari 2026 — to'liq ma'lumot va muddatlar.",
	]
		.filter(Boolean)
		.join(' ')

	return {
		'@type': 'EducationEvent',
		name,
		description: description || "Milliy sertifikat test sinovlari jadvali 2026 — to'liq ma'lumot va muddatlar",
		startDate: item.royxatSana || undefined,
		endDate: item.tolovSana || undefined,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
		location: {
			'@type': 'VirtualLocation',
			url: `${SITE_URL}${PAGE_PATH}`,
			name: 'Milliy sertifikat — onlayn ro\'yxatdan o\'tish',
		},
		organizer: {
			'@type': 'Organization',
			name: 'O\'zbekiston Respublikasi Ta\'lim tizimi',
			url: SITE_URL,
		},
		offers: {
			'@type': 'Offer',
			price: '556200',
			priceCurrency: 'UZS',
			url: `${SITE_URL}${PAGE_PATH}`,
		},
	}
}

export function buildEventsSchema(items: MilliySertifikatImtihon[]): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: buildEducationEventSchema(item, i),
		})),
	}
}

export function buildFAQSchema(): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: FAQ_ITEMS_EDTECH.map((faq) => ({
			'@type': 'Question',
			name: faq.q,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.a,
			},
		})),
	}
}
