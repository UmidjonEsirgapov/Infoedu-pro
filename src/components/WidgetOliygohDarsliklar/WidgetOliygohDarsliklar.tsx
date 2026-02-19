import Link from 'next/link'
import { FC } from 'react'
import WidgetHeading1 from '../WidgetHeading1/WidgetHeading1'

const links = [
  {
    href: '/oliygoh',
    title: 'Oliygohlar',
    description: 'Universitetlar va institutlar',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    gradient: 'from-violet-500/10 to-purple-600/10 dark:from-violet-500/20 dark:to-purple-600/20',
    ring: 'ring-violet-500/20 dark:ring-violet-400/30',
  },
  {
    href: '/darsliklar',
    title: 'Darsliklar',
    description: '1–11 sinf darsliklari PDF',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    gradient: 'from-emerald-500/10 to-teal-600/10 dark:from-emerald-500/20 dark:to-teal-600/20',
    ring: 'ring-emerald-500/20 dark:ring-emerald-400/30',
  },
]

export interface WidgetOliygohDarsliklarProps {
  className?: string
}

const WidgetOliygohDarsliklar: FC<WidgetOliygohDarsliklarProps> = ({
  className = 'rounded-3xl border border-neutral-100 dark:border-neutral-700',
}) => {
  return (
    <div className={`nc-WidgetOliygohDarsliklar overflow-hidden ${className}`}>
      <WidgetHeading1 title="📚 Ta'lim bo'limlari" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-4 rounded-2xl bg-gradient-to-br ${item.gradient} p-4 ring-1 transition-all duration-200 hover:shadow-md ${item.ring} hover:ring-2 hover:ring-offset-2 dark:ring-offset-neutral-900`}
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/80 text-neutral-700 shadow-sm dark:bg-neutral-800/80 dark:text-neutral-300 group-hover:scale-105 transition-transform">
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {item.title}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {item.description}
              </span>
            </div>
            <svg
              className="h-5 w-5 flex-shrink-0 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default WidgetOliygohDarsliklar
