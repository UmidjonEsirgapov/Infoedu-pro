import { TCategoryCardFull } from '@/components/CardCategory1/CardCategory1'
import WidgetCategories from '@/components/WidgetCategories/WidgetCategories'
import WidgetPopularPosts from '@/components/WidgetPopularPosts/WidgetPopularPosts'
import WidgetOliygohDarsliklar from '@/components/WidgetOliygohDarsliklar/WidgetOliygohDarsliklar'
import { TPostCard } from '@/components/Card2/Card2'
import React, { FC } from 'react'

export interface SidebarProps {
	className?: string
	categories: TCategoryCardFull[] | null
	popularPosts?: TPostCard[] | null
}

export const Sidebar: FC<SidebarProps> = ({
	className = 'space-y-6 ',
	categories,
	popularPosts,
}) => {
	return (
		<div className={`nc-SingleSidebar lg:sticky lg:top-24 ${className}`}>
			{/* Popular Posts - Top */}
			{popularPosts && popularPosts.length > 0 && (
				<WidgetPopularPosts posts={popularPosts} />
			)}

			<WidgetOliygohDarsliklar />

			<WidgetCategories categories={categories || []} />
		</div>
	)
}
