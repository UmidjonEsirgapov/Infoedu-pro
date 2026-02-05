import { NC_SITE_SETTINGS } from '@/contains/site-settings'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

const FAVICON_VERSION = 4
const SITE_URL = process.env.NEXT_PUBLIC_URL
const SITE_TITLE = NC_SITE_SETTINGS.site_info?.site_title

function v(href: string) {
	return `${href}?v=${FAVICON_VERSION}`
}

export default class Document extends NextDocument {
	// @ts-ignore
	static async getInitialProps(ctx) {
		const initialProps = await NextDocument.getInitialProps(ctx)
		return { ...initialProps }
	}

	render() {
		return (
			<Html
				lang="en"
				className="[--scroll-mt:9.875rem] lg:[--scroll-mt:6.3125rem]"
				dir={process.env.NEXT_PUBLIC_SITE_DIRECTION}
			>
				<Head>
				<script
  dangerouslySetInnerHTML={{
    __html: `
      (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {
              if (document.scripts[j].src === r) { return; }
          }
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],
          k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=106513328', 'ym');

      ym(106513328, 'init', {
          ssr:true,
          webvisor:true,
          clickmap:true,
          ecommerce:"dataLayer",
          referrer: document.referrer,
          url: location.href,
          accurateTrackBounce:true,
          trackLinks:true
      });
    `,
  }}
/>

					<link
						href={`${SITE_URL}/api/feeds/feed.json`}
						rel="alternate"
						type="application/feed+json"
						title={SITE_TITLE + ' JSON Feed'}
					/>
					<link
						href={`${SITE_URL}/api/feeds/rss.xml`}
						rel="alternate"
						type="application/rss+xml"
						title={SITE_TITLE + ' XML Feed'}
					/>
					<link
						href={`${SITE_URL}/api/feeds/feed.atom`}
						rel="alternate"
						type="application/atom+xml"
						title={SITE_TITLE + ' Atom Feed'}
					/>
					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href={v('/favicons/apple-touch-icon.png')}
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="32x32"
						href={v('/favicons/favicon-32x32.png')}
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="16x16"
						href={v('/favicons/favicon-16x16.png')}
					/>
					<link rel="manifest" href={v('/favicons/site.webmanifest')} />
					<link
						rel="mask-icon"
						href={v('/favicons/safari-pinned-tab.svg')}
						color="#38bdf8"
					/>
					<link rel="shortcut icon" href={v('/favicons/favicon.ico')} />
					<meta name="apple-mobile-web-app-title" content="Ncmaz Nextjs" />
					<meta name="application-name" content="Ncmaz Nextjs" />
					<meta name="theme-color" content="#172A53" />
					<script
						dangerouslySetInnerHTML={{
							__html: `
						try {
							if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
							document.documentElement.classList.add('dark')
							} else {
							document.documentElement.classList.remove('dark')
							}
						} catch (_) {}
						`,
						}}
					/>
					<script
						dangerouslySetInnerHTML={{
							__html: `
							try {
								if (localStorage.dismiss_top_banner === 'true' ) {
								document.documentElement.classList.add('dismiss_top_banner')
								} else {
								document.documentElement.classList.remove('dismiss_top_banner')
								}
							} catch (_) {}
							`,
						}}
					/>

					<meta
          httpEquiv="Content-Security-Policy"
          content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://yastatic.net https://cdn.onesignal.com https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://quge5.com https://yohle.com https://glempirteechacm.com https://roagrofoogrobo.com https://ep2.adtrafficquality.google" 
        />
         
        <script
           async
           src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2258193393152528"
           crossOrigin="anonymous"
         />

<script
  src="https://quge5.com/88/tag.min.js"
  data-zone="206210"
  async
  data-cfasync="false"
/>
<script
  dangerouslySetInnerHTML={{
    __html: `
      // Monetag: Faqat Banner reklamani qoldirish, qolganlarini o'chirish
      (function() {
        // Skript yuklangandan keyin kutish
        function disableNonBannerAds() {
          // Popup va overlay reklamalarni o'chirish
          const popupSelectors = [
            '[id*="popup"]',
            '[id*="overlay"]',
            '[id*="interstitial"]',
            '[class*="popup"]',
            '[class*="overlay"]',
            '[class*="interstitial"]',
            '[class*="modal"]',
            'iframe[src*="yohle"]',
            'iframe[src*="glempirteechacm"]',
            'iframe[src*="roagrofoogrobo"]',
          ];
          
          popupSelectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => {
                // Banner emas bo'lsa, o'chirish
                const isBanner = el.offsetWidth > 200 && el.offsetHeight < 1000 && 
                                 !el.style.position || el.style.position !== 'fixed';
                if (!isBanner && (el.style.position === 'fixed' || 
                    el.style.zIndex > 1000 || 
                    el.classList.contains('popup') ||
                    el.classList.contains('overlay') ||
                    el.classList.contains('interstitial'))) {
                  el.remove();
                }
              });
            } catch(e) {}
          });
          
          // Fixed position va z-index yuqori bo'lgan elementlarni tekshirish
          const allElements = document.querySelectorAll('*');
          allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' && 
                parseInt(style.zIndex) > 1000 && 
                el.offsetWidth < window.innerWidth * 0.9) {
              // Bu popup yoki overlay bo'lishi mumkin
              const isBanner = el.offsetWidth > 200 && el.offsetHeight < 1000;
              if (!isBanner) {
                el.remove();
              }
            }
          });
        }
        
        // DOM yuklangandan keyin
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(disableNonBannerAds, 1000);
            setInterval(disableNonBannerAds, 2000);
          });
        } else {
          setTimeout(disableNonBannerAds, 1000);
          setInterval(disableNonBannerAds, 2000);
        }
        
        // MutationObserver orqali yangi elementlarni kuzatish
        const observer = new MutationObserver(function(mutations) {
          disableNonBannerAds();
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      })();
    `,
  }}
/>


				</Head>
				<body className="relative bg-white text-base text-neutral-900 dark:bg-neutral-900/95 dark:text-neutral-100">
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
