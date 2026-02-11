'use client'

import React, { useMemo } from 'react'
import MilliySertifikatTimelineItem from './MilliySertifikatTimelineItem'
import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'

interface MilliySertifikatTimelineProps {
	items: MilliySertifikatImtihon[]
}

/** Bugungi kundan keyingi birinchi imtihon (royxatSana >= bugun) — "Faol" */
function getActiveIndex(items: MilliySertifikatImtihon[]): number {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	for (let i = 0; i < items.length; i++) {
		const royxat = items[i].royxatSana
		if (!royxat) continue
		const d = new Date(royxat)
		d.setHours(0, 0, 0, 0)
		if (d.getTime() >= today.getTime()) return i
	}
	return -1
}

/** Ro'yxat sanasi o'tgan bo'lsa kartochka inactive (xiralashtiriladi) */
function isInactive(item: MilliySertifikatImtihon): boolean {
	if (!item.royxatSana) return false
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const d = new Date(item.royxatSana)
	d.setHours(0, 0, 0, 0)
	return d.getTime() < today.getTime()
}

export default function MilliySertifikatTimeline({
	items,
}: MilliySertifikatTimelineProps) {
	const activeIndex = useMemo(() => getActiveIndex(items), [items])

	if (!items.length) {
		return (
			<div className="rounded-xl border border-neutral-200 bg-neutral-50/50 py-12 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400">
				Imtihonlar jadvali hozircha mavjud emas. Keyinroq qaytib turing.
			</div>
		)
	}

	return (
		<div className="relative">
			<div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-primary-200 dark:bg-primary-800 sm:block" />
			<div className="space-y-8 sm:space-y-12">
				{items.map((item, index) => {
					const isLeft = index % 2 === 0
					return (
						<div
							key={item.id}
							className="relative flex w-full flex-row flex-wrap items-stretch justify-center sm:flex-nowrap"
						>
							{isLeft && <div className="hidden w-1/2 sm:block" />}
							<div className="w-full sm:w-1/2">
								<MilliySertifikatTimelineItem
									item={item}
									index={index}
									isActive={index === activeIndex}
									isInactive={isInactive(item)}
								/>
							</div>
							{!isLeft && <div className="hidden w-1/2 sm:block" />}
						</div>
					)
				})}
			</div>
		</div>
	)
}
