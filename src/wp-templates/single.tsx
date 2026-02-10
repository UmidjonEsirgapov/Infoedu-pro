import { gql } from '../__generated__'
import {
	GetPostSiglePageQuery,
	NcgeneralSettingsFieldsFragmentFragment,
	NcmazFcUserReactionPostActionEnum,
	NcmazFcUserReactionPostNumberUpdateEnum,
} from '../__generated__/graphql'
import { FaustTemplate } from '@faustwp/core'
import SingleContent from '@/container/singles/SingleContent'
import SingleType1 from '@/container/singles/single/single'
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment'
import { Sidebar } from '@/container/singles/Sidebar'
import PageLayout from '@/container/PageLayout'
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu'
import dynamic from 'next/dynamic'
import React, { useEffect, useState, useMemo } from 'react'
import { NC_MUTATION_UPDATE_USER_REACTION_POST_COUNT } from '@/fragments/mutations'
import { useMutation } from '@apollo/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/stores/store'
import useGetPostsNcmazMetaByIds from '@/hooks/useGetPostsNcmazMetaByIds'
import { TPostCard } from '@/components/Card2/Card2'
import { useRouter } from 'next/router'
import { TCategoryCardFull } from '@/components/CardCategory1/CardCategory1'
import SingleTypeAudio from '@/container/singles/single-audio/single-audio'
import SingleTypeVideo from '@/container/singles/single-video/single-video'
import SingleTypeGallery from '@/container/singles/single-gallery/single-gallery'
import Head from 'next/head'
import { useCanonicalUrl } from '@/utils/getCanonicalUrl'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'

const DynamicSingleRelatedPosts = dynamic(
	() => import('@/container/singles/SingleRelatedPosts'),
)
const DynamicSingleType2 = dynamic(
	() => import('../container/singles/single-2/single-2'),
)
const DynamicSingleType3 = dynamic(
	() => import('../container/singles/single-3/single-3'),
)
const DynamicSingleType4 = dynamic(
	() => import('../container/singles/single-4/single-4'),
)
const DynamicSingleType5 = dynamic(
	() => import('../container/singles/single-5/single-5'),
)

