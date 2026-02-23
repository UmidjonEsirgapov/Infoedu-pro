import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';
import { BUTTON_TEXTS, TELEGRAM_LINKS } from '@/contains/buttonTexts';
import { trackTelegramChannelView } from '@/utils/analytics';

// Lazy load komponentlar
const UniversitetFilters = dynamic(() => import('@/components/oliygoh/UniversitetFilters'), {
  loading: () => <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"><div className="h-64 bg-slate-100 rounded"></div></div>
});

const UniversitetListItem = dynamic(() => import('@/components/oliygoh/UniversitetListItem'), {
  loading: () => <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse"><div className="h-32 bg-slate-100 rounded"></div></div>
});

const Pagination = dynamic(() => import('@/components/oliygoh/Pagination'), {
  loading: () => <div className="h-10"></div>
});

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
    contentNodesWithOliygoh?: {
      nodes?: Array<OliygohNode & { __typename?: string }>;
      pageInfo?: {
        hasNextPage: boolean;
        endCursor?: string | null;
      };
    } | null;
    generalSettings?: {
      title?: string | null;
      description?: string | null;
    } | null;
    primaryMenuItems?: {
      nodes?: any[];
    } | null;
    footerMenuItems?: {
      nodes?: any[];
    } | null;
  };
}

