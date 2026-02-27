import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import PageLayout from '@/container/PageLayout'
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu'
import { GetServerSideProps } from 'next'
import { getApolloClient } from '@faustwp/core'
import { gql } from '@apollo/client'
import type { NcgeneralSettingsFieldsFragmentFragment } from '@/__generated__/graphql'

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz'

const MAIN_SECTIONS = [
  { label: 'Bosh sahifa', href: '/' },
  { label: "Oliy ta'lim muassasalari", href: '/oliygoh' },
  { label: 'Darsliklar', href: '/darsliklar' },
  { label: 'Yangiliklar', href: '/posts' },
  { label: 'Milliy sertifikat sanalari', href: '/milliy-sertifikat-sanalari' },
  { label: 'Pedagog kadrlar attestatsiyasi', href: '/pedagog-kadrlar-attestatsiyasi' },
  { label: 'Reklama', href: '/reklama' },
  { label: 'Aloqa', href: '/contact' },
]

export default function SitemapPage({
  headerMenuItems,
  footerMenuItems,
  generalSettings,
}: {
  headerMenuItems: any[]
  footerMenuItems: any[] | null
  generalSettings: NcgeneralSettingsFieldsFragmentFragment | null
}) {
  const title = 'Sayt xaritasi (HTML)'
  const siteName = generalSettings?.title || 'InfoEdu'

  return (
    <>
      <Head>
        <title>{`${title} - ${siteName}`}</title>
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${BASE_URL.replace(/\/$/, '')}/sitemap`} />
      </Head>
      <PageLayout
        headerMenuItems={headerMenuItems}
        footerMenuItems={footerMenuItems}
        pageTitle={title}
        generalSettings={generalSettings}
        appendSiteName={true}
      >
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Sayt xaritasi
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Google va boshqa qidiruv tizimlari uchun sahifalar ro&apos;yxati.
              XML sitemap: <a href="/sitemap.xml" className="text-blue-600 dark:text-blue-400 hover:underline">/sitemap.xml</a>
            </p>
            <nav aria-label="Sayt xaritasi">
              <ul className="space-y-2">
                {MAIN_SECTIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </PageLayout>
    </>
  )
}

const MENU_QUERY = gql`
  query SitemapPageMenus($headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    primaryMenuItems: menuItems(where: { location: $headerLocation }, first: 50) {
      nodes {
        id
        label
        uri
        parentId
        childItems {
          nodes {
            id
            label
            uri
          }
        }
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }, first: 50) {
      nodes {
        id
        label
        uri
      }
    }
    generalSettings {
      title
      description
    }
  }
`

export const getServerSideProps: GetServerSideProps = async () => {
  const client = getApolloClient()
  const { data } = await client.query({
    query: MENU_QUERY,
    variables: {
      headerLocation: PRIMARY_LOCATION,
      footerLocation: FOOTER_LOCATION,
    },
  })

  const gs = data?.generalSettings
  return {
    props: {
      headerMenuItems: data?.primaryMenuItems?.nodes ?? [],
      footerMenuItems: data?.footerMenuItems?.nodes ?? null,
      generalSettings: gs ? { __typename: 'GeneralSettings' as const, ...gs } : null,
    },
  }
}
