import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { GetStaticProps } from 'next'
import { WordPressTemplateProps } from '../types'
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings'

/** ISR: 1 soatda bir kontent yangilanadi (redeploy-siz) */
const REVALIDATE_SECONDS = 3600

/** Build vaqtida faqat eng so'nggi shuncha post generatsiya qilinadi; qolgani fallback: 'blocking' da */
const RECENT_POSTS_BUILD_LIMIT = 500

/** Parallel fetch: bir vaqtda maksimal sahifalar soni */
const PARALLEL_PAGE_LIMIT = 12

const PER_PAGE = 100 // WP REST max odatda 100

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

/** Cloudflare / CDN cache'dan foydalanish uchun force-cache */
const BUILD_FETCH_OPTIONS: RequestInit = {
	cache: 'force-cache',
	signal: AbortSignal.timeout(15000),
}

async function fetchWithRetry(
	url: string,
	retries = 3,
	opts: RequestInit = BUILD_FETCH_OPTIONS,
): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		try {
			const res = await fetch(url, opts)
			return res
		} catch (e) {
			if (i === retries - 1) throw e
			await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
		}
	}
	throw new Error('fetchWithRetry failed')
}

function parseTotalFromResponse(res: Response): number {
	const total = res.headers.get('x-wp-total')
	if (total != null) {
		const n = parseInt(total, 10)
		if (!Number.isNaN(n)) return n
	}
	return 0
}

/**
 * Bir sahifa ma'lumotini oladi (slug lar). Response ham qaytariladi (total uchun).
 */
async function fetchPageWithResponse(
	base: string,
	path: string,
	page: number,
	opts: RequestInit,
): Promise<{ data: { slug: string }[]; total: number }> {
	const url = `${base}${path}per_page=${PER_PAGE}&page=${page}&_fields=slug`
	const res = await fetchWithRetry(url, 3, opts)
	const data = (await res.json()) as { slug?: string }[]
	const list = Array.isArray(data)
		? data.filter((x): x is { slug: string } => typeof x?.slug === 'string')
		: []
	const total = parseTotalFromResponse(res)
	return { data: list, total }
}

async function fetchPage(
	base: string,
	path: string,
	page: number,
	opts: RequestInit,
): Promise<{ slug: string }[]> {
	const { data } = await fetchPageWithResponse(base, path, page, opts)
	return data
}

/**
 * Parallel: bir vaqtda PARALLEL_PAGE_LIMIT ta so'rov. Cloudflare cache (force-cache) ishlatiladi.
 */
async function fetchAllPaginatedParallel(
	base: string,
	path: string,
	maxItems?: number,
	opts: RequestInit = BUILD_FETCH_OPTIONS,
): Promise<{ slug: string }[]> {
	const { data: first, total } = await fetchPageWithResponse(base, path, 1, opts)
	if (total <= 0) return first

	const needItems = maxItems != null ? Math.min(total, maxItems) : total
	const totalPages = Math.ceil(needItems / PER_PAGE)
	if (totalPages <= 1) return maxItems != null ? first.slice(0, maxItems) : first

	const acc: { slug: string }[] = [...first]
	const pagesToFetch = Array.from(
		{ length: totalPages - 1 },
		(_, i) => i + 2,
	)

	for (let i = 0; i < pagesToFetch.length; i += PARALLEL_PAGE_LIMIT) {
		const chunk = pagesToFetch.slice(i, i + PARALLEL_PAGE_LIMIT)
		const results = await Promise.all(
			chunk.map((p) => fetchPage(base, path, p, opts)),
		)
		for (const rows of results) {
			acc.push(...rows)
			if (maxItems != null && acc.length >= maxItems) {
				return acc.slice(0, maxItems)
			}
		}
	}

	return maxItems != null ? acc.slice(0, maxItems) : acc
}

export async function myGetPaths() {
	const base = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') ?? ''
	let posts: { slug: string }[] = []
	let categories: { slug: string }[] = []

	try {
		// Parallel: kategoriyalar va postlar bir vaqtda
		const [categoriesRaw, postsRaw] = await Promise.all([
			fetchAllPaginatedParallel(base, '/wp-json/wp/v2/categories?'),
			fetchAllPaginatedParallel(
				base,
				'/wp-json/wp/v2/posts?status=publish&',
				RECENT_POSTS_BUILD_LIMIT,
			),
		])
		categories = categoriesRaw
		// Eng so'nggi 500 ta post (API allaqachon date desc qaytaradi)
		posts = postsRaw.slice(0, RECENT_POSTS_BUILD_LIMIT)
	} catch (e) {
		console.warn(
			'[wordpressNode] myGetPaths fetch failed, using empty paths:',
			(e as Error)?.message,
		)
	}

	if (!categories?.length) categories = []
	if (!posts?.length) posts = []

	let pathSlugs = [
		...categories.map((c) => ({ slug: 'category/' + c.slug })),
		...posts,
	]

	if (IS_CHISNGHIAX_DEMO_SITE) {
		pathSlugs = [
			...pathSlugs,
			{ slug: 'home-2' },
			{ slug: 'home-3-podcast' },
			{ slug: 'home-4-video' },
			{ slug: 'home-5-gallery' },
			{ slug: 'home-6' },
			{ slug: 'search/posts/' },
		]
	}

	return pathSlugs.map((page) => ({
		params: { wordpressNode: [page.slug] },
	}))
}

export async function getStaticPaths() {
	const paths = await myGetPaths()
	return {
		paths,
		fallback: 'blocking', // Build'da bo'lmagan sahifalar kirganda yaratiladi, 404 emas
	}
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 3000

function isNetworkError(error: unknown): boolean {
	const e = error as { cause?: { code?: string }; networkError?: unknown }
	return (
		e?.cause?.code === 'ECONNRESET' ||
		e?.cause?.code === 'ECONNREFUSED' ||
		e?.cause?.code === 'ETIMEDOUT' ||
		!!e?.networkError
	)
}

export const getStaticProps: GetStaticProps = async (ctx) => {
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			return await getWordPressProps({
				ctx,
				revalidate: REVALIDATE_SECONDS, // ISR: 1 soat
			})
		} catch (error) {
			if (isNetworkError(error) && attempt < MAX_RETRIES) {
				console.warn(
					`[wordpressNode] Attempt ${attempt}/${MAX_RETRIES} failed for ${(ctx.params?.wordpressNode as string[])?.join('/')}, retrying in ${RETRY_DELAY_MS}ms...`,
				)
				await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt))
				continue
			}
			console.error(
				`[wordpressNode] getStaticProps failed for ${(ctx.params?.wordpressNode as string[])?.join('/')} after ${attempt} attempt(s):`,
				(error as Error)?.message ?? error,
			)
			return { notFound: true }
		}
	}
	return { notFound: true }
}
