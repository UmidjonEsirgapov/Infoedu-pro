import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';

// Lazy load komponentlar
const UniversitetFilters = dynamic(() => import('@/components/oliygoh/UniversitetFilters'), {
  loading: () => <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"><div className="h-64 bg-slate-100 rounded"></div></div>
});

const UniversitetListItem = dynamic(() => import('@/components/oliygoh/UniversitetListItem'), {
  loading: () => <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse"><div className="h-32 bg-slate-100 rounded"></div></div>
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
  // Get all universities from contentNodes - memoize
  const allUniversities = useMemo(() => {
    return props.data?.contentNodesWithOliygoh?.nodes?.filter((node: any) => node.__typename === 'Oliygoh') || [];
  }, [props.data?.contentNodesWithOliygoh?.nodes]);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    viloyat: '',
    turi: '',
  });

  // Memoize filter handler
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
              <div className="text-center max-w-4xl mx-auto">
                {/* Icon */}
                <div className="mb-4 sm:mb-6 flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-5 md:mb-6 leading-tight drop-shadow-lg">
                  Oliy Ta'lim Muassasalari
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 dark:text-slate-200 mb-6 sm:mb-8 px-2 sm:px-0 leading-relaxed font-medium">
                  O'zbekistondagi barcha universitetlar, institutlar va akademiyalar ro'yxati
                </p>

                {/* Stats Cards */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl px-4 sm:px-6 py-3 sm:py-4 border border-white/30 dark:border-white/20 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 dark:bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white/80 dark:text-slate-300 text-xs sm:text-sm font-medium">Jami muassasalar</div>
                        <div className="text-white text-xl sm:text-2xl font-bold">{allUniversities.length}</div>
                      </div>
                    </div>
                  </div>

                  {filters.search || filters.viloyat || filters.turi ? (
                    <div className="bg-green-500/20 dark:bg-green-500/10 backdrop-blur-md rounded-xl px-4 sm:px-6 py-3 sm:py-4 border border-green-400/30 dark:border-green-400/20 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/30 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white/80 dark:text-green-200 text-xs sm:text-sm font-medium">Topildi</div>
                          <div className="text-white text-xl sm:text-2xl font-bold">{filteredUniversities.length}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 -mt-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="lg:sticky lg:top-6 z-10">
                  <UniversitetFilters
                    onFilterChange={handleFilterChange}
                    allUniversities={allUniversities}
                  />
                </div>
              </div>

              {/* Universities List */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                {/* Results Header */}
                {filteredUniversities.length > 0 && (
                  <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                        {filters.search || filters.viloyat || filters.turi 
                          ? `${filteredUniversities.length} ta natija topildi`
                          : `Barcha muassasalar (${filteredUniversities.length})`
                        }
                      </h2>
                      {(filters.search || filters.viloyat || filters.turi) && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Qidiruv natijalari
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {filteredUniversities.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredUniversities.map((university, index) => (
                      <UniversitetListItem
                        key={university.databaseId}
                        title={university.title}
                        slug={university.slug}
                        featuredImage={university.featuredImage}
                        oliygohMalumotlari={(university as any).oliygohMalumotlari}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 md:p-16 text-center shadow-lg">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                        Hech narsa topilmadi
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        {filters.search || filters.viloyat || filters.turi
                          ? 'Qidiruv shartlariga mos universitet topilmadi. Filtrlarni o\'zgartirib ko\'ring yoki boshqa so\'zlar bilan qidiring.'
                          : 'Hozircha universitetlar ro\'yxati mavjud emas.'}
                      </p>
                      {(filters.search || filters.viloyat || filters.turi) && (
                        <button
                          onClick={() => setFilters({ search: '', viloyat: '', turi: '' })}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-manipulation"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Filtrlarni tozalash
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
      revalidate: 60,
    };
  }
};
