/** @type {import('next-sitemap').IConfig} */

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [
    '/submission',
    '/dashboard',
    '/dashboard/*',
    '/preview',
    '/reset-password',
    '/readinglist',
    '/wordpress-sitemap.xml',
  ],
  robotsTxtOptions: {
    additionalSitemaps: [`${SITE_URL}/wordpress-sitemap.xml`],
  },
  transform: async (config, path) => {
    const currentDate = new Date()

    // ✅ ISO format (Google uchun to‘g‘ri)
    const formattedDate = currentDate.toISOString()

    const lowPriorityPaths = ['/contact', '/login', '/sign-up']
    const isLowPriority = lowPriorityPaths.includes(path.replace(/\/$/, ''))
    const isHomePage = path === '/'

    let priority = 0.8
    let changefreq = 'daily'

    if (isHomePage) {
      changefreq = 'always'
      priority = 1.0
    } else if (isLowPriority) {
      changefreq = 'monthly'
      priority = 0.1
    }

    return {
      loc: `${SITE_URL}${path}`,
      lastmod: formattedDate, // ✅ ISO 8601 formatda
      changefreq,
      priority,
    }
  },
}
