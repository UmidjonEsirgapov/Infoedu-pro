import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || ''
const JWT_SECRET = process.env.NEXTAUTH_SECRET

/**
 * Telegram Login Widget dan kelgan redirect ni qabul qiladi, hash tekshiradi,
 * bir martalik JWT yaratadi va /auth/telegram?token=... ga yo'naltiradi.
 * https://core.telegram.org/widgets/login
 */
function verifyTelegramHash(params: Record<string, string>): boolean {
	if (!BOT_TOKEN) return false
	const hash = params.hash
	if (!hash) return false

	const dataCheckString = Object.keys(params)
		.filter((k) => k !== 'hash')
		.sort()
		.map((k) => `${k}=${params[k]}`)
		.join('\n')

	const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest()
	const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
	return hmac === hash
}

function createTelegramJWT(payload: Record<string, unknown>, expiresInSec = 300): string {
	if (!JWT_SECRET) return ''
	const header = { alg: 'HS256', typ: 'JWT' }
	const exp = Math.floor(Date.now() / 1000) + expiresInSec
	const body = { ...payload, exp }
	const b64 = (obj: object) =>
		Buffer.from(JSON.stringify(obj)).toString('base64url')
	const signature = crypto
		.createHmac('sha256', JWT_SECRET)
		.update(`${b64(header)}.${b64(body)}`)
		.digest('base64url')
	return `${b64(header)}.${b64(body)}.${signature}`
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).end()
	}

	const params = req.query as Record<string, string>
	if (!params.id || !params.hash) {
		return res.redirect(302, '/login?error=telegram_missing_params')
	}

	if (!verifyTelegramHash(params)) {
		return res.redirect(302, '/login?error=telegram_invalid_hash')
	}

	const authDate = parseInt(params.auth_date || '0', 10)
	const now = Math.floor(Date.now() / 1000)
	if (now - authDate > 300) {
		return res.redirect(302, '/login?error=telegram_expired')
	}

	const token = createTelegramJWT({
		telegram_id: params.id,
		first_name: params.first_name || '',
		last_name: params.last_name || '',
		username: params.username || '',
		photo_url: params.photo_url || '',
	})
	if (!token) {
		return res.redirect(302, '/login?error=telegram_config')
	}

	const base = (NEXTAUTH_URL || '').replace(/\/$/, '') || (req.headers.host ? `${req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'}://${req.headers.host}` : '')
	const path = `/auth/telegram?token=${encodeURIComponent(token)}`
	return res.redirect(302, base ? `${base}${path}` : path)
}
