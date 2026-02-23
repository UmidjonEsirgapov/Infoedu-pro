import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';
import { VILOYAT_SLUGS, getViloyatLabelBySlug } from '@/components/oliygoh/utils';
import { BUTTON_TEXTS, TELEGRAM_LINKS } from '@/contains/buttonTexts';
import { trackTelegramChannelView } from '@/utils/analytics';

const UniversitetListItem = dynamic(() => import('@/components/oliygoh/UniversitetListItem'), {
  loading: () => <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse"><div className="h-32 bg-slate-100 rounded"></div></div>
});

const Pagination = dynamic(() => import('@/components/oliygoh/Pagination'), {
  loading: () => <div className="h-10"></div>
});

const GET_ALL_OLIYGOH = gql`
  query GetAllOliygohViloyat($first: Int!, $after: String, $headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    contentNodesWithOliygoh: contentNodes(first: $first, after: $after, where: { contentTypes: [OLIYGOH] }) {
      nodes {
        ... on Oliygoh {
          databaseId
          title
          slug
          uri
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          oliygohMalumotlari {
            viloyat
            universitetTuri
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    generalSettings {
      title
      description
    }
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
  }
`;

interface OliygohNode {
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  featuredImage?: {
    node?: {
      sourceUrl: string;
      altText?: string | null;
    } | null;
  } | null;
  oliygohMalumotlari?: {
    viloyat?: string | string[] | null;
    universitetTuri?: string | string[] | null;
  } | null;
}

interface PageProps {
  data?: {
    nodes: OliygohNode[];
    generalSettings?: { title?: string | null; description?: string | null } | null;
    primaryMenuItems?: { nodes?: any[] } | null;
    footerMenuItems?: { nodes?: any[] } | null;
  };
  viloyatSlug: string;
  viloyatLabel: string;
}

async function getAllUniversities(client: any, after: string | null = null, acc: any[] = []): Promise<any[]> {
  const { data } = await client.query({
    query: GET_ALL_OLIYGOH,
    variables: {
      first: 100,
      after,
      headerLocation: PRIMARY_LOCATION,
      footerLocation: FOOTER_LOCATION,
    },
    fetchPolicy: 'cache-first',
    context: { fetchOptions: { next: { revalidate: 3600 } } }
  });

  const nodes = data?.contentNodesWithOliygoh?.nodes?.filter((n: any) => n.__typename === 'Oliygoh') || [];
  acc = [...acc, ...nodes];

  if (data?.contentNodesWithOliygoh?.pageInfo?.hasNextPage) {
    acc = await getAllUniversities(client, data.contentNodesWithOliygoh.pageInfo.endCursor, acc);
  }
  return acc;
}

function filterByViloyat(nodes: any[], viloyatSlug: string, viloyatLabel: string): any[] {
  const slugNorm = viloyatSlug.toLowerCase().trim();
  return nodes.filter((node) => {
    const vil = (node as any).oliygohMalumotlari?.viloyat;
    if (!vil) return false;
    const arr = Array.isArray(vil) ? vil.filter(Boolean) : [vil].filter(Boolean);
    return arr.some((v: string) => {
      const s = (v || '').trim();
      return s === viloyatLabel || s.toLowerCase() === slugNorm;
    });
  });
}

