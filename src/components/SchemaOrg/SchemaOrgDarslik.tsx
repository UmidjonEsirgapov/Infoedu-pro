'use client'

import React, { useMemo } from 'react'

const PUBLISHER_NAME = "O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi"

export interface SchemaOrgDarslikProps {
	/** Darslik nomi (sahifa sarlavhasidan, masalan "9-sinf Ona tili") */
	bookName: string
	/** Sinf raqami (1–11) */
	sinf: number
	/** URL uchun sinf raqami (masalan 9) */
	sinfRaqami: number
	/** Hozirgi yil (datePublished) */
	currentYear: number
	/** Sayt asosiy URL (masalan https://infoedu.uz) */
	baseUrl: string
	/** Ushbu sahifaning to'liq canonical URL */
	canonicalUrl: string
	/** PDF fayl hajmi (ixtiyoriy) */
	fileSize?: string | null
	/** PDF yuklab olish linki (ixtiyoriy) */
	fileUrl?: string | null
	/** Qisqa tavsif (ixtiyoriy) */
	description?: string | null
}

/**
 * Darslik sahifasi uchun JSON-LD Schema: Book, BreadcrumbList, FAQPage.
 * Next.js Head ichida ishlatiladi.
 */
const SchemaOrgDarslik: React.FC<SchemaOrgDarslikProps> = ({
	bookName,
	sinf,
	sinfRaqami,
	currentYear,
	baseUrl,
	canonicalUrl,
	fileUrl,
	description,
}) => {
	const bookSchema = useMemo(() => ({
		'@context': 'https://schema.org',
		'@type': 'Book',
		name: bookName,
		url: canonicalUrl,
		...(description && { description }),
		author: {
			'@type': 'Organization',
			name: PUBLISHER_NAME,
		},
		publisher: {
			'@type': 'Organization',
			name: PUBLISHER_NAME,
		},
		datePublished: String(currentYear),
		bookFormat: 'https://schema.org/EBook',
		additionalType: 'EBook/PDF',
		educationalLevel: `${sinf}-sinf`,
		inLanguage: 'uz',
		...(fileUrl && {
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'UZS',
				availability: 'https://schema.org/InStock',
				url: fileUrl,
			},
		}),
	}), [bookName, canonicalUrl, description, currentYear, sinf, fileUrl])

	const breadcrumbSchema = useMemo(() => {
		const base = baseUrl.replace(/\/$/, '')
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: base + '/' },
				{ '@type': 'ListItem', position: 2, name: 'Darsliklar', item: `${base}/darsliklar` },
				{ '@type': 'ListItem', position: 3, name: `${sinf}-sinf`, item: `${base}/darsliklar/${sinfRaqami}` },
				{ '@type': 'ListItem', position: 4, name: bookName, item: canonicalUrl },
			],
		}
	}, [baseUrl, sinf, sinfRaqami, bookName, canonicalUrl])

	const faqSchema = useMemo(() => ({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: "Bu darslik yangi nashrmi?",
				acceptedAnswer: {
					'@type': 'Answer',
					text: `Ha, bu ${currentYear}-yilgi eng so'nggi metodika asosidagi yangi nashr.`,
				},
			},
			{
				'@type': 'Question',
				name: "Kitobning javoblari bormi?",
				acceptedAnswer: {
					'@type': 'Answer',
					text: "Ushbu darslik o'quv dasturi uchun mo'ljallangan, mashqlar javoblari darslik oxirida yoki metodik qo'llanmalarda berilishi mumkin.",
				},
			},
		],
	}), [currentYear])

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
			/>
		</>
	)
}

export default SchemaOrgDarslik