const Component: FaustTemplate<GetPostSiglePageQuery> = (props) => {
	//  LOADING ----------
	if (props.loading) {
		return <>Loading...</>
	}

	const router = useRouter()
	const IS_PREVIEW = router.pathname === '/preview'

	// START ----------
	const { isReady, isAuthenticated } = useSelector(
		(state: RootState) => state.viewer.authorizedUser,
	)
	const { viewer } = useSelector((state: RootState) => state.viewer)
	const [isUpdateViewCount, setIsUpdateViewCount] = useState(false)

	useEffect(() => {
		const timeOutUpdateViewCount = setTimeout(() => {
			setIsUpdateViewCount(true)
		}, 5000)

		return () => {
			clearTimeout(timeOutUpdateViewCount)
		}
	}, [])

	const _post = props.data?.post || {}

	// console.log('🚀 ~ file: single.tsx ~ line 68 ~ Component ~ _post', _post)

	const _relatedPosts = (props.data?.posts?.nodes as TPostCard[]) || []
	const _top10Categories =
		(props.data?.categories?.nodes as TCategoryCardFull[]) || []
	
	// Popular posts - sort by viewsCount
	const _popularPosts = React.useMemo(() => {
		const posts = (props.data?.popularPosts?.nodes as TPostCard[]) || []
		// Create a copy of the array before sorting (GraphQL responses are read-only)
		return [...posts]
			.sort((a, b) => {
				const aViews = getPostDataFromPostFragment(a).ncPostMetaData?.viewsCount || 0
				const bViews = getPostDataFromPostFragment(b).ncPostMetaData?.viewsCount || 0
				return bViews - aViews
			})
			.slice(0, 5)
	}, [props.data?.popularPosts?.nodes])

	const {
		title,
		ncPostMetaData,
		postFormats,
		featuredImage,
		databaseId,
		excerpt,
		modified,
		date,
		uri,
		author,
		categories,
	} = getPostDataFromPostFragment(_post)

	//
	const {} = useGetPostsNcmazMetaByIds({
		posts: (IS_PREVIEW ? [] : [_post]) as TPostCard[],
	})
	//

	// Query update post view count
	const [handleUpdateReactionCount, { reset }] = useMutation(
		NC_MUTATION_UPDATE_USER_REACTION_POST_COUNT,
		{
			onCompleted: (data) => {
				reset()
			},
		},
	)

	// update view count
	useEffect(() => {
		if (!isReady || IS_PREVIEW || !isUpdateViewCount) {
			return
		}

		// user chua dang nhap, va update view count voi user la null
		if (isAuthenticated === false) {
			handleUpdateReactionCount({
				variables: {
					post_id: databaseId,
					reaction: NcmazFcUserReactionPostActionEnum.View,
					number: NcmazFcUserReactionPostNumberUpdateEnum.Add_1,
				},
			})
			return
		}

		// user da dang nhap, va luc nay viewer dang fetch.
		if (!viewer?.databaseId) {
			return
		}

		// khi viewer fetch xong, luc nay viewer da co databaseId, va se update view count voi user la viewer
		handleUpdateReactionCount({
			variables: {
				post_id: databaseId,
				reaction: NcmazFcUserReactionPostActionEnum.View,
				number: NcmazFcUserReactionPostNumberUpdateEnum.Add_1,
				user_id: viewer?.databaseId,
			},
		})
	}, [
		databaseId,
		isReady,
		isAuthenticated,
		viewer?.databaseId,
		IS_PREVIEW,
		isUpdateViewCount,
	])

	const renderHeaderType = () => {
		const pData = { ...(_post || {}) }

		if (postFormats === 'audio') {
			return <SingleTypeAudio post={pData} />
		}
		if (postFormats === 'video') {
			return <SingleTypeVideo post={pData} />
		}
		if (postFormats === 'gallery') {
			return <SingleTypeGallery post={pData} />
		}

		if (ncPostMetaData?.template?.[0] === 'style2') {
			return <DynamicSingleType2 post={pData} />
		}
		if (ncPostMetaData?.template?.[0] === 'style3') {
			return <DynamicSingleType3 post={pData} />
		}
		if (ncPostMetaData?.template?.[0] === 'style4') {
			return <DynamicSingleType4 post={pData} />
		}
		if (ncPostMetaData?.template?.[0] === 'style5') {
			return <DynamicSingleType5 post={pData} />
		}
		return (
			<SingleType1
				showRightSidebar={!!ncPostMetaData?.showRightSidebar}
				post={pData}
			/>
		)
	}

	// NewsArticle JSON-LD Schema
	const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'
	const canonicalUrl = useCanonicalUrl(uri || undefined)
	
	const newsArticleSchema = useMemo(() => {
		if (!title || !date) return null

		const schema: any = {
			'@context': 'https://schema.org',
			'@type': 'NewsArticle',
			headline: title,
			description: excerpt || '',
			datePublished: date,
			...(modified && { dateModified: modified }),
			author: {
				'@type': 'Person',
				name: author?.name || author?.username || 'InfoEdu.uz',
				...(author?.uri && { url: `${BASE_URL}${author.uri}` }),
			},
			publisher: {
				'@type': 'Organization',
				name: (props.data?.generalSettings as NcgeneralSettingsFieldsFragmentFragment)?.title || 'InfoEdu.uz',
				url: BASE_URL,
				logo: {
					'@type': 'ImageObject',
					url: `${BASE_URL}/logo.png`,
				},
			},
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': canonicalUrl,
			},
			url: canonicalUrl,
			...(featuredImage?.sourceUrl && {
				image: {
					'@type': 'ImageObject',
					url: featuredImage.sourceUrl,
					width: 1200,
					height: 630,
					...(featuredImage.altText && { caption: featuredImage.altText }),
				},
			}),
			articleSection: categories?.nodes?.[0]?.name || '',
			keywords: categories?.nodes?.map((cat: any) => cat.name).join(', ') || '',
			inLanguage: 'uz',
		}

		return schema
	}, [
		title,
		date,
		modified,
		excerpt,
		author,
		featuredImage,
		categories,
		canonicalUrl,
		BASE_URL,
		props.data?.generalSettings,
	])

	return (
		<>
			{/* NewsArticle JSON-LD Schema */}
			{newsArticleSchema && (
				<Head>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(newsArticleSchema),
						}}
					/>
				</Head>
			)}
			<PageLayout
				headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
				footerMenuItems={props.data?.footerMenuItems?.nodes || []}
				pageFeaturedImageUrl={featuredImage?.sourceUrl}
				pageImageWidth={1200}
				pageImageHeight={630}
				pageTitle={title}
				pageDescription={excerpt || ''}
				pageModifiedDate={modified || null}
				pagePublishedDate={date || null}
				seoType="article"
				generalSettings={
					props.data?.generalSettings as NcgeneralSettingsFieldsFragmentFragment
				}
			>
				{/* Breadcrumb Navigation */}
				{categories?.nodes?.[0] && (
					<Breadcrumb
						items={[
							{
								label: categories.nodes[0].name || 'Kategoriya',
								href: categories.nodes[0].uri || '/',
							},
							{
								label: title || 'Maqola',
								href: uri || '/',
							},
						]}
					/>
				)}
				
				{ncPostMetaData?.showRightSidebar ? (
					<div>
						<div className={`relative`}>
							{renderHeaderType()}

							<div className="container my-10 flex flex-col lg:flex-row">
								<div className="w-full lg:w-3/5 xl:w-2/3 xl:pe-20">
									<SingleContent post={_post} />
								</div>
								<div className="mt-12 w-full lg:mt-0 lg:w-2/5 lg:ps-10 xl:w-1/3 xl:ps-0">
									<Sidebar 
										categories={_top10Categories} 
										popularPosts={_popularPosts}
									/>
								</div>
							</div>

							{/* RELATED POSTS */}
							<DynamicSingleRelatedPosts
								posts={_relatedPosts}
								postDatabaseId={databaseId}
							/>
						</div>
					</div>
				) : (
					<div>
						{renderHeaderType()}

						<div className="container mt-10">
							{/* SINGLE MAIN CONTENT */}
							<SingleContent post={_post} />
						</div>

						{/* RELATED POSTS */}
						<DynamicSingleRelatedPosts
							posts={_relatedPosts}
							postDatabaseId={databaseId}
						/>
					</div>
				)}
			</PageLayout>
		</>
	)
}

