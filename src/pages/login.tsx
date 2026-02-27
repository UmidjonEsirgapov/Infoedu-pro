import { useEffect, useState } from 'react'
import ButtonPrimary from '@/components/Button/ButtonPrimary'
import Error from '@/components/Error'
import Input from '@/components/Input/Input'
import Label from '@/components/Label/Label'
import SEO from '@/components/SEO/SEO'
import LoginLayout from '@/container/login/LoginLayout'
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings'
import getTrans from '@/utils/getTrans'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import TelegramLoginWidget from '@/components/TelegramLoginWidget'

const TELEGRAM_ERRORS: Record<string, string> = {
	telegram_missing_params: 'Telegram dan ma\'lumot kelmadi.',
	telegram_invalid_hash: 'Tasdiqlash xatosi. Qaytadan urinib ko\'ring.',
	telegram_expired: 'Muddati o\'tgan. Qaytadan kirishni boshing.',
	telegram_config: 'Server sozlamasi xatosi.',
}

export default function Login() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const T = getTrans()
	const [isProcessingLogin, setIsProcessingLogin] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	useEffect(() => {
		if (status === 'authenticated' && session?.user) {
			router.replace('/')
		}
	}, [status, session, router])

	useEffect(() => {
		const err = router.query.error as string
		if (err && TELEGRAM_ERRORS[err]) {
			toast.error(TELEGRAM_ERRORS[err], { position: 'bottom-center', duration: 5000 })
			setErrorMessage(TELEGRAM_ERRORS[err])
			router.replace('/login', undefined, { shallow: true })
		}
	}, [router.query.error, router])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const form = e.currentTarget
		const username = form.username?.value?.trim()
		const password = form.password?.value
		if (!username || !password) {
			toast.error(T['Username and password are required!'] || 'Foydalanuvchi nomi va parol kiritilishi shart.', {
				position: 'bottom-center',
			})
			return
		}
		setErrorMessage(null)
		setIsProcessingLogin(true)
		try {
			const result = await signIn('credentials', {
				username,
				password,
				redirect: false,
			})
			if (result?.ok) {
				toast.success('Kirish muvaffaqiyatli.', {
					position: 'bottom-center',
					duration: 3000,
				})
				router.replace('/')
			} else {
				const msg = result?.error || 'Login yoki parol noto\'g\'ri.'
				setErrorMessage(msg)
				toast.error(msg, { position: 'bottom-center', duration: 5000 })
			}
		} catch (err: any) {
			setErrorMessage(err?.message || 'Xatolik yuz berdi.')
			toast.error('Xatolik yuz berdi.', { position: 'bottom-center' })
		} finally {
			setIsProcessingLogin(false)
		}
	}

	if (status === 'loading') {
		return (
			<LoginLayout isLoginPage rightBtn={{ text: T['Sign up'], href: '/sign-up' }}>
				<div className="flex min-h-[200px] items-center justify-center">
					<p className="text-neutral-500 dark:text-neutral-400">Yuklanmoqda...</p>
				</div>
			</LoginLayout>
		)
	}

	return (
		<LoginLayout
			isLoginPage
			rightBtn={{
				text: T['Sign up'],
				href: '/sign-up',
			}}
		>
			<>
				<SEO noindex />
				<div className="grid gap-6">
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4">
							<div className="grid gap-1.5">
								<Label htmlFor="email">{T.Username}</Label>
								<Input
									id="username"
									name="username"
									placeholder={T['Email or username']}
									autoCapitalize="none"
									autoComplete="username"
									autoCorrect="off"
									type="text"
									required
									defaultValue={IS_CHISNGHIAX_DEMO_SITE ? 'demo' : undefined}
								/>
							</div>
							<div className="grid gap-1.5">
								<Label htmlFor="password">{T.Password}</Label>
								<Input
									id="password"
									name="password"
									type="password"
									required
									defaultValue={IS_CHISNGHIAX_DEMO_SITE ? 'demo' : undefined}
								/>
							</div>
							<div className="grid">
								<ButtonPrimary loading={isProcessingLogin} disabled={isProcessingLogin}>
									{isProcessingLogin ? 'Tekshirilmoqda...' : T.Login}
								</ButtonPrimary>
								{!!errorMessage && (
									<Error className="mt-2 text-center" error={errorMessage} />
								)}
							</div>
						</div>
					</form>

					{process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME && (
						<>
							<div className="relative my-4">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-neutral-200 dark:border-neutral-600" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="bg-white px-2 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
										yoki Telegram orqali
									</span>
								</div>
							</div>
							<TelegramLoginWidget
								botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
								size="large"
								className="mt-2"
							/>
						</>
					)}
				</div>

				<p className="text-center text-sm leading-6 text-neutral-500 dark:text-neutral-400">
					{T['Not a member?']}{' '}
					<Link
						href="/sign-up"
						className="text-primary-600 underline-offset-2 hover:text-primary-500 hover:underline dark:text-primary-400"
					>
						{T['Sign up']}
					</Link>
					<span className="mx-1">|</span>
					<Link
						href="/reset-password"
						className="text-primary-600 underline-offset-2 hover:text-primary-500 hover:underline dark:text-primary-400"
					>
						{T['Lost your password?']}
					</Link>
				</p>
			</>
		</LoginLayout>
	)
}
