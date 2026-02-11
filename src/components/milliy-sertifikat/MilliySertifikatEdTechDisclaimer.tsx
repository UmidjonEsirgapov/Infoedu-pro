'use client'

import { AlertCircle } from 'lucide-react'

const DISCLAIMER_TEXT =
	"Grafikdagi sanalar talabgorlar soniga qarab o'zgarishi mumkin."

export default function MilliySertifikatEdTechDisclaimer() {
	return (
		<div className="mx-4 mb-12 flex flex-wrap items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-500/30 dark:bg-amber-500/10 sm:mb-16">
			<AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
			<p className="text-sm text-amber-900 dark:text-amber-100">
				{DISCLAIMER_TEXT}
			</p>
		</div>
	)
}
