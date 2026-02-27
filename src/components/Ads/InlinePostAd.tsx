'use client'

/**
 * Maqola matni ichiga (3-blokdan keyin) Yandex banner joylashtiradi.
 * Agar reklama chiqmasa:
 * 1. Yandex Dashboard → Blok R-A-18660186-3 → sayt domeni "Ruxsat berilgan saytlar"da bo'lsin.
 * 2. Blok turi "Adaptiv banner" yoki "Standart banner" bo'lsin.
 * 3. Brauzerda Elements → #single-entry-content ichida [data-yandex-inline-ad] div bor-yo'qligini tekshiring (joylashuv ishlayapti).
 * 4. Localhostda Yandex 403 berishi mumkin — production domenida tekshiring.
 */
import React, { useEffect, useRef, useId } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'
import { useThemeMode } from '@/hooks/useThemeMode'

const INLINE_BANNER_BLOCK_ID = YAN_BLOCK_IDS.banner
const MIN_HEIGHT_PX = 250

export interface InlinePostAdProps {
  /** Maqola kontenti konteyneri (single-entry-content) ref */
  contentRef: React.RefObject<HTMLDivElement | null>
}

/** Paragraf yoki blok elementlari — WordPress/Faust div.wp-block-* ham chiqaradi */
const CONTENT_BLOCK_SELECTOR =
  'p, h1, h2, h3, h4, h5, h6, [class*="wp-block-paragraph"], [class*="wp-block-heading"], .CoreFreeform > *'

/** Fallback: konteyner ichidagi har qanday to‘g‘ridan-to‘g‘ri bolalar (bloklar topilmasa) */
const FALLBACK_BLOCK_SELECTOR = '#single-entry-content > *'

/** Maqola matnining o‘rtasiga (3-blokdan keyin) R-A-18660186-3 StandardBanner joylashtiriladi */
const INSERT_AFTER_BLOCK_INDEX = 2

export default function InlinePostAd({ contentRef }: InlinePostAdProps) {
  const insertedRef = useRef<HTMLDivElement | null>(null)
  const id = useId().replace(/:/g, '')
  const renderToId = `yandex_rtb_${INLINE_BANNER_BLOCK_ID.replace(/-/g, '_')}_inline_${id}`
  const { isDarkMode } = useThemeMode()

  useEffect(() => {
    const container = contentRef.current
    if (!container || typeof window === 'undefined') return
    if (!window.yaContextCb) window.yaContextCb = []

    const insertAd = () => {
      if (insertedRef.current) return

      let blocks = container.querySelectorAll(CONTENT_BLOCK_SELECTOR)
      if (blocks.length === 0) {
        blocks = container.querySelectorAll(FALLBACK_BLOCK_SELECTOR)
      }
      const idx = INSERT_AFTER_BLOCK_INDEX
      const insertAfter =
        blocks.length > idx ? blocks[idx] : blocks.length > 0 ? blocks[blocks.length - 1] : null

      const adDiv = document.createElement('div')
      adDiv.id = renderToId
      adDiv.setAttribute('data-yandex-inline-ad', '')
      adDiv.style.minHeight = `${MIN_HEIGHT_PX}px`
      adDiv.className = 'my-6 w-full max-h-[200px] sm:max-h-none overflow-hidden bg-white dark:bg-slate-800'

      if (insertAfter) {
        insertAfter.after(adDiv)
      } else {
        container.appendChild(adDiv)
      }
      insertedRef.current = adDiv

    const tryRender = () => {
      const el = document.getElementById(renderToId)
      if (!el) return
      if (window.Ya?.Context?.AdvManager) {
        window.Ya.Context.AdvManager.render({
          blockId: INLINE_BANNER_BLOCK_ID,
          renderTo: renderToId,
          darkTheme: isDarkMode,
        })
      }
    }

    /** Layout tugagach render (CONTAINER_IS_HIDDEN kamayishi uchun) */
    const tryRenderAfterLayout = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(tryRender)
      })
    }

      if (window.yaContextCb) {
        window.yaContextCb.push(tryRenderAfterLayout)
      }
      if (window.Ya?.Context?.AdvManager) {
        tryRenderAfterLayout()
      }
    }

    const hasBlockContent = () =>
      container.querySelector(CONTENT_BLOCK_SELECTOR) != null || container.childNodes.length > 0

    const runWhenReady = () => {
      if (hasBlockContent()) {
        insertAd()
        return true
      }
      return false
    }

    let observer: MutationObserver | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const runAfterPaint = () => {
      requestAnimationFrame(() => {
        if (runWhenReady()) return
        observer = new MutationObserver(() => {
          if (runWhenReady() && observer) {
            observer.disconnect()
            observer = null
          }
        })
        observer.observe(container, { childList: true, subtree: true })
        timeoutId = setTimeout(() => {
          if (!insertedRef.current) insertAd()
        }, 2000)
      })
    }

    runAfterPaint()

    return () => {
      observer?.disconnect()
      if (timeoutId) clearTimeout(timeoutId)
      const el = document.getElementById(renderToId)
      if (el) el.remove()
      insertedRef.current = null
    }
  }, [contentRef, renderToId, isDarkMode])

  return null
}
