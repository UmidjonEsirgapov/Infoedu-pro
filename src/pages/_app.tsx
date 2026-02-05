import '@/../faust.config'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { FaustProvider } from '@faustwp/core'
import '@/styles/globals.css'
import '@/styles/index.scss'
import { AppProps } from 'next/app'
import { WordPressBlocksProvider, fromThemeJson } from '@faustwp/blocks'
import blocks from '@/wp-blocks'
import { Poppins } from 'next/font/google'
import SiteWrapperProvider from '@/container/SiteWrapperProvider'
import { Toaster } from 'react-hot-toast'
import NextNProgress from 'nextjs-progressbar'
import themeJson from '@/../theme.json'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'

const poppins = Poppins({
	subsets: ['latin'],
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
})

// OneSignal initialization component
function OneSignalInit() {
	useEffect(() => {
		// Check if window is available (client-side only)
		if (typeof window === 'undefined') return

		// Initialize OneSignal array if it doesn't exist
		// window.OneSignal.push() SDK yuklanguncha funksiyalarni saqlaydi
		window.OneSignal = window.OneSignal || []

		// Initialize OneSignal using push method (safe way)
		// This ensures OneSignal SDK is fully loaded before executing
		window.OneSignal.push(function() {
			// Type guard: OneSignal SDK yuklanganda, window.OneSignal obyekt bo'ladi
			// Array emas, obyekt bo'lishini tekshiramiz
			if (window.OneSignal && !Array.isArray(window.OneSignal) && typeof window.OneSignal.init === 'function') {
				try {
					// Use init() promise to ensure OneSignal is fully initialized before accessing its properties
					window.OneSignal.init({
						appId: "8cd942e4-4453-4863-bfcb-dd86b87fc5cd",
						allowLocalhostAsSecureOrigin: true,
					}).then(() => {
						// OneSignal is now fully initialized, emitter and other properties are available
						if (window.OneSignal && !Array.isArray(window.OneSignal)) {
							// Now it's safe to use OneSignal.emitter, OneSignal.EVENTS, etc.
							// Example: Subscribe to notification permission changes
							if (window.OneSignal.emitter && window.OneSignal.EVENTS) {
								// OneSignal.emitter is now available and can be used safely
								// Example usage:
								// window.OneSignal.emitter.on(
								//   window.OneSignal.EVENTS.NOTIFICATION_PERMISSION_CHANGED_AS_AS_STRING,
								//   (permissionNative: NotificationPermission) => {
								//     // Handle permission change
								//   }
								// )
							}
						}
					}).catch((error: Error) => {
						console.error('OneSignal initialization failed:', error)
					})
				} catch (error) {
					console.error('OneSignal initialization error:', error)
				}
			}
		})
	}, [])

	return null
}

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()

	return (
		<>
			{/* OneSignal SDK Script */}
			<Script
				src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
				strategy="afterInteractive"
				defer
			/>
			
			<GoogleAnalytics trackPageViews />
			<Analytics />
			<SpeedInsights />
			<OneSignalInit />

			<FaustProvider pageProps={pageProps}>
				<WordPressBlocksProvider
					config={{
						blocks,
						theme: fromThemeJson(themeJson),
					}}
				>
					<SiteWrapperProvider {...pageProps}>
						<style jsx global>{`
							html {
								font-family: ${poppins.style.fontFamily};
							}
						`}</style>
						<NextNProgress color="#818cf8" />
						<Component {...pageProps} key={router.asPath} />
						<Toaster
							position="bottom-left"
							toastOptions={{
								style: {
									fontSize: '14px',
									borderRadius: '0.75rem',
								},
							}}
							containerClassName="text-sm"
						/>
					</SiteWrapperProvider>
				</WordPressBlocksProvider>
			</FaustProvider>
		</>
	)
}