export default function OliygohViloyatPage(props: PageProps) {
  const router = useRouter();
  const { data, viloyatSlug, viloyatLabel } = props;
  const nodes = data?.nodes || [];

  const ITEMS_PER_PAGE = 12;
  const currentPage = useMemo(() => {
    const p = router.query.page;
    const n = typeof p === 'string' ? parseInt(p, 10) : 1;
    return isNaN(n) || n < 1 ? 1 : n;
  }, [router.query.page]);

  const totalPages = Math.max(1, Math.ceil(nodes.length / ITEMS_PER_PAGE));
  const safePage = currentPage > totalPages ? 1 : currentPage;
  const paginatedNodes = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return nodes.slice(start, start + ITEMS_PER_PAGE);
  }, [nodes, safePage]);

  const handlePageChange = useCallback((page: number) => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, page: String(page) } },
      undefined,
      { scroll: false, shallow: true }
    );
  }, [router]);

  const BASE_URL = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://infoedu.uz';
  const baseUrl = BASE_URL.replace(/\/$/, '');

  const pageTitle = `${viloyatLabel}da joylashgan oliygohlar`;
  const siteTitle = data?.generalSettings?.title || 'Infoedu';
  const fullPageTitle = `${pageTitle} | ${siteTitle}`;
  const pageDescription = useMemo(() => {
    const count = nodes.length;
    return `${viloyatLabel}dagi oliy ta'lim muassasalari: ${count} ta universitet, institut va akademiya. Kirish ballari, qabul kvotalari va kontrakt narxlari haqida to'liq ma'lumot.`;
  }, [viloyatLabel, nodes.length]);

  const canonicalUrl = useMemo(() => {
    const path = `/oliygoh/viloyat/${viloyatSlug}`;
    return safePage > 1 ? `${baseUrl}${path}?page=${safePage}` : `${baseUrl}${path}`;
  }, [baseUrl, viloyatSlug, safePage]);

  const seoKeywords = useMemo(() => {
    return [
      `${viloyatLabel} oliygohlar`,
      `${viloyatLabel} universitetlar`,
      `${viloyatLabel}da joylashgan oliy ta'lim`,
      `oliygohlar ${viloyatLabel}`,
      `${viloyatLabel} kirish ballari`,
      `universitetlar ro'yxati ${viloyatLabel}`,
    ].join(', ');
  }, [viloyatLabel]);

  const ogImageUrl = `${baseUrl}/logo.png`;

  const breadcrumbSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: "Oliy ta'lim muassasalari", item: `${baseUrl}/oliygoh` },
      { '@type': 'ListItem', position: 3, name: viloyatLabel, item: `${baseUrl}/oliygoh/viloyat/${viloyatSlug}` },
    ],
  }), [baseUrl, viloyatLabel, viloyatSlug]);

  const itemListSchema = useMemo(() => {
    if (nodes.length === 0) return null;
    const listItems = nodes.slice(0, 20).map((node, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: node.title,
      url: `${baseUrl}/oliygoh/${node.slug}`,
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      description: pageDescription,
      numberOfItems: nodes.length,
      itemListElement: listItems,
    };
  }, [nodes, baseUrl, pageTitle, pageDescription]);

  const collectionPageSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: siteTitle,
      url: baseUrl,
    },
    about: {
      '@type': 'Place',
      name: viloyatLabel,
      addressRegion: viloyatLabel,
      addressCountry: 'UZ',
    },
  }), [pageTitle, pageDescription, canonicalUrl, siteTitle, baseUrl, viloyatLabel]);

  return (
    <>
      <Head>
        <title>{fullPageTitle}</title>
        <meta name="title" content={fullPageTitle} />
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="author" content="InfoEdu.uz" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="language" content="Uzbek" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={fullPageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="uz_UZ" />
        <meta property="og:site_name" content="InfoEdu.uz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={fullPageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />

        <meta name="geo.region" content="UZ" />
        <meta name="geo.placename" content={viloyatLabel} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {itemListSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
      </Head>

      <PageLayout
        headerMenuItems={data?.primaryMenuItems?.nodes || []}
        footerMenuItems={data?.footerMenuItems?.nodes || []}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        pageFeaturedImageUrl={null}
        generalSettings={data?.generalSettings as any || undefined}
        appendSiteName={false}
      >
        <div className="min-h-screen bg-slate-50/80 dark:bg-slate-900/80">
          <div className="border-b border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <Link href="/oliygoh" className="hover:text-slate-700 dark:hover:text-slate-300">
                  Oliy ta'lim muassasalari
                </Link>
                <span aria-hidden>/</span>
                <span className="text-slate-700 dark:text-slate-200 font-medium">{viloyatLabel}</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-xl min-[375px]:text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {viloyatLabel}da joylashgan oliygohlar
                  </h1>
                  <p className="mt-1.5 sm:mt-2 text-slate-600 dark:text-slate-400 text-xs min-[375px]:text-sm sm:text-base max-w-xl">
                    {viloyatLabel}dagi universitetlar, institutlar va akademiyalar ro'yxati
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 px-3 sm:px-4 py-2 min-h-[44px] shrink-0">
                  <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Jami</span>
                  <span className="text-slate-900 dark:text-white font-semibold tabular-nums text-sm sm:text-base">{nodes.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <a
              href={TELEGRAM_LINKS.subscribeChannel}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackTelegramChannelView('oliygoh_banner')}
              className="group flex items-center gap-3 sm:gap-4 w-full rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 p-4 min-h-[56px] sm:min-h-0 active:opacity-90 transition-opacity mb-6"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.174 1.858-.926 6.655-1.31 8.82-.168.929-.5 1.238-.82 1.27-.697.062-1.225-.46-1.9-.902-1.056-.705-1.653-1.143-2.678-1.83-1.185-.8-.418-1.241.259-1.96.178-.188 3.246-2.977 3.307-3.23.007-.031.014-.15-.056-.212-.07-.062-.173-.041-.248-.024-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.429-.008-1.253-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.895-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.64.099-.003.321.024.465.14.118.095.15.223.165.312.015.09.033.297.018.461z" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-white font-medium text-sm sm:text-base line-clamp-1">{BUTTON_TEXTS.telegramSubscribe}</span>
              </div>
              <svg className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>

            {nodes.length > 0 ? (
              <>
                <div className="mt-4 mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base">
                    {nodes.length} ta oliygoh
                  </span>
                  {totalPages > 1 && (
                    <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      · Sahifa {safePage} / {totalPages}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 sm:space-y-4 list-none p-0 m-0 -mx-1 sm:mx-0">
                  {paginatedNodes.map((university) => (
                    <li key={university.databaseId}>
                      <UniversitetListItem
                        title={university.title}
                        slug={university.slug}
                        featuredImage={university.featuredImage}
                        oliygohMalumotlari={university.oliygohMalumotlari}
                      />
                    </li>
                  ))}
                </ul>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 md:p-12 text-center">
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Ushbu viloyatda oliygohlar topilmadi</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                  Boshqa viloyatlar yoki barcha oliygohlar ro'yxatini ko'ring.
                </p>
                <Link
                  href="/oliygoh"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Barcha oliygohlar
                </Link>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = VILOYAT_SLUGS.map((viloyat) => ({
    params: { viloyat },
  }));
  return { paths, fallback: false };
};

const GET_MENUS = gql`
  query GetMenusViloyat($headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    generalSettings { title description }
    primaryMenuItems: menuItems(where: { location: $headerLocation }, first: 50) {
      nodes { id label uri parentId childItems { nodes { id label uri } } }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }, first: 50) {
      nodes { id label uri }
    }
  }
`;

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const viloyatSlug = ctx.params?.viloyat as string;
  if (!viloyatSlug || !VILOYAT_SLUGS.includes(viloyatSlug as any)) {
    return { notFound: true };
  }

  const viloyatLabel = getViloyatLabelBySlug(viloyatSlug);
  const client = getApolloClient();

  try {
    const allNodes = await getAllUniversities(client);
    const filtered = filterByViloyat(allNodes, viloyatSlug, viloyatLabel);

    const { data: menuData } = await client.query({
      query: GET_MENUS,
      variables: { headerLocation: PRIMARY_LOCATION, footerLocation: FOOTER_LOCATION },
      fetchPolicy: 'cache-first',
      context: { fetchOptions: { next: { revalidate: 3600 } } }
    });

    return {
      props: {
        data: {
          nodes: filtered,
          generalSettings: menuData?.generalSettings ?? null,
          primaryMenuItems: menuData?.primaryMenuItems ?? null,
          footerMenuItems: menuData?.footerMenuItems ?? null,
        },
        viloyatSlug,
        viloyatLabel,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching viloyat oliygohlar:', error);
    return {
      notFound: true,
    };
  }
};
