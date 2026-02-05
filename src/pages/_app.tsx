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
		window.OneSignal = window.OneSignal || []
		window.OneSignalDeferred = window.OneSignalDeferred || []

		// Initialize OneSignal when SDK is loaded
		window.OneSignalDeferred.push(async function(OneSignal: any) {
			await OneSignal.init({
				appId: "8cd942e4-4453-4863-bfcb-dd86b87fc5cd",
				allowLocalhostAsSecureOrigin: true,
			})
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
