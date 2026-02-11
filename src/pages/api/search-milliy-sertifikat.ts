import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchMilliySertifikatYangiliklar } from '@/lib/fetch-milliy-sertifikat-yangiliklar'
import { fetchMilliySertifikatImtihonlar } from '@/lib/fetch-milliy-sertifikat-imtihonlar'
import type { MilliySertifikatPost } from '@/lib/fetch-milliy-sertifikat-yangiliklar'
import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') || ''
const CATEGORY_SLUG = 'milliy-sertifikat'

/** Milliy sertifikat bo‘yicha qidiruv: yangiliklar (REST search) + imtihonlar (filtr) */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<{
		yangiliklar: MilliySertifikatPost[]
		imtihonlar: MilliySertifikatImtihon[]
	}>
) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET')
		return res.status(405).json({ yangiliklar: [], imtihonlar: [] })
	}

	const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
	if (!q) {
		return res.status(200).json({ yangiliklar: [], imtihonlar: [] })
	}

	try {
		// 1) Yangiliklar: WordPress REST da category + search
		let yangiliklar: MilliySertifikatPost[] = []
		try {
			const catRes = await fetch(
				`${WP_URL}/wp-json/wp/v2/categories?slug=${CATEGORY_SLUG}&per_page=1`
			)
			if (catRes.ok) {
				const cats = (await catRes.json()) as { id: number }[]
				const categoryId = cats[0]?.id
				if (categoryId) {
					const postsRes = await fetch(
						`${WP_URL}/wp-json/wp/v2/posts?categories=${categoryId}&search=${encodeURIComponent(q)}&per_page=8&orderby=date&order=desc&_fields=id,title,excerpt,link,date`
					)
					if (postsRes.ok) {
						const data = (await postsRes.json()) as {
							id: number
							title?: { rendered?: string }
							excerpt?: { rendered?: string }
							link?: string
							date?: string
						}[]
						yangiliklar = data.map((p) => ({
							id: p.id,
							title: p.title?.rendered?.replace(/<[^>]*>/g, '') ?? '',
							excerpt: (p.excerpt?.rendered ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 160),
							link: p.link ?? '',
							date: p.date ?? '',
							featuredImageUrl: null,
						}))
					}
				}
			}
		} catch (e) {
			console.error('Milliy sertifikat yangiliklar search:', e)
		}

		// 2) Imtihonlar: barchasini olib, sarlavha va fanlar bo‘yicha filtrlash
		let imtihonlar: MilliySertifikatImtihon[] = []
		try {
			const all = await fetchMilliySertifikatImtihonlar()
			imtihonlar = all.filter((im) => {
				const titleMatch = im.title?.toLowerCase().includes(q)
				const fanMatch = im.fanlar?.some((f) =>
					f.fan_nomi?.toLowerCase().includes(q)
				)
				return titleMatch || fanMatch
			})
			imtihonlar = imtihonlar.slice(0, 8)
		} catch (e) {
			console.error('Milliy sertifikat imtihonlar search:', e)
		}

		res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
		return res.status(200).json({ yangiliklar, imtihonlar })
	} catch (err) {
		console.error('search-milliy-sertifikat:', err)
		return res.status(200).json({ yangiliklar: [], imtihonlar: [] })
	}
}
