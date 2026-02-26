'use client'

import React, { useState } from 'react'

const LABEL = "Bildirishnomalar uchun obuna bo'lish"
const LABEL_LOADING = 'Soʻralmoqda…'
const LABEL_SUBSCRIBED = 'Obuna boʻldingiz'

export default function PushSubscribeButton() {
	const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

	const handleClick = () => {
		if (typeof window === 'undefined') return
		setStatus('loading')

		const run = async (OneSignal: any) => {
			const req =
				OneSignal?.Notifications?.requestPermission ??
				OneSignal?.Slidedown?.requestPermission
			if (typeof req !== 'function') {
				setStatus('error')
				return
			}
			try {
				const ok = await req()
				setStatus(ok ? 'done' : 'error')
			} catch {
				setStatus('error')
			}
		}

		if (window.OneSignalDeferred) {
			window.OneSignalDeferred.push(async (OS: any) => {
				await run(OS)
			})
		} else {
			setStatus('error')
		}
	}

	const label =
		status === 'loading'
			? LABEL_LOADING
			: status === 'done'
				? LABEL_SUBSCRIBED
				: LABEL

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={status === 'loading' || status === 'done'}
			className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
			aria-label={LABEL}
		>
			{label}
		</button>
	)
}
