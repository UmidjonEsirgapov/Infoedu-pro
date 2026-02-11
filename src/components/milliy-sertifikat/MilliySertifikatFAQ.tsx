import React from 'react'

const FAQ_ITEMS = [
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
		a: "Har bir siklda qaysi fanlar bo'lishi jadvaldagi kartochkalarda badge ko'rinishida ko'rsatilgan.",
	},
]

export default function MilliySertifikatFAQ() {
	return (
		<section className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50 sm:p-8">
			<h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
				Tez-tez so'raladigan savollar
			</h2>
			<dl className="space-y-4">
				{FAQ_ITEMS.map((faq, i) => (
					<div key={i}>
						<dt className="font-medium text-neutral-800 dark:text-neutral-200">
							{faq.q}
						</dt>
						<dd className="mt-1 text-neutral-600 dark:text-neutral-400">
							{faq.a}
						</dd>
					</div>
				))}
			</dl>
		</section>
	)
}

export { FAQ_ITEMS }
