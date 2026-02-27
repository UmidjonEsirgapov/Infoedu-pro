import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * WordPress foydalanuvchi parolini tekshiradi.
 * WordPress'da quyidagi pluginlardan biri kerak:
 * - "JWT Authentication for WP REST API" — endpoint: /wp-json/jwt-auth/v1/token
 * - yoki .env da WP_LOGIN_ENDPOINT o'rnating (masalan: /wp-json/custom-login/v1)
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { username, password } = req.body || {}
	if (!username || !password) {
		return res.status(400).json({ error: 'username va password kerak' })
	}

	const base = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '')
	const path = process.env.WP_LOGIN_ENDPOINT || '/wp-json/jwt-auth/v1/token'
	const url = base + path

	let wpRes: Response
	try {
		wpRes = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		})
	} catch (e: any) {
		return res.status(502).json({
			error: 'WordPress ga ulanish xatosi',
			detail: e?.message,
		})
	}

	const data = await wpRes.json().catch(() => ({}))
	if (!wpRes.ok) {
		return res.status(wpRes.status).json({
			error: data?.message || data?.code || 'Login rad etildi',
			...data,
		})
	}

	// JWT plugin odatda { token, user: { id, name, email, ... } } qaytaradi
	const user = data?.user || data
	const id = user?.id ?? user?.data?.ID ?? data?.data?.user?.id
	const name = user?.name ?? user?.display_name ?? user?.data?.display_name ?? ''
	const email = user?.email ?? user?.data?.user_email ?? ''

	if (!id) {
		return res.status(500).json({
			error: 'WordPress javobida user id yo\'q',
			detail: 'Plugin javobi boshqa formatda bo\'lishi mumkin.',
		})
	}

	return res.status(200).json({
		id: String(id),
		name: name || email || 'User',
		email: email || '',
	})
}
