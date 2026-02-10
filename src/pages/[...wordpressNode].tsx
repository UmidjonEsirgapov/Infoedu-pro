import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { GetStaticProps } from 'next'
import { WordPressTemplateProps } from '../types'
import { REVALIDATE_TIME } from '@/contains/contants'
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings'

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
			return res
		} catch (e) {
			if (i === retries - 1) throw e
			await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
		}
	}
	throw new Error('fetchWithRetry failed')
}

const PER_PAGE = 100 // WP REST max odatda 100

async function fetchAllPaginated(
	base: string,
	path: string,
	fields = 'slug',
): Promise<{ slug: string }[]> {
	const acc: { slug: string }[] = []
	let page = 1
	while (true) {
		const url = `${base}${path}per_page=${PER_PAGE}&page=${page}&_fields=${fields}`
		const res = await fetchWithRetry(url)
		const data = (await res.json()) as { slug?: string }[]
		if (!Array.isArray(data) || data.length === 0) break
		const withSlug = data.filter((x): x is { slug: string } => typeof x?.slug === 'string')
		acc.push(...withSlug)
		if (data.length < PER_PAGE) break
		page++
	}
	return acc
}

export async function myGetPaths() {
	const base = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') ?? ''
	let posts: { slug: string }[] = []
	let categories: { slug: string }[] = []
	try {
		// Build vaqtida BARCHA sahifalar yaratiladi (Vercel'dagi kabi).
		// Barcha kategoriyalar va barcha postlar — cheklov yo'q.
		categories = await fetchAllPaginated(
			base,
			'/wp-json/wp/v2/categories?',
		)
		posts = await fetchAllPaginated(
			base,
			'/wp-json/wp/v2/posts?status=publish&',
		)
	} catch (e) {
		console.warn('[wordpressNode] myGetPaths fetch failed, using empty paths:', (e as Error)?.message)
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
		fallback: 'blocking',
	}
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 3000

function isNetworkError(error: unknown): boolean {
	const e = error as { cause?: { code?: string }; networkError?: unknown }
	return e?.cause?.code === 'ECONNRESET' ||
		e?.cause?.code === 'ECONNREFUSED' ||
		e?.cause?.code === 'ETIMEDOUT' ||
		!!e?.networkError
}

export const getStaticProps: GetStaticProps = async (ctx) => {
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			return await getWordPressProps({ ctx, revalidate: REVALIDATE_TIME })
		} catch (error) {
			if (isNetworkError(error) && attempt < MAX_RETRIES) {
				console.warn(
					`[wordpressNode] Attempt ${attempt}/${MAX_RETRIES} failed for ${(ctx.params?.wordpressNode as string[])?.join('/')}, retrying in ${RETRY_DELAY_MS}ms...`
				)
				await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt))
				continue
			}
			console.error(
				`[wordpressNode] getStaticProps failed for ${(ctx.params?.wordpressNode as string[])?.join('/')} after ${attempt} attempt(s):`,
				(error as Error)?.message ?? error
			)
			return { notFound: true }
		}
	}
	return { notFound: true }
}
