import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const DISCLAIMER_TEXT =
	"Grafikdagi sanalar talabgorlar soniga qarab o'zgarishi mumkin."

export default function MilliySertifikatDisclaimer() {
	return (
		<div className="flex flex-wrap items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-800 dark:bg-amber-900/20">
			<ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
			<p className="text-sm text-amber-800 dark:text-amber-200">
				{DISCLAIMER_TEXT}
			</p>
		</div>
	)
}
