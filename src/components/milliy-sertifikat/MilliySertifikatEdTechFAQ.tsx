'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export const FAQ_ITEMS_EDTECH = [
	{
		q: 'Milliy sertifikat narxi qancha?',
		a: "2026-yil I yarim yillik imtihonlari uchun narx 556 200 so'm.",
	},
	{
		q: "Qachon ro'yxatdan o'tiladi?",
		a: "Har bir imtihon sikli uchun ro'yxatdan o'tish va to'lov muddatlari jadvalda ko'rsatilgan. Grafikdagi sanalar talabgorlar soniga qarab o'zgarishi mumkin.",
	},
	{
		q: "Imtihon qanday fanlarni qamrab oladi?",
		a: "Har bir siklda qaysi fanlar bo'lishi jadvaldagi kartochkalarda ko'rsatilgan.",
	},
]

export default function MilliySertifikatEdTechFAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(0)

	return (
		<section className="px-4 py-12 sm:py-16">
			<h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
				Tez-tez so&apos;raladigan savollar
			</h2>
			<div className="space-y-2">
				{FAQ_ITEMS_EDTECH.map((faq, i) => {
					const isOpen = openIndex === i
					return (
						<motion.div
							key={i}
							className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-slate-700/80 dark:bg-slate-800/50"
							initial={false}
						>
							<button
								type="button"
								onClick={() => setOpenIndex(isOpen ? null : i)}
								className="flex w-full items-center justify-between px-5 py-4 text-left text-slate-900 transition-colors hover:bg-neutral-50 dark:text-slate-100 dark:hover:bg-slate-700/30 sm:px-6"
							>
								<span className="pr-4 font-medium">{faq.q}</span>
								<motion.span
									animate={{ rotate: isOpen ? 180 : 0 }}
									transition={{ duration: 0.2 }}
									className="shrink-0 text-slate-500 dark:text-slate-400"
								>
									<ChevronDown className="h-5 w-5" />
								</motion.span>
							</button>
							<AnimatePresence initial={false}>
								{isOpen && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: 'auto', opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.25, ease: 'easeInOut' }}
										className="overflow-hidden"
									>
										<p className="border-t border-neutral-100 px-5 py-4 text-slate-600 dark:border-slate-700/80 dark:text-slate-300 sm:px-6">
											{faq.a}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					)
				})}
			</div>
		</section>
	)
}
