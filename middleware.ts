import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	const url = request.nextUrl.clone()
	const { pathname, search } = url
	const hostname = request.headers.get('host') || ''

	// 1. WWW dan non-WWW ga redirect (301)
	if (hostname.startsWith('www.')) {
		const newHostname = hostname.replace(/^www\./, '')
		url.hostname = newHostname
		// Agar trailing slash ham bo'lsa, uni ham tuzatish
		if (pathname !== '/' && pathname.endsWith('/')) {
			url.pathname = pathname.slice(0, -1)
		}
		url.search = search
		return NextResponse.redirect(url, 301)
	}

	// 2. Bosh sahifa duplicate title: /?page_id=2 → / (SEO)
	if (pathname === '/' && search && (search === '?page_id=2' || search.startsWith('?page_id=2&'))) {
		url.search = ''
		return NextResponse.redirect(url, 301)
	}

	// 3. Trailing slash ni olib tashlash (asosiy domen bundan mustasno)
	// Root path (/) uchun trailing slash qoldiriladi
	if (pathname !== '/' && pathname.endsWith('/')) {
		url.pathname = pathname.slice(0, -1)
		// Query string ni saqlab qolish
		url.search = search
		return NextResponse.redirect(url, 301)
	}

	return NextResponse.next()
}

// Middleware barcha route-lar uchun ishlashi kerak
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - robots.txt, sitemap.xml (SEO files)
		 * - public files (images, etc.)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|woff|woff2|ttf|eot)).*)',
	],
}
