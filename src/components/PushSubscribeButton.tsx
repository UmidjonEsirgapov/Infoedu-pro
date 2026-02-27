'use client'

import React, { useState } from 'react'

const LABEL = "Bildirishnomalar uchun obuna bo'lish"
const LABEL_LOADING = 'Soʻralmoqda…'
const LABEL_SUBSCRIBED = 'Obuna boʻldingiz'

export default function PushSubscribeButton() {
	const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

	const handleClick = async () => {
		if (typeof window === 'undefined') return
		setStatus('loading')

		try {
			// Avvalo brauzer native ruxsatini so'raymiz (OneSignal SDK NotificationsNamespace xatosiga bog'liq emas)
			if (typeof Notification !== 'undefined' && Notification.requestPermission) {
				const perm = await Notification.requestPermission()
				if (perm === 'granted') {
					setStatus('done')
					// Sahifani qayta yuklash — OneSignal keyingi yuklashda ruxsatni ko'rib, obunani ro'yxatga oladi
					window.location.reload()
					return
				}
				if (perm === 'denied') {
					setStatus('error')
					return
				}
			}

			// Fallback: OneSignal API (agar SDK ishlab qolsa)
			const run = async (OS: any) => {
				const req = OS?.Notifications?.requestPermission ?? OS?.Slidedown?.requestPermission
				if (typeof req === 'function') {
					const ok = await req()
					setStatus(ok ? 'done' : 'error')
					if (ok) window.location.reload()
					return
				}
				setStatus('error')
			}
			if (window.OneSignalDeferred && Array.isArray(window.OneSignalDeferred)) {
				window.OneSignalDeferred.push(run)
			} else {
				setStatus('error')
			}
		} catch {
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
