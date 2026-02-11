'use client'

import React from 'react'
import { CreditCardIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import Badge from '@/components/Badge/Badge'
import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'
import { formatImtihonSana } from '@/lib/format-imtihon-sana'

interface MilliySertifikatTimelineItemProps {
	item: MilliySertifikatImtihon
	index: number
	/** Kelajakdagi / joriy siklni "Faol" qilib ko'rsatish */
	isActive: boolean
	/** Ro'yxat sanasi o'tgan — kartochka xiralashtiriladi (inactive) */
	isInactive: boolean
}

const FAN_COLORS = [
	'blue',
	'green',
	'red',
	'yellow',
	'indigo',
	'pink',
] as const

export default function MilliySertifikatTimelineItem({
	item,
	index,
	isActive,
	isInactive,
}: MilliySertifikatTimelineItemProps) {
	const isLeft = index % 2 === 0
	const badgeColor = FAN_COLORS[index % FAN_COLORS.length]
	const royxatMatn = formatImtihonSana(item.royxatSana)
	const tolovMatn = formatImtihonSana(item.tolovSana)

	return (
		<div
			className={`relative flex w-full items-center ${
				isLeft ? 'sm:justify-end sm:pr-8' : 'sm:justify-start sm:pl-8'
			}`}
		>
			<div
				className={`w-full max-w-md rounded-xl border p-5 shadow-md transition-all dark:border-neutral-700 ${
					isInactive
						? 'border-neutral-200 bg-neutral-100/80 opacity-75 dark:bg-neutral-800/60 dark:border-neutral-600'
						: 'bg-white dark:bg-neutral-800/80'
				} ${
					isActive && !isInactive
						? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-neutral-900'
						: !isInactive
							? 'border-neutral-200 dark:border-neutral-700'
							: ''
				}`}
				style={
					isActive && !isInactive
						? {
								boxShadow:
									'0 0 20px rgba(var(--c-primary-500), 0.25), 0 0 40px rgba(var(--c-primary-500), 0.1)',
							}
						: undefined
				}
			>
				{isActive && !isInactive && (
					<span className="absolute -top-2 right-4 rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
						Faol
					</span>
				)}
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
					{item.title}
				</h3>
				<p className="mt-2 text-xl font-bold leading-snug text-primary-600 dark:text-primary-400">
					{item.imtihonSanalari}
				</p>
				{item.fanlar.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-2">
						{item.fanlar.map((fan, i) => (
							<Badge
								key={i}
								name={fan}
								color={badgeColor}
								className="text-xs"
							/>
						))}
					</div>
				)}
				<div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
					{item.royxatSana && (
						<span className="flex items-center gap-1.5">
							<UserPlusIcon className="h-4 w-4 shrink-0" />
							Ro&apos;yxat: {royxatMatn || item.royxatSana}
						</span>
					)}
					{item.tolovSana && (
						<span className="flex items-center gap-1.5">
							<CreditCardIcon className="h-4 w-4 shrink-0" />
							To&apos;lov: {tolovMatn || item.tolovSana}
						</span>
					)}
				</div>
			</div>
		</div>
	)
}
