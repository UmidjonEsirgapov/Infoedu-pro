'use client'

import React, { useEffect, useRef, useId } from 'react'
import { useThemeMode } from '@/hooks/useThemeMode'

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
            darkTheme?: boolean
          }) => void
        }
      }
    }
  }
}

const YAN_BLOCK_IDS = {
  topAd: 'R-A-18660186-1',
  banner: 'R-A-18660186-3',
  fullscreen: 'R-A-18660186-4',
  inImage: 'R-A-18660186-5',
} as const

export interface YandexAdProps {
  blockId: string
  type?: 'topAd' | 'fullscreen' | 'inImage'
  renderTo?: string
  /** Konteyner uchun min-height (layout shift oldini olish) */
  minHeight?: number
  className?: string
}

const DEFAULT_MIN_HEIGHT = 250

export default function YandexAd({ blockId, type, renderTo, minHeight = DEFAULT_MIN_HEIGHT, className = '' }: YandexAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, '')
  const to = renderTo || `yandex_rtb_${blockId.replace(/-/g, '_')}_${id}`
  const { isDarkMode } = useThemeMode()
  const isStandardBanner = blockId === YAN_BLOCK_IDS.banner

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.yaContextCb) window.yaContextCb = []

    const el = document.getElementById(to)
    if (el) el.innerHTML = ''

    const push = () => {
      window.yaContextCb!.push(() => {
        if (window.Ya?.Context?.AdvManager) {
          const opts: Parameters<typeof window.Ya.Context.AdvManager.render>[0] = {
            blockId,
            renderTo: to,
            darkTheme: isDarkMode,
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
  }, [blockId, type, to, isDarkMode])

  if (type === 'topAd' || type === 'fullscreen') {
    return null
  }

  const bannerClass = isStandardBanner ? ' max-h-[200px] sm:max-h-none overflow-hidden' : ''
  const themeBg = 'bg-white dark:bg-slate-800'

  return (
    <div
      id={to}
      ref={containerRef}
      className={`${themeBg} ${className}${bannerClass}`.trim()}
      style={{ minHeight: `${minHeight}px` }}
    />
  )
}

export { YAN_BLOCK_IDS }
