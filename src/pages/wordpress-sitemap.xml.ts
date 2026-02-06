import { GetServerSideProps } from 'next'
import { getServerSideSitemapLegacy } from 'next-sitemap'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const client = getApolloClient()

const SITEMAP_QUERY = gql`
	query SitemapQuery($after: String) {
		contentNodes(
			where: { contentTypes: [POST, PAGE, OLIYGOH, TEXTBOOKS] }
			first: 50
			after: $after
		) {
			pageInfo {
				hasNextPage
				endCursor
			}
			nodes {
				uri
				modifiedGmt
				__typename
				... on Oliygoh {
					slug
				}
				... on Textbook {
					slug
					darslikMalumotlari {
						sinf
					}
				}
			}
		}
	}
`

async function getAllWPContent(after = null, acc: any[] = []) {
	const { data } = await client.query({
		query: SITEMAP_QUERY,
		variables: {
			after,
		},
	})

	acc = [...acc, ...data.contentNodes.nodes]

	if (data.contentNodes.pageInfo.hasNextPage) {
		acc = await getAllWPContent(data.contentNodes.pageInfo.endCursor, acc)
	}

	return acc
}

// Function to format the date to ISO 8601 format (Google uchun to'g'ri)
function formatDate(dateString: string): string {
	if (!dateString) return new Date().toISOString()
	
	try {
		const date = new Date(dateString)
		// ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
		return date.toISOString()
	} catch (error) {
		// Agar xatolik bo'lsa, hozirgi sanani qaytar
		return new Date().toISOString()
	}
}

// URL'ni decode qilish va trailing slash'ni olib tashlash
function normalizeUrl(url: string, baseUrl: string): string {
	// URL'ni decode qilish (%2F -> /)
	let decodedUrl = decodeURIComponent(url)
	
	// Trailing slash'ni olib tashlash (next.config.js da trailingSlash: false)
	decodedUrl = decodedUrl.replace(/\/$/, '')
	
	// Base URL bilan birlashtirish
	return `${baseUrl}${decodedUrl}`
}

// Universitetlar va darsliklar uchun to'g'ri URL yaratish
function getCorrectUrl(node: any, baseUrl: string): string {
	if (!node.uri) return ''
	
	// Agar Oliygoh bo'lsa, /oliygoh/[slug] formatida (trailing slash yo'q)
	if (node.__typename === 'Oliygoh' && node.slug) {
		return `${baseUrl}/oliygoh/${node.slug}`
	}
	
	// Agar Textbook bo'lsa, /darsliklar/[sinf]/[slug] formatida
	if (node.__typename === 'Textbook' && node.slug) {
		const sinf = node.darslikMalumotlari?.sinf || 1
		return `${baseUrl}/darsliklar/${sinf}/${node.slug}`
	}
	
	// Boshqa content typelar uchun URI'ni normalize qilish
	return normalizeUrl(node.uri, baseUrl)
}

// Sahifani filtrlash - preview va tizim sahifalarini olib tashlash
function shouldExcludeUrl(url: string): boolean {
	const excludePatterns = [
		'/magazine-variations-preview',
		'/block-term-variations-preview',
		'/home-',
		'/sample-page',
		'/ncmaz_for_ncmazfc_preview_blocks',
		'/login',
		'/sign-up',
		'/preview',
		'/submission',
		'/dashboard',
		'/reset-password',
		'/readinglist',
	]
	
	return excludePatterns.some(pattern => url.includes(pattern))
}

// Sitemap component
export default function WPSitemap() {}

// Collect all the posts and pages
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const nodes = await getAllWPContent()

	// Define your WordPress base URL
	const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'
	
	// Agar BASE_URL bo'lmasa, sitemap yaratishni to'xtatish
	if (!BASE_URL) {
		return {
			notFound: true,
		}
	}

	const allRoutes = nodes.reduce((acc, node) => {
		// Universitetlar va darsliklar uchun to'g'ri URL yaratish
		const url = getCorrectUrl(node, BASE_URL)
		
		if (!url) {
			return acc
		}

		// Filtrlash - preview va tizim sahifalarini olib tashlash
		if (shouldExcludeUrl(url)) {
			return acc
		}

		// Priority va changefreq ni content type bo'yicha belgilash
		let priority = 0.8
		let changefreq: 'daily' | 'weekly' | 'monthly' = 'daily'
		
		if (node.__typename === 'Oliygoh') {
			priority = 0.9 // Universitetlar uchun yuqoriroq priority
			changefreq = 'weekly'
		} else if (node.__typename === 'Textbook') {
			priority = 0.8 // Darsliklar uchun priority
			changefreq = 'monthly' // Darsliklar kamroq o'zgaradi
		} else if (node.__typename === 'Post') {
			priority = 0.8 // Maqolalar uchun priority
			changefreq = 'daily'
		} else if (node.__typename === 'Page') {
			priority = 0.7
			changefreq = 'monthly'
		}

		// WordPress'dan kelgan modified sanasini ishlatish
		const lastmod = node.modifiedGmt ? formatDate(node.modifiedGmt) : new Date().toISOString()

		acc.push({
			loc: url,
			lastmod, // WordPress'dan kelgan modified sana
			changefreq,
			priority,
		})

		return acc
	}, [])

	// Index sahifalarni qo'shish (trailing slash yo'q, chunki trailingSlash: false)
	const indexPages = [
		{
			loc: `${BASE_URL}/`,
			lastmod: new Date().toISOString(),
			changefreq: 'always' as const,
			priority: 1.0, // Bosh sahifa uchun eng yuqori priority
		},
		{
			loc: `${BASE_URL}/oliygoh`,
			lastmod: new Date().toISOString(),
			changefreq: 'weekly' as const,
			priority: 0.9, // Asosiy bo'limlar uchun yuqori priority
		},
		{
			loc: `${BASE_URL}/darsliklar`,
			lastmod: new Date().toISOString(),
			changefreq: 'weekly' as const,
			priority: 0.9, // Asosiy bo'limlar uchun yuqori priority
		},
		// Sinflar sahifalari (1-sinfdan 11-sinfgacha)
		...Array.from({ length: 11 }, (_, i) => i + 1).map((sinf) => ({
			loc: `${BASE_URL}/darsliklar/${sinf}`,
			lastmod: new Date().toISOString(),
			changefreq: 'monthly' as const,
			priority: 0.8, // Darsliklar/maqolalar uchun priority
		})),
	]

	// Barcha route'larni birlashtirish
	const finalRoutes = [...indexPages, ...allRoutes]

	return await getServerSideSitemapLegacy(ctx, finalRoutes)
}
