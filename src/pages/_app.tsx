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
import { GoogleAnalytics, event as gaEvent } from 'nextjs-google-analytics'
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'
import YandexTopAd from '@/components/Ads/YandexTopAd'
import YandexFullscreen from '@/components/Ads/YandexFullscreen'

/** Core Web Vitals va boshqa metrikalarni GA4 ga yuborish — sahifa yuklanish tezligi analitikasi uchun */
export function reportWebVitals(metric: { id: string; name: string; label: string; value: number }) {
	if (typeof window === 'undefined') return
	// GA4: value butun son bo'lishi kerak; CLS 0–1 oralig'ida, 1000 ga ko'paytiramiz
	const value = metric.name === 'CLS' ? Math.round(metric.value * 1000) : Math.round(metric.value)
	gaEvent(metric.name, {
		event_category: metric.label === 'web-vital' ? 'Web Vitals' : 'Next.js',
		event_label: metric.id,
		value,
		nonInteraction: true,
	})
}

const poppins = Poppins({
	subsets: ['latin'],
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
})

// OneSignal v16 init — OneSignalDeferred orqali (defer skript bilan to'g'ri ishlashi uchun)
const ONE_SIGNAL_APP_ID = '8cd942e4-4453-4863-bfcb-dd86b87fc5cd'

function OneSignalInit() {
	useEffect(() => {
		if (typeof window === 'undefined') return
		if (!window.OneSignalDeferred) window.OneSignalDeferred = []

		window.OneSignalDeferred.push(async (OneSignal: any) => {
			try {
				await OneSignal.init({
					appId: ONE_SIGNAL_APP_ID,
					allowLocalhostAsSecureOrigin: true,
					serviceWorkerPath: '/OneSignalSDKWorker.js',
				})
			} catch (error) {
				console.error('OneSignal initialization failed:', error)
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
			{/* Yandex.RTB context.js — reklama bloklari uchun */}
			<Script
				src="https://yandex.ru/ads/system/context.js"
				strategy="afterInteractive"
			/>
			{/* OneSignal SDK Script */}
			<Script
				src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
				strategy="afterInteractive"
				defer
				onError={(e) => {
					console.error('OneSignal SDK script failed to load:', e)
				}}
			/>
			
			<GoogleAnalytics trackPageViews />
			<Analytics />
			<OneSignalInit />
			<YandexTopAd />
			<YandexFullscreen />

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
