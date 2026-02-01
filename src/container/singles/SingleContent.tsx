'use client'

import { FC, forwardRef, useEffect, useRef, useState } from 'react'
import Tag from '@/components/Tag/Tag'
import SingleAuthor from './SingleAuthor'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import PostCardLikeAction from '@/components/PostCardLikeAction/PostCardLikeAction'
import PostCardCommentBtn from '@/components/PostCardCommentBtn/PostCardCommentBtn'
import { ArrowUpIcon } from '@heroicons/react/24/solid'
import { GetPostSiglePageQuery } from '@/__generated__/graphql'
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment'
import NcBookmark from '@/components/NcBookmark/NcBookmark'
import SingleCommentWrap from './SingleCommentWrap'
import { Transition } from '@headlessui/react'
import TableContentAnchor from './TableContentAnchor'
import Alert from '@/components/Alert'
import { clsx } from 'clsx'
import { useMusicPlayer } from '@/hooks/useMusicPlayer'
import { flatListToHierarchical } from '@faustwp/core'
import MyWordPressBlockViewer from '@/components/MyWordPressBlockViewer'
import { ContentBlock } from '@faustwp/blocks/dist/mjs/components/WordPressBlocksViewer'
import { replaceYearPlaceholder } from '@/utils/replaceYearPlaceholder'
import { BUTTON_TEXTS, TELEGRAM_LINKS } from '@/contains/buttonTexts'

export interface SingleContentProps {
	post: GetPostSiglePageQuery['post']
}

