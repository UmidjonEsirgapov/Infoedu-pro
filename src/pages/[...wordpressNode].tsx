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
		// 404 kamayishi uchun ko'proq path olamiz (build vaqtida va fallback da)
		const response = await fetchWithRetry(
			base + '/wp-json/wp/v2/posts?per_page=100&_fields=slug',
		)
		const getAllCategories = await fetchWithRetry(
			base + '/wp-json/wp/v2/categories?per_page=100&_fields=slug',
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

function normalizePath(p: string): string {
	const path = p.startsWith('http') ? new URL(p).pathname : p
	const trimmed = path.replace(/^\/+|\/+$/g, '')
	return trimmed ? `/${trimmed}` : '/'
}

/** next.config.js dagi 301 lar bilan bir xil — sahifa ochilmasdan 301 qaytaramiz */
const REDIRECT_301: Record<string, string> = {
	'/9-sinf-algebra-pdf': '/darsliklar/9/9-sinf-algebra',
	'/9-sinf-onatili-pdf': '/darsliklar/9/9-sinf-ona-tili',
	'/9-sinf-adabiyot-pdf': '/darsliklar/9/9-sinf-adabiyot',
	'/jizzax-davlat-pedagogika-universiteti': '/oliygoh/jizzax-davlat-pedagogika-universiteti',
	'/ozbekiston-davlat-jahon-tillari-universiteti': '/oliygoh/ozbekiston-davlat-jahon-tillari-universiteti',
	'/yunus-rajabiy-nomidagi-ozbek-milliy-musiqa-sanati-instituti': '/oliygoh/ozbek-milliy-musiqa-san%CA%BCati-instituti',
	'/samarqand-davlat-veterinariya-meditsinasi-chorvachilik-va-biotexnologiyalar-universiteti-toshkent-filiali': '/oliygoh/samarqand-davlat-veterinariya-meditsinasi-chorvachilik-va-biotexnologiyalar-universiteti-toshkent-filiali',
	'/milliy-sertifikat-sanalari2': '/milliy-sertifikat-sanalari',
	// Mavjud kontent: eski URL → yangi kanonik URL (oliygoh, darsliklar, category)
	'/category/darsliklar': '/darsliklar',
	'/9-sinf-ozbekiston-tarixi': '/darsliklar/9/9-sinf-ozbekiston-tarixi',
	'/jizzax-politexnika-instituti-jizpi': '/oliygoh/jizzax-politexnika-instituti-jizpi',
}

export const getStaticProps: GetStaticProps = async (ctx) => {
	const wordpressNode = (ctx.params?.wordpressNode as string[]) || []
	const currentPath = '/' + wordpressNode.join('/')
	const currentNorm = normalizePath(currentPath)

	const redirectTo = REDIRECT_301[currentNorm]
	if (redirectTo) {
		return { redirect: { destination: redirectTo, permanent: true } }
	}

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const result = await getWordPressProps({ ctx, revalidate: REVALIDATE_TIME })
			if ('notFound' in result && result.notFound) return result
			if ('redirect' in result && result.redirect) return result

			const props = (result as { props?: Record<string, unknown> }).props
			const post = props?.data && typeof props.data === 'object' && (props.data as Record<string, unknown>).post
			const postObj = post && typeof post === 'object' ? (post as Record<string, unknown>) : null
			const canonicalUrl = postObj?.seo && typeof postObj.seo === 'object'
				? (postObj.seo as Record<string, unknown>).canonicalUrl as string | undefined
				: undefined

			if (canonicalUrl && typeof canonicalUrl === 'string' && canonicalUrl.trim()) {
				const canonicalPath = normalizePath(canonicalUrl.trim())
				if (canonicalPath !== currentNorm) {
					return {
						redirect: {
							destination: canonicalPath,
							permanent: true,
						},
					}
				}
			}

			return result
		} catch (error) {
			if (isNetworkError(error) && attempt < MAX_RETRIES) {
				console.warn(
					`[wordpressNode] Attempt ${attempt}/${MAX_RETRIES} failed for ${wordpressNode.join('/')}, retrying in ${RETRY_DELAY_MS}ms...`
				)
				await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt))
				continue
			}
			console.error(
				`[wordpressNode] getStaticProps failed for ${wordpressNode.join('/')} after ${attempt} attempt(s):`,
				(error as Error)?.message ?? error
			)
			return { notFound: true }
		}
	}
	return { notFound: true }
}
