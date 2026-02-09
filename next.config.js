const { withFaust, getWpHostname } = require('@faustwp/core')
const { createSecureHeaders } = require('next-secure-headers')

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
	trailingSlash: false, // SEO uchun trailing slash ni o'chirish
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
	async redirects() {
		return [
			{
				source: '/9-sinf-algebra-pdf',
				destination: '/darsliklar/9/9-sinf-algebra',
				permanent: true, // 301 redirect
			},
			{
				source: '/9-sinf-onatili-pdf',
				destination: '/darsliklar/9/9-sinf-ona-tili',
				permanent: true, // 301 redirect
			},
			{
				source: '/9-sinf-adabiyot-pdf',
				destination: '/darsliklar/9/9-sinf-adabiyot',
				permanent: true, // 301 redirect
			},
		]
	},
})