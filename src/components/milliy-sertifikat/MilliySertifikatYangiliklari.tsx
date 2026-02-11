'use client'

import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'

const YANGILIKLAR_LINK = '/category/milliy-sertifikat'

export default function MilliySertifikatYangiliklari() {
	return (
		<section className="px-4 pb-12 sm:pb-16">
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 dark:border-slate-700 dark:bg-slate-800/50 sm:p-8">
				<h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
					Milliy sertifikat yangiliklari
				</h2>
				<p className="mb-6 text-slate-600 dark:text-slate-400">
					Muddatlar, qoidalar va e&apos;lonlar haqida yangilanishlarni shu yerdan kuzating.
				</p>
				<Link
					href={YANGILIKLAR_LINK}
					className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
				>
					<Newspaper className="h-5 w-5" />
					Yangiliklarni ko&apos;rish
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</section>
	)
}
