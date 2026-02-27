import { useAuth } from '@faustwp/core'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
	updateViewer as updateViewerToStore,
	updateAuthorizedUser,
	addViewerReactionPosts,
} from '@/stores/viewer/viewerSlice'
import { updateGeneralSettings } from '@/stores/general-settings/generalSettingsSlice'
import ControlSettingsDemo from './ControlSettingsDemo'
import CookiestBoxPopover from '@/components/CookiestBoxPopover'
import MusicPlayer from '@/components/MusicPlayer/MusicPlayer'
import { initLocalPostsSavedListFromLocalstored } from '@/stores/localPostSavedList/localPostsSavedListSlice'
import { usePathname } from 'next/navigation'
import { CMSUserMetaResponseData } from '@/pages/api/cms-user-meta/[id]'

export function SiteWrapperChild({
	...props
}: {
	__TEMPLATE_QUERY_DATA__: any
}) {
	const { isAuthenticated, isReady, loginUrl, viewer } = useAuth()
	const { data: session, status: sessionStatus } = useSession()
	const dispatch = useDispatch()
	const pathname = usePathname()

	const [isFirstFetchApis, setIsFirstFetchApis] = useState(false)
	const [isFirstFetchNextAuth, setIsFirstFetchNextAuth] = useState(false)

	// NextAuth WordPress JWT ni Apollo va boshqa so'rovlar uchun global'da qo'yamiz (getApolloAuthClient ishlashi uchun)
	useEffect(() => {
		const wpToken = (session as { wpToken?: string } | null)?.wpToken
		if (typeof globalThis !== 'undefined') {
			;(globalThis as { __NEXT_AUTH_WP_TOKEN?: string }).__NEXT_AUTH_WP_TOKEN = wpToken || undefined
		}
	}, [session])

	// NextAuth session bo'lsa — Redux ni shundan yangilaymiz (login yangi plugin orqali)
	useEffect(() => {
		const user = (session?.user as { id?: string }) ?? {}
		const userIdRaw = user.id
		const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw
		if (sessionStatus !== 'authenticated' || userIdRaw == null || !Number.isInteger(userId) || isFirstFetchNextAuth) return
		setIsFirstFetchNextAuth(true)
		dispatch(
			updateAuthorizedUser({
				isAuthenticated: true,
				isReady: true,
				loginUrl: null,
			}),
		)
		dispatch(
			updateViewerToStore({
				userId,
				databaseId: userId,
				name: session.user?.name ?? '',
				email: session.user?.email ?? '',
			}),
		)
		fetch('/api/cms-user-meta/' + userIdRaw)
			.then((res) => res.json())
			.then((data: CMSUserMetaResponseData) => {
				const u = data?.data?.user
				if (u) dispatch(updateViewerToStore(u))
				if (u?.userReactionFields) {
					const likes = u.userReactionFields.likedPosts || ''
					const saves = u.userReactionFields.savedPosts || ''
					const views = u.userReactionFields.viewedPosts || ''
					const a_likes = likes.split(',').map((id) => ({ id, title: id + ',LIKE' }))
					const a_saves = saves.split(',').map((id) => ({ id, title: id + ',SAVE' }))
					const a_views = views.split(',').map((id) => ({ id, title: id + ',VIEW' }))
					const reactionPosts = [...a_likes, ...a_saves, ...a_views]
					if (reactionPosts.length > 0) dispatch(addViewerReactionPosts(reactionPosts))
				}
			})
			.catch((err) => console.error(err))
	}, [sessionStatus, session?.user, isFirstFetchNextAuth])

	// Faust auth (preview va h.k.) — NextAuth session yo'q bo'lganda
	useEffect(() => {
		if (session?.user) return
		if (!isAuthenticated || !viewer?.userId || isFirstFetchApis) return
		setIsFirstFetchApis(true)
		dispatch(updateViewerToStore(viewer))
		fetch('/api/cms-user-meta/' + viewer?.userId)
			.then((res) => res.json())
			.then((data: CMSUserMetaResponseData) => {
				const u = data?.data?.user
				if (u) dispatch(updateViewerToStore(u))
				if (u?.userReactionFields) {
					const likes = u.userReactionFields.likedPosts || ''
					const saves = u.userReactionFields.savedPosts || ''
					const views = u.userReactionFields.viewedPosts || ''
					const a_likes = likes.split(',').map((id) => ({ id, title: id + ',LIKE' }))
					const a_saves = saves.split(',').map((id) => ({ id, title: id + ',SAVE' }))
					const a_views = views.split(',').map((id) => ({ id, title: id + ',VIEW' }))
					const reactionPosts = [...a_likes, ...a_saves, ...a_views]
					if (reactionPosts.length > 0) dispatch(addViewerReactionPosts(reactionPosts))
				}
			})
			.catch((err) => console.error(err))
	}, [isAuthenticated, viewer?.userId, isFirstFetchApis, session?.user])

	// update general settings to store
	useEffect(() => {
		const generalSettings =
			props?.__TEMPLATE_QUERY_DATA__?.generalSettings ?? {}
		dispatch(updateGeneralSettings(generalSettings))
	}, [])

	useEffect(() => {
		const initialStateLocalSavedPosts: number[] = JSON.parse(
			typeof window !== 'undefined'
				? localStorage?.getItem('localSavedPosts') || '[]'
				: '[]',
		)
		dispatch(
			initLocalPostsSavedListFromLocalstored(initialStateLocalSavedPosts),
		)
	}, [])

	// Redux: auth holati — NextAuth session yoki Faust
	useEffect(() => {
		if (session?.user) {
			dispatch(
				updateAuthorizedUser({
					isAuthenticated: true,
					isReady: true,
					loginUrl: null,
				}),
			)
		} else {
			dispatch(
				updateAuthorizedUser({
					isAuthenticated,
					isReady,
					loginUrl,
				}),
			)
		}
	}, [isAuthenticated, isReady, loginUrl, session?.user])

	if (pathname?.startsWith('/ncmaz_for_ncmazfc_preview_blocks')) {
		return null
	}

	return (
		<div>
			<CookiestBoxPopover />
			<ControlSettingsDemo />
			<MusicPlayer />
		</div>
	)
}
