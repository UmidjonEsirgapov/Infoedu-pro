'use client'

import React from 'react'

interface MilliySertifikatEdTechWrapProps {
	children: React.ReactNode
}

/** Light/dark: next-themes bilan ishlash uchun bg va spotlight'lar dark: da */
export default function MilliySertifikatEdTechWrap({
	children,
}: MilliySertifikatEdTechWrapProps) {
	return (
		<div className="relative min-h-screen w-full bg-white dark:bg-slate-950">
			{/* Spotlight / gradient orbs — faqat dark rejimda ko'rinadi */}
			<div className="pointer-events-none fixed inset-0 hidden overflow-hidden dark:block">
				<div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px]" />
				<div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-purple-500/15 blur-[120px]" />
				<div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-indigo-600/10 blur-[80px]" />
			</div>
			<div className="relative mx-auto max-w-6xl">{children}</div>
		</div>
	)
}
