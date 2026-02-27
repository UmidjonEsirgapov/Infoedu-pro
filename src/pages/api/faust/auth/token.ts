import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * WordPress'da faqat /authorize (eski FaustWP) bo'lib, /auth/token yo'q bo'lganda
 * token exchange so'rovini /authorize ga yo'naltiramiz.
 * Client GET /api/faust/auth/token?code=... yuboradi → biz POST .../authorize ga proxy qilamiz.
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const wordPressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '')
	const secret = process.env.FAUST_SECRET_KEY

	if (!wordPressUrl) {
		return res.status(500).json({ error: 'NEXT_PUBLIC_WORDPRESS_URL not set' })
	}

	// Code: GET query yoki POST body dan
	const code =
		(typeof req.query.code === 'string' ? req.query.code : null) ||
		(req.body?.code ?? null)

	if (!code) {
		return res.status(400).json({ code: 'rest_missing_param', message: 'Missing code' })
	}

	const url = `${wordPressUrl}/wp-json/faustwp/v1/authorize`
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(secret ? { 'x-faustwp-secret': secret } : {}),
	}

	let wpRes: Response
	try {
		wpRes = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({ code }),
		})
	} catch (err: any) {
		return res.status(502).json({
			code: 'proxy_error',
			message: err?.message || 'WordPress /authorize ga ulanish xatosi',
		})
	}

	const contentType = wpRes.headers.get('content-type') || ''
	const isJson = contentType.includes('application/json')
	let body: string | object
	if (isJson) {
		try {
			body = await wpRes.json()
		} catch {
			body = await wpRes.text()
		}
	} else {
		body = await wpRes.text()
	}

	// WordPress'dan kelgan Set-Cookie ni client'ga o'tkazish (Faust session)
	const setCookieHeaders =
		typeof wpRes.headers.getSetCookie === 'function'
			? wpRes.headers.getSetCookie()
			: wpRes.headers.get('set-cookie')
			? [wpRes.headers.get('set-cookie')!]
			: []
	if (setCookieHeaders.length) {
		res.setHeader('Set-Cookie', setCookieHeaders)
	}

	res.status(wpRes.status)
	if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
		return res.json(body)
	}
	return res.send(body)
}
