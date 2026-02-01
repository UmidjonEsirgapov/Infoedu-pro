import React, { useMemo } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';
import ClassSeoContent from '@/components/ClassSeoContent';
import { getGradientBySubject } from '@/components/GenerativeBookCover';
import { NC_GENERAL_SETTINGS_FIELDS_FRAGMENT } from '@/fragments/general';
import { NcgeneralSettingsFieldsFragmentFragment } from '@/__generated__/graphql';

interface Darslik {
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  darslikMalumotlari?: {
    sinf?: number | null;
    textbookFile?: {
      node?: {
        sourceUrl?: string | null;
        mediaItemUrl?: string | null;
      } | null;
    } | string | null;
  } | null;
  fanlar?: {
    nodes?: Array<{
      name?: string | null;
      slug?: string | null;
      uri?: string | null;
    } | null> | null;
  } | null;
}

interface PageProps {
  data: {
    darsliklar?: Darslik[];
    generalSettings?: NcgeneralSettingsFieldsFragmentFragment | null;
    primaryMenuItems?: {
      nodes?: any[];
    } | null;
    footerMenuItems?: {
      nodes?: any[];
    } | null;
  };
  sinfRaqami: number;
}

const GET_DARSLIKLAR_BY_CLASS = gql`
  query GetDarsliklarByClass($first: Int!, $after: String, $headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    contentNodesWithTextbooks: contentNodes(
      first: $first
      after: $after
      where: { 
        contentTypes: [TEXTBOOKS]
      }
    ) {
      nodes {
        ... on Textbook {
          databaseId
          title
          slug
          uri
          darslikMalumotlari {
            sinf
            textbookFile {
              node {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          fanlar {
            nodes {
              name
              slug
              uri
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    generalSettings {
      ...NcgeneralSettingsFieldsFragment
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
  ${NC_GENERAL_SETTINGS_FIELDS_FRAGMENT || ''}
`;

