import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * WordPress REST API va Faust.js endpoint'larini test qilish uchun
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const wordPressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') || ''
	const results: any = {
		timestamp: new Date().toISOString(),
		wordPressUrl,
		tests: {},
	}

	try {
		// 1. WordPress REST API test
		try {
			const wpRestResponse = await fetch(`${wordPressUrl}/wp-json/wp/v2`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			results.tests.wordPressRestAPI = {
				status: wpRestResponse.status,
				statusText: wpRestResponse.statusText,
				ok: wpRestResponse.ok,
				url: `${wordPressUrl}/wp-json/wp/v2`,
			}
		} catch (error: any) {
			results.tests.wordPressRestAPI = {
				error: error.message,
				url: `${wordPressUrl}/wp-json/wp/v2`,
			}
		}

		// 2. Faust.js auth endpoint test
		try {
			const faustAuthResponse = await fetch(`${wordPressUrl}/wp-json/faustwp/v1/auth/token`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			results.tests.faustAuthEndpoint = {
				status: faustAuthResponse.status,
				statusText: faustAuthResponse.statusText,
				ok: faustAuthResponse.ok,
				url: `${wordPressUrl}/wp-json/faustwp/v1/auth/token`,
			}
		} catch (error: any) {
			results.tests.faustAuthEndpoint = {
				error: error.message,
				url: `${wordPressUrl}/wp-json/faustwp/v1/auth/token`,
			}
		}

		// 3. Faust.js plugin test
		try {
			const faustPluginResponse = await fetch(`${wordPressUrl}/wp-json/faustwp/v1`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			results.tests.faustPlugin = {
				status: faustPluginResponse.status,
				statusText: faustPluginResponse.statusText,
				ok: faustPluginResponse.ok,
				url: `${wordPressUrl}/wp-json/faustwp/v1`,
			}
		} catch (error: any) {
			results.tests.faustPlugin = {
				error: error.message,
				url: `${wordPressUrl}/wp-json/faustwp/v1`,
			}
		}

		// 4. Environment variables check
		results.environment = {
			hasWordPressUrl: !!process.env.NEXT_PUBLIC_WORDPRESS_URL,
			hasFaustSecretKey: !!process.env.FAUST_SECRET_KEY,
			wordPressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'NOT SET',
		}

		return res.status(200).json(results)
	} catch (error: any) {
		return res.status(500).json({
			error: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		})
	}
}
