import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

/**
 * Telegram Login Widget redirect qilganda shu sahifaga token bilan keladi.
 * Token ni NextAuth Credentials ga yuborib session yaratamiz.
 */
export default function AuthTelegramPage() {
	const router = useRouter()
	const { token } = router.query
	const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

	useEffect(() => {
		if (!router.isReady || typeof token !== 'string') return
		;(async () => {
			const result = await signIn('credentials', {
				telegram_token: token,
				redirect: false,
			})
			if (result?.ok) {
				setStatus('ok')
				toast.success('Telegram orqali kirish muvaffaqiyatli.', {
					position: 'bottom-center',
					duration: 2000,
				})
				router.replace('/')
			} else {
				setStatus('error')
				toast.error(result?.error || 'Kirish amalga oshmadi.', {
					position: 'bottom-center',
				})
				setTimeout(() => router.replace('/login'), 2000)
			}
		})()
	}, [router.isReady, token, router])

	return (
		<div className="flex min-h-[40vh] flex-col items-center justify-center p-6">
			{status === 'loading' && (
				<p className="text-neutral-600 dark:text-neutral-400">Tasdiqlanmoqda...</p>
			)}
			{status === 'ok' && (
				<p className="text-green-600 dark:text-green-400">Bosh sahifaga yo‘naltirilmoqda...</p>
			)}
			{status === 'error' && (
				<p className="text-red-600 dark:text-red-400">Xatolik. Login sahifaga yo‘naltirilmoqda...</p>
			)}
		</div>
	)
}
