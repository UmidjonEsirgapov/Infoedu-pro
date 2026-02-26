'use client'

import React, { useEffect } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'
import { useThemeMode } from '@/hooks/useThemeMode'
import { assignDynamicIdsToImages } from './assignImageIds'

const IN_IMAGE_BLOCK_ID = YAN_BLOCK_IDS.inImage

/** In-Image uchun id prefiksi (assignDynamicIdsToImages bilan bir xil) */
const IN_IMAGE_ID_PREFIX = 'yandex_rtb_' + IN_IMAGE_BLOCK_ID.replace(/-/g, '_')

/** Yandex In-Image minimal o‘lcham (px) — kichikrasmlar INVALID_IMAGE_SIZE beradi */
const MIN_IMAGE_WIDTH = 320
const MIN_IMAGE_HEIGHT = 190

/** Maqola matnidagi rasmlar — reklama qo‘yilmaydi, faqat oddiy ko‘rinadi */
const POST_CONTENT_SELECTOR = '#single-entry-content'

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

    const allImages = assignDynamicIdsToImages(root as HTMLElement, IN_IMAGE_ID_PREFIX)
    const postContent = document.querySelector(POST_CONTENT_SELECTOR)
    /** Post ichidagi rasmlarni In-Image dan chiqarib tashlash — ular doim oddiy ko‘rinsin */
    const images = postContent
      ? allImages.filter((img) => !postContent.contains(img))
      : allImages

    /** Faqat asl rasm o‘lchami (natural*) — Yandex INVALID_IMAGE_SIZE ni shu asosida beradi */
    const isLargeEnough = (img: HTMLImageElement): boolean => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      return w >= MIN_IMAGE_WIDTH && h >= MIN_IMAGE_HEIGHT
    }

    images.forEach((img) => {
      const imageId = img.id
      if (!imageId) return

      const onReady = () => {
        if (!isLargeEnough(img)) return
        render(imageId)
      }

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
