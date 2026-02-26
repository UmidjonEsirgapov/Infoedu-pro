'use client'

import React, { useEffect } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'

const IN_IMAGE_BLOCK_ID = YAN_BLOCK_IDS.inImage

/** Faqat priority rasmlar (Next.js Image priority → loading="eager", yoki data-priority) */
const PRIORITY_IMAGE_SELECTOR =
  'main img[loading="eager"], article img[loading="eager"], img[data-priority="true"]'

export interface YandexInImageProps {
  /** Faqat shu selector bilan rasmlarga reklama. Default: priority rasmlar */
  selector?: string
}

export default function YandexInImage({ selector = PRIORITY_IMAGE_SELECTOR }: YandexInImageProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.yaContextCb) return

    const render = (imageId: string) => {
      window.yaContextCb!.push(() => {
        if (window.Ya?.Context?.AdvManager) {
          window.Ya.Context.AdvManager.render({
            renderTo: imageId,
            blockId: IN_IMAGE_BLOCK_ID,
            type: 'inImage',
          })
        }
      })
    }

    const images = Array.from(document.querySelectorAll<HTMLImageElement>(selector))

    images.forEach((img) => {
      const imageId = `yandex_rtb_${IN_IMAGE_BLOCK_ID.replace(/-/g, '_')}_${Math.random().toString(16).slice(2)}`
      img.id = imageId

      const onReady = () => render(imageId)

      if (!img.complete) {
        img.addEventListener('load', onReady, { once: true })
        img.addEventListener('error', onReady, { once: true })
      } else {
        onReady()
      }
    })
  }, [selector])

  return null
}
