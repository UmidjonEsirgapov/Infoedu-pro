'use client'

import React, { useMemo, useState } from 'react'
import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'
import MilliySertifikatEdTechCard from './MilliySertifikatEdTechCard'

function getUniqueFanNomi(items: MilliySertifikatImtihon[]): string[] {
	const set = new Set<string>()
	items.forEach((item) => item.fanlar.forEach((f) => set.add(f.fan_nomi)))
	return Array.from(set).sort()
}

export default function MilliySertifikatEdTechGrid({
	items,
}: {
	items: MilliySertifikatImtihon[]
}) {
	const [selectedFan, setSelectedFan] = useState<string>('all')
	const fanlar = useMemo(() => getUniqueFanNomi(items), [items])

	const filtered = useMemo(() => {
		if (selectedFan === 'all') return items
		return items.filter((item) =>
			item.fanlar.some(
				(f) => f.fan_nomi.toLowerCase() === selectedFan.toLowerCase()
			)
		)
	}, [items, selectedFan])

	if (!items.length) {
		return (
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
				Imtihonlar jadvali hozircha mavjud emas. Keyinroq qaytib turing.
			</div>
		)
	}

	return (
		<section className="px-4 py-8 sm:py-10">
			{fanlar.length > 0 && (
				<div className="mb-8">
					<p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
						Fan bo&apos;yicha filtrlash
					</p>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => setSelectedFan('all')}
							className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
								selectedFan === 'all'
									? 'bg-indigo-600 text-white dark:bg-indigo-500'
									: 'bg-neutral-200 text-slate-700 hover:bg-neutral-300 dark:bg-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-600/80'
							}`}
						>
							Barchasi
						</button>
						{fanlar.map((fan) => (
							<button
								key={fan}
								type="button"
								onClick={() => setSelectedFan(fan)}
								className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
									selectedFan === fan
										? 'bg-indigo-600 text-white dark:bg-indigo-500'
										: 'bg-neutral-200 text-slate-700 hover:bg-neutral-300 dark:bg-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-600/80'
								}`}
							>
								{fan}
							</button>
						))}
					</div>
				</div>
			)}

			{filtered.length === 0 ? (
				<p className="py-12 text-center text-slate-500 dark:text-slate-400">
					Tanlangan fanga oid imtihon topilmadi.
				</p>
			) : (
				<div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map((item, index) => (
						<MilliySertifikatEdTechCard
							key={item.id}
							item={item}
							index={index}
						/>
					))}
				</div>
			)}
		</section>
	)
}
