import { GetServerSideProps } from 'next'
import { getServerSideSitemapLegacy } from 'next-sitemap'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const client = getApolloClient()

const SITEMAP_CONTENT_QUERY = gql`
	query MainSitemapQuery($after: String) {
		contentNodes(
			where: { contentTypes: [POST, PAGE, OLIYGOH, TEXTBOOKS] }
			first: 100
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

async function getAllWPContent(after: string | null = null, acc: any[] = []): Promise<any[]> {
	const { data } = await client.query({
		query: SITEMAP_CONTENT_QUERY,
		variables: { after },
	})

	acc = [...acc, ...(data.contentNodes?.nodes ?? [])]
	if (data.contentNodes?.pageInfo?.hasNextPage) {
		return getAllWPContent(data.contentNodes.pageInfo.endCursor, acc)
	}
	return acc
}

function formatDate(dateString: string): string {
	if (!dateString) return new Date().toISOString()
	try {
		return new Date(dateString).toISOString()
	} catch {
		return new Date().toISOString()
	}
}

function normalizeUrl(url: string, baseUrl: string): string {
	let decodedUrl = decodeURIComponent(url)
	decodedUrl = decodedUrl.replace(/\/$/, '')
	return `${baseUrl}${decodedUrl}`
}

function getCorrectUrl(node: any, baseUrl: string): string {
	if (!node.uri) return ''
	if (node.__typename === 'Oliygoh' && node.slug) {
		return `${baseUrl}/oliygoh/${node.slug}`
	}
	if (node.__typename === 'Textbook' && node.slug) {
		const sinf = node.darslikMalumotlari?.sinf || 1
		return `${baseUrl}/darsliklar/${sinf}/${node.slug}`
	}
	return normalizeUrl(node.uri, baseUrl)
}

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
	return excludePatterns.some((pattern) => url.includes(pattern))
}

export default function Sitemap() {}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'
	if (!BASE_URL) {
		return { notFound: true }
	}

	const nodes = await getAllWPContent()

	const allRoutes = nodes.reduce((acc, node) => {
		const url = getCorrectUrl(node, BASE_URL)
		if (!url || shouldExcludeUrl(url)) return acc

		let priority = 0.8
		let changefreq: 'daily' | 'weekly' | 'monthly' = 'daily'
		if (node.__typename === 'Oliygoh') {
			priority = 0.9
			changefreq = 'weekly'
		} else if (node.__typename === 'Textbook') {
			changefreq = 'monthly'
		} else if (node.__typename === 'Page') {
			priority = 0.7
			changefreq = 'monthly'
		}

		const lastmod = node.modifiedGmt ? formatDate(node.modifiedGmt) : new Date().toISOString()
		acc.push({ loc: url, lastmod, changefreq, priority })
		return acc
	}, [])

	const indexPages = [
		{ loc: `${BASE_URL}`, lastmod: new Date().toISOString(), changefreq: 'always' as const, priority: 1.0 },
		{ loc: `${BASE_URL}/oliygoh`, lastmod: new Date().toISOString(), changefreq: 'weekly' as const, priority: 0.9 },
		{ loc: `${BASE_URL}/darsliklar`, lastmod: new Date().toISOString(), changefreq: 'weekly' as const, priority: 0.9 },
		...Array.from({ length: 11 }, (_, i) => ({
			loc: `${BASE_URL}/darsliklar/${i + 1}`,
			lastmod: new Date().toISOString(),
			changefreq: 'monthly' as const,
			priority: 0.8,
		})),
	]

	const finalRoutes = [...indexPages, ...allRoutes]
	return await getServerSideSitemapLegacy(ctx, finalRoutes)
}