export default function SinfDarsliklarPage(props: PageProps) {
  const router = useRouter();
  const { sinfRaqami } = props;

  // Get current year for SEO
  const currentYear = new Date().getFullYear();

  // Generate SEO Title
  const seoTitle = useMemo(() => {
    return `${sinfRaqami}-sinf darsliklari ${currentYear} - barcha fanlar PDF yuklab olish`;
  }, [sinfRaqami, currentYear]);

  // Generate SEO Description
  const seoDescription = useMemo(() => {
    return `O'zbekiston maktablarining ${sinfRaqami}-sinf o'quvchilari uchun barcha fanlardan elektron darsliklar to'plami. Ona tili, Tarix, Algebra va boshqa kitoblarni bepul yuklab oling.`;
  }, [sinfRaqami]);

  // Filter darsliklar by class number
  const filteredDarsliklar = useMemo(() => {
    if (!props.data?.darsliklar) return [];
    
    return props.data.darsliklar.filter((darslik) => {
      const classNum = darslik.darslikMalumotlari?.sinf;
      const classNumAsNumber = typeof classNum === 'string' ? parseInt(classNum, 10) : classNum;
      return classNumAsNumber === sinfRaqami;
    });
  }, [props.data?.darsliklar, sinfRaqami]);

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${sinfRaqami}-sinf darsliklari, ${sinfRaqami}-sinf darsliklari skachat, ${sinfRaqami}-sinf pdf, darsliklar ${currentYear}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Head>
      <PageLayout 
        {...props}
        pageTitle={seoTitle}
        pageDescription={seoDescription}
        headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
        footerMenuItems={props.data?.footerMenuItems?.nodes || []}
        generalSettings={props.data?.generalSettings || null}
      >
        <div className="nc-Page-Sinf-Darsliklar">
          <div className="container py-8 sm:py-12 lg:py-16">
            {/* Breadcrumb */}
            <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link
                    href="/darsliklar"
                    className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Darsliklar
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-500">/</li>
                <li className="text-slate-900 dark:text-slate-100 font-medium">
                  {sinfRaqami}-sinf
                </li>
              </ol>
            </nav>

            {/* Header with Gradient Background */}
            <div className="relative mb-8 sm:mb-12 md:mb-16 px-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-purple-500/5 rounded-2xl sm:rounded-3xl -z-10" />
              <div className="relative p-6 sm:p-8 md:p-12 lg:p-16">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  {sinfRaqami}-sinf darsliklari
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                  {sinfRaqami}-sinf uchun barcha fanlardan elektron darsliklar to'plami. Har bir darslikni bosib, batafsil ma'lumot va yuklab olish imkoniyatini ko'ring.
                </p>
              </div>
            </div>

            {/* App Store Style Grid */}
            {filteredDarsliklar.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
                {filteredDarsliklar.map((darslik) => {
                  const subject = darslik.fanlar?.nodes?.[0]?.name || 'Fan';
                  const subjectSlug = darslik.fanlar?.nodes?.[0]?.slug;
                  const subjectLink = subjectSlug ? `/darsliklar/${sinfRaqami}/${subjectSlug}/` : null;
                  const gradientClass = getGradientBySubject(darslik.title);
                  
                  // Xavfsiz va sodda file check
                  const textbookFile = darslik.darslikMalumotlari?.textbookFile;
                  const fileUrl = typeof textbookFile === 'string' 
                    ? textbookFile 
                    : textbookFile?.node?.sourceUrl || textbookFile?.node?.mediaItemUrl || null;
                  const hasFile = !!fileUrl;
                  
                  return (
                    <Link
                      key={darslik.databaseId}
                      href={`/darsliklar/${sinfRaqami}/${darslik.slug}`}
                      className="group block"
                    >
                      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
                        {/* Gradient Cover */}
                        <div className={`relative aspect-[3/4] ${gradientClass} flex items-center justify-center p-3 sm:p-4`}>
                          {/* Class Number - Large */}
                          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white/90 drop-shadow-2xl">
                            {sinfRaqami}
                          </div>
                          
                          {/* PDF Badge */}
                          {hasFile && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                                PDF
                              </span>
                            </div>
                          )}
                          
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full -mr-8 sm:-mr-12 -mt-8 sm:-mt-12" />
                          <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 bg-white/5 rounded-full -ml-6 sm:-ml-10 -mb-6 sm:-mb-10" />
                        </div>

                        {/* Card Content */}
                        <div className="p-3 sm:p-4 md:p-5">
                          {/* Subject Badge */}
                          <div className="mb-1.5 sm:mb-2">
                            {subjectLink ? (
                              <Link
                                href={subjectLink}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.location.href = subjectLink;
                                }}
                                className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                {subject}
                              </Link>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {subject}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5 sm:mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                            {darslik.title}
                          </h3>

                          {/* File Size Badge */}
                          {hasFile && (
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                              <svg
                                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span>PDF</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}

            {/* Other Classes Quick Links */}
            <div className="mt-8 sm:mt-12 md:mt-16 px-2 sm:px-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">
                Boshqa sinflar
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Array.from({ length: 11 }, (_, i) => i + 1)
                  .filter(c => c !== sinfRaqami)
                  .slice(0, 8)
                  .map((classNum) => (
                    <Link
                      key={classNum}
                      href={`/darsliklar/${classNum}`}
                      className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold rounded-lg sm:rounded-xl shadow hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                    >
                      {classNum}-sinf
                    </Link>
                  ))}
                <Link
                  href="/darsliklar"
                  className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg sm:rounded-xl shadow hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                >
                  Barcha sinflar →
                </Link>
              </div>
            </div>

            {/* SEO Content Section - Below Grid */}
            {filteredDarsliklar.length > 0 && (
              <div className="prose prose-slate dark:prose-invert max-w-4xl mx-auto mt-8 sm:mt-12 md:mt-16 px-4">
                <ClassSeoContent classNumber={sinfRaqami} />
              </div>
            )}

            {/* No Textbooks Found Message */}
            {filteredDarsliklar.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 md:p-16 text-center shadow-lg">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Darsliklar topilmadi
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {sinfRaqami}-sinf uchun hozircha darsliklar mavjud emas. Boshqa sinflarni ko'rib chiqing.
                  </p>
                  <Link
                    href="/darsliklar"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Barcha sinflarga qaytish
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate paths for classes 1-11
  const paths = Array.from({ length: 11 }, (_, i) => ({
    params: { sinf_raqami: String(i + 1) },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const client = getApolloClient();
  const sinfRaqami = parseInt(ctx.params?.sinf_raqami as string, 10);

  if (isNaN(sinfRaqami) || sinfRaqami < 1 || sinfRaqami > 11) {
    return {
      notFound: true,
    };
  }

  try {
    // Fragment importini tekshirish
    if (!NC_GENERAL_SETTINGS_FIELDS_FRAGMENT) {
      console.error('[SERVER] NC_GENERAL_SETTINGS_FIELDS_FRAGMENT is undefined!');
      throw new Error('GraphQL fragment import failed');
    }

    // Fetch textbooks with pagination (optimized - stop early if we find enough)
    let allDarsliklar: Darslik[] = [];
    let hasNextPage = true;
    let after: string | null = null;
    let pageCount = 0;
    const MAX_PAGES = 20; // Reduced limit to prevent memory issues
    const BATCH_SIZE = 200; // Increased batch size to reduce requests
    let previousAfter: string | null = null;
    const MAX_RESULTS = 500; // Maximum results to prevent excessive memory usage
    
    while (hasNextPage && pageCount < MAX_PAGES && allDarsliklar.length < MAX_RESULTS) {
      const { data } = await client.query({
        query: GET_DARSLIKLAR_BY_CLASS,
        variables: {
          first: BATCH_SIZE,
          after,
          headerLocation: PRIMARY_LOCATION,
          footerLocation: FOOTER_LOCATION,
        },
      });

      const nodes = (data?.contentNodesWithTextbooks?.nodes || []).filter(
        (node: any) => node?.__typename === 'Textbook'
      ) as Darslik[];

      // Safety check: if no nodes returned, break the loop
      if (nodes.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SERVER] No more nodes found, breaking loop at page ${pageCount + 1}`);
        }
        break;
      }

      // Filter by sinf immediately to reduce memory usage
      // Xavfsiz data access uchun optional chaining ishlatamiz
      const filteredNodes = nodes.filter((darslik: any) => {
        // Xavfsiz textbookFile strukturasini normalizatsiya qilish
        if (darslik?.darslikMalumotlari?.textbookFile && 
            typeof darslik.darslikMalumotlari.textbookFile === 'object' &&
            darslik.darslikMalumotlari.textbookFile !== null) {
          // Agar node mavjud bo'lmasa, null qilamiz (xatolarni oldini olish uchun)
          if (!darslik.darslikMalumotlari.textbookFile.node) {
            darslik.darslikMalumotlari.textbookFile = null;
          }
        }
        
        const classNum = darslik?.darslikMalumotlari?.sinf;
        const classNumAsNumber = typeof classNum === 'string' ? parseInt(classNum, 10) : classNum;
        const matches = classNumAsNumber === sinfRaqami;
        
        // Debug for all sinflar
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SERVER] Darslik "${darslik?.title}": sinf=${classNum} (type: ${typeof classNum}), parsed=${classNumAsNumber}, target=${sinfRaqami}, matches=${matches}`);
        }
        
        return matches;
      });

      allDarsliklar = [...allDarsliklar, ...filteredNodes];

      const newHasNextPage = data?.contentNodesWithTextbooks?.pageInfo?.hasNextPage || false;
      const newAfter = data?.contentNodesWithTextbooks?.pageInfo?.endCursor || null;
      
      // Safety check: if cursor hasn't changed, break to prevent infinite loop
      if (newAfter === previousAfter && newAfter !== null) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[SERVER] Cursor hasn't changed (${newAfter}), breaking loop to prevent infinite loop`);
        }
        break;
      }

      hasNextPage = newHasNextPage;
      after = newAfter;
      previousAfter = newAfter;
      pageCount++;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[SERVER] Page ${pageCount}: fetched ${nodes.length} textbooks, filtered ${filteredNodes.length} for sinf ${sinfRaqami}, total so far: ${allDarsliklar.length}, hasNextPage: ${hasNextPage}`);
        
        // Debug: show sinf distribution for all sinflar
        if (nodes.length > 0) {
          const sinfDistribution = nodes.reduce((acc: any, d: any) => {
            const sinf = d.darslikMalumotlari?.sinf;
            const key = sinf !== null && sinf !== undefined ? String(sinf) : 'null/undefined';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
          console.log(`[SERVER] Sinf distribution in this batch:`, sinfDistribution);
          
          // Show first few darsliklar details for debugging
          if (pageCount === 1 && nodes.length > 0) {
            console.log(`[SERVER] First 3 darsliklar details:`);
            nodes.slice(0, 3).forEach((d: any, idx: number) => {
              console.log(`  [${idx + 1}] "${d.title}": sinf=${d.darslikMalumotlari?.sinf} (type: ${typeof d.darslikMalumotlari?.sinf})`);
            });
          }
        }
      }
    }

    if (pageCount >= MAX_PAGES && hasNextPage) {
      console.warn(`[SERVER] Reached MAX_PAGES limit (${MAX_PAGES}), some textbooks may be missing`);
    }

    // Get menu items from a separate query
    let generalSettings = null;
    let primaryMenuItems = null;
    let footerMenuItems = null;

    try {
      const { data: menuData } = await client.query({
        query: GET_DARSLIKLAR_BY_CLASS,
        variables: {
          first: 1,
          after: null,
          headerLocation: PRIMARY_LOCATION,
          footerLocation: FOOTER_LOCATION,
        },
      });

      generalSettings = menuData?.generalSettings || null;
      primaryMenuItems = menuData?.primaryMenuItems || null;
      footerMenuItems = menuData?.footerMenuItems || null;
    } catch (menuError) {
      console.error('[SERVER] Error fetching menu data:', menuError);
      // Continue with null values - page will still work without menus
    }

    // Already filtered during pagination, no need to filter again
    const filteredDarsliklar = allDarsliklar;

    return {
      props: {
        data: {
          darsliklar: filteredDarsliklar,
          generalSettings,
          primaryMenuItems,
          footerMenuItems,
        },
        sinfRaqami,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching darsliklar:', error);
    return {
      props: {
        data: {
          darsliklar: [],
          generalSettings: null,
          primaryMenuItems: null,
          footerMenuItems: null,
        },
        sinfRaqami,
      },
      revalidate: 3600,
    };
  }
};
