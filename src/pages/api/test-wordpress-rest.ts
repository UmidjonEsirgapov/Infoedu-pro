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
			
			let pluginResponseBody: string | object | null = null
			try {
				const textResponse = await faustPluginResponse.text()
				try {
					pluginResponseBody = JSON.parse(textResponse)
				} catch {
					pluginResponseBody = textResponse
				}
			} catch {
				pluginResponseBody = null
			}
			
			results.tests.faustPlugin = {
				status: faustPluginResponse.status,
				statusText: faustPluginResponse.statusText,
				ok: faustPluginResponse.ok,
				url: `${wordPressUrl}/wp-json/faustwp/v1`,
				response: pluginResponseBody,
			}
		} catch (error: any) {
			results.tests.faustPlugin = {
				error: error.message,
				url: `${wordPressUrl}/wp-json/faustwp/v1`,
			}
		}

		// 4. Alternative auth endpoint test (POST method)
		try {
			const faustAuthPostResponse = await fetch(`${wordPressUrl}/wp-json/faustwp/v1/auth/token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			
			let postResponseBody: string | object | null = null
			try {
				const textResponse = await faustAuthPostResponse.text()
				try {
					postResponseBody = JSON.parse(textResponse)
				} catch {
					postResponseBody = textResponse
				}
			} catch {
				postResponseBody = null
			}
			
			results.tests.faustAuthEndpointPOST = {
				status: faustAuthPostResponse.status,
				statusText: faustAuthPostResponse.statusText,
				ok: faustAuthPostResponse.ok,
				url: `${wordPressUrl}/wp-json/faustwp/v1/auth/token`,
				method: 'POST',
				response: postResponseBody,
			}
		} catch (error: any) {
			results.tests.faustAuthEndpointPOST = {
				error: error.message,
				url: `${wordPressUrl}/wp-json/faustwp/v1/auth/token`,
				method: 'POST',
			}
		}

		// 5. Check available Faust.js routes
		try {
			const faustRoutesResponse = await fetch(`${wordPressUrl}/wp-json/faustwp/v1`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			
			if (faustRoutesResponse.ok) {
				const routesData = await faustRoutesResponse.json()
				results.tests.availableRoutes = {
					status: faustRoutesResponse.status,
					routes: routesData,
					note: 'Check if auth/token route is listed in available routes',
				}
			}
		} catch (error: any) {
			results.tests.availableRoutes = {
				error: error.message,
			}
		}

		// 6. Environment variables check
		results.environment = {
			hasWordPressUrl: !!process.env.NEXT_PUBLIC_WORDPRESS_URL,
			hasFaustSecretKey: !!process.env.FAUST_SECRET_KEY,
			wordPressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'NOT SET',
		}

		// 7. Summary and recommendations
		results.summary = {
			issue: results.tests.faustAuthEndpoint?.status === 404
				? 'Faust.js auth endpoint (/wp-json/faustwp/v1/auth/token) is not available. This is a WordPress plugin configuration issue.'
				: results.tests.faustAuthEndpoint?.status === 500
				? 'Faust.js auth endpoint returns 500 error. Check WordPress server logs.'
				: 'All endpoints are working correctly.',
			recommendations: results.tests.faustAuthEndpoint?.status === 404
				? [
					'1. Check Faust.js plugin version - ensure it\'s the latest version',
					'2. Verify plugin is activated in WordPress admin',
					'3. Check plugin settings - auth endpoints may need to be enabled',
					'4. Try deactivating and reactivating the plugin',
					'5. Check WordPress REST API is enabled (Settings > Permalinks)',
					'6. Verify FAUST_SECRET_KEY matches between WordPress and Next.js',
				]
				: [],
		}

		return res.status(200).json(results)
	} catch (error: any) {
		return res.status(500).json({
			error: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		})
	}
}
