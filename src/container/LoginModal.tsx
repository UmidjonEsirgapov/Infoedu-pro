import React, { FC, useEffect, useState } from 'react'
import ButtonPrimary from '@/components/Button/ButtonPrimary'
import Error from '@/components/Error'
import Input from '@/components/Input/Input'
import Label from '@/components/Label/Label'
import Logo from '@/components/Logo/Logo'
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import getTrans from '@/utils/getTrans'
import { useLoginModal } from '@/hooks/useLoginModal'
import NcModal from '@/components/NcModal/NcModal'
import { useRouter } from 'next/router'
import TelegramLoginWidget from '@/components/TelegramLoginWidget'

interface LoginModalProps {}

const LoginModal: FC<LoginModalProps> = () => {
	const { closeLoginModal, isOpen, urlRiderect } = useLoginModal()
	const router = useRouter()
	const T = getTrans()
	const [isProcessingLogin, setIsProcessingLogin] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const form = e.currentTarget
		const username = form.username?.value?.trim()
		const password = form.password?.value
		if (!username || !password) {
			toast.error('Foydalanuvchi nomi va parol kiritilishi shart.', {
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
				closeLoginModal()
				setTimeout(() => {
					router.push(urlRiderect || '/')
				}, 300)
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

	const closeModal = closeLoginModal

	const renderContent = () => {
		return (
			<div className="flex min-h-full flex-1 flex-col justify-center py-2.5 sm:p-6 lg:pb-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-sm">
					<Logo className="block w-full text-center" imageClassName="mx-auto" />
					<div className="text-center">
						<h2 className="mt-5 text-center text-xl font-semibold leading-9 tracking-tight text-neutral-900 sm:mt-7 md:text-2xl dark:text-neutral-200">
							{T['Sign in to your account']}
						</h2>
						{IS_CHISNGHIAX_DEMO_SITE && (
							<span className="text-xs text-neutral-500 dark:text-neutral-400">
								Try sing in with a demo account (demo/demo).
							</span>
						)}
					</div>
				</div>
				<div className="mt-5 sm:mx-auto sm:mt-10 sm:w-full sm:max-w-sm">
					<div className="grid gap-6">
						<form onSubmit={handleSubmit}>
							<div className="grid gap-4">
								<div className="grid gap-1.5">
									<Label htmlFor="email">{T.Username}</Label>
									<Input
										id="username"
										name="username"
										placeholder="Email or username"
										autoCapitalize="none"
										autoComplete="username"
										autoCorrect="off"
										type="text"
										required
										defaultValue={IS_CHISNGHIAX_DEMO_SITE ? 'demo' : undefined}
										autoFocus
										data-autofocus
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="password">{T.Password}</Label>
									<Input
										id="password"
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
									{isProcessingLogin && (
										<p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
											Please wait, verifying your credentials...
										</p>
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

					<p className="mt-5 text-center text-sm leading-6 text-neutral-500 sm:mt-10 dark:text-neutral-400">
						{T['Not a member?']}?{' '}
						<Link
							href="/sign-up"
							className="font-medium text-primary-600 underline-offset-2 hover:text-primary-500 hover:underline dark:text-primary-400"
							onClick={closeModal}
						>
							{T['Sign up']}!
						</Link>
						<span className="mx-1">|</span>
						<Link
							href="/reset-password"
							className="font-medium text-primary-600 underline-offset-2 hover:text-primary-500 hover:underline dark:text-primary-400"
							onClick={closeModal}
						>
							{T['Lost your password?']}
						</Link>
					</p>
				</div>
			</div>
		)
	}

	const renderModalLogin = () => {
		return (
			<NcModal
				isOpenProp={isOpen}
				onCloseModal={closeLoginModal}
				contentExtraClass="max-w-screen-md"
				renderContent={renderContent}
				renderTrigger={() => null}
				modalTitle=""
			/>
		)
	}

	return renderModalLogin()
}

export default LoginModal
