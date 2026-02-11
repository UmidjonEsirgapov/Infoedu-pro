import React from 'react'
import { BanknotesIcon } from '@heroicons/react/24/outline'
import { MILLIY_SERTIFIKAT_PRICE } from '@/data/milliy-sertifikat-types'

export default function MilliySertifikatPriceCard() {
	return (
		<div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-6 shadow-sm dark:border-primary-800 dark:bg-primary-900/20 sm:p-8">
			<div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
					<BanknotesIcon className="h-6 w-6" />
				</div>
				<div className="text-center sm:text-left">
					<p className="text-xl font-bold tabular-nums text-primary-600 dark:text-primary-400 sm:text-2xl">
						Imtihon narxi: {MILLIY_SERTIFIKAT_PRICE}
					</p>
				</div>
			</div>
		</div>
	)
}