const GET_ALL_OLIYGOH = gql`
  query GetAllOliygoh($first: Int!, $after: String, $headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    # Use contentNodes with OLIYGOH content type (more reliable)
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

interface FilterState {
  search: string;
  viloyat: string;
  turi: string;
}

export default function OliygohlarPage(props: PageProps) {
  const router = useRouter();
  
  // Get all universities from contentNodes - memoize
  const allUniversities = useMemo(() => {
    return props.data?.contentNodesWithOliygoh?.nodes?.filter((node: any) => node.__typename === 'Oliygoh') || [];
  }, [props.data?.contentNodesWithOliygoh?.nodes]);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    viloyat: '',
    turi: '',
  });

  // Pagination settings
  const ITEMS_PER_PAGE = 12;
  
  // Get current page from URL query or default to 1
  const currentPage = useMemo(() => {
    const page = router.query.page;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : 1;
    return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  }, [router.query.page]);

  // Memoize filter handler — shallow: true bo'lmasa sahifa qayta yuklanib, filter state yo'qoladi
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    if (currentPage > 1) {
      router.push(
        { pathname: router.pathname, query: { ...router.query, page: '1' } },
        undefined,
        { scroll: false, shallow: true }
      );
    }
  }, [currentPage, router]);

  // Filter universities based on filters - optimized
  const filteredUniversities = useMemo(() => {
    if (!filters.search && !filters.viloyat && !filters.turi) {
      return allUniversities;
    }

    return allUniversities.filter((university) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = university.title?.toLowerCase().includes(searchLower);
        if (!titleMatch) return false;
      }

      // Viloyat filter
      if (filters.viloyat) {
        const vil = (university as any).oliygohMalumotlari?.viloyat;
        if (!vil) return false;
        const viloyatArray = Array.isArray(vil) ? vil.filter(Boolean) : [vil].filter(Boolean);
        if (!viloyatArray.includes(filters.viloyat)) return false;
      }

      // Turi filter
      if (filters.turi) {
        const tur = (university as any).oliygohMalumotlari?.universitetTuri;
        if (!tur) return false;
        const turiArray = Array.isArray(tur) ? tur.filter(Boolean) : [tur].filter(Boolean);
        if (!turiArray.includes(filters.turi)) return false;
      }

      return true;
    });
  }, [allUniversities, filters]);

  // Pagination calculations
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE));
  }, [filteredUniversities.length]);

  // Agar URL da page=3 bo'lsa lekin filtrlangan ro'yxatda 1 sahifa bo'lsa — 1-sahifani ko'rsatamiz
  const safePage = currentPage > totalPages ? 1 : currentPage;

  // Get paginated universities (safePage ishlatamiz, shunda filter o'zgarganda bo'sh chiqmas)
  const paginatedUniversities = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUniversities.slice(startIndex, endIndex);
  }, [filteredUniversities, safePage]);

  // Handle page change — shallow: true bilan sahifa refresh bo'lmaydi, state saqlanadi
  const handlePageChange = useCallback((page: number) => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, page: String(page) } },
      undefined,
      { scroll: false, shallow: true }
    );
  }, [router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1 && (filters.search || filters.viloyat || filters.turi)) {
      const newTotalPages = Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages) {
        handlePageChange(1);
      }
    }
  }, [filters, filteredUniversities.length, currentPage, handlePageChange]);

  const siteTitle = props.data?.generalSettings?.title || 'Infoedu';
  const pageTitle = `Barcha Oliy Ta'lim Muassasalari | ${siteTitle}`;
  const pageDescription = `O'zbekistondagi barcha oliy ta'lim muassasalari ro'yxati. Universitetlar, institutlar va akademiyalar haqida to'liq ma'lumotlar.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Head>

      <PageLayout
        headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
        footerMenuItems={props.data?.footerMenuItems?.nodes || []}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        pageFeaturedImageUrl={null}
        generalSettings={props.data?.generalSettings as any || undefined}
      >
        <div className="min-h-screen bg-slate-50/80 dark:bg-slate-900/80">
          {/* Hero — minimalist, mobile-friendly */}
          <div className="border-b border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
                <div className="min-w-0">
                  <h1 className="text-xl min-[375px]:text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight break-words">
                    Oliy ta'lim muassasalari kirish ballari
                  </h1>
                  <p className="mt-1.5 sm:mt-2 text-slate-600 dark:text-slate-400 text-xs min-[375px]:text-sm sm:text-base max-w-xl">
                    O'zbekistondagi universitetlar, institutlar va akademiyalar ro'yxati
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 shrink-0">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px]">
                    <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Jami</span>
                    <span className="text-slate-900 dark:text-white font-semibold tabular-nums text-sm sm:text-base">{allUniversities.length}</span>
                  </div>
                  {(filters.search || filters.viloyat || filters.turi) && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] text-emerald-700 dark:text-emerald-300">
                      <span className="text-xs sm:text-sm">Topildi</span>
                      <span className="font-semibold tabular-nums text-sm sm:text-base">{filteredUniversities.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content — full width, filters on top, safe padding on mobile */}
          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            {/* Filter bar — above list */}
            <div className="mb-4 sm:mb-6">
              <UniversitetFilters
                value={filters}
                onFilterChange={handleFilterChange}
                allUniversities={allUniversities}
                variant="inline"
              />
            </div>

            {/* Telegram banner — compact, touch-friendly */}
            <a
              href={TELEGRAM_LINKS.subscribeChannel}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackTelegramChannelView('oliygoh_banner')}
              className="group flex items-center gap-3 sm:gap-4 w-full rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 p-4 min-h-[56px] sm:min-h-0 active:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.174 1.858-.926 6.655-1.31 8.82-.168.929-.5 1.238-.82 1.27-.697.062-1.225-.46-1.9-.902-1.056-.705-1.653-1.143-2.678-1.83-1.185-.8-.418-1.241.259-1.96.178-.188 3.246-2.977 3.307-3.23.007-.031.014-.15-.056-.212-.07-.062-.173-.041-.248-.024-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.429-.008-1.253-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.895-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.64.099-.003.321.024.465.14.118.095.15.223.165.312.015.09.033.297.018.461z" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-white font-medium text-sm sm:text-base line-clamp-1">{BUTTON_TEXTS.telegramSubscribe}</span>
                <span className="text-white/80 text-sm hidden sm:inline ml-2">— {BUTTON_TEXTS.telegramSubscribeDescription}</span>
              </div>
              <svg className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* Results header */}
            {filteredUniversities.length > 0 && (
              <div className="mt-4 sm:mt-6 mb-3 sm:mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base">
                  {filters.search || filters.viloyat || filters.turi
                    ? `${filteredUniversities.length} ta natija`
                    : `Barcha muassasalar (${filteredUniversities.length})`}
                </span>
                {totalPages > 1 && (
                  <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                    · Sahifa {safePage} / {totalPages}
                  </span>
                )}
              </div>
            )}

            {filteredUniversities.length > 0 ? (
              <>
                <ul className="space-y-3 sm:space-y-4 list-none p-0 m-0 -mx-1 sm:mx-0">
                  {paginatedUniversities.map((university) => (
                    <li key={university.databaseId}>
                      <UniversitetListItem
                        title={university.title}
                        slug={university.slug}
                        featuredImage={university.featuredImage}
                        oliygohMalumotlari={(university as any).oliygohMalumotlari}
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
                  <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Hech narsa topilmadi</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                  {filters.search || filters.viloyat || filters.turi
                    ? "Filtrlarni o'zgartirib ko'ring yoki boshqa so'zlar bilan qidiring."
                    : "Hozircha ro'yxat mavjud emas."}
                </p>
                {(filters.search || filters.viloyat || filters.turi) && (
                  <button
                    onClick={() => setFilters({ search: '', viloyat: '', turi: '' })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    {BUTTON_TEXTS.clearFilters}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
}

// Recursive function to get all universities - optimized with caching
async function getAllUniversities(client: any, after: string | null = null, acc: any[] = []): Promise<any[]> {
  const { data } = await client.query({
    query: GET_ALL_OLIYGOH,
    variables: {
      first: 100,
      after,
      headerLocation: PRIMARY_LOCATION,
      footerLocation: FOOTER_LOCATION,
    },
    fetchPolicy: 'cache-first', // Use cache when possible
    context: {
      fetchOptions: {
        next: { revalidate: 3600 } // Revalidate every hour
      }
    }
  });

  const nodes = data?.contentNodesWithOliygoh?.nodes?.filter((node: any) => node.__typename === 'Oliygoh') || [];
  acc = [...acc, ...nodes];

  if (data?.contentNodesWithOliygoh?.pageInfo?.hasNextPage) {
    acc = await getAllUniversities(client, data.contentNodesWithOliygoh.pageInfo.endCursor, acc);
  }

  return acc;
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const client = getApolloClient();

  try {
    // Get all universities recursively
    const allUniversityNodes = await getAllUniversities(client);
    
    // Get menu items separately
    const { data: menuData } = await client.query({
      query: gql`
        query GetMenus($headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
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
      `,
      variables: {
        headerLocation: PRIMARY_LOCATION,
        footerLocation: FOOTER_LOCATION,
      },
      fetchPolicy: 'cache-first', // Use cache when possible
      context: {
        fetchOptions: {
          next: { revalidate: 3600 } // Revalidate every hour
        }
      }
    });

    // Combine data
    const data = {
      contentNodesWithOliygoh: {
        nodes: allUniversityNodes,
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
      generalSettings: menuData?.generalSettings,
      primaryMenuItems: menuData?.primaryMenuItems,
      footerMenuItems: menuData?.footerMenuItems,
    };

    return {
      props: {
        data: data || null,
      },
      revalidate: 3600, // 1 soatda bir marta yangilash
    };
  } catch (error) {
    console.error('Error fetching universities:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return {
      props: {
        data: {
          contentNodesWithOliygoh: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
          generalSettings: null,
          primaryMenuItems: { nodes: [] },
          footerMenuItems: { nodes: [] },
        },
      },
      revalidate: 3600, // 1 soat — ISR Writes limitini tejash
    };
  }
};
