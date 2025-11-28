import { useEffect, useState } from 'react'
import ButtonPrimary from '@/components/Button/ButtonPrimary'
import Error from '@/components/Error'
import Input from '@/components/Input/Input'
import Label from '@/components/Label/Label'
import LoginLayout from '@/container/login/LoginLayout'
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings'
import { RootState } from '@/stores/store'
import getTrans from '@/utils/getTrans'
import { useLogin, useAuth } from '@faustwp/core'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

export default function Login() {
	const { isReady: isReadyFromStore, isAuthenticated: isAuthenticatedFromStore } = useSelector(
		(state: RootState) => state.viewer.authorizedUser,
	)
	const { isReady, isAuthenticated } = useAuth()
	const { login, loading, error, data } = useLogin()
	const router = useRouter()
	const T = getTrans()
	const [isProcessingLogin, setIsProcessingLogin] = useState(false)

	// Use useAuth hook's state as primary source
	const finalIsReady = isReady || isReadyFromStore
	const finalIsAuthenticated = isAuthenticated || isAuthenticatedFromStore

	useEffect(() => {
		if (finalIsReady && finalIsAuthenticated) {
			router.replace('/')
		}
	}, [finalIsReady, finalIsAuthenticated, router])

	useEffect(() => {
		if (!!data?.generateAuthorizationCode.error) {
			// remove html tags on error message
			const errorMessage = data?.generateAuthorizationCode.error.replace(
				/<[^>]+>/g,
				'',
			)
			toast.error(errorMessage, {
				position: 'bottom-center',
			})
			setIsProcessingLogin(false)
			return
		}

		if (!!data?.generateAuthorizationCode.code && !isProcessingLogin) {
			setIsProcessingLogin(true)
			console.log('Authorization code received, waiting for authentication...')
			
			// Wait for token processing and authentication state update
			const checkAuth = setInterval(() => {
				if (isReady && isAuthenticated) {
					clearInterval(checkAuth)
					toast.success(
						'Login successful, redirecting...',
						{
							position: 'bottom-center',
							duration: 3000,
						},
					)
					router.replace('/')
					setIsProcessingLogin(false)
				}
			}, 500)

			// Timeout after 5 seconds
			setTimeout(() => {
				clearInterval(checkAuth)
				if (!isAuthenticated) {
					// If still not authenticated, reload to trigger auth check
					toast.success(
						'Login successful, reloading page...',
						{
							position: 'bottom-center',
							duration: 3000,
						},
					)
					router.reload()
				}
				setIsProcessingLogin(false)
			}, 5000)
		}
	}, [data?.generateAuthorizationCode.code, data?.generateAuthorizationCode.error, router, isAuthenticated, isReady, isProcessingLogin])

	const errorMessage = error?.message || data?.generateAuthorizationCode.error

	return (
		<LoginLayout
			isLoginPage
			rightBtn={{
				text: T['Sign up'],
				href: '/sign-up',
			}}
		>
			<>
				<div className="grid gap-6">
					<form
						onSubmit={(e) => {
							e.preventDefault()

							if (
								!e.currentTarget.username?.value ||
								!e.currentTarget.password?.value
							) {
								toast.error(T['Username and password are required!'], {
									position: 'bottom-center',
								})
								return
							}

							login(
								e.currentTarget.username.value,
								e.currentTarget.password.value,
							)
						}}
					>
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
									type="password"
									required
									defaultValue={IS_CHISNGHIAX_DEMO_SITE ? 'demo' : undefined}
								/>
							</div>
							<div className="grid">
								<ButtonPrimary loading={loading}>{T.Login}</ButtonPrimary>
								{!!errorMessage && (
									<Error className="mt-2 text-center" error={errorMessage} />
								)}
							</div>
						</div>
					</form>
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
