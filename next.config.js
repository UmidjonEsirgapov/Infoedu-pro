const { withFaust, getWpHostname } = require('@faustwp/core')
const { createSecureHeaders } = require('next-secure-headers')

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
	trailingSlash: false, // SEO uchun trailing slash ni o'chirish
	reactStrictMode: true,
	typedRoutes: false,
	// Hostinger MySQL limitini saqlash uchun
	experimental: {
		cpus: 1,
		workerThreads: false,
	},
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
		const secureHeaders = createSecureHeaders({
			xssProtection: false,
			frameGuard: [
				'allow-from',
				{ uri: process.env.NEXT_PUBLIC_WORDPRESS_URL },
			],
		})
		return [
			{
				source: '/:path*',
				headers: secureHeaders,
			},
			// Rasmlar va static — brauzer/proxy cache (Hostinger Vercel kabi CDN bermaydi)
			{
				source: '/_next/image',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, stale-while-revalidate=86400',
					},
				],
			},
			{
				source: '/_next/static/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
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
			// Oliygoh sahifalari: eski URL → /oliygoh/[slug]
			{
				source: '/jizzax-davlat-pedagogika-universiteti',
				destination: '/oliygoh/jizzax-davlat-pedagogika-universiteti',
				permanent: true,
			},
			{
				source: '/ozbekiston-davlat-jahon-tillari-universiteti',
				destination: '/oliygoh/ozbekiston-davlat-jahon-tillari-universiteti',
				permanent: true,
			},
			{
				source: '/yunus-rajabiy-nomidagi-ozbek-milliy-musiqa-sanati-instituti',
				destination: '/oliygoh/ozbek-milliy-musiqa-san%CA%BCati-instituti',
				permanent: true,
			},
			{
				source: '/samarqand-davlat-veterinariya-meditsinasi-chorvachilik-va-biotexnologiyalar-universiteti-toshkent-filiali',
				destination: '/oliygoh/samarqand-davlat-veterinariya-meditsinasi-chorvachilik-va-biotexnologiyalar-universiteti-toshkent-filiali',
				permanent: true,
			},
		]
	},
})