'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { MilliySertifikatPost } from '@/lib/fetch-milliy-sertifikat-yangiliklar'

interface MilliySertifikatSonggiYangiliklarProps {
	posts: MilliySertifikatPost[]
}

export default function MilliySertifikatSonggiYangiliklar({ posts }: MilliySertifikatSonggiYangiliklarProps) {
	if (!posts.length) return null

	return (
		<section className="px-4 py-12 sm:py-16" aria-labelledby="songgi-yangiliklar-heading">
			<h2 id="songgi-yangiliklar-heading" className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
				So&apos;nggi yangiliklar
			</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{posts.map((post) => (
					<article
						key={post.id}
						className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-indigo-600"
					>
						{post.featuredImageUrl && (
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="block aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-700"
							>
								<img
									src={post.featuredImageUrl}
									alt=""
									className="h-full w-full object-cover"
								/>
							</a>
						)}
						<div className="p-4">
							<h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
								{post.title}
							</h3>
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
							>
								O&apos;qish
								<ArrowRight className="h-4 w-4" />
							</a>
						</div>
					</article>
				))}
			</div>
			<div className="mt-6">
				<Link
					href="/category/milliy-sertifikat"
					className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
				>
					Barcha yangiliklar
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</section>
	)
}
