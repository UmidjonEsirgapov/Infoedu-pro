/** @type {import('next-sitemap').IConfig} */

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false, // Bitta sitemap yaratish uchun
  exclude: [
    '/submission',
    '/dashboard',
    '/dashboard/*',
    '/preview',
    '/reset-password',
    '/readinglist',
    '/wordpress-sitemap.xml',
    '/login',
    '/sign-up',
    '/magazine-variations-preview',
    '/block-term-variations-preview',
    '/home-*',
    '/sample-page',
    '/ncmaz_for_ncmazfc_preview_blocks',
  ],
  robotsTxtOptions: {
    // WordPress sitemap asosiy sitemap bo'ladi
    additionalSitemaps: [`${SITE_URL}/wordpress-sitemap.xml`],
  },
  transform: async (config, path) => {
    const currentDate = new Date()

    // ✅ ISO format (Google uchun to'g'ri)
    const formattedDate = currentDate.toISOString()

    // Trailing slash'ni olib tashlash (next.config.js da trailingSlash: false)
    const normalizedPath = path.replace(/\/$/, '')
    
    const lowPriorityPaths = ['/contact']
    const isLowPriority = lowPriorityPaths.includes(normalizedPath)
    const isHomePage = normalizedPath === '' || normalizedPath === '/'

    let priority = 0.8
    let changefreq = 'daily'

    if (isHomePage) {
      changefreq = 'always'
      priority = 1.0
    } else if (normalizedPath === '/oliygoh' || normalizedPath === '/darsliklar') {
      changefreq = 'weekly'
      priority = 0.9
    } else if (normalizedPath.startsWith('/darsliklar/')) {
      changefreq = 'monthly'
      priority = 0.8
    } else if (isLowPriority) {
      changefreq = 'monthly'
      priority = 0.1
    }

    return {
      loc: `${SITE_URL}${normalizedPath}`,
      lastmod: formattedDate, // ✅ ISO 8601 formatda
      changefreq,
      priority,
    }
  },
}
