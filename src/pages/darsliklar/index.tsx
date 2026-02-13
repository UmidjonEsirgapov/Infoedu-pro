import React, { useMemo } from 'react';
import { GetStaticProps } from 'next';
import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';
import { NcgeneralSettingsFieldsFragmentFragment } from '@/__generated__/graphql';
import { trackButtonClick, GA_CATEGORIES } from '@/utils/analytics';

interface PageProps {
  data: {
    generalSettings?: NcgeneralSettingsFieldsFragmentFragment | null;
    primaryMenuItems?: {
      nodes?: any[];
    } | null;
    footerMenuItems?: {
      nodes?: any[];
    } | null;
  };
}

const GET_MENUS = gql`
  query GetDarsliklarMenus($headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    generalSettings {
      title
      description
      url
      language
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

export default function DarsliklarPage(props: PageProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  
  // Sinf raqamlari 1 dan 11 gacha
  const classes = Array.from({ length: 11 }, (_, i) => i + 1);

  // Get card style based on grade level
  const getCardStyle = (classNumber: number) => {
    // 1-4 Grades (Boshlang'ich): Bright, playful colors
    if (classNumber >= 1 && classNumber <= 4) {
      const gradients = [
        'bg-gradient-to-br from-yellow-400 to-orange-500',
        'bg-gradient-to-br from-pink-400 to-rose-500',
        'bg-gradient-to-br from-amber-400 to-yellow-500',
        'bg-gradient-to-br from-orange-400 to-pink-500',
      ];
      return {
        gradient: gradients[(classNumber - 1) % gradients.length],
        icon: (
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      };
    }
    
    // 5-9 Grades (O'rta): Cool colors
    if (classNumber >= 5 && classNumber <= 9) {
      const gradients = [
        'bg-gradient-to-br from-blue-500 to-cyan-500',
        'bg-gradient-to-br from-teal-500 to-green-500',
        'bg-gradient-to-br from-cyan-500 to-blue-500',
        'bg-gradient-to-br from-green-500 to-emerald-500',
        'bg-gradient-to-br from-indigo-500 to-purple-500',
      ];
      return {
        gradient: gradients[(classNumber - 5) % gradients.length],
        icon: (
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      };
    }
    
    // 10-11 Grades (Yuqori): Serious, premium colors
    const gradients = [
      'bg-gradient-to-br from-purple-600 to-indigo-800',
      'bg-gradient-to-br from-slate-700 to-blue-900',
    ];
    return {
      gradient: gradients[(classNumber - 10) % gradients.length],
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M12 14l-9-5M12 14l9-5M12 5v9" />
        </svg>
      ),
    };
  };

  // SEO Title and Description
  const seoTitle = useMemo(() => {
    return `Maktab darsliklarini bepul yuklab oling - ${currentYear} | ${props.data?.generalSettings?.title || 'InfoEdu'}`;
  }, [currentYear, props.data?.generalSettings?.title]);

  const seoDescription = useMemo(() => {
    return `1-sinfdan 11-sinfgacha barcha fanlar PDF formatda. O'zbekiston maktab dasturi asosida tayyorlangan elektron darsliklar. Bepul yuklab oling.`;
  }, []);

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`darsliklar, maktab darsliklari, ${currentYear} darsliklar, PDF darsliklar, elektron darsliklar`} />
        
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
        pageTitle="Maktab darsliklarini bepul yuklab oling"
        pageDescription={seoDescription}
        headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
        footerMenuItems={props.data?.footerMenuItems?.nodes || []}
        generalSettings={props.data?.generalSettings || null}
      >
        <div className="nc-Page-Darsliklar">
          <div className="container py-8 sm:py-12 lg:py-16">
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Maktab darsliklarini bepul yuklab oling
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium px-2">
                1-sinfdan 11-sinfgacha barcha fanlar PDF formatda
              </p>
            </div>

            {/* Class Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-16 px-2 sm:px-0">
              {classes.map((classNumber) => {
                const cardStyle = getCardStyle(classNumber);
                return (
                  <Link
                    key={classNumber}
                    href={`/darsliklar/${classNumber}`}
                    onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, `class_tile_click_${classNumber}`)}
                    className="group block"
                  >
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 overflow-hidden transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-xl sm:hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
                      {/* Gradient Background */}
                      <div className={`${cardStyle.gradient} p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]`}>
                        {/* Icon */}
                        <div className="mb-2 sm:mb-3 md:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                            {cardStyle.icon}
                          </div>
                        </div>
                        
                        {/* Class Number */}
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg">
                          {classNumber}
                        </div>
                        
                        {/* Class Label */}
                        <div className="text-xs sm:text-sm md:text-base font-bold text-white/90 uppercase tracking-wide">
                          {classNumber}-sinf
                        </div>
                      </div>

                      {/* Card Footer with CTA */}
                      <div className="p-2 sm:p-3 md:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Darsliklar
                          </span>
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Popular Classes Section */}
            <div className="mt-12 sm:mt-16 md:mt-20 px-2 sm:px-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 sm:mb-8 text-center">
                Mashhur sinflar
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {[9, 10, 11, 5, 6, 7].map((classNum) => {
                  const cardStyle = getCardStyle(classNum);
                  return (
                    <Link
                      key={classNum}
                      href={`/darsliklar/${classNum}`}
                      onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, `popular_class_click_${classNum}`)}
                      className="group block"
                    >
                      <div className="relative bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className={`${cardStyle.gradient} p-4 sm:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px]`}>
                          <div className="text-3xl sm:text-4xl font-black text-white mb-1 drop-shadow-lg">
                            {classNum}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-white/90 uppercase">
                            {classNum}-sinf
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* SEO Footer Content */}
            <div className="prose prose-slate dark:prose-invert max-w-4xl mx-auto mt-12 sm:mt-16 md:mt-20 px-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
                  O'zbekiston elektron darsliklar {currentYear}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Bizning saytda O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi tomonidan tasdiqlangan barcha sinflar uchun elektron darsliklar mavjud. <strong>1-sinfdan 11-sinfgacha</strong> bo'lgan barcha fanlardan darsliklarni <strong>PDF formatda bepul yuklab olish</strong> imkoniyati mavjud.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Har bir darslik yuqori sifatli skanerlangan nusxa bo'lib, asl kitobdagi barcha rasmlar, chizmalar va matnlar saqlanib qolgan. Darsliklarni telefon, planshet yoki kompyuteringizda o'qishingiz mumkin. TAS-IX tizimida joylashgan bo'lib, tez va trafikni tejagan holda yuklanadi.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>{currentYear}-yilgi yangi nashrlar</strong> va o'quv dasturiga mos keladigan barcha darsliklar doimiy yangilanib boriladi. O'quvchilar va ota-onalar uchun qulay interfeys va tez qidiruv imkoniyati taqdim etilgan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const client = getApolloClient();

  try {
    const { data } = await client.query({
      query: GET_MENUS,
      variables: {
        headerLocation: PRIMARY_LOCATION,
        footerLocation: FOOTER_LOCATION,
      },
    });

    return {
      props: {
        data: {
          generalSettings: data?.generalSettings || null,
          primaryMenuItems: data?.primaryMenuItems || null,
          footerMenuItems: data?.footerMenuItems || null,
        },
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching menus:', error);
    return {
      props: {
        data: {
          generalSettings: null,
          primaryMenuItems: null,
          footerMenuItems: null,
        },
      },
      revalidate: 3600,
    };
  }
};
