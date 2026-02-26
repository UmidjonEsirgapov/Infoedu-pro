'use client'

import React, { useEffect, useRef, useId } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'

const INLINE_BANNER_BLOCK_ID = YAN_BLOCK_IDS.banner
const MIN_HEIGHT_PX = 250

export interface InlinePostAdProps {
  /** Maqola kontenti konteyneri (single-entry-content) ref */
  contentRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Maqola matnining o‘rtasiga (2-paragrafdan keyin) StandardBanner reklamasini
 * dinamik joylashtiradi. Agar paragraf 2 tadan kam bo‘lsa — reklama oxiriga qo‘yiladi.
 */
export default function InlinePostAd({ contentRef }: InlinePostAdProps) {
  const insertedRef = useRef<HTMLDivElement | null>(null)
  const id = useId().replace(/:/g, '')
  const renderToId = `yandex_rtb_${INLINE_BANNER_BLOCK_ID.replace(/-/g, '_')}_inline_${id}`

  useEffect(() => {
    const container = contentRef.current
    if (!container || typeof window === 'undefined') return
    if (!window.yaContextCb) window.yaContextCb = []

    const insertAd = () => {
      if (insertedRef.current) return

      const paragraphs = container.querySelectorAll('p')
      const insertAfter = paragraphs.length >= 2 ? paragraphs[1] : null

      const adDiv = document.createElement('div')
      adDiv.id = renderToId
      adDiv.setAttribute('data-yandex-inline-ad', '')
      adDiv.style.minHeight = `${MIN_HEIGHT_PX}px`
      adDiv.className = 'my-6 w-full'

      if (insertAfter) {
        insertAfter.after(adDiv)
      } else {
        container.appendChild(adDiv)
      }
      insertedRef.current = adDiv

      if (window.yaContextCb) {
        window.yaContextCb.push(() => {
          if (window.Ya?.Context?.AdvManager) {
            window.Ya.Context.AdvManager.render({
              blockId: INLINE_BANNER_BLOCK_ID,
              renderTo: renderToId,
            })
          }
        })
      }
    }

    const runWhenReady = () => {
      const hasContent = container.querySelector('p') != null || container.childNodes.length > 0
      if (hasContent) {
        insertAd()
        return true
      }
      return false
    }

    if (runWhenReady()) return

    const observer = new MutationObserver(() => {
      if (runWhenReady()) observer.disconnect()
    })
    observer.observe(container, { childList: true, subtree: true })

    const timeoutId = setTimeout(() => {
      if (!insertedRef.current) insertAd()
    }, 1500)

    return () => {
      observer.disconnect()
      clearTimeout(timeoutId)
      const el = document.getElementById(renderToId)
      if (el) el.remove()
      insertedRef.current = null
    }
  }, [contentRef, renderToId])

  return null
}
