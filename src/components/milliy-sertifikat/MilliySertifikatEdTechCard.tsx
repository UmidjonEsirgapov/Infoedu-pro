'use client'

import React, { useState } from 'react'
import {
	Calendar,
	CreditCard,
	BookOpen,
	AlertCircle,
	Share2,
} from 'lucide-react'
import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'
import { formatImtihonSana } from '@/lib/format-imtihon-sana'

const SHARE_TITLE = "Milliy sertifikat test sinovlari jadvali 2026"
const SHARE_TEXT = "Milliy sertifikat imtihonlari jadvali, ro'yxatdan o'tish va to'lov muddatlari — to'liq ma'lumot."

interface MilliySertifikatEdTechCardProps {
	item: MilliySertifikatImtihon
	index: number
}

function isQabulOchiq(item: MilliySertifikatImtihon): boolean {
	if (!item.royxatSana) return false
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const d = new Date(item.royxatSana)
	d.setHours(0, 0, 0, 0)
	return d.getTime() >= today.getTime()
}

export default function MilliySertifikatEdTechCard({
	item,
	index,
}: MilliySertifikatEdTechCardProps) {
	const open = isQabulOchiq(item)
	const royxatMatn = formatImtihonSana(item.royxatSana)
	const tolovMatn = formatImtihonSana(item.tolovSana)
	const [shareStatus, setShareStatus] = useState<'idle' | 'ok' | 'fail'>('idle')

	const handleShare = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : ''
		try {
			if (typeof navigator !== 'undefined' && navigator.share) {
				await navigator.share({
					title: SHARE_TITLE,
					text: SHARE_TEXT,
					url,
				})
				setShareStatus('ok')
			} else {
				await navigator.clipboard.writeText(url)
				setShareStatus('ok')
			}
		} catch {
			setShareStatus('fail')
		}
	}

	return (
		<article
			className="group relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-400/60 hover:shadow-[0_0_24px_rgba(99,102,241,0.08)] dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-indigo-400/60 dark:hover:shadow-[0_0_24px_rgba(99,102,241,0.12)] sm:p-6"
			style={{ animation: 'none' }}
		>
			<div className="mb-4 flex items-center justify-between">
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
						open
							? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-400'
							: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-300 dark:bg-slate-600/40 dark:text-slate-400 dark:ring-slate-500/40'
					}`}
				>
					{open ? (
						<>
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
							</span>
							Qabul Ochiq
						</>
					) : (
						<>
							<AlertCircle className="h-3.5 w-3.5" />
							Yakunlangan
						</>
					)}
				</span>
			</div>

			<h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
			<p className="mt-2 text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-300">
				{item.imtihonSanalari}
			</p>

			{item.fanlar.length > 0 && (
				<div className="mt-4 flex flex-wrap items-center gap-2">
					<BookOpen className="h-4 w-4 shrink-0 text-neutral-500 dark:text-slate-500" />
					{item.fanlar.map((fan, i) => (
						<span
							key={i}
							className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700/80 dark:text-slate-300"
						>
							{fan.fan_nomi}
						</span>
					))}
				</div>
			)}

			<div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
				{item.royxatSana && (
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
						Ro&apos;yxat: {royxatMatn || item.royxatSana}
					</div>
				)}
				{item.tolovSana && (
					<div className="flex items-center gap-2">
						<CreditCard className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
						To&apos;lov: {tolovMatn || item.tolovSana}
					</div>
				)}
			</div>

			<div className="mt-6 flex-1">
				<button
					type="button"
					onClick={handleShare}
					className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-200"
				>
					<Share2 className="h-4 w-4" />
					{shareStatus === 'ok' ? "Ulashildi" : shareStatus === 'fail' ? "Xatolik" : "Do'stlarga ulashish"}
				</button>
			</div>
		</article>
	)
}
