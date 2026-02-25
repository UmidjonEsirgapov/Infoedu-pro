'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { YAN_BLOCK_IDS } from './YandexAd'

function useIsTouch() {
  const [isTouch, setIsTouch] = React.useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])
  return isTouch
}

export default function YandexFullscreen() {
  const router = useRouter()
  const isTouch = useIsTouch()
  const prevPathRef = useRef(router.asPath)

  useEffect(() => {
    if (!isTouch || typeof window === 'undefined') return

    const handler = () => {
      if (prevPathRef.current === router.asPath) return
      prevPathRef.current = router.asPath
      if (!window.yaContextCb) window.yaContextCb = []
      window.yaContextCb.push(() => {
        if (window.Ya?.Context?.AdvManager) {
          window.Ya.Context.AdvManager.render({
            blockId: YAN_BLOCK_IDS.fullscreen,
            type: 'fullscreen',
            platform: 'touch',
          })
        }
      })
    }

    router.events.on('routeChangeComplete', handler)
    return () => router.events.off('routeChangeComplete', handler)
  }, [router.asPath, router.events, isTouch])

  return null
}
