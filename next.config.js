const { withFaust, getWpHostname } = require('@faustwp/core')
const { createSecureHeaders } = require('next-secure-headers')

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
	trailingSlash: true,
	reactStrictMode: true,
	typedRoutes: false,
	images: {
		// 👇 ESKI UZUN RO'YXAT O'RNIGA SHU IKKI QATOR YETARLI
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**', // Barcha HTTPS saytlarga ruxsat
			},
			{
				protocol: 'http',
				hostname: '**', // Barcha HTTP saytlarga ruxsat
			},
		],
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: createSecureHeaders({
					xssProtection: false,
					frameGuard: [
						'allow-from',
						{ uri: process.env.NEXT_PUBLIC_WORDPRESS_URL },
					],
				}),
			},
		]
	},
})