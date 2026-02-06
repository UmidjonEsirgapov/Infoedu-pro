import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
	label: string
	href: string
}

interface BreadcrumbProps {
	items: BreadcrumbItem[]
	className?: string
}

/**
 * Breadcrumb component for SEO and navigation
 * Displays hierarchical navigation path
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
	if (!items || items.length === 0) return null

	return (
		<nav 
			className={`bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-3 px-4 ${className}`}
			aria-label="Breadcrumb"
		>
			<div className="max-w-7xl mx-auto">
				<ol className="flex items-center text-sm text-slate-500 dark:text-slate-400 flex-wrap">
					{/* Home */}
					<li>
						<Link 
							href="/" 
							className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
							aria-label="Bosh sahifa"
						>
							<Home className="w-4 h-4" />
						</Link>
					</li>
					
					{/* Breadcrumb items */}
					{items.map((item, index) => (
						<li key={index} className="flex items-center">
							<ChevronRight className="w-4 h-4 mx-2 text-slate-400 dark:text-slate-500" />
							{index === items.length - 1 ? (
								// Last item - current page (not a link)
								<span className="text-slate-900 dark:text-slate-100 font-medium line-clamp-1">
									{item.label}
								</span>
							) : (
								// Other items - links
								<Link
									href={item.href}
									className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
								>
									{item.label}
								</Link>
							)}
						</li>
					))}
				</ol>
			</div>
		</nav>
	)
}
