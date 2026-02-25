'use client'

import React, { useEffect } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'

const IN_IMAGE_BLOCK_ID = YAN_BLOCK_IDS.inImage

/** Asosiy rasmlar (featured images) uchun selector. O'zgartirish mumkin. */
const DEFAULT_IMAGE_SELECTOR = 'main img[src*="wp-content"], article .wp-block-post-featured-image img, .prose img'

export interface YandexInImageProps {
  /** Qaysi rasmlarga reklama chiqarish. Default: featured va asosiy kontent rasmlari */
  selector?: string
}

export default function YandexInImage({ selector = DEFAULT_IMAGE_SELECTOR }: YandexInImageProps) {
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
    const process = (list: HTMLImageElement[]) => {
      if (!list.length) return
      const img = list.shift()!
      const imageId = `yandex_rtb_${IN_IMAGE_BLOCK_ID.replace(/-/g, '_')}_${Math.random().toString(16).slice(2)}`
      img.id = imageId
      if (img.tagName === 'IMG' && !img.complete) {
        img.addEventListener('load', () => render(imageId), { once: true })
      } else {
        render(imageId)
      }
      process(list)
    }
    process(images)
  }, [selector])

  return null
}