const SingleContent: FC<SingleContentProps> = ({ post }) => {
	const endedAnchorRef = useRef<HTMLDivElement>(
		null,
	) as React.RefObject<HTMLDivElement>
	const contentRef = useRef<HTMLDivElement>(null)
	const progressRef = useRef<HTMLButtonElement>(null)
	//
	const [isShowScrollToTop, setIsShowScrollToTop] = useState<boolean>(false)
	//

	const endedAnchorEntry = useIntersectionObserver(endedAnchorRef, {
		threshold: 0,
		root: null,
		rootMargin: '0%',
		freezeOnceVisible: false,
	})

	//
	const {
		author,
		databaseId,
		commentCount,
		commentStatus,
		tags,
		status,
		date,
		editorBlocks,
	} = getPostDataFromPostFragment(post || {})
	let blocks: (ContentBlock | null)[] = []
	if (editorBlocks) {
		blocks = flatListToHierarchical(editorBlocks as any, {
			idKey: 'clientId',
			parentKey: 'parentClientId',
		})
	}
	//

	useEffect(() => {
		const handleProgressIndicator = () => {
			const entryContent = contentRef.current
			const progressBarContent = progressRef.current

			if (!entryContent || !progressBarContent) {
				return
			}

			const totalEntryH = entryContent.offsetTop + entryContent.offsetHeight
			let winScroll =
				document.body.scrollTop || document.documentElement.scrollTop

			let scrolled = totalEntryH ? (winScroll / totalEntryH) * 100 : 0

			progressBarContent.innerText = scrolled.toFixed(0) + '%'

			if (scrolled >= 100) {
				setIsShowScrollToTop(true)
			} else {
				setIsShowScrollToTop(false)
			}
		}

		const handleProgressIndicatorHeadeEvent = () => {
			window?.requestAnimationFrame(handleProgressIndicator)
		}
		handleProgressIndicator()
		window?.addEventListener('scroll', handleProgressIndicatorHeadeEvent)
		return () => {
			window?.removeEventListener('scroll', handleProgressIndicatorHeadeEvent)
		}
	}, [])

	// Replace [year] placeholder in post content after render
	useEffect(() => {
		if (!contentRef.current) return

		const replaceYearInNode = (node: Node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || ''
				if (text.includes('[year]')) {
					const newText = replaceYearPlaceholder(text)
					if (newText !== text) {
						node.textContent = newText
					}
				}
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as Element
				// Skip script and style tags
				if (
					element.tagName === 'SCRIPT' ||
					element.tagName === 'STYLE' ||
					element.tagName === 'CODE'
				) {
					return
				}
				// Process child nodes
				Array.from(node.childNodes).forEach(replaceYearInNode)
			}
		}

		// Use MutationObserver to handle dynamically loaded content
		let timeoutId: NodeJS.Timeout
		const observer = new MutationObserver(() => {
			// Debounce to avoid too many replacements
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				if (contentRef.current) {
					Array.from(contentRef.current.childNodes).forEach(replaceYearInNode)
				}
			}, 100)
		})

		observer.observe(contentRef.current, {
			childList: true,
			subtree: true,
			characterData: true,
		})

		// Initial replacement after a short delay to ensure content is rendered
		const initialTimeout = setTimeout(() => {
			if (contentRef.current) {
				Array.from(contentRef.current.childNodes).forEach(replaceYearInNode)
			}
		}, 100)

		return () => {
			clearTimeout(timeoutId)
			clearTimeout(initialTimeout)
			observer.disconnect()
		}
	}, [blocks])

	const renderAlert = () => {
		if (status === 'publish') {
			return null
		}
		if (status === 'future') {
			return (
				<Alert type="warning">
					This post is scheduled. It will be published on {date}.
				</Alert>
			)
		}
		return (
			<>
				<Alert type="warning">
					This post is {status}. It will not be visible on the website until it
					is published.
				</Alert>
			</>
		)
	}

	const showLikeAndCommentSticky =
		!endedAnchorEntry?.intersectionRatio &&
		(endedAnchorEntry?.boundingClientRect.top || 0) > 0

	return (
		<div className="relative flex flex-col">
			<div className="nc-SingleContent flex-1 space-y-10">
				{/*    */}
				{renderAlert()}

				{/* ENTRY CONTENT */}
				<div
					// not remove this id
					id="single-entry-content"
					className="prose mx-auto max-w-screen-md lg:prose-lg dark:prose-invert"
					ref={contentRef}
				>
					<MyWordPressBlockViewer blocks={blocks} />
				</div>

				{/* Telegram Reklama Banner */}
				<div className="mx-auto max-w-screen-md my-8">
					<a
						href={TELEGRAM_LINKS.channel}
						target="_blank"
						rel="noopener noreferrer"
						className="group block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
					>
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							{/* Telegram Icon */}
							<svg
								className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.174 1.858-.926 6.655-1.31 8.82-.168.929-.5 1.238-.82 1.27-.697.062-1.225-.46-1.9-.902-1.056-.705-1.653-1.143-2.678-1.83-1.185-.8-.418-1.241.259-1.96.178-.188 3.246-2.977 3.307-3.23.007-.031.014-.15-.056-.212-.07-.062-.173-.041-.248-.024-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.429-.008-1.253-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.895-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.64.099-.003.321.024.465.14.118.095.15.223.165.312.015.09.033.297.018.461z" />
							</svg>
							{/* Text */}
							<span className="text-white font-semibold text-sm sm:text-base md:text-lg text-center">
								{BUTTON_TEXTS.telegramSubscribe}
							</span>
						</div>
					</a>
				</div>

				{/* TAGS */}
				{tags?.nodes?.length ? (
					<div className="mx-auto flex max-w-screen-md flex-wrap">
						{tags.nodes.map((item) => (
							<Tag
								hideCount
								key={item.databaseId}
								name={'#' + (item.name || '')}
								uri={item.uri || ''}
								className="mb-2 me-2 border border-neutral-200 dark:border-neutral-800"
							/>
						))}
					</div>
				) : null}

				{/* AUTHOR */}
				<div className="mx-auto max-w-screen-md border-b border-t border-neutral-100 dark:border-neutral-700"></div>
				<div className="mx-auto max-w-screen-md">
					<SingleAuthor author={author} />
				</div>

				{/* COMMENTS LIST - not delete comments id */}
				{commentStatus === 'open' ? (
					<div
						id="comments"
						className="mx-auto max-w-screen-md scroll-mt-10 sm:scroll-mt-20"
					>
						<SingleCommentWrap
							commentCount={commentCount || 0}
							postDatabaseId={databaseId}
						/>
					</div>
				) : null}
				<div className="!my-0" ref={endedAnchorRef}></div>
			</div>

			{/* sticky action */}
			<StickyAction
				showLikeAndCommentSticky={showLikeAndCommentSticky}
				isShowScrollToTop={isShowScrollToTop}
				post={post}
				ref={progressRef}
				blocks={blocks}
			/>
		</div>
	)
}

