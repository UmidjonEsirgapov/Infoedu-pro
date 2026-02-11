'use client'

import Link from 'next/link'
import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'
import { formatImtihonSana } from '@/lib/format-imtihon-sana'
import { MY_GOV_UZ_REGISTER_URL } from '@/data/milliy-sertifikat-types'

const H1_TITLE = "Milliy sertifikat test sinovlari jadvali 2026 — To'liq ma'lumot va muddatlar"

function getEngYaqinSana(items: MilliySertifikatImtihon[]): string {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	for (const item of items) {
		if (!item.royxatSana) continue
		const d = new Date(item.royxatSana)
		d.setHours(0, 0, 0, 0)
		if (d.getTime() >= today.getTime()) {
			return item.imtihonSanalari || formatImtihonSana(item.royxatSana)
		}
	}
	return ''
}

interface MilliySertifikatEdTechHeroProps {
	exams: MilliySertifikatImtihon[]
}

export default function MilliySertifikatEdTechHero({ exams }: MilliySertifikatEdTechHeroProps) {
	const engYaqinSana = getEngYaqinSana(exams)

	return (
		<section className="relative overflow-hidden px-4 py-12 sm:py-16 md:py-20">
			<div className="relative z-10 mx-auto max-w-4xl text-center">
				<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl lg:text-5xl">
					{H1_TITLE}
				</h1>
				<p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg md:mt-6">
					Ro&apos;yxatdan o&apos;tish va imtihon sanalari — barcha ma&apos;lumotlar bir joyda.
				</p>
				{engYaqinSana && (
					<div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
						<div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-5 py-3 dark:border-indigo-700 dark:bg-indigo-900/30">
							<p className="text-sm font-medium uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
								Eng yaqin imtihon
							</p>
							<p className="mt-0.5 text-xl font-bold text-indigo-800 dark:text-indigo-200 sm:text-2xl">
								{engYaqinSana}
							</p>
						</div>
						<Link
							href={MY_GOV_UZ_REGISTER_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
						>
							my.gov.uz orqali ro&apos;yxatdan o&apos;tish
						</Link>
					</div>
				)}
			</div>
		</section>
	)
}