Component.variables = ({ databaseId }, ctx) => {
	return {
		databaseId,
		post_databaseId: Number(databaseId || 0),
		asPreview: ctx?.asPreview,
		headerLocation: PRIMARY_LOCATION,
		footerLocation: FOOTER_LOCATION,
	}
}

Component.query = gql(`
  query GetPostSiglePage($databaseId: ID!, $post_databaseId: Int,$asPreview: Boolean = false, $headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
		...NcmazFcPostFullVsEditorBlocksNoContentFields
    }
    posts(where: {isRelatedOfPostId:$post_databaseId}) {
      nodes {
      ...PostCardFieldsNOTNcmazMEDIA
      }
    }
    popularPosts: posts(first: 5, where: {orderby: {field: DATE, order: DESC}, status: PUBLISH}) {
      nodes {
        ...PostCardFieldsNOTNcmazMEDIA
        ncPostMetaData {
          viewsCount
        }
      }
    }
    categories(first:10, where: { orderby: COUNT, order: DESC }) {
      nodes {
        ...NcmazFcCategoryFullFieldsFragment
      }
    }
    generalSettings {
      ...NcgeneralSettingsFieldsFragment
    }
    primaryMenuItems: menuItems(where: {location:$headerLocation}, first: 80) {
      nodes {
        ...NcPrimaryMenuFieldsFragment
      }
    }
    footerMenuItems: menuItems(where: {location:$footerLocation}, first: 40) {
      nodes {
        ...NcFooterMenuFieldsFragment
      }
    }
  }
`)

export default Component
