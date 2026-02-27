import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import crypto from 'crypto'

/** WordPress JWT payload dan user id olish (imzo tekshirilmaydi, faqat o‘qish) */
function decodeWpJwtUserId(jwtToken: string): string | null {
	if (!jwtToken || typeof jwtToken !== 'string') return null
	const parts = jwtToken.split('.')
	if (parts.length !== 3) return null
	try {
		const payload = JSON.parse(
			Buffer.from(parts[1], 'base64url').toString('utf8')
		) as Record<string, unknown>
		const data = payload?.data as Record<string, unknown> | undefined
		const user = (data?.user ?? payload?.user) as { id?: number } | undefined
		const numId =
			(user?.id as number | undefined) ??
			(data?.id as number | undefined) ??
			(payload?.user_id as number | undefined) ??
			(payload?.id as number | undefined) ??
			(typeof payload?.sub === 'number' ? payload.sub : null)
		return numId != null ? String(numId) : null
	} catch {
		return null
	}
}

function verifyTelegramJWT(token: string): { telegram_id: string; first_name: string; last_name: string; username: string } | null {
	const secret = process.env.NEXTAUTH_SECRET
	if (!secret || !token) return null
	const parts = token.split('.')
	if (parts.length !== 3) return null
	try {
		const payload = JSON.parse(
			Buffer.from(parts[1], 'base64url').toString('utf8')
		) as { exp?: number; telegram_id?: string; first_name?: string; last_name?: string; username?: string }
		if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
		const sig = crypto
			.createHmac('sha256', secret)
			.update(`${parts[0]}.${parts[1]}`)
			.digest('base64url')
		if (sig !== parts[2]) return null
		return {
			telegram_id: String(payload.telegram_id ?? ''),
			first_name: payload.first_name ?? '',
			last_name: payload.last_name ?? '',
			username: payload.username ?? '',
		}
	} catch {
		return null
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: 'credentials',
			name: 'WordPress',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
				telegram_token: { label: 'Telegram token', type: 'text' },
			},
			async authorize(credentials) {
				// Telegram Login Widget orqali
				const telegramToken = credentials?.telegram_token
				if (telegramToken) {
					const tg = verifyTelegramJWT(telegramToken)
					if (!tg || !tg.telegram_id) return null
					const name = [tg.first_name, tg.last_name].filter(Boolean).join(' ') || tg.username || 'User'
					return {
						id: tg.telegram_id,
						name,
						email: tg.username ? `${tg.username}@telegram.user` : '',
					}
				}
				// WordPress login/password
				if (!credentials?.username || !credentials?.password) return null
				const base = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '')
				const path = process.env.WP_LOGIN_ENDPOINT || '/wp-json/jwt-auth/v1/token'
				const url = base + path
				let res: Response
				try {
					res = await fetch(url, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							username: credentials.username,
							password: credentials.password,
						}),
					})
				} catch (e: any) {
					throw new Error('WordPress ga ulanish xatosi: ' + (e?.message || 'Network error'))
				}
				const data = await res.json().catch(() => ({}))
				if (!res.ok) {
					const msg = data?.message || data?.code || data?.data?.message || `HTTP ${res.status}`
					throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
				}
				// Turli JWT plugin formatlari: user obyekti yoki token/user_email/user_nickname (JWT Auth for WP-API)
				const user = data?.user || data
				let id = user?.id ?? user?.data?.ID ?? data?.data?.user?.id ?? null
				let name = user?.name ?? user?.display_name ?? user?.data?.display_name ?? ''
				let email = user?.email ?? user?.data?.user_email ?? ''
				if (data?.token) {
					const wpUserId = decodeWpJwtUserId(data.token)
					if (wpUserId) id = wpUserId
				}
				if (!id && (data?.user_email || data?.user_nickname)) {
					id = data.user_email || data.user_nickname || data.user_login || ''
					name = data.user_display_name || data.user_nickname || name
					email = data.user_email || email
				}
				if (!id) return null
				return {
					id: String(id),
					name: name || email || 'User',
					email: email || '',
					wpToken: data?.token as string | undefined,
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.email = user.email
				token.wpToken = (user as { wpToken?: string }).wpToken
			}
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as { id?: string }).id = token.id as string
			}
			;(session as { wpToken?: string }).wpToken = token.wpToken as string | undefined
			return session
		},
	},
	session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
	pages: { signIn: '/login' },
	secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
