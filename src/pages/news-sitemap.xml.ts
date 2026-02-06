import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const client = getApolloClient()

// Google News sitemap uchun GraphQL query
const GOOGLE_NEWS_QUERY = gql`
	query GoogleNewsSitemapQuery($first: Int!) {
		posts(first: $first, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
			nodes {
				uri
				title
				date
			}
		}
	}
`

// Function to format date to ISO 8601 format (Google News talabi)
function formatDateForGoogleNews(dateString: string): string {
	if (!dateString) return ''
	
	try {
		const date = new Date(dateString)
		// Google News ISO 8601 format: YYYY-MM-DDTHH:mm:ss+00:00
		return date.toISOString()
	} catch (error) {
		return ''
	}
}

// Function to check if post is within last 48 hours
function isWithinLast48Hours(dateString: string): boolean {
	if (!dateString) return false
	
	try {
		const postDate = new Date(dateString)
		const now = new Date()
		const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60)
		
		return diffInHours <= 48
	} catch (error) {
		return false
	}
}

// Function to escape XML special characters
function escapeXml(unsafe: string): string {
	if (!unsafe) return ''
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

// Google News Sitemap component
export default function GoogleNewsSitemap() {}

// Generate Google News sitemap
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	try {
		// Fetch last 100 posts from WordPress
		const { data } = await client.query({
			query: GOOGLE_NEWS_QUERY,
			variables: {
				first: 100,
			},
		})

		const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'
		const baseUrl = BASE_URL.replace(/\/$/, '')

		// Filter posts: only those published within last 48 hours
		const recentPosts = (data?.posts?.nodes || []).filter((post: any) => {
			if (!post.date) return false
			// Use date for timezone comparison
			return isWithinLast48Hours(post.date)
		})

		// Build XML
		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
		xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`

		recentPosts.forEach((post: any) => {
			if (!post.uri || !post.title || !post.date) return

			// Normalize URL (remove trailing slash)
			const url = `${baseUrl}${post.uri.replace(/\/$/, '')}`
			const publicationDate = formatDateForGoogleNews(post.date)
			const title = escapeXml(post.title)

			xml += `  <url>\n`
			xml += `    <loc>${escapeXml(url)}</loc>\n`
			xml += `    <news:news>\n`
			xml += `      <news:publication>\n`
			xml += `        <news:name>InfoEdu</news:name>\n`
			xml += `        <news:language>uz</news:language>\n`
			xml += `      </news:publication>\n`
			xml += `      <news:publication_date>${publicationDate}</news:publication_date>\n`
			xml += `      <news:title>${title}</news:title>\n`
			xml += `    </news:news>\n`
			xml += `  </url>\n`
		})

		xml += `</urlset>`

		// Return XML response with proper Content-Type
		ctx.res.setHeader('Content-Type', 'text/xml; charset=utf-8')
		ctx.res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
		ctx.res.write(xml)
		ctx.res.end()

		return {
			props: {},
		}
	} catch (error) {
		console.error('Google News Sitemap Error:', error)
		
		// Return empty sitemap on error
		const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n</urlset>`
		
		ctx.res.setHeader('Content-Type', 'text/xml; charset=utf-8')
		ctx.res.write(emptyXml)
		ctx.res.end()

		return {
			props: {},
		}
	}
}
