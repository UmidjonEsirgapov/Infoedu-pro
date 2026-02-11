import React from 'react'

const HERO_TITLE = 'Milliy sertifikat test sinovlari jadvali (2026-yil)'

export default function MilliySertifikatHero() {
	return (
		<section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-600/5 to-transparent dark:from-primary-600/20 dark:via-primary-500/10">
			<div className="relative px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20">
				<h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl md:text-4xl">
					{HERO_TITLE}
				</h1>
			</div>
		</section>
	)
}
