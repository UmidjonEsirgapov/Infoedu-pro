'use client'

import React, { useEffect, useState } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'
import { useThemeMode } from '@/hooks/useThemeMode'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = () => setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export default function YandexTopAd() {
  const isMobile = useIsMobile()
  const { isDarkMode } = useThemeMode()

  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') return
    if (!window.yaContextCb) window.yaContextCb = []
    window.yaContextCb.push(() => {
      if (window.Ya?.Context?.AdvManager) {
        window.Ya.Context.AdvManager.render({
          blockId: YAN_BLOCK_IDS.topAd,
          type: 'topAd',
          darkTheme: isDarkMode,
        })
      }
    })
  }, [isMobile, isDarkMode])

  return null
}
