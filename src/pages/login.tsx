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
			console.error('Login error:', errorMessage, data?.generateAuthorizationCode)
			toast.error(errorMessage, {
				position: 'bottom-center',
				duration: 5000,
			})
			setIsProcessingLogin(false)
			return
		}

		// Authorization code olingandan keyin token exchange jarayonini kutish
		if (!!data?.generateAuthorizationCode.code && !isProcessingLogin) {
			setIsProcessingLogin(true)
			console.log('Authorization code received:', data?.generateAuthorizationCode.code)
			console.log('Waiting for token exchange and authentication...')
			
			// Token exchange va authentication holatini kuzatish
			let checkCount = 0
			const maxChecks = 20 // 10 soniya (20 * 500ms)
			
			const checkAuth = setInterval(() => {
				checkCount++
				console.log(`Auth check ${checkCount}/${maxChecks}: isReady=${isReady}, isAuthenticated=${isAuthenticated}`)
				
				if (isReady && isAuthenticated) {
					clearInterval(checkAuth)
					console.log('Authentication successful!')
					toast.success(
						'Login successful, redirecting...',
						{
							position: 'bottom-center',
							duration: 3000,
						},
					)
					setIsProcessingLogin(false)
					// Kichik kechikish bilan redirect qilish
					setTimeout(() => {
						router.replace('/')
					}, 500)
					return
				}
				
				// Timeout bo'lganda
				if (checkCount >= maxChecks) {
					clearInterval(checkAuth)
					console.warn('Authentication timeout - checking server status')
					
					// Server holatini tekshirish va batafsil error logging
					fetch('/api/faust/auth/token', {
						method: 'GET',
						credentials: 'include',
					}).then(async response => {
						// 500 xatosi bo'lsa, batafsil ma'lumot olish
						// 404 xatosi - Faust.js auth endpoint topilmadi
						if (response.status === 404) {
							console.error('=== 404 ERROR: Faust.js Auth Endpoint Not Found ===')
							console.error('The endpoint /wp-json/faustwp/v1/auth/token is not available.')
							console.error('This means Faust.js plugin auth endpoints are not properly configured.')
							console.error('Please check:')
							console.error('1. Faust.js plugin is installed and activated')
							console.error('2. Faust.js plugin version is compatible')
							console.error('3. Auth endpoints are enabled in plugin settings')
							console.error('====================================================')
							
							// WordPress REST API test qilish
							fetch('/api/test-wordpress-rest')
								.then(res => res.json())
								.then(testResults => {
									console.log('WordPress REST API Test Results:', testResults)
									if (testResults.tests?.faustAuthEndpoint?.status === 404) {
										console.error('CONFIRMED: Faust.js auth endpoint returns 404')
										
										// Versiya nomuvofiqlik xabari
										if (testResults.summary?.hasAuthorizeRoute) {
											console.error('⚠️ VERSION MISMATCH DETECTED:')
											console.error('Your Faust.js plugin uses /authorize endpoint instead of /auth/token')
											console.error('This means your WordPress plugin version is outdated.')
											console.error('SOLUTION: Update Faust.js plugin to the latest version in WordPress admin.')
											console.error('Current Next.js Faust.js version:', '3.3.1')
											console.error('Required WordPress plugin version: Latest (with /auth/token endpoint)')
											
											toast.error(
												'⚠️ Faust.js plugin version mismatch! Please update WordPress plugin to latest version.',
												{
													position: 'bottom-center',
													duration: 10000,
												},
											)
										} else {
											toast.error(
												'Faust.js authentication endpoint not found. Please check WordPress plugin configuration.',
												{
													position: 'bottom-center',
													duration: 7000,
												},
											)
										}
									}
								})
								.catch(err => {
									console.error('WordPress REST API test failed:', err)
									toast.error(
										'Faust.js authentication endpoint not found. Please check WordPress plugin configuration.',
										{
											position: 'bottom-center',
											duration: 7000,
										},
									)
								})
							setIsProcessingLogin(false)
							return
						}
						
						// 500 xatosi
						if (response.status === 500) {
							let errorDetails = ''
							try {
								const errorData = await response.json()
								errorDetails = JSON.stringify(errorData, null, 2)
								console.error('Server error (500) details:', errorData)
							} catch (e) {
								const errorText = await response.text()
								errorDetails = errorText
								console.error('Server error (500) text:', errorText)
							}
							
							console.error('=== 500 ERROR DETAILS ===')
							console.error('Status:', response.status)
							console.error('Status Text:', response.statusText)
							console.error('Response:', errorDetails)
							console.error('URL:', response.url)
							console.error('========================')
							
							// WordPress REST API test qilish
							fetch('/api/test-wordpress-rest')
								.then(res => res.json())
								.then(testResults => {
									console.log('WordPress REST API Test Results:', testResults)
								})
								.catch(err => {
									console.error('WordPress REST API test failed:', err)
								})
							
							toast.error(
								'Server error occurred. Please check console for details or contact support.',
								{
									position: 'bottom-center',
									duration: 5000,
								},
							)
							setIsProcessingLogin(false)
							return
						}
						
						// Agar 401 yoki boshqa xato bo'lsa, reload qilish
						console.warn('Authentication timeout - reloading page to check auth state')
						setIsProcessingLogin(false)
						toast(
							'Verifying login, please wait...',
							{
								position: 'bottom-center',
								duration: 2000,
								icon: '⏳',
							},
						)
						setTimeout(() => {
							router.reload()
						}, 1000)
					}).catch(error => {
						console.error('Error checking server status:', error)
						setIsProcessingLogin(false)
						toast.error(
							'Network error. Please check your connection and try again.',
							{
								position: 'bottom-center',
								duration: 5000,
							},
						)
					})
				}
			}, 500) // Har 500ms tekshirish

			// Cleanup function
			return () => {
				clearInterval(checkAuth)
			}
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
								<ButtonPrimary loading={loading || isProcessingLogin} disabled={loading || isProcessingLogin}>
									{isProcessingLogin ? 'Logging in...' : T.Login}
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
