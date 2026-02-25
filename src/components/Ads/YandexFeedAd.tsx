'use client'

import React from 'react'
import YandexAd from './YandexAd'
import { YAN_BLOCK_IDS } from './YandexAd'

export default function YandexFeedAd() {
  return (
    <YandexAd
      blockId={YAN_BLOCK_IDS.feed}
      type="feed"
      renderTo="yandex_rtb_R-A-18660186-2"
      minHeight={250}
      className="my-4 w-full"
    />
  )
}
