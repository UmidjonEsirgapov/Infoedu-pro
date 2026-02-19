import React, { useMemo } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import Head from 'next/head';
import Link from 'next/link';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';
import GenerativeBookCover from '@/components/GenerativeBookCover';
import SEOContentExpander from '@/components/SEOContentExpander';
import SchemaOrgDarslik from '@/components/SchemaOrg/SchemaOrgDarslik';
import { NcgeneralSettingsFieldsFragmentFragment } from '@/__generated__/graphql';
import { BUTTON_TEXTS, TELEGRAM_LINKS } from '@/contains/buttonTexts';
import { trackButtonClick, trackTelegramChannelView, GA_CATEGORIES } from '@/utils/analytics';

interface Darslik {
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  content?: string | null;
  darslikMalumotlari?: {
    sinf?: number | null;
    textbookFile?: {
      node?: {
        sourceUrl?: string | null;
        mediaItemUrl?: string | null;
        mimeType?: string | null;
        fileSize?: string | null;
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
    darslik?: Darslik | null;
    similarTextbooks?: Darslik[];
    generalSettings?: NcgeneralSettingsFieldsFragmentFragment | null;
    primaryMenuItems?: {
      nodes?: any[];
    } | null;
    footerMenuItems?: {
      nodes?: any[];
    } | null;
  };
  sinfRaqami: number;
  slug: string;
}

const GET_DARSLIK_BY_SLUG = gql`
  query GetDarslikBySlug($uri: String!, $slug: String, $headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    nodeByUri(uri: $uri) {
      ... on Textbook {
        databaseId
        title
        slug
        uri
        content
        darslikMalumotlari {
          sinf
          textbookFile {
            node {
              sourceUrl
              mediaItemUrl
              mimeType
              fileSize
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
    # Fallback 1: aniq slug bo'yicha (WordPress "name" = slug)
    textbookBySlug: textbooks(where: { name: $slug }, first: 1) {
      nodes {
        databaseId
        title
        slug
        uri
        content
        darslikMalumotlari {
          sinf
          textbookFile {
            node {
              sourceUrl
              mediaItemUrl
              mimeType
              fileSize
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
    # Fallback 2: qidiruv (search) — faqat textbookBySlug ishlamasa
    textbooks(where: { search: $slug }, first: 10) {
      nodes {
        databaseId
        title
        slug
        uri
        content
        darslikMalumotlari {
          sinf
          textbookFile {
            node {
              sourceUrl
              mediaItemUrl
              mimeType
              fileSize
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

const GET_SIMILAR_TEXTBOOKS = gql`
  query GetSimilarTextbooks($first: Int!, $headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    contentNodes(
      first: $first
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
              }
            }
          }
          fanlar {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
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

const GET_ALL_DARSLIK_SLUGS = gql`
  query GetAllDarslikSlugs($after: String) {
    contentNodes(first: 1000, after: $after, where: { contentTypes: [TEXTBOOKS] }) {
      nodes {
        ... on Textbook {
          slug
          darslikMalumotlari {
            sinf
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export default function DarslikDetailPage(props: PageProps) {
  const { data, sinfRaqami, slug } = props;
  const darslik = data?.darslik;

  if (!darslik) {
    return (
      <PageLayout {...props}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Darslik topilmadi
          </h1>
          <Link
            href={`/darsliklar/${sinfRaqami}`}
            onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, `textbook_not_found_back_${sinfRaqami}`)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sinf sahifasiga qaytish
          </Link>
        </div>
      </PageLayout>
    );
  }

  const subject = darslik.fanlar?.nodes?.[0]?.name || 'Fan';
  const sinf = darslik.darslikMalumotlari?.sinf || sinfRaqami;
  
  // ACF file field - sourceUrl orqali fayl URL'ini olamiz
  const textbookFile = darslik.darslikMalumotlari?.textbookFile;
  const fileNode = typeof textbookFile === 'string' ? null : (typeof textbookFile === 'object' ? textbookFile?.node : null);
  let fileUrl = typeof textbookFile === 'string' 
    ? textbookFile 
    : (fileNode?.sourceUrl || fileNode?.mediaItemUrl || null);
  const mimeType = fileNode?.mimeType || null;
  const fileSize = fileNode?.fileSize || null;
  
  // Format file size for display
  const formatFileSize = (size: string | null): string => {
    if (!size) return 'Noma\'lum';
    const bytes = parseInt(size);
    if (isNaN(bytes)) return size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const displayFileSize = formatFileSize(fileSize);

  // Agar URL rasm formatida (.jpg, .png) bo'lsa, lekin MIME type PDF bo'lsa,
  // URL'ni PDF formatiga o'zgartirish (WordPress ba'zida thumbnail URL'ini qaytaradi)
  if (fileUrl && mimeType && mimeType.toLowerCase().includes('pdf')) {
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      fileUrl = fileUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.pdf');
    }
  }

  const handleDownload = async () => {
    if (!fileUrl) {
      console.error('Fayl URL mavjud emas');
      console.error('Textbook File Object:', textbookFile);
      alert('Fayl mavjud emas');
      return;
    }

    trackButtonClick(GA_CATEGORIES.Textbooks, `pdf_download_click_${sinf}_${darslik.slug}`);

    // ACF file field'ning sourceUrl yoki mediaItemUrl to'liq URL qaytaradi
    // URL'ni to'g'rilaymiz: domain va fayl nomini
    let finalUrl = fileUrl;

    // Agar URL to'liq bo'lsa (http:// yoki https:// bilan boshlansa), to'g'ridan-to'g'ri ishlatamiz
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
      // Agar nisbiy URL bo'lsa (masalan, /wp-content/uploads/...)
      // WordPress domain'ini qo'shamiz
      const wordPressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') || '';
      finalUrl = fileUrl.startsWith('/') 
        ? `${wordPressUrl}${fileUrl}` 
        : `${wordPressUrl}/${fileUrl}`;
    }

    // 1. Domain'ni infoedu.uz dan infoedu.trafik.uz ga o'zgartirish
    if (finalUrl.includes('infoedu.uz') && !finalUrl.includes('infoedu.trafik.uz')) {
      finalUrl = finalUrl.replace(/infoedu\.uz/g, 'infoedu.trafik.uz');
    }

    // 2. Fayl nomidagi -pdf qismini olib tashlash (masalan, umumiy_kimyo_11_uzb-pdf.pdf -> umumiy_kimyo_11_uzb.pdf)
    if (finalUrl.match(/-pdf\.(pdf|jpg|jpeg|png|gif|webp|doc|docx)$/i)) {
      finalUrl = finalUrl.replace(/-pdf\.(pdf|jpg|jpeg|png|gif|webp|doc|docx)$/i, '.$1');
    }

    // To'g'ridan-to'g'ri WordPress hostingiga yo'naltirish — Vercel Origin Transfer limitini tejash
    const link = document.createElement('a');
    link.href = finalUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 100);
  };

  // Get current year for SEO
  const currentYear = new Date().getFullYear();

  // Generate SEO Title (optimized for browser tab display)
  // Format: "{title} darsligi {currentYear}-yil, yangi nashr yuklab olish"
  // Note: PageLayout SEO component will add " - " + generalSettings.title, so we provide title without site name
  const seoTitle = useMemo(() => {
    // Debug: check if darslik exists
    if (!darslik) {
      console.warn('Darslik is null or undefined');
      return `Darsligi ${currentYear}-yil, yangi nashr yuklab olish`;
    }
    
    if (!darslik.title) {
      console.warn('Darslik title is missing');
      return `Darsligi ${currentYear}-yil, yangi nashr yuklab olish`;
    }
    
    // Limit title length for browser tab (max ~60 chars recommended)
    const titlePart = darslik.title.length > 40 
      ? `${darslik.title.substring(0, 40)}...` 
      : darslik.title;
    
    const finalTitle = `${titlePart} darsligi ${currentYear}-yil, yangi nashr yuklab olish`;
    
    // Debug: log the title
    if (process.env.NODE_ENV === 'development') {
      console.log('SEO Title (for PageLayout):', finalTitle);
    }
    
    return finalTitle;
  }, [darslik?.title, currentYear]);

  // Full SEO Title with site name (for Head component and OG tags)
  const fullSeoTitle = useMemo(() => {
    return `${seoTitle} | InfoEdu`;
  }, [seoTitle]);

  // Generate SEO Meta Description
  const seoMetaDescription = useMemo(() => {
    return `🏫 ${sinf}-sinf o'quvchilari uchun ${darslik.title} fanidan yangi ${currentYear}-yilgi darslik. 📥 PDF formatda bepul yuklab oling. O'zbekiston maktab dasturi asosida.`;
  }, [sinf, darslik.title, currentYear]);

  // Generate SEO Keywords
  const seoKeywords = useMemo(() => {
    return `${darslik.title}, ${darslik.title} ${sinf}-sinf, ${darslik.title} pdf yuklab olish, darsliklar ${currentYear}, ${darslik.title} yangi nashr`;
  }, [darslik.title, sinf, currentYear]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || props.data?.generalSettings?.url?.replace(/\/$/, '') || 'https://infoedu.uz';
  const canonicalUrl = `${baseUrl}/darsliklar/${sinfRaqami}/${slug || darslik?.slug || ''}`;
  // OG Image — SSR va client'da to'liq URL
  const ogImageUrl = useMemo(() => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : baseUrl;
    return `${siteUrl}/logo.png`;
  }, [baseUrl]);

  // Generate SEO description for content
  const seoDescription = useMemo(() => {
    return `Ushbu sahifada umumta'lim maktablarining ${sinf}-sinf o'quvchilari uchun mo'ljallangan ${darslik.title} darsligini yuklab olishingiz mumkin. Kitob O'zbekiston Xalq ta'limi vazirligi standartlari asosida tayyorlangan. Fayl formati PDF bo'lib, hajmi ${displayFileSize}. Darslikni pastdagi tugma orqali bepul yuklab oling.`;
  }, [sinf, darslik.title, displayFileSize]);

  // Filter similar textbooks (same class, exclude current)
  const similarTextbooks = useMemo(() => {
    if (!props.data?.similarTextbooks) return [];
    return props.data.similarTextbooks
      .filter((t) => t.databaseId !== darslik.databaseId && t.darslikMalumotlari?.sinf === sinf)
      .slice(0, 6);
  }, [props.data?.similarTextbooks, darslik.databaseId, sinf]);

  // Get textbooks by same subject (fan)
  const textbooksBySubject = useMemo(() => {
    if (!props.data?.similarTextbooks || !darslik.fanlar?.nodes?.[0]) return [];
    const currentSubjectSlug = darslik.fanlar.nodes[0].slug;
    return props.data.similarTextbooks
      .filter((t) => 
        t.databaseId !== darslik.databaseId && 
        t.fanlar?.nodes?.some(f => f?.slug === currentSubjectSlug)
      )
      .slice(0, 4);
  }, [props.data?.similarTextbooks, darslik.databaseId, darslik.fanlar]);

  // Get other classes links (1-11)
  const otherClasses = useMemo(() => {
    const classes = Array.from({ length: 11 }, (_, i) => i + 1);
    return classes.filter(c => c !== sinf).slice(0, 6);
  }, [sinf]);

  return (
    <>
      <Head>
        {/* Primary SEO Tags - Title will be set by PageLayout SEO component */}
        <meta name="description" content={seoMetaDescription} />
        <meta name="keywords" content={seoKeywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="book" />
        <meta property="og:title" content={fullSeoTitle} />
        <meta property="og:description" content={seoMetaDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="InfoEdu" />
        <meta property="og:locale" content="uz_UZ" />
        <meta property="book:release_date" content={String(currentYear)} />
        <meta property="book:author" content="O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullSeoTitle} />
        <meta name="twitter:description" content={seoMetaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="InfoEdu" />
        <meta name="language" content="Uzbek" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* JSON-LD: Book, BreadcrumbList, FAQPage */}
        <SchemaOrgDarslik
          bookName={darslik.title}
          sinf={sinf}
          sinfRaqami={sinfRaqami}
          currentYear={currentYear}
          baseUrl={baseUrl}
          canonicalUrl={canonicalUrl}
          fileSize={fileSize ?? undefined}
          fileUrl={fileUrl ?? undefined}
          description={seoMetaDescription}
        />
      </Head>
      <PageLayout 
        {...props}
        pageTitle={seoTitle}
        pageDescription={seoMetaDescription}
        headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
        footerMenuItems={props.data?.footerMenuItems?.nodes || []}
        generalSettings={props.data?.generalSettings || null}
      >
        <div className="nc-Page-Darslik-Detail">
          <div className="container py-8 sm:py-12 lg:py-16">
            {/* Breadcrumb */}
            <nav className="mb-4 sm:mb-6 md:mb-8 relative z-10 px-2 sm:px-0" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base flex-wrap">
                <li>
                  <Link
                    href="/"
                    onClick={() => trackButtonClick(GA_CATEGORIES.Navigation, 'breadcrumb_home')}
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    Bosh sahifa
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/darsliklar"
                    onClick={() => trackButtonClick(GA_CATEGORIES.Navigation, 'breadcrumb_darsliklar')}
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    Darsliklar
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/darsliklar/${sinfRaqami}`}
                    onClick={() => trackButtonClick(GA_CATEGORIES.Navigation, `breadcrumb_sinf_${sinfRaqami}`)}
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    {sinf}-sinf
                  </Link>
                </li>
                <li className="text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true">/</li>
                <li className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-xs sm:max-w-md md:max-w-lg">
                  {darslik.title}
                </li>
              </ol>
            </nav>

            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 px-2 sm:px-0">
              {/* Left Column: Book Cover */}
              <div className="flex justify-center lg:justify-start">
                <GenerativeBookCover
                  sinf={sinf}
                  title={darslik.title}
                  className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-sm"
                />
              </div>

