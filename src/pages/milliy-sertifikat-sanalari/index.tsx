import { gql } from '@/__generated__'
import {
	GetReadingListPageQuery,
	NcgeneralSettingsFieldsFragmentFragment,
} from '@/__generated__/graphql'
import { FaustPage, getNextStaticProps } from '@faustwp/core'
import { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import Head from 'next/head'
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu'
import PageLayout from '@/container/PageLayout'
import { REVALIDATE_TIME } from '@/contains/contants'
import { fetchMilliySertifikatImtihonlar } from '@/lib/fetch-milliy-sertifikat-imtihonlar'
import { fetchMilliySertifikatYangiliklar } from '@/lib/fetch-milliy-sertifikat-yangiliklar'
import type { MilliySertifikatPost } from '@/lib/fetch-milliy-sertifikat-yangiliklar'
import {
	buildEventsSchema,
	buildFAQSchema,
} from '@/lib/milliy-sertifikat-schema'
import type { MilliySertifikatImtihon } from '@/data/milliy-sertifikat-types'
import MilliySertifikatEdTechWrap from '@/components/milliy-sertifikat/MilliySertifikatEdTechWrap'
import MilliySertifikatEdTechStats from '@/components/milliy-sertifikat/MilliySertifikatEdTechStats'
import MilliySertifikatEdTechHero from '@/components/milliy-sertifikat/MilliySertifikatEdTechHero'
import MilliySertifikatEdTechGrid from '@/components/milliy-sertifikat/MilliySertifikatEdTechGrid'
import MilliySertifikatBatafsil from '@/components/milliy-sertifikat/MilliySertifikatBatafsil'
import MilliySertifikatYangiliklari from '@/components/milliy-sertifikat/MilliySertifikatYangiliklari'
import MilliySertifikatEdTechFAQ from '@/components/milliy-sertifikat/MilliySertifikatEdTechFAQ'
import MilliySertifikatEdTechDisclaimer from '@/components/milliy-sertifikat/MilliySertifikatEdTechDisclaimer'
import MilliySertifikatSonggiYangiliklar from '@/components/milliy-sertifikat/MilliySertifikatSonggiYangiliklar'

const PAGE_TITLE =
	"Milliy Sertifikat Sanalari 2026: Imtihon Jadvali va Muddatlar ✅"
const PAGE_DESCRIPTION =
	"2026-yilgi milliy sertifikat imtihonlari sanalari rasman e'lon qilindi. Matematika, fizika, ona tili, tarix va boshqa barcha fanlar bo'yicha ro'yxatdan o'tish hamda 75% lik imtiyozlar haqida batafsil ma'lumot."

interface PageProps extends GetReadingListPageQuery {
	exams?: MilliySertifikatImtihon[]
	yangiliklar?: MilliySertifikatPost[]
}

const Page: FaustPage<PageProps> = (props) => {
	const p = props as unknown as PageProps
	const exams = p.exams ?? []
	const yangiliklar = p.yangiliklar ?? []

	return (
		<>
			<PageLayout
				headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
				footerMenuItems={props.data?.footerMenuItems?.nodes || []}
				pageFeaturedImageUrl={null}
				pageTitle={PAGE_TITLE}
				pageDescription={PAGE_DESCRIPTION}
				generalSettings={
					props.data?.generalSettings as NcgeneralSettingsFieldsFragmentFragment
				}
			>
				<Head>
					{exams.length > 0 && (
						<script
							type="application/ld+json"
							dangerouslySetInnerHTML={{
								__html: JSON.stringify(buildEventsSchema(exams)),
							}}
						/>
					)}
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(buildFAQSchema()),
						}}
					/>
				</Head>
				<MilliySertifikatEdTechWrap>
					<MilliySertifikatEdTechStats />
					<MilliySertifikatEdTechHero exams={exams} />
					<section aria-labelledby="imtihonlar-heading">
						<h2
							id="imtihonlar-heading"
							className="px-4 pt-4 text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl"
						>
							Imtihonlar jadvali
						</h2>
						<MilliySertifikatEdTechGrid items={exams} />
					</section>
					<MilliySertifikatBatafsil />
					<MilliySertifikatSonggiYangiliklar posts={yangiliklar} />
					<MilliySertifikatEdTechFAQ />
					<MilliySertifikatYangiliklari />
					<MilliySertifikatEdTechDisclaimer />
				</MilliySertifikatEdTechWrap>
			</PageLayout>
		</>
	)
}

Page.variables = () => ({
	headerLocation: PRIMARY_LOCATION,
	footerLocation: FOOTER_LOCATION,
})

Page.query = gql(`
  query GetReadingListPage($headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    generalSettings {
      ...NcgeneralSettingsFieldsFragment
    }
    primaryMenuItems: menuItems(where: { location: $headerLocation }, first: 80) {
      nodes {
        ...NcPrimaryMenuFieldsFragment
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }, first: 50) {
      nodes {
        ...NcFooterMenuFieldsFragment
      }
    }
  }
`)

export async function getStaticProps(ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> {
	const result = await getNextStaticProps(ctx, {
		Page,
		revalidate: REVALIDATE_TIME,
	})

	let exams: MilliySertifikatImtihon[] = []
	let yangiliklar: MilliySertifikatPost[] = []
	try {
		exams = await fetchMilliySertifikatImtihonlar()
	} catch (err) {
		console.error('Milliy sertifikat imtihonlari GraphQL xato:', err)
	}
	try {
		yangiliklar = await fetchMilliySertifikatYangiliklar()
	} catch (err) {
		console.error('Milliy sertifikat yangiliklar fetch xato:', err)
	}

	// Redirect yoki notFound bo'lsa, o'sha natijani qaytarish (result.props mavjud emas)
	if ('redirect' in result && result.redirect) return result
	if ('notFound' in result && result.notFound) return result

	// Normal props: Faust props ga exams va yangiliklar qo'shamiz
	const baseProps = 'props' in result ? result.props : {}
	return {
		props: { ...baseProps, exams, yangiliklar },
		revalidate: REVALIDATE_TIME,
	}
}

export default Page
