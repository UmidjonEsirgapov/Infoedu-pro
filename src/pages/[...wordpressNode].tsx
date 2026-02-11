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

export async function myGetPaths() {
	const base = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') ?? ''
	let posts: any[] = []
	let categories: any[] = []
	try {
		const response = await fetchWithRetry(
			base + '/wp-json/wp/v2/posts?per_page=50&_fields=slug',
		)
		const getAllCategories = await fetchWithRetry(
			base + '/wp-json/wp/v2/categories?per_page=20&_fields=slug',
		)
		posts = (await response.json()) as any[]
		categories = (await getAllCategories.json()) as any[]
	} catch (e) {
		console.warn('[wordpressNode] myGetPaths fetch failed, using empty paths:', (e as Error)?.message)
	}

	// NOTE: Universitetlar (oliygoh) endi /oliygoh/[slug] route'ida ishlaydi
	// Shuning uchun ularni bu yerda qo'shishimiz shart emas

	if (!categories?.length) {
		categories = []
	}
	if (!posts?.length) {
		posts = []
	}

	posts = [
		...categories.map((category) => ({ slug: 'category/' + category.slug })),
		...posts,
		// Universitetlar endi /oliygoh/[slug] route'ida ishlaydi
		// src/pages/oliygoh/[slug].tsx faylida handle qilinadi
	]

	if (IS_CHISNGHIAX_DEMO_SITE) {
		posts = [
			...posts,
			// Add more demo pages
			{ slug: 'home-2' },
			{ slug: 'home-3-podcast' },
			{ slug: 'home-4-video' },
			{ slug: 'home-5-gallery' },
			{ slug: 'home-6' },
			{ slug: 'search/posts/' },
		]
	}

	return posts.map((page) => ({
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
