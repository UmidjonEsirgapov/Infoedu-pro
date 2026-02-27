'use client'

import { useEffect, useRef } from 'react'

const WIDGET_SCRIPT = 'https://telegram.org/js/telegram-widget.js?22'

interface TelegramLoginWidgetProps {
	botUsername: string
	className?: string
	size?: 'large' | 'medium' | 'small'
	showUserPhoto?: boolean
}

function getAuthUrl(): string {
	if (typeof window !== 'undefined') return `${window.location.origin}/api/auth/telegram-callback`
	const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ''
	return url ? `${url.replace(/\/$/, '')}/api/auth/telegram-callback` : ''
}

/**
 * Telegram Login Widget — rasmiy widget script orqali.
 * BotFather da /setdomain bilan sayt domenini botga bog'lashingiz kerak.
 */
export default function TelegramLoginWidget({
	botUsername,
	className = '',
	size = 'large',
	showUserPhoto = true,
}: TelegramLoginWidgetProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!botUsername || !containerRef.current) return
		const authUrl = getAuthUrl()
		if (!authUrl) return

		const wrap = containerRef.current
		wrap.innerHTML = ''
		const div = document.createElement('div')
		div.setAttribute('data-telegram-login', botUsername)
		div.setAttribute('data-size', size)
		div.setAttribute('data-auth-url', authUrl)
		div.setAttribute('data-request-access', 'write')
		if (showUserPhoto) div.setAttribute('data-userpic', 'true')
		wrap.appendChild(div)

		let script = document.querySelector(`script[src="${WIDGET_SCRIPT}"]`) as HTMLScriptElement | null
		if (!script) {
			script = document.createElement('script')
			script.src = WIDGET_SCRIPT
			script.async = true
			document.body.appendChild(script)
		}

		return () => {
			wrap.innerHTML = ''
		}
	}, [botUsername, size, showUserPhoto])

	if (!botUsername) return null

	return (
		<div
			ref={containerRef}
			className={`flex justify-center [&_iframe]:!rounded-lg ${className}`}
			aria-label="Telegram orqali kirish"
		/>
	)
}
