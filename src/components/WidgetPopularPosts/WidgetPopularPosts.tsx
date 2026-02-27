import React, { FC } from 'react'
import Link from 'next/link'
import { TPostCard } from '@/components/Card2/Card2'
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment'
import { formatShortDateUz } from '@/utils/formatDate'
import { FireIcon } from '@heroicons/react/24/outline'

export interface WidgetPopularPostsProps {
	posts: TPostCard[] | null
	className?: string
}

const WidgetPopularPosts: FC<WidgetPopularPostsProps> = ({
	posts,
	className = '',
}) => {
	if (!posts || posts.length === 0) {
		return null
	}

	return (
		<div className={`nc-WidgetPopularPosts ${className}`}>
			<div className="rounded-2xl border border-neutral-200/70 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
				<h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					<FireIcon className="w-5 h-5 text-orange-500" />
					Eng ko'p ko'rilgan
				</h3>
				<div className="space-y-4">
					{posts.slice(0, 5).map((post, index) => {
						const data = getPostDataFromPostFragment(post)
						const {
							title,
							uri,
							featuredImage,
							ncPostMetaData,
							date,
						} = data
						// 301 redirect qilingan postlarda havola canonical (yangi) URL bo‘lishi kerak
						const rawHref = (data as { seo?: { canonicalUrl?: string | null } }).seo?.canonicalUrl || uri || '/'
						const linkHref = rawHref.startsWith('http') ? new URL(rawHref).pathname : rawHref

						return (
							<Link
								key={post.databaseId || index}
								href={linkHref}
								className="group flex gap-3 hover:opacity-80 transition-opacity"
							>
								{/* Number Badge */}
								<div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
									{index + 1}
								</div>

								{/* Content — rasm ko'rsatilmaydi (sidebar qisqa) */}
								<div className="flex-1 min-w-0">
									{/* Title */}
									<h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
										{title}
									</h4>

									{/* Meta */}
									<div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
										{date && (
											<span>{formatShortDateUz(date)}</span>
										)}
										{ncPostMetaData?.viewsCount && (
											<>
												<span>•</span>
												<span>{ncPostMetaData.viewsCount} ko'rish</span>
											</>
										)}
									</div>
								</div>
							</Link>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default WidgetPopularPosts
