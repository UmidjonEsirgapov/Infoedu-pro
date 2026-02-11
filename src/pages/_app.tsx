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
							// Notifications API mavjudligini tekshirish va xavfsiz ishlatish
							// OneSignal SDK v16 da Notifications API o'zgargan bo'lishi mumkin
							// SDK ichida NotificationsNamespace.ts xatosini oldini olish uchun
							// Notifications obyektini mavjud qilish yoki xavfsiz ishlatish
							try {
								if (window.OneSignal.Notifications && typeof window.OneSignal.Notifications.on === 'function') {
									// Notifications event listener'larini qo'shish
									// Masalan: notification permission changes, click events, va hokazo
									console.log('OneSignal Notifications API is available')
								} else {
									// Notifications API mavjud emas - SDK ichida xato bo'lmasligi uchun
									// Notifications obyektini yaratish yoki SDK'ning o'ziga ishonish
									console.warn('OneSignal Notifications API is not available - this is normal for some SDK versions')
									
									// SDK ichida NotificationsNamespace.ts xatosini oldini olish uchun
									// Notifications obyektini mavjud qilish (agar kerak bo'lsa)
									if (!window.OneSignal.Notifications) {
										// SDK o'zi Notifications obyektini yaratadi, shuning uchun biz hech narsa qilmaymiz
										// Faqat xatolarni catch qilamiz
									}
								}
							} catch (error) {
								// Notifications API bilan bog'liq xatolarni catch qilish
								console.warn('OneSignal Notifications API error (non-critical):', error)
							}
							
							// Emitter API mavjudligini tekshirish
							if (window.OneSignal.emitter && window.OneSignal.EVENTS) {
								// OneSignal.emitter is now available and can be used safely
								console.log('OneSignal emitter API is available')
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

	// Global error handler for OneSignal SDK errors
	React.useEffect(() => {
		if (typeof window === 'undefined') return

		// OneSignal SDK ichidagi xatolarni catch qilish
		const originalErrorHandler = window.onerror
		window.onerror = (message, source, lineno, colno, error) => {
			// OneSignal NotificationsNamespace.ts xatosini filter qilish
			if (typeof message === 'string' && message.includes('NotificationsNamespace') && message.includes("Cannot read properties of undefined (reading 'on')")) {
				console.warn('OneSignal NotificationsNamespace error caught and suppressed:', message)
				// Xatoni suppress qilish - bu SDK ichidagi muammo, bizning kodimizda emas
				return true // Error handled, don't show in console
			}
			// Boshqa xatolarni original handler'ga yuborish
			if (originalErrorHandler) {
				return originalErrorHandler(message, source, lineno, colno, error)
			}
			return false
		}

		// Cleanup
		return () => {
			window.onerror = originalErrorHandler
		}
	}, [])

	return (
		<>
			{/* OneSignal SDK Script */}
			<Script
				src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
				strategy="afterInteractive"
				defer
				onLoad={() => {
					// Script yuklangandan keyin, OneSignal array'ni tekshirish
					if (typeof window !== 'undefined' && window.OneSignal) {
						console.log('OneSignal SDK script loaded')
					}
				}}
				onError={(e) => {
					console.error('OneSignal SDK script failed to load:', e)
				}}
			/>
			
			<GoogleAnalytics trackPageViews />
			<Analytics />
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
