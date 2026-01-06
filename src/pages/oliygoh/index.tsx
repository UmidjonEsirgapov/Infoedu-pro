import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState, useMemo } from 'react';
import PageLayout from '@/container/PageLayout';
import { UniversitetListItem, UniversitetFilters } from '@/components/oliygoh';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';
import { getViloyatLabel } from '@/components/oliygoh/utils';

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
  // Get all universities from contentNodes
  const allUniversities = props.data?.contentNodesWithOliygoh?.nodes?.filter((node: any) => node.__typename === 'Oliygoh') || [];
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    viloyat: '',
    turi: '',
  });

  // Filter universities based on filters
  const filteredUniversities = useMemo(() => {
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
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Barcha Oliy Ta'lim Muassasalari
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-6">
                  O'zbekistondagi barcha universitetlar, institutlar va akademiyalar ro'yxati. 
                  Har bir muassasa haqida to'liq ma'lumotlar, kirish ballari va qabul kvotalari.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Jami: <span className="text-slate-900 dark:text-slate-100 font-bold text-lg">{allUniversities.length}</span> ta muassasa
                    </span>
                  </div>
                  {filters.search || filters.viloyat || filters.turi ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Topildi: <span className="text-slate-900 dark:text-slate-100 font-bold text-lg">{filteredUniversities.length}</span> ta
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="sticky top-4 lg:top-8 z-10">
                  <UniversitetFilters
                    onFilterChange={setFilters}
                    allUniversities={allUniversities}
                  />
                </div>
              </div>

              {/* Universities List */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                {filteredUniversities.length > 0 ? (
                  <div className="space-y-4">
                    {filteredUniversities.map((university) => (
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
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Hech narsa topilmadi
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {filters.search || filters.viloyat || filters.turi
                          ? 'Qidiruv shartlariga mos universitet topilmadi. Filtrlarni o\'zgartirib ko\'ring.'
                          : 'Hozircha universitetlar ro\'yxati mavjud emas.'}
                      </p>
                      {(filters.search || filters.viloyat || filters.turi) && (
                        <button
                          onClick={() => setFilters({ search: '', viloyat: '', turi: '' })}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                        >
                          Filtrlarni tozalash →
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

// Recursive function to get all universities
async function getAllUniversities(client: any, after: string | null = null, acc: any[] = []): Promise<any[]> {
  const { data } = await client.query({
    query: GET_ALL_OLIYGOH,
    variables: {
      first: 100,
      after,
      headerLocation: PRIMARY_LOCATION,
      footerLocation: FOOTER_LOCATION,
    },
    fetchPolicy: 'network-only',
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
      fetchPolicy: 'network-only',
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

    // Debug: check data structure
    console.log('Total universities fetched:', allUniversityNodes.length);
    if (allUniversityNodes.length > 0) {
      const sample = allUniversityNodes[0];
      console.log('Sample university data:', {
        title: sample.title,
        oliygohMalumotlari: sample.oliyygohMalumotlari,
        hasViloyat: !!sample.oliyygohMalumotlari?.viloyat,
        hasTuri: !!sample.oliyygohMalumotlari?.universitetTuri,
        viloyatValue: sample.oliyygohMalumotlari?.viloyat,
        turiValue: sample.oliyygohMalumotlari?.universitetTuri,
      });
      
      // Count universities with viloyat and turi
      const withViloyat = allUniversityNodes.filter((u: any) => {
        const vil = u.oliygohMalumotlari?.viloyat;
        return vil && (Array.isArray(vil) ? vil.length > 0 : vil);
      }).length;
      const withTuri = allUniversityNodes.filter((u: any) => {
        const tur = u.oliygohMalumotlari?.universitetTuri;
        return tur && (Array.isArray(tur) ? tur.length > 0 : tur);
      }).length;
      console.log(`Universities with viloyat: ${withViloyat}/${allUniversityNodes.length}`);
      console.log(`Universities with turi: ${withTuri}/${allUniversityNodes.length}`);
    }


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
