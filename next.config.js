const { withFaust } = require('@faustwp/core')
const { createSecureHeaders } = require('next-secure-headers')

// Hostinger runtime da env tekshirish (Cindy tavsiyasi) — stdout/stderr.log da ko'rinadi
console.error('[next.config] NEXT_PUBLIC_WORDPRESS_URL at startup:', process.env.NEXT_PUBLIC_WORDPRESS_URL || '(empty)')

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
			// 404 cache bartaraf: eski buildId bilan /_next/data so'rovlari cache'lanmasin
			{
				source: '/_next/data/:path*',
				headers: [
					{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
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
			{
				source: '/milliy-sertifikat-sanalari2',
				destination: '/milliy-sertifikat-sanalari',
				permanent: true,
			},
			// Mavjud kontent: eski URL → yangi kanonik URL (bir xil sahifa, boshqa yo'l)
			// Category darsliklar → darsliklar bo'limi
			{
				source: '/category/darsliklar',
				destination: '/darsliklar',
				permanent: true,
			},
			// Darsliklar: root dagi eski URL → /darsliklar/[sinf]/[slug]
			{
				source: '/9-sinf-ozbekiston-tarixi',
				destination: '/darsliklar/9/9-sinf-ozbekiston-tarixi',
				permanent: true,
			},
			// Oliygoh: root dagi eski URL → /oliygoh/[slug]
			{
				source: '/jizzax-politexnika-instituti-jizpi',
				destination: '/oliygoh/jizzax-politexnika-instituti-jizpi',
				permanent: true,
			},
		]
	},
})