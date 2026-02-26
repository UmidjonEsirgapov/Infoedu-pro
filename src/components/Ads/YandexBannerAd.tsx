'use client'

import React from 'react'
import YandexAd from './YandexAd'
import { YAN_BLOCK_IDS } from './YandexAd'

export default function YandexBannerAd() {
  return (
    <YandexAd
      blockId={YAN_BLOCK_IDS.banner}
      renderTo="yandex_rtb_R-A-18660186-3"
      minHeight={250}
      className="my-4 w-full"
    />
  )
}
