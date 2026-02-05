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
			
			let responseBody: string | object | null = null
			try {
				const textResponse = await faustAuthResponse.text()
				// JSON bo'lsa parse qilish
				try {
					responseBody = JSON.parse(textResponse)
				} catch {
					// JSON emas, text qilib qoldirish
					responseBody = textResponse
				}
			} catch {
				// Response body o'qib bo'lmasa
				responseBody = null
			}
			
			results.tests.faustAuthEndpoint = {
				status: faustAuthResponse.status,
				statusText: faustAuthResponse.statusText,
				ok: faustAuthResponse.ok,
				url: `${wordPressUrl}/wp-json/faustwp/v1/auth/token`,
				response: responseBody,
				issue: faustAuthResponse.status === 404 
					? 'Faust.js auth endpoint not found. Check if Faust.js plugin is properly installed and activated, and if auth endpoints are enabled.'
					: faustAuthResponse.status === 500
					? 'Faust.js auth endpoint returns 500 error. Check WordPress server logs.'
					: null,
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