const StickyAction = forwardRef(function (
	{
		showLikeAndCommentSticky,
		post,
		isShowScrollToTop,
		blocks,
	}: {
		showLikeAndCommentSticky: boolean
		post: GetPostSiglePageQuery['post']
		isShowScrollToTop: boolean
		blocks: (ContentBlock | null)[]
	},
	progressRef,
) {
	//
	const { content, databaseId, ncPostMetaData, uri, commentCount } =
		getPostDataFromPostFragment(post || {})

	const { postData: musicPlayerPostData } = useMusicPlayer()

	const hasMusic = musicPlayerPostData?.databaseId
	const stickyActionClassName = clsx(
		'sticky z-40 mt-8 inline-flex self-center',
		hasMusic ? 'bottom-14 sm:bottom-14' : 'bottom-5 sm:bottom-8',
	)

	return (
		<div className={stickyActionClassName}>
			<Transition
				as={'div'}
				show={showLikeAndCommentSticky}
				enter="transition-opacity duration-75"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition-opacity duration-150"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
				className={
					'inline-flex items-center justify-center gap-1 self-center sm:gap-2'
				}
			>
				<>
					<div className="flex items-center justify-center gap-1 rounded-full bg-white p-1.5 text-xs shadow-lg ring-1 ring-neutral-900/5 ring-offset-1 sm:gap-2 dark:bg-neutral-800 dark:ring-neutral-700 dark:ring-offset-neutral-600">
						<PostCardLikeAction
							likeCount={ncPostMetaData?.likesCount || 0}
							postDatabseId={databaseId}
						/>
						<div className="h-4 border-s border-neutral-200 dark:border-neutral-700"></div>
						<PostCardCommentBtn
							isATagOnSingle
							commentCount={commentCount || 0}
							linkToPost={uri || ''}
						/>
						<div className="h-4 border-s border-neutral-200 dark:border-neutral-700"></div>
						<NcBookmark postDatabseId={databaseId} />
						<div className="h-4 border-s border-neutral-200 dark:border-neutral-700"></div>

						<button
							className={`h-9 w-9 items-center justify-center rounded-full bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 ${
								isShowScrollToTop ? 'flex' : 'hidden'
							}`}
							onClick={() => {
								window.scrollTo({ top: 0, behavior: 'smooth' })
							}}
							title="Go to top"
						>
							<ArrowUpIcon className="h-4 w-4" />
						</button>

						<button
							ref={progressRef as any}
							className={`h-9 w-9 items-center justify-center ${
								isShowScrollToTop ? 'hidden' : 'flex'
							}`}
							title="Go to top"
							onClick={() => {
								window.scrollTo({ top: 0, behavior: 'smooth' })
							}}
						>
							%
						</button>
					</div>

					<TableContentAnchor
						className="flex items-center justify-center gap-2 rounded-full bg-white p-1.5 text-xs shadow-lg ring-1 ring-neutral-900/5 ring-offset-1 dark:bg-neutral-800 dark:ring-neutral-700 dark:ring-offset-neutral-600"
						content={content}
						editorBlocks={blocks}
					/>
				</>
			</Transition>
		</div>
	)
})

export default SingleContent
