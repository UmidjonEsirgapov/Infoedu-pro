'use client'

import React from 'react'
import YandexAd from './YandexAd'
import { YAN_BLOCK_IDS } from './YandexAd'

const BANNER_BLOCK_ID = YAN_BLOCK_IDS.banner

/**
 * Kun.uz uslubidagi "Top Billboard" — Header ustida, to‘liq kenglikdagi reklama.
 * Joylashuv: layout da Header (Navigatsiya) dan tepada.
 * Kenglik: tashqi konteyner 100vw; ichki reklama bloki markazda (margin: 0 auto).
 * Fon: light — #f0f2f5; dark mode — sahifa foniga mos (neutral-900).
 * Mobil: balandlik avtomatik; desktop: min-height 120px.
 */
export default function YandexTopBillboard() {
  return (
    <section
      className="yandex-top-billboard bg-[#f0f2f5] dark:bg-neutral-900 py-2 md:py-3 w-full"
      style={{
        width: '100vw',
        maxWidth: '100%',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="yandex-top-billboard__inner w-full max-w-[1280px] px-3 sm:px-4 min-h-0 md:min-h-[120px]"
        style={{ margin: '0 auto' }}
      >
        <YandexAd
          blockId={BANNER_BLOCK_ID}
          renderTo="yandex_rtb_R-A-18660186-3_topbillboard"
          minHeight={120}
          className="w-full"
        />
      </div>
    </section>
  )
}
