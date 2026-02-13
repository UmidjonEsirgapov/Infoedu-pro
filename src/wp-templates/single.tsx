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
		modifiedGmt,
		date,
		dateGmt,
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

	// Schemas (NewsArticle, FAQ, BreadcrumbList)
	const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'
	const canonicalUrl = useCanonicalUrl(uri || undefined)

	// FAQ Schema: avvalo Rank Math seo.jsonLd.raw dan, keyin FAQ blokdan
	const faqSchema = useMemo(() => {
		const post = props.data?.post as {
			seo?: { jsonLd?: { raw?: string | null } | null } | null
			editorBlocks?: Array<{ __typename?: string; attributes?: { questions?: unknown } | null } | null>
		} | undefined

		// 1) Rank Math JSON-LD dan FAQPage qidirish
		// raw <script type="application/ld+json">...</script> ichida yoki to'g'ri JSON bo'ladi; @graph ichida FAQ bor
		const raw = post?.seo?.jsonLd?.raw
		if (raw && typeof raw === 'string') {
			let jsonStr = raw.trim()
			const scriptMatch = jsonStr.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
			if (scriptMatch) jsonStr = scriptMatch[1].trim()
			try {
				const parsed = JSON.parse(jsonStr) as { '@graph'?: Array<{ '@type'?: string | string[]; mainEntity?: unknown }> } | Array<{ '@type'?: string; mainEntity?: unknown }> | { '@type'?: string | string[]; mainEntity?: unknown }
				const graph = Array.isArray(parsed) ? parsed : (parsed && (parsed as { '@graph'?: unknown })['@graph']) ? (parsed as { '@graph': unknown[] })['@graph'] : [parsed]
				const items = Array.isArray(graph) ? graph : [parsed]
				const faq = items.find((s) => {
					const type = s?.['@type']
					const isFaq = Array.isArray(type) ? type.includes('FAQPage') : type === 'FAQPage'
					return isFaq && Array.isArray(s?.mainEntity) && s.mainEntity.length > 0
				})
				if (faq && faq.mainEntity) {
					return {
						'@context': 'https://schema.org',
						'@type': 'FAQPage',
						mainEntity: faq.mainEntity,
					}
				}
			} catch {
				// regex fallback
				const faqMatch = raw.match(/"mainEntity"\s*:\s*(\[[\s\S]*?\])\s*}\s*,\s*{"@type"\s*:\s*"Person"/)
				if (faqMatch) {
					try {
						const mainEntity = JSON.parse(faqMatch[1])
						if (Array.isArray(mainEntity) && mainEntity.length > 0) {
							return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }
						}
					} catch {
						// ignore
					}
				}
			}
		}

		// 2) Editor bloklaridan: Rank Math FAQ block (questions = massiv ichida har biri JSON string)
		const blocks = post?.editorBlocks
		if (!blocks?.length) return null
		const faqBlocks = blocks.filter((b): b is { __typename: 'RankMathFaqBlock'; attributes: { questions: unknown } } => b?.__typename === 'RankMathFaqBlock' && !!b.attributes?.questions)
		const allQuestions: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = []

		function getText(v: unknown): string {
			if (v == null) return ''
			if (typeof v === 'string') return v.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
			if (typeof v === 'object' && v !== null && 'content' in v) return getText((v as { content?: unknown }).content)
			return String(v)
		}

		for (const block of faqBlocks) {
			const questions = block.attributes.questions
			const list = Array.isArray(questions) ? questions : typeof questions === 'string' ? (() => { try { return JSON.parse(questions) } catch { return [] } })() : []
			for (const q of list) {
				let obj: Record<string, unknown> | null = null
				if (typeof q === 'string') {
					try { obj = JSON.parse(q) as Record<string, unknown> } catch { continue }
				} else if (q && typeof q === 'object') {
					obj = q as Record<string, unknown>
				}
				if (!obj) continue
				const name = getText(obj.question ?? obj.title ?? obj.name)
				const text = getText(obj.answer ?? obj.content ?? obj.text)
				if (name && text) {
					allQuestions.push({
						'@type': 'Question',
						name,
						acceptedAnswer: { '@type': 'Answer', text },
					})
				}
			}
		}
		if (allQuestions.length === 0) return null
		return {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: allQuestions,
		}
	}, [props.data?.post])

	// BreadcrumbList Schema (Asosiy → Kategoriya → Maqola)
	const breadcrumbListSchema = useMemo(() => {
		const items: Array<{ '@type': string; position: number; name: string; item?: string }> = [
			{ '@type': 'ListItem', position: 1, name: 'Asosiy', item: BASE_URL },
		]
		if (categories?.nodes?.[0]) {
			items.push({
				'@type': 'ListItem',
				position: items.length + 1,
				name: categories.nodes[0].name || 'Kategoriya',
				item: `${BASE_URL}${categories.nodes[0].uri || ''}`,
			})
		}
		items.push({
			'@type': 'ListItem',
			position: items.length + 1,
			name: title || 'Maqola',
			item: canonicalUrl,
		})
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items,
		}
	}, [BASE_URL, canonicalUrl, title, categories?.nodes])
	
	const newsArticleSchema = useMemo(() => {
		if (!title || !date) return null

		// Yangiliklar kategoriyasiga tegishli bo'lsa NewsArticle, aks holda Article
		const isYangiliklar = categories?.nodes?.some(
			(c: { slug?: string; name?: string }) =>
				(c.slug || c.name || '').toLowerCase() === 'yangiliklar'
		)
		const schemaType = isYangiliklar ? 'NewsArticle' : 'Article'

		// ISO 8601 with timezone (Google Rich Results "missing timezone" fix)
		const schemaDatePublished = dateGmt ? `${String(dateGmt).replace(/Z$/, '')}Z` : (/Z$|[+-]\d{2}:\d{2}$/.test(date) ? date : `${String(date).replace(/Z$/, '')}Z`)
		const schemaDateModified = modified && (modifiedGmt ? `${String(modifiedGmt).replace(/Z$/, '')}Z` : (/Z$|[+-]\d{2}:\d{2}$/.test(modified) ? modified : `${String(modified).replace(/Z$/, '')}Z`))

		const schema: any = {
			'@context': 'https://schema.org',
			'@type': schemaType,
			headline: title,
			description: excerpt || '',
			datePublished: schemaDatePublished,
			...(schemaDateModified && { dateModified: schemaDateModified }),
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
		dateGmt,
		modified,
		modifiedGmt,
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
			<Head>
				{/* Article / NewsArticle JSON-LD (NewsArticle faqat "yangiliklar" kategoriyasida) */}
				{newsArticleSchema && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(newsArticleSchema),
						}}
					/>
				)}
				{/* FAQ Schema (Rank Math FAQ block) */}
				{faqSchema && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(faqSchema),
						}}
					/>
				)}
				{/* BreadcrumbList Schema */}
				{breadcrumbListSchema && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(breadcrumbListSchema),
						}}
					/>
				)}
			</Head>
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
    popularPosts: posts(first: 5, where: {orderby: {field: VIEWS_COUNT, order: DESC}, status: PUBLISH}) {
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
