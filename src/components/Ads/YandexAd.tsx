'use client'

import React, { useEffect, useRef, useId } from 'react'

declare global {
  interface Window {
    yaContextCb?: Array<() => void>
    Ya?: {
      Context: {
        AdvManager: {
          render: (opts: {
            blockId: string
            type?: string
            renderTo?: string
            platform?: string
          }) => void
        }
      }
    }
  }
}

const YAN_BLOCK_IDS = {
  topAd: 'R-A-18660186-1',
  feed: 'R-A-18660186-2',
  banner: 'R-A-18660186-3',
  fullscreen: 'R-A-18660186-4',
  inImage: 'R-A-18660186-5',
} as const

export interface YandexAdProps {
  blockId: string
  type?: 'topAd' | 'feed' | 'fullscreen' | 'inImage'
  renderTo?: string
  /** Konteyner uchun min-height (layout shift oldini olish) */
  minHeight?: number
  className?: string
}

export default function YandexAd({ blockId, type, renderTo, minHeight = 90, className = '' }: YandexAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, '')
  const to = renderTo || `yandex_rtb_${blockId.replace(/-/g, '_')}_${id}`

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.yaContextCb) window.yaContextCb = []

    const push = () => {
      window.yaContextCb!.push(() => {
        if (window.Ya?.Context?.AdvManager) {
          const opts: Parameters<typeof window.Ya.Context.AdvManager.render>[0] = {
            blockId,
            renderTo: to,
          }
          if (type) opts.type = type
          window.Ya.Context.AdvManager.render(opts)
        }
      })
    }

    push()

    return () => {
      const el = document.getElementById(to)
      if (el) el.innerHTML = ''
    }
  }, [blockId, type, to])

  if (type === 'topAd' || type === 'fullscreen') {
    return null
  }

  return (
    <div
      id={to}
      ref={containerRef}
      className={className}
      style={{ minHeight: `${minHeight}px` }}
    />
  )
}

export { YAN_BLOCK_IDS }
