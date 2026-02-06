import { useRouter } from 'next/router'

/**
 * Get the canonical URL for the current page
 * @param customPath - Optional custom path to use instead of router.asPath
 * @returns Full canonical URL
 */
export function getCanonicalUrl(customPath?: string): string {
	const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'
	
	// Remove trailing slash from BASE_URL
	const baseUrl = BASE_URL.replace(/\/$/, '')
	
	// If custom path is provided, use it
	if (customPath) {
		// Remove leading slash if present and add it back properly
		const path = customPath.startsWith('/') ? customPath : `/${customPath}`
		return `${baseUrl}${path}`
	}
	
	// For server-side rendering, we'll need to get the path from context
	// This function will be used in components with useRouter
	return baseUrl
}

/**
 * Hook to get canonical URL using Next.js router
 * @param customPath - Optional custom path to override router.asPath
 * @returns Full canonical URL
 */
export function useCanonicalUrl(customPath?: string): string {
	const router = useRouter()
	const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'
	const baseUrl = BASE_URL.replace(/\/$/, '')
	
	// Use custom path if provided, otherwise use router.asPath
	const path = customPath || router.asPath || '/'
	
	// Remove query parameters and hash from path for canonical URL
	const cleanPath = path.split('?')[0].split('#')[0]
	
	// Ensure path starts with /
	const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
	
	return `${baseUrl}${normalizedPath}`
}
