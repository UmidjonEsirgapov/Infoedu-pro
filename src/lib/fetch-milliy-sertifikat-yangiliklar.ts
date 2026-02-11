const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') || ''
const REVALIDATE_SECONDS = 3600
const CATEGORY_SLUG = 'milliy-sertifikat'
const PER_PAGE = 3

export interface MilliySertifikatPost {
	id: number
	title: string
	excerpt: string
	link: string
	date: string
	/** Post rasmi (featured image) URL; null bo'lsa rasm yo'q (getStaticProps undefined ni serialize qilmaydi) */
	featuredImageUrl: string | null
}

/**
 * WordPress REST: /category/milliy-sertifikat ruknidagi oxirgi 3 ta post. ISR.
 */
export async function fetchMilliySertifikatYangiliklar(): Promise<MilliySertifikatPost[]> {
	try {
		const catRes = await fetch(
			`${WP_URL}/wp-json/wp/v2/categories?slug=${CATEGORY_SLUG}&per_page=1`,
			{ next: { revalidate: REVALIDATE_SECONDS } }
		)
		if (!catRes.ok) return []
		const cats = (await catRes.json()) as { id: number }[]
		const categoryId = cats[0]?.id
		if (!categoryId) return []

		// _fields da _links va _embedded bo'lishi kerak, yoki _fields siz so'rov — aks holda _embedded qaytarmaydi
		const postsRes = await fetch(
			`${WP_URL}/wp-json/wp/v2/posts?categories=${categoryId}&per_page=${PER_PAGE}&orderby=date&order=desc&_embed`,
			{ next: { revalidate: REVALIDATE_SECONDS } }
		)
		if (!postsRes.ok) return []
		const data = (await postsRes.json()) as {
			id: number
			title?: { rendered?: string }
			excerpt?: { rendered?: string }
			link?: string
			date?: string
			_embedded?: { 'wp:featuredmedia'?: { source_url?: string }[] }
		}[]

		return data.map((p) => {
			const featuredUrl = p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
			return {
				id: p.id,
				title: p.title?.rendered?.replace(/<[^>]*>/g, '') ?? '',
				excerpt: (p.excerpt?.rendered ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 160),
				link: p.link ?? '',
				date: p.date ?? '',
				featuredImageUrl: featuredUrl ?? null,
			}
		})
	} catch (err) {
		console.error('Milliy sertifikat yangiliklar fetch:', err)
		return []
	}
}
