'use client'

import { Banknote } from 'lucide-react'
import { MILLIY_SERTIFIKAT_PRICE } from '@/data/milliy-sertifikat-types'

export default function MilliySertifikatEdTechStats() {
	return (
		<section className="px-4 py-6">
			<div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-neutral-200 bg-neutral-50/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50 sm:gap-8">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
						<Banknote className="h-5 w-5" />
					</div>
					<div>
						<p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Imtihon narxi
						</p>
						<p className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{MILLIY_SERTIFIKAT_PRICE}
						</p>
					</div>
				</div>
			</div>
		</section>
	)
}
