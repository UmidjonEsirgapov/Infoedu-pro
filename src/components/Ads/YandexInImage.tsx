'use client'

import React, { useEffect } from 'react'
import { YAN_BLOCK_IDS } from './YandexAd'
import { useThemeMode } from '@/hooks/useThemeMode'
import { assignDynamicIdsToImages } from './assignImageIds'

const IN_IMAGE_BLOCK_ID = YAN_BLOCK_IDS.inImage

/** In-Image uchun id prefiksi (assignDynamicIdsToImages bilan bir xil) */
const IN_IMAGE_ID_PREFIX = 'yandex_rtb_' + IN_IMAGE_BLOCK_ID.replace(/-/g, '_')

/** Yandex In-Image minimal o‘lcham (px) — natural va ekrandagi o‘lcham ikkalasi ham shundan katta bo‘lishi kerak (INVALID_IMAGE_SIZE oldini olish) */
const MIN_IMAGE_WIDTH = 320
const MIN_IMAGE_HEIGHT = 190

/** Maqola matnidagi rasmlar — reklama qo‘yilmaydi, faqat oddiy ko‘rinadi */
const POST_CONTENT_SELECTOR = '#single-entry-content'
/** Oliygoh sahifasidagi Hero rasmi — reklama yopmasin (universitet nomi binoda ko‘rinsin) */
const OLIYGOH_HERO_SELECTOR = '[data-oliygoh-hero-image]'
/** Bosh sahifadagi asosiy post rasmi — reklama chiqmasin */
const HOME_HERO_SELECTOR = '[data-home-hero-image]'

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
    const oliygohHero = document.querySelector(OLIYGOH_HERO_SELECTOR)
    const homeHero = document.querySelector(HOME_HERO_SELECTOR)
    /** Post, oliygoh Hero va bosh sahifa hero rasmlarida In-Image chiqarilmaydi */
    const images = allImages.filter((img) => {
      if (postContent?.contains(img)) return false
      if (oliygohHero?.contains(img)) return false
      if (homeHero?.contains(img)) return false
      return true
    })

    /** Natural va ekrandagi o‘lcham ikkalasi ham min dan katta bo‘lishi kerak (Yandex ikkalasini tekshiradi, INVALID_IMAGE_SIZE kamayadi) */
    const isLargeEnough = (img: HTMLImageElement): boolean => {
      const nw = img.naturalWidth || 0
      const nh = img.naturalHeight || 0
      const dw = img.offsetWidth || 0
      const dh = img.offsetHeight || 0
      return (
        nw >= MIN_IMAGE_WIDTH &&
        nh >= MIN_IMAGE_HEIGHT &&
        dw >= MIN_IMAGE_WIDTH &&
        dh >= MIN_IMAGE_HEIGHT
      )
    }

    const runAfterLayout = (fn: () => void) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(fn)
      })
    }

    images.forEach((img) => {
      const imageId = img.id
      if (!imageId) return

      const onReady = () => {
        runAfterLayout(() => {
          if (!isLargeEnough(img)) return
          render(imageId)
        })
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