              {/* Right Column: Product Details */}
              <div className="flex flex-col">
                {/* H1 Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 leading-tight">
                  {darslik.title}
                </h1>

                {/* Meta Badges */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    Sinf: {sinf}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    Format: PDF
                  </span>
                  {fileSize && (
                    <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Hajmi: {displayFileSize}
                    </span>
                  )}
                </div>

                {/* Auto-Generated Description */}
                <div className="prose prose-slate dark:prose-invert max-w-none mb-6 sm:mb-8">
                  <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {seoDescription}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {fileUrl ? (
                    <>
                      <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                      >
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm sm:text-base md:text-lg">{BUTTON_TEXTS.downloadPdf}</span>
                      </button>
                      
                      {/* Telegram orqali yuklab olish tugmasi */}
                      <a
                        href={TELEGRAM_LINKS.channel}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackTelegramChannelView('textbook_page', `${sinf}_${darslik.slug}`)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                      >
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.174 1.858-.926 6.655-1.31 8.82-.168.929-.5 1.238-.82 1.27-.697.062-1.225-.46-1.9-.902-1.056-.705-1.653-1.143-2.678-1.83-1.185-.8-.418-1.241.259-1.96.178-.188 3.246-2.977 3.307-3.23.007-.031.014-.15-.056-.212-.07-.062-.173-.041-.248-.024-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.429-.008-1.253-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.895-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.64.099-.003.321.024.465.14.118.095.15.223.165.312.015.09.033.297.018.461z" />
                        </svg>
                        <span className="text-sm sm:text-base md:text-lg">{BUTTON_TEXTS.downloadViaTelegram}</span>
                      </a>
                    </>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>{BUTTON_TEXTS.fileNotFound}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Content Expander */}
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg mt-8 sm:mt-12 px-4 sm:px-0">
              <SEOContentExpander title={darslik.title} sinf={sinf} />
            </div>

            {/* Textbooks by Same Subject */}
            {textbooksBySubject.length > 0 && (
              <div className="mt-8 sm:mt-12 md:mt-16 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 md:mb-8">
                  {darslik.fanlar?.nodes?.[0]?.name} fanidan boshqa darsliklar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {textbooksBySubject.map((textbook) => {
                    const similarSinf = textbook.darslikMalumotlari?.sinf || sinfRaqami;
                    return (
                      <Link
                        key={textbook.databaseId}
                        href={`/darsliklar/${similarSinf}/${textbook.slug}`}
                        onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, `related_textbook_open_${similarSinf}_${textbook.slug}`)}
                        className="group bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl"
                      >
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {textbook.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <span>{similarSinf}-sinf</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Similar Textbooks Section (Same Class) */}
            {similarTextbooks.length > 0 && (
              <div className="mt-8 sm:mt-12 md:mt-16 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 md:mb-8">
                  {sinf}-sinf boshqa darsliklari
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {similarTextbooks.map((textbook) => {
                    const similarSinf = textbook.darslikMalumotlari?.sinf || sinfRaqami;
                    return (
                      <Link
                        key={textbook.databaseId}
                        href={`/darsliklar/${similarSinf}/${textbook.slug}`}
                        onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, `related_textbook_open_${similarSinf}_${textbook.slug}`)}
                        className="group bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl"
                      >
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {textbook.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <span>{similarSinf}-sinf</span>
                          {textbook.fanlar?.nodes?.[0]?.name && (
                            <>
                              <span>•</span>
                              <span>{textbook.fanlar.nodes[0].name}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Classes Quick Links */}
            <div className="mt-8 sm:mt-12 md:mt-16 px-2 sm:px-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">
                Boshqa sinflar
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {otherClasses.map((classNum) => (
                  <Link
                    key={classNum}
                    href={`/darsliklar/${classNum}`}
                    onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, `textbook_other_class_${classNum}`)}
                    className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold rounded-lg sm:rounded-xl shadow hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    {classNum}-sinf
                  </Link>
                ))}
                <Link
                  href="/darsliklar"
                  onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, 'textbook_all_classes_link')}
                  className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg sm:rounded-xl shadow hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                >
                  {BUTTON_TEXTS.allClasses} →
                </Link>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-12">
              <Link
                href={`/darsliklar/${sinfRaqami}`}
                onClick={() => trackButtonClick(GA_CATEGORIES.Textbooks, `textbook_back_to_class_${sinfRaqami}`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold rounded-xl shadow hover:shadow-lg transition-all duration-200"
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
                <span>{BUTTON_TEXTS.backToClassPage}</span>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}

// Recursive function to get all darslik slugs
async function getAllDarslikSlugs(
  client: any,
  after: string | null = null,
  acc: Array<{ params: { sinf_raqami: string; slug: string } }> = []
): Promise<Array<{ params: { sinf_raqami: string; slug: string } }>> {
  const { data } = await client.query({
    query: GET_ALL_DARSLIK_SLUGS,
    variables: { after },
  });

  const nodes = (data?.contentNodes?.nodes || []).filter(
    (node: any) => node.__typename === 'Textbook'
  );

  const slugs = nodes.map((node: any) => {
    const classNum = node.darslikMalumotlari?.sinf || 1;
    return {
      params: {
        sinf_raqami: String(classNum),
        slug: node.slug,
      },
    };
  });

  acc = [...acc, ...slugs];

  if (data?.contentNodes?.pageInfo?.hasNextPage) {
    acc = await getAllDarslikSlugs(
      client,
      data.contentNodes.pageInfo.endCursor,
      acc
    );
  }

  return acc;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = getApolloClient();

  try {
    const paths = await getAllDarslikSlugs(client);
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching darslik slugs:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const client = getApolloClient();
  const sinfRaqami = parseInt(ctx.params?.sinf_raqami as string, 10);
  const slug = ctx.params?.slug as string;

  if (isNaN(sinfRaqami) || sinfRaqami < 1 || sinfRaqami > 11 || !slug) {
    return {
      notFound: true,
    };
  }

  const uriFormats = [
    `/darsliklar/${sinfRaqami}/${slug}/`,
    `/darsliklar/${sinfRaqami}/${slug}`,
    `/textbooks/${slug}/`,
    `/textbooks/${slug}`,
    `/${slug}/`,
    `/${slug}`,
  ];

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let darslik: any = null;
      let queryData: any = null;

      for (const uri of uriFormats) {
        const { data } = await client.query({
          query: GET_DARSLIK_BY_SLUG,
          variables: {
            uri,
            slug,
            headerLocation: PRIMARY_LOCATION,
            footerLocation: FOOTER_LOCATION,
          },
        });

        const node = data?.nodeByUri as any;
        const textbookBySlug = (data as any)?.textbookBySlug?.nodes?.[0];
        const textbooksFromQuery = data?.textbooks?.nodes || [];
        const textbookFromSearch = textbooksFromQuery.find((t: any) => t.slug === slug);

        if (node && node.__typename === 'Textbook') {
          darslik = node;
          queryData = data;
          break;
        }
        if (textbookBySlug && textbookBySlug.slug === slug) {
          darslik = textbookBySlug;
          queryData = data;
          break;
        }
        if (textbookFromSearch) {
          darslik = textbookFromSearch;
          queryData = data;
          break;
        }
      }

      if (!darslik && queryData) {
        const bySlug = (queryData as any)?.textbookBySlug?.nodes?.[0];
        if (bySlug && bySlug.slug === slug) {
          darslik = bySlug;
          queryData = queryData;
        }
      }

      if (!darslik) {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
          continue;
        }
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SERVER] Darslik not found for slug: ${slug}, sinf: ${sinfRaqami}`);
        }
        return { notFound: true };
      }

      const classNum = darslik.darslikMalumotlari?.sinf;
      const classNumAsNumber =
        classNum == null ? null : typeof classNum === 'string' ? parseInt(classNum, 10) : classNum;

      if (classNumAsNumber != null && !isNaN(classNumAsNumber) && classNumAsNumber !== sinfRaqami) {
        return {
          redirect: {
            destination: `/darsliklar/${classNumAsNumber}/${darslik.slug}`,
            permanent: true,
          },
        };
      }

      let similarTextbooks: Darslik[] = [];
      try {
        const { data: similarData } = await client.query({
          query: GET_SIMILAR_TEXTBOOKS,
          variables: {
            first: 20,
            headerLocation: PRIMARY_LOCATION,
            footerLocation: FOOTER_LOCATION,
          },
        });

        const similarNodes = (similarData?.contentNodes?.nodes || []).filter(
          (node: any) => node.__typename === 'Textbook' && node.databaseId !== darslik.databaseId
        ) as Darslik[];

        similarTextbooks = similarNodes
          .filter((t) => {
            const tSinf = t.darslikMalumotlari?.sinf;
            const tSinfAsNumber =
              tSinf == null ? sinfRaqami : typeof tSinf === 'string' ? parseInt(tSinf, 10) : tSinf;
            return tSinfAsNumber === sinfRaqami;
          })
          .slice(0, 6);
      } catch {
        // Continue without similar textbooks
      }

      return {
        props: {
          data: {
            darslik,
            similarTextbooks,
            generalSettings: queryData?.generalSettings || null,
            primaryMenuItems: queryData?.primaryMenuItems || null,
            footerMenuItems: queryData?.footerMenuItems || null,
          },
          sinfRaqami,
          slug,
        },
        revalidate: 3600,
      };
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        console.warn(
          `[darsliklar] getStaticProps attempt ${attempt}/${MAX_RETRIES} failed for ${sinfRaqami}/${slug}, retrying in ${RETRY_DELAY_MS}ms...`,
          (error as Error)?.message
        );
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      } else {
        console.error(
          `[darsliklar] getStaticProps failed for ${sinfRaqami}/${slug} after ${MAX_RETRIES} attempts:`,
          (error as Error)?.message
        );
        return { notFound: true };
      }
    }
  }

  return {
    notFound: true,
  };
}

    // Fetch similar textbooks (same class, exclude current)
    let similarTextbooks: Darslik[] = [];
    try {
      const { data: similarData } = await client.query({
        query: GET_SIMILAR_TEXTBOOKS,
        variables: {
          first: 20, // Fetch more to filter
          headerLocation: PRIMARY_LOCATION,
          footerLocation: FOOTER_LOCATION,
        },
      });

      const similarNodes = (similarData?.contentNodes?.nodes || []).filter(
        (node: any) => node.__typename === 'Textbook' && node.databaseId !== darslik.databaseId
      ) as Darslik[];

      // Filter by same class
      similarTextbooks = similarNodes.filter((t) => {
        const tSinf = t.darslikMalumotlari?.sinf;
        const tSinfAsNumber = typeof tSinf === 'string' ? parseInt(tSinf, 10) : tSinf;
        return tSinfAsNumber === sinfRaqami;
      }).slice(0, 6);
    } catch (error) {
      console.error('Error fetching similar textbooks:', error);
      // Continue without similar textbooks
    }

    return {
      props: {
        data: {
          darslik,
          similarTextbooks,
          generalSettings: queryData?.generalSettings || null,
          primaryMenuItems: queryData?.primaryMenuItems || null,
          footerMenuItems: queryData?.footerMenuItems || null,
        },
        sinfRaqami,
        slug,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching darslik:', error);
    return {
      notFound: true,
    };
  }
};
