import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Runtime da NEXT_PUBLIC_WORDPRESS_URL bor-yo'qligini tekshirish.
 * Brauzerda https://infoedu.uz/api/env-check oching — javobda ko'rasiz.
 * Log fayllarni qidirish shart emas.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const url = process.env.NEXT_PUBLIC_WORDPRESS_URL ?? null
	res.status(200).json({
		NEXT_PUBLIC_WORDPRESS_URL: url,
		status: url ? 'SET' : 'EMPTY',
	})
}
