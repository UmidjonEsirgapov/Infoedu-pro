import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import {
	ArrowUpRightIcon,
	BookOpenIcon,
	BuildingOffice2Icon,
	AcademicCapIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import { FC, ReactNode, useEffect, useState } from 'react'
import {
	CategoriesIcon,
	FilterVerticalIcon,
	PostSearchIcon,
	SearchIcon,
	UserSearchIcon,
} from '../Icons/Icons'
import clsx from 'clsx'
import getTrans from '@/utils/getTrans'
import { NC_SITE_SETTINGS } from '@/contains/site-settings'
import Empty from '../Empty'
import { gql } from '@/__generated__'
import { getApolloClient } from '@faustwp/core'
import _ from 'lodash'
import { TPostCard } from '../Card2/Card2'
import Loading from '../Button/Loading'
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment'
import ncFormatDate from '@/utils/formatDate'
import MyImage from '../MyImage'
import PostTypeFeaturedIcon from '../PostTypeFeaturedIcon/PostTypeFeaturedIcon'
import { useRouter } from 'next/router'

const T = getTrans()

interface PersonType {
	name: string
	uri: string
	type: string
	icon: typeof PostSearchIcon
}

const quickActions: PersonType[] = [
	{
		type: 'quick-action',
		name: T['Search posts'],
		icon: PostSearchIcon,
		uri: '/search/posts/',
	},
	{
		type: 'quick-action',
		name: T['Filter posts by'],
		icon: FilterVerticalIcon,
		uri: '/posts?search=',
	},
	{
		type: 'quick-action',
		name: T['Search authors'],
		icon: UserSearchIcon,
		uri: '/search/authors/',
	},
	{
		type: 'quick-action',
		name: T['Search categories'],
		icon: CategoriesIcon,
		uri: '/search/categories/',
	},
	{
		type: 'quick-action',
		name: 'Darsliklar',
		icon: BookOpenIcon as unknown as typeof PostSearchIcon,
		uri: '/darsliklar',
	},
	{
		type: 'quick-action',
		name: 'Oliygohlar',
		icon: BuildingOffice2Icon as unknown as typeof PostSearchIcon,
		uri: '/oliygoh',
	},
	{
		type: 'quick-action',
		name: 'Milliy sertifikat',
		icon: AcademicCapIcon as unknown as typeof PostSearchIcon,
		uri: '/milliy-sertifikat-sanalari',
	},
]
const explores: PersonType[] =
	NC_SITE_SETTINGS.search_page?.recommended_searches?.items
		?.map((item, index) => {
			return {
				type: 'recommended_searches',
				name: item?.title || '',
				icon: SearchIcon,
				uri: item?.url || '/search/posts/' + item?.title,
			}
		})
		.filter(Boolean) || []

interface Props {
	renderTrigger?: () => ReactNode
	triggerClassName?: string
}

/** Darslik (GraphQL Textbook) qidiruv natijasi */
interface SearchTextbookNode {
	databaseId: number
	title?: string | null
	slug?: string | null
	uri?: string | null
	darslikMalumotlari?: { sinf?: number | null } | null
	fanlar?: { nodes?: Array<{ name?: string | null } | null> | null } | null
}

/** Oliygoh (GraphQL Oliygoh) qidiruv natijasi */
interface SearchOliygohNode {
	databaseId: number
	title?: string | null
	slug?: string | null
	uri?: string | null
	oliygohMalumotlari?: { viloyat?: (string | null)[] | null } | null
}

/** Tanlangan element: bitta uri orqali navigatsiya */
export interface SearchResultItem {
	type: 'post' | 'darslik' | 'oliygoh' | 'milliy-yangilik' | 'milliy-imtihon'
	uri: string
	title?: string
}

const DEBOUNCE_MS = 300
const LIMIT_POSTS = 6
const LIMIT_TEXTBOOKS = 5
const LIMIT_OLIYGOH = 5

const SearchModal: FC<Props> = ({ renderTrigger, triggerClassName = '' }) => {
	const client = getApolloClient()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [posts, setPosts] = useState<TPostCard[]>([])
	const [textbooks, setTextbooks] = useState<SearchTextbookNode[]>([])
	const [oliygohlar, setOliygohlar] = useState<SearchOliygohNode[]>([])
	const [milliyYangiliklar, setMilliyYangiliklar] = useState<
		Array<{ id: number; title: string; link: string }>
	>([])
	const [milliyImtihonlar, setMilliyImtihonlar] = useState<
		Array<{ id: number; title: string; fanlar: { fan_nomi: string }[] }>
	>([])

	const GQL = gql(`
		#graphql
		query SearchFormUnified(
			$search: String
			$firstPosts: Int
			$firstTextbooks: Int
			$firstOliygoh: Int
		) {
			posts(first: $firstPosts, where: { search: $search }) {
				nodes {
					...NcmazFcPostCardFields
				}
				pageInfo { endCursor hasNextPage }
			}
			textbooks(first: $firstTextbooks, where: { search: $search }) {
				nodes {
					databaseId
					title
					slug
					uri
					darslikMalumotlari { sinf }
					fanlar { nodes { name } }
				}
			}
			oliygohlar(first: $firstOliygoh, where: { search: $search }) {
				nodes {
					databaseId
					title
					slug
					uri
					oliygohMalumotlari { viloyat }
				}
			}
		}
	`)

	function fetchData(searchQuery: string) {
		if (!searchQuery.trim()) {
			setPosts([])
			setTextbooks([])
			setOliygohlar([])
			setMilliyYangiliklar([])
			setMilliyImtihonlar([])
			return
		}
		setIsLoading(true)
		setPosts([])
		setTextbooks([])
		setOliygohlar([])
		setMilliyYangiliklar([])
		setMilliyImtihonlar([])

		const variables = {
			search: searchQuery,
			firstPosts: LIMIT_POSTS,
			firstTextbooks: LIMIT_TEXTBOOKS,
			firstOliygoh: LIMIT_OLIYGOH,
		}

		Promise.all([
			client.query({
				query: GQL,
				variables,
			}),
			fetch(
				`/api/search-milliy-sertifikat?q=${encodeURIComponent(searchQuery)}`
			).then((r) => r.json()),
		])
			.then(([gqlRes, milliy]) => {
				const data = gqlRes?.data as {
					posts?: { nodes?: TPostCard[] }
					textbooks?: { nodes?: SearchTextbookNode[] }
					oliygohlar?: { nodes?: SearchOliygohNode[] }
				}
				setPosts((data?.posts?.nodes as TPostCard[]) || [])
				setTextbooks(data?.textbooks?.nodes || [])
				setOliygohlar(data?.oliygohlar?.nodes || [])
				setMilliyYangiliklar(
					(milliy?.yangiliklar || []).map((p: { id: number; title: string; link: string }) => ({
						id: p.id,
						title: p.title,
						link: p.link,
					}))
				)
				setMilliyImtihonlar(
					(milliy?.imtihonlar || []).map(
						(im: { id: number; title: string; fanlar: { fan_nomi: string }[] }) => ({
							id: im.id,
							title: im.title,
							fanlar: im.fanlar || [],
						})
					)
				)
			})
			.catch((err) => {
				console.error('Search fetch error:', err)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	useEffect(() => {
		if (query.trim() === '') {
			setPosts([])
			setTextbooks([])
			setOliygohlar([])
			setMilliyYangiliklar([])
			setMilliyImtihonlar([])
			return
		}
		const t = setTimeout(() => fetchData(query), DEBOUNCE_MS)
		return () => clearTimeout(t)
	}, [query])

	const handleSetSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	return (
		<>
			<div onClick={() => setOpen(true)} className={triggerClassName}>
				{renderTrigger ? (
					renderTrigger()
				) : (
					<button className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 focus:outline-none sm:h-12 sm:w-12 dark:text-neutral-300 dark:hover:bg-neutral-800">
						<SearchIcon className="h-5 w-5" />
					</button>
				)}
			</div>

			<Transition show={open} afterLeave={() => setQuery('')} appear>
				<Dialog className={`relative z-50`} onClose={setOpen}>
					<TransitionChild
						enter="ease-out duration-200"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-150"
						leaveFrom="opacity-200"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-neutral-900/50 transition-opacity" />
					</TransitionChild>

					<div className="fixed inset-0 z-10 flex w-full overflow-y-auto sm:p-6 md:pb-10 md:pt-20">
						<TransitionChild
							enter="ease-out duration-200"
							enterFrom="opacity-0 translate-y-20 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-20 sm:translate-y-0 sm:scale-95"
						>
							<DialogPanel className="mx-auto w-full max-w-2xl transform divide-y divide-gray-100 self-end overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 transition-all sm:self-start sm:rounded-xl dark:divide-gray-700 dark:bg-neutral-800 dark:ring-white/10">
								<Combobox
									// @ts-ignore
									onChange={(item?: PersonType | SearchResultItem) => {
										if (!item) return
										const withUri = item as { uri?: string; type?: string }
										if (withUri.type === 'quick-action') {
											const base = withUri.uri || ''
											// Faqat qidiruv sahifalariga so‘rovni qo‘shamiz
											const searchUris = ['/search/posts/', '/search/authors/', '/search/categories/', '/posts?search=']
											const appendQuery = searchUris.some((u) => base.startsWith(u))
											router.push(appendQuery ? base + encodeURIComponent(query) : base)
											setOpen(false)
											return
										}
										if (withUri.uri) {
											router.push(withUri.uri)
											setOpen(false)
										}
									}}
									form="search-form-combobox"
								>
									<div className="relative">
										<MagnifyingGlassIcon
											className="pointer-events-none absolute start-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-300"
											aria-hidden="true"
										/>
										<div className="pe-9">
											<ComboboxInput
												autoFocus
												className="h-12 w-full border-0 bg-transparent pe-4 ps-11 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-300"
												placeholder={T['Type to search...']}
												onChange={_.debounce(handleSetSearchValue, DEBOUNCE_MS)}
												onBlur={() => setQuery('')}
											/>
										</div>
										<button
											className="absolute end-3 top-1/2 z-10 -translate-y-1/2 text-xs text-neutral-400 focus:outline-none sm:end-4 dark:text-neutral-300"
											onClick={() => setOpen(false)}
											type="button"
										>
											<XMarkIcon className="block h-5 w-5 sm:hidden" />
											<span className="hidden sm:block">
												<kbd className="font-sans">Esc</kbd>
											</span>
										</button>
									</div>

									{isLoading && (
										<div className="flex w-full items-center justify-center py-5">
											<Loading />
										</div>
									)}

									<ComboboxOptions
										static
										as="ul"
										className="max-h-[70vh] scroll-py-2 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700"
									>
										{query !== '' && !isLoading && (
											<>
												{/* Maqolalar */}
												{posts.length > 0 && (
													<li className="p-2">
														<h3 className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
															{T['Articles'] || 'Maqolalar'}
														</h3>
														<ul className="divide-y divide-gray-100 text-sm text-gray-700 dark:divide-gray-700 dark:text-gray-300">
															{posts.map((post) => (
																<ComboboxOption
																	as="li"
																	key={`post-${post.databaseId}`}
																	value={{
																		type: 'post' as const,
																		uri: post.uri || '',
																		title: post.title || undefined,
																	}}
																	className={({ focus }) =>
																		clsx(
																			'relative flex cursor-default select-none items-center',
																			focus && 'bg-neutral-100 dark:bg-neutral-700',
																		)
																	}
																>
																	{({ focus }) => (
																		<CardPost post={post} focus={focus} />
																	)}
																</ComboboxOption>
															))}
														</ul>
													</li>
												)}
												{/* Darsliklar */}
												{textbooks.length > 0 && (
													<li className="p-2">
														<h3 className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
															Darsliklar
														</h3>
														<ul className="divide-y divide-gray-100 text-sm dark:divide-gray-700 dark:text-gray-300">
															{textbooks.map((tb) => (
																<ComboboxOption
																	as="li"
																	key={`tb-${tb.databaseId}`}
																	value={{
																		type: 'darslik' as const,
																		uri: tb.uri || `/darsliklar/${tb.darslikMalumotlari?.sinf ?? ''}/${tb.slug ?? ''}`.replace(/\/+/g, '/'),
																		title: tb.title || undefined,
																	}}
																	className={({ focus }) =>
																		clsx(
																			'relative flex cursor-default select-none items-center rounded-lg px-3 py-2',
																			focus && 'bg-neutral-100 dark:bg-neutral-700',
																		)
																	}
																>
																	{() => (
																		<div className="flex items-center gap-3">
																			<BookOpenIcon className="h-5 w-5 flex-shrink-0 text-neutral-400" />
																			<div className="min-w-0">
																				<p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
																					{tb.title}
																				</p>
																				{(tb.darslikMalumotlari?.sinf || tb.fanlar?.nodes?.[0]?.name) && (
																					<p className="text-xs text-neutral-500 dark:text-neutral-400">
																						{tb.darslikMalumotlari?.sinf && `${tb.darslikMalumotlari.sinf}-sinf`}
																						{tb.darslikMalumotlari?.sinf && tb.fanlar?.nodes?.[0]?.name && ' · '}
																						{tb.fanlar?.nodes?.[0]?.name}
																					</p>
																				)}
																			</div>
																			<ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
																		</div>
																	)}
																</ComboboxOption>
															))}
														</ul>
													</li>
												)}
												{/* Oliygohlar */}
												{oliygohlar.length > 0 && (
													<li className="p-2">
														<h3 className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
															Oliygohlar
														</h3>
														<ul className="divide-y divide-gray-100 text-sm dark:divide-gray-700 dark:text-gray-300">
															{oliygohlar.map((ol) => (
																<ComboboxOption
																	as="li"
																	key={`ol-${ol.databaseId}`}
																	value={{
																		type: 'oliygoh' as const,
																		uri: ol.uri || `/oliygoh`,
																		title: ol.title || undefined,
																	}}
																	className={({ focus }) =>
																		clsx(
																			'relative flex cursor-default select-none items-center rounded-lg px-3 py-2',
																			focus && 'bg-neutral-100 dark:bg-neutral-700',
																		)
																	}
																>
																	{() => (
																		<div className="flex items-center gap-3">
																			<BuildingOffice2Icon className="h-5 w-5 flex-shrink-0 text-neutral-400" />
																			<div className="min-w-0">
																				<p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
																					{ol.title}
																				</p>
																				{ol.oliygohMalumotlari?.viloyat?.[0] && (
																					<p className="text-xs text-neutral-500 dark:text-neutral-400">
																						{ol.oliygohMalumotlari.viloyat[0]}
																					</p>
																				)}
																			</div>
																			<ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
																		</div>
																	)}
																</ComboboxOption>
															))}
														</ul>
													</li>
												)}
												{/* Milliy sertifikat */}
												{(milliyYangiliklar.length > 0 || milliyImtihonlar.length > 0) && (
													<li className="p-2">
														<h3 className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
															Milliy sertifikat
														</h3>
														<ul className="divide-y divide-gray-100 text-sm dark:divide-gray-700 dark:text-gray-300">
															{milliyYangiliklar.map((y) => (
																<ComboboxOption
																	as="li"
																	key={`ms-y-${y.id}`}
																	value={{
																		type: 'milliy-yangilik' as const,
																		uri: y.link,
																		title: y.title,
																	}}
																	className={({ focus }) =>
																		clsx(
																			'relative flex cursor-default select-none items-center rounded-lg px-3 py-2',
																			focus && 'bg-neutral-100 dark:bg-neutral-700',
																		)
																	}
																>
																	{() => (
																		<div className="flex items-center gap-3">
																			<AcademicCapIcon className="h-5 w-5 flex-shrink-0 text-neutral-400" />
																			<p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
																				{y.title}
																			</p>
																			<ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
																		</div>
																	)}
																</ComboboxOption>
															))}
															{milliyImtihonlar.map((im) => (
																<ComboboxOption
																	as="li"
																	key={`ms-im-${im.id}`}
																	value={{
																		type: 'milliy-imtihon' as const,
																		uri: '/milliy-sertifikat-sanalari',
																		title: im.title,
																	}}
																	className={({ focus }) =>
																		clsx(
																			'relative flex cursor-default select-none items-center rounded-lg px-3 py-2',
																			focus && 'bg-neutral-100 dark:bg-neutral-700',
																		)
																	}
																>
																	{() => (
																		<div className="flex items-center gap-3">
																			<AcademicCapIcon className="h-5 w-5 flex-shrink-0 text-neutral-400" />
																			<div className="min-w-0">
																				<p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
																					{im.title}
																				</p>
																				{im.fanlar?.length > 0 && (
																					<p className="text-xs text-neutral-500 dark:text-neutral-400">
																						{im.fanlar.map((f) => f.fan_nomi).join(', ')}
																					</p>
																				)}
																			</div>
																			<ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
																		</div>
																	)}
																</ComboboxOption>
															))}
														</ul>
													</li>
												)}
												{posts.length === 0 &&
													textbooks.length === 0 &&
													oliygohlar.length === 0 &&
													milliyYangiliklar.length === 0 &&
													milliyImtihonlar.length === 0 && (
														<li className="p-2">
															<div className="py-5 text-center">
																<Empty />
															</div>
														</li>
													)}
											</>
										)}

										{query === '' && (
											<li className="p-2">
												<h2 className="mb-2 mt-4 px-3 text-xs font-medium text-gray-500 dark:text-gray-300">
													{T['Recommended searches']}
												</h2>

												<ul className="text-sm text-gray-700 dark:text-gray-300">
													{explores.map((explore) => (
														<ComboboxOption
															as={'li'}
															key={explore.name}
															value={explore}
															className={({ focus }) =>
																clsx(
																	'flex cursor-default select-none items-center rounded-md px-3 py-2',
																	focus && 'bg-neutral-100 dark:bg-neutral-700',
																)
															}
														>
															{({ focus }) => (
																<>
																	<explore.icon
																		className={clsx(
																			'h-6 w-6 flex-none text-neutral-400 dark:text-gray-300',
																		)}
																		aria-hidden="true"
																	/>
																	<span className="ms-3 flex-auto truncate">
																		{explore.name}
																	</span>
																	{focus && (
																		<span className="ms-3 flex-none text-neutral-500 dark:text-gray-400">
																			<ArrowUpRightIcon className="inline-block h-4 w-4" />
																		</span>
																	)}
																</>
															)}
														</ComboboxOption>
													))}
												</ul>
											</li>
										)}

										<li className="p-2">
											<h2 className="sr-only">Quick actions</h2>
											<ul className="text-sm text-gray-700 dark:text-gray-300">
												{quickActions.map((action) => (
													<ComboboxOption
														as={'li'}
														key={action.name}
														value={action}
														className={({ focus }) =>
															clsx(
																'flex cursor-default select-none items-center rounded-md px-3 py-2',
																focus && 'bg-neutral-100 dark:bg-neutral-700',
															)
														}
													>
														{({ focus }) => (
															<>
																<action.icon
																	className={clsx(
																		'h-6 w-6 flex-none text-neutral-400 dark:text-gray-300',
																		focus ? '' : '',
																	)}
																	aria-hidden="true"
																/>
																<span className="ms-3 flex-auto truncate">
																	{action.name}
																</span>
																<span
																	className={clsx(
																		'ms-3 flex-none text-xs font-semibold text-neutral-400 dark:text-gray-300',
																		focus ? '' : '',
																	)}
																>
																	<ArrowUpRightIcon className="inline-block h-4 w-4" />
																</span>
															</>
														)}
													</ComboboxOption>
												))}
											</ul>
										</li>
									</ComboboxOptions>
								</Combobox>
							</DialogPanel>
						</TransitionChild>
					</div>
				</Dialog>
			</Transition>
		</>
	)
}

const CardPost = ({ post, focus }: { post: TPostCard; focus: boolean }) => {
	const { title, date, categories, author, postFormats, featuredImage } =
		getPostDataFromPostFragment(post)

	return (
		<div
			className={`group relative flex flex-row-reverse gap-3 rounded-2xl p-4 sm:gap-5 ${focus ? '' : ''}`}
		>
			<div className="space-y-3">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<p className="text-xs leading-6 text-neutral-500 xl:text-sm dark:text-neutral-400">
						<span className="capitalize">{author?.name || ''}</span>
						{author?.name && ' · '}
						<time dateTime={date} className="leading-6">
							{ncFormatDate(date)}
						</time>
					</p>

					<span className="relative z-10 rounded-full bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/80">
						{categories?.nodes?.[0]?.name || ''}
					</span>
				</div>
				<h4 className="mt-2 text-sm font-medium leading-6 text-neutral-900 dark:text-neutral-300">
					<span dangerouslySetInnerHTML={{ __html: post.title || '' }}></span>
				</h4>
			</div>

			<div
				className={`relative z-0 hidden h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl sm:block`}
			>
				<MyImage
					sizes="(max-width: 600px) 180px, 400px"
					className="h-full w-full object-cover"
					fill
					src={featuredImage?.sourceUrl || ''}
					alt={title || 'Card Image'}
				/>
				<span className="absolute bottom-1 start-1">
					<PostTypeFeaturedIcon
						wrapSize="h-7 w-7"
						iconSize="h-4 w-4"
						postType={postFormats || ''}
					/>
				</span>
			</div>
		</div>
	)
}

export default SearchModal
