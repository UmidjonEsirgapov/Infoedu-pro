'use client'

import React, { useEffect } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'
import { useThemeMode } from '@/hooks/useThemeMode'
import { assignDynamicIdsToImages } from './assignImageIds'

const IN_IMAGE_BLOCK_ID = YAN_BLOCK_IDS.inImage

/** In-Image uchun id prefiksi (assignDynamicIdsToImages bilan bir xil) */
const IN_IMAGE_ID_PREFIX = 'yandex_rtb_' + IN_IMAGE_BLOCK_ID.replace(/-/g, '_')

export interface YandexInImageProps {
  /**
   * Rasmlarni qidirish konteyneri.
   * Default: main yoki document.body — sahifadagi barcha img ga dinamik id birikadi.
   */
  container?: HTMLElement | null
}

export default function YandexInImage({ container }: YandexInImageProps) {
  const { isDarkMode } = useThemeMode()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.yaContextCb) return

    const root = container || document.querySelector('main') || document.body

    const render = (imageId: string) => {
      window.yaContextCb!.push(() => {
        if (window.Ya?.Context?.AdvManager) {
          window.Ya.Context.AdvManager.render({
            renderTo: imageId,
            blockId: IN_IMAGE_BLOCK_ID,
            type: 'inImage',
            darkTheme: isDarkMode,
          })
        }
      })
    }

    const images = assignDynamicIdsToImages(root as HTMLElement, IN_IMAGE_ID_PREFIX)

    images.forEach((img) => {
      const imageId = img.id
      if (!imageId) return

      const onReady = () => render(imageId)

      if (!img.complete) {
        img.addEventListener('load', onReady, { once: true })
        img.addEventListener('error', onReady, { once: true })
      } else {
        onReady()
      }
    })
  }, [container, isDarkMode])

  return null
}
