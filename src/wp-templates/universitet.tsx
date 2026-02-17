import React, { useMemo, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { FaustTemplate } from '@faustwp/core';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PageLayout from '@/container/PageLayout';
import Hero from '@/components/oliygoh/Hero';
import Breadcrumb from '@/components/oliygoh/Breadcrumb';

// Lazy load komponentlar
const ContactCard = dynamic(() => import('@/components/oliygoh/ContactCard'), {
  loading: () => <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"><div className="h-64 bg-slate-100 rounded"></div></div>
});

const QuotaTable = dynamic(() => import('@/components/oliygoh/QuotaTable'), {
  loading: () => <div className="mt-10 animate-pulse"><div className="h-8 bg-slate-200 rounded w-64 mb-6"></div><div className="h-96 bg-slate-100 rounded"></div></div>
});

// --- 3. MAIN COMPONENT ---

const Universitet: FaustTemplate<any> = (props) => {
  const data = props.data?.nodeByUri || props.data?.oliygoh;

  if (!data) return <div className="p-10 text-center">Yuklanmoqda...</div>;

  const { title, content, featuredImage, oliygohMalumotlari, uri, slug, date, modified } = data;
  const bgImage = featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000';
  const info = oliygohMalumotlari || {};

  // O'quv yili (2025-2026)
  const currentYear = 2025;
  const nextYear = 2026;

  // Header balandligini o'lchash va top value hisoblash
  const [stickyTop, setStickyTop] = useState(120);
  
  useEffect(() => {
    const calculateStickyTop = () => {
      if (typeof window === 'undefined') return;
      
      // Header elementini topish - SiteHeader komponenti ichidagi sticky div
      const headerWrapper = document.querySelector('div[class*="sticky"][class*="top-0"]');
      const banner = document.querySelector('.Ncmaz_Banner');
      
      let headerHeight = 0;
      let bannerHeight = 0;
      
      if (headerWrapper) {
        headerHeight = headerWrapper.getBoundingClientRect().height;
      }
      
      if (banner) {
        bannerHeight = banner.getBoundingClientRect().height;
      }
      
      // Header + Banner + 16px padding
      const totalHeight = headerHeight + bannerHeight + 16;
      setStickyTop(Math.max(totalHeight, 80)); // Minimum 80px
    };
    
    calculateStickyTop();
    
    // Resize va scroll event'larda qayta hisoblash
    window.addEventListener('resize', calculateStickyTop);
    window.addEventListener('scroll', calculateStickyTop);
    
    // MutationObserver - DOM o'zgarishlarini kuzatish
    const observer = new MutationObserver(calculateStickyTop);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    
    return () => {
      window.removeEventListener('resize', calculateStickyTop);
      window.removeEventListener('scroll', calculateStickyTop);
      observer.disconnect();
    };
  }, []);

  // SEO
  const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz';
  
  // Optimallashtirilgan SEO Title: "Universitet nomi Kirish ballari 2025-2026"
  const seoTitle = useMemo(() => {
    const universityName = title || 'Universitet';
    return `${universityName} Kirish ballari ${currentYear}-${nextYear}`;
  }, [title, currentYear, nextYear]);
  
  // Optimallashtirilgan SEO Description
  const seoDesc = useMemo(() => {
    const getDescriptionFromContent = (htmlContent: string | null | undefined): string => {
      if (!htmlContent) return '';
      
      // HTML taglarini olib tashlash
      const textContent = htmlContent
        .replace(/<[^>]*>/g, '') // HTML taglarini olib tashlash
        .replace(/&nbsp;/g, ' ') // &nbsp; ni bo'shliqqa o'zgartirish
        .replace(/&amp;/g, '&') // &amp; ni & ga o'zgartirish
        .replace(/&lt;/g, '<') // &lt; ni < ga o'zgartirish
        .replace(/&gt;/g, '>') // &gt; ni > ga o'zgartirish
        .replace(/&quot;/g, '"') // &quot; ni " ga o'zgartirish
        .replace(/&#39;/g, "'") // &#39; ni ' ga o'zgartirish
        .trim();
      
      // Birinchi paragrafni olish (155 belgigacha - SEO uchun optimal)
      const firstParagraph = textContent.split('\n').find(p => p.trim().length > 0) || textContent;
      return firstParagraph.substring(0, 155).trim();
    };
    
    const universityName = title || 'Universitet';
    const defaultDesc = `${universityName} ${currentYear}-${nextYear} o'quv yili uchun kirish ballari, qabul kvotalari va ta'lim yo'nalishlari. Barcha fakultetlar bo'yicha o'tish ballari, grant va kontrakt kvotalari haqida to'liq ma'lumot.`;
    
    const contentDesc = getDescriptionFromContent(content);
    return contentDesc || defaultDesc;
  }, [content, title, currentYear, nextYear]);
  
  // SEO Keywords
  const seoKeywords = useMemo(() => {
    const universityName = title || 'Universitet';
    const viloyat = Array.isArray(info.viloyat) ? info.viloyat[0] : info.viloyat;
    const keywords = [
      `${universityName} kirish ballari`,
      `${universityName} ${currentYear}-${nextYear}`,
      `${universityName} qabul kvotalari`,
      `${universityName} o'tish ballari`,
      `${universityName} grant kvotasi`,
      `${universityName} kontrakt kvotasi`,
      `${universityName} fakultetlar`,
      `${universityName} ta'lim yo'nalishlari`,
    ];
    
    if (viloyat) {
      keywords.push(`${universityName} ${viloyat}`);
    }
    
    return keywords.join(', ');
  }, [title, info.viloyat, currentYear, nextYear]);
  
  const seoImage = useMemo(() => {
    return bgImage ? (bgImage.startsWith('http') ? bgImage : `${BASE_URL}${bgImage}`) : '';
  }, [bgImage, BASE_URL]);
  
  // Canonical URL: no trailing slash (match next.config.js trailingSlash: false, fix "multiple canonical URLs" SEO issue)
  const seoUrl = useMemo(() => {
    const base = BASE_URL.replace(/\/$/, '');
    if (uri) {
      const path = uri === '/' ? uri : uri.replace(/\/+$/, '');
      return `${base}${path}`;
    }
    return slug ? `${base}/oliygoh/${slug}` : base;
  }, [uri, slug, BASE_URL]);

  // --- SCHEMA MARKUP (JSON-LD) ---
  // 1. Organization/CollegeOrUniversity Schema
  const organizationSchema = useMemo(() => {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      "@id": `${seoUrl}#organization`,
      "name": title,
      "url": seoUrl,
      "description": seoDesc,
      "image": seoImage,
      "logo": {
        "@type": "ImageObject",
        "url": seoImage
      },
      "foundingDate": undefined, // Kelajakda qo'shish mumkin
      "numberOfStudents": undefined // Kelajakda qo'shish mumkin
    };

    // Address
    if (info.manzil) {
      const addressParts = info.manzil.split(',').map((s: string) => s.trim());
      schema.address = {
        "@type": "PostalAddress",
        "addressCountry": "UZ",
        "addressLocality": addressParts[0] || "O'zbekiston",
        "streetAddress": info.manzil
      };
    }

    // Contact Points
    const contactPoints: any[] = [];
    
    if (info.telefon) {
      contactPoints.push({
        "@type": "ContactPoint",
        "telephone": info.telefon,
        "contactType": "admissions",
        "areaServed": "UZ",
        "availableLanguage": ["uz", "ru", "en"]
      });
    }

    if (info.elektronPochta) {
      contactPoints.push({
        "@type": "ContactPoint",
        "email": info.elektronPochta,
        "contactType": "admissions",
        "areaServed": "UZ"
      });
    }

    if (contactPoints.length > 0) {
      schema.contactPoint = contactPoints.length === 1 ? contactPoints[0] : contactPoints;
    }

    // SameAs (social media and official website)
    const sameAs = [
      info.rasmiySayt,
      info.telegramKanal
    ].filter(Boolean);
    
    if (sameAs.length > 0) {
      schema.sameAs = sameAs;
    }

    // Viloyat — faqat PostalAddress yoki Place.address ichida (CollegeOrUniversity da addressRegion yo'q)
    if (info.viloyat) {
      const viloyat = Array.isArray(info.viloyat) ? info.viloyat[0] : info.viloyat;
      schema.location = {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": viloyat,
          "addressCountry": "UZ"
        }
      };
      // Asosiy address bor bo'lsa, unga ham addressRegion qo'shish (PostalAddress da qonuniy)
      if (schema.address && typeof schema.address === "object") {
        schema.address.addressRegion = viloyat;
      }
    }

    if (info.universitetTuri) {
      schema.additionalType = Array.isArray(info.universitetTuri) 
        ? info.universitetTuri[0] 
        : info.universitetTuri;
    }

    // Educational credentials
    schema.hasCredential = {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "degree"
    };

    // Geo coordinates (if available in future)
    // schema.geo = {
    //   "@type": "GeoCoordinates",
    //   "latitude": "",
    //   "longitude": ""
    // };

    return schema;
  }, [title, seoUrl, seoDesc, seoImage, info]);

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${seoUrl}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Bosh sahifa",
          "item": BASE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Oliy Ta'lim Muassasalari",
          "item": `${BASE_URL}/oliygoh/`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": title,
          "item": seoUrl
        }
      ]
    };
  }, [title, seoUrl, BASE_URL]);

  // 3. WebPage Schema
  const webpageSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": seoUrl,
      "name": seoTitle,
      "description": seoDesc,
      "url": seoUrl,
      "inLanguage": ["uz", "ru"],
      "isPartOf": {
        "@type": "WebSite",
        "@id": `${BASE_URL}#website`,
        "name": props.data?.generalSettings?.title || "Infoedu",
        "url": BASE_URL
      },
      "about": {
        "@id": `${seoUrl}#organization`
      },
      "breadcrumb": {
        "@id": `${seoUrl}#breadcrumb`
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": seoImage
      },
      ...(date && { "datePublished": date }),
      ...(modified && { "dateModified": modified })
    };
  }, [seoTitle, seoDesc, seoUrl, seoImage, BASE_URL, props.data?.generalSettings?.title, data]);

  return (
    <>
      {/* --- OPTIMALLASHTIRILGAN SEO META TAGS --- */}
      <Head>
        {/* Primary Meta Tags */}
        <title>{seoTitle}</title>
        <meta name="title" content={seoTitle} />
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="author" content="InfoEdu.uz" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="language" content="Uzbek" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href={seoUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="uz_UZ" />
        <meta property="og:site_name" content="InfoEdu.uz" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={seoUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
        
        {/* Additional SEO */}
        <meta name="geo.region" content="UZ" />
        <meta name="geo.placename" content={Array.isArray(info.viloyat) ? info.viloyat[0] : info.viloyat || "O'zbekiston"} />
        
        {/* Content Freshness - Modified Date */}
        {modified && (() => {
          try {
            const formattedDate = new Date(modified).toISOString();
            return (
              <>
                <meta property="og:updated_time" content={formattedDate} />
                <meta property="article:modified_time" content={formattedDate} />
              </>
            );
          } catch (error) {
            return null;
          }
        })()}
        
        {/* Alohida script — validatorda WebPage, CollegeOrUniversity, BreadcrumbList alohida ko‘rinadi */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
        />
      </Head>

      {/* 1-Xato: HEADER VA FOOTER QAYTARILDI (PageLayout orqali) */}
      <PageLayout
        headerMenuItems={props.data?.primaryMenuItems?.nodes}
        footerMenuItems={props.data?.footerMenuItems?.nodes}
        pageTitle={seoTitle}
        pageDescription={seoDesc}
        pageFeaturedImageUrl={seoImage}
        generalSettings={props.data?.generalSettings}
      >
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
            {/* BREADCRUMB */}
            <Breadcrumb title={title} />
            
            {/* HERO */}
            <Hero 
              title={title} 
              bgImage={bgImage} 
              viloyat={info.viloyat} 
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Asosiy Kontent */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                    
                    <article className="prose prose-slate dark:prose-invert max-w-none mb-12">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{title} haqida ma'lumot</h2>
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    </article>

                    {/* Mobile versiyada ContactCard - universitet haqida ma'lumot va kirish ballari orasida */}
                    <div className="lg:hidden mb-10">
                      <ContactCard info={info} />
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700 my-10" />

                    {/* Kvotalar Jadvali - dinamik ma'lumotlar */}
                    <QuotaTable quotas={props.quotas || []} universityName={title} />
                  </div>
                </div>

                {/* Sidebar - Qabul Komissiyasi (faqat desktop) */}
                <div className="hidden lg:block lg:col-span-1">
                  <div className="lg:sticky" style={{ top: `${stickyTop}px` }}>
                    <ContactCard info={info} />
                  </div>
                </div>
              </div>
            </div>
        </div>
      </PageLayout>
    </>
  );
};

// --- GRAPHQL QUERY YANGILANDI ---
// Menyular (Header/Footer) chiqishi uchun ularni ham chaqiramiz
Universitet.query = gql`
  query GetUniversitet($uri: String!, $slug: String) {
    # 1. Asosiy Content (avvalo URI bo'yicha)
    nodeByUri(uri: $uri) {
      ... on Oliygoh {
        databaseId
        title
        content
        slug
        uri
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        oliygohMalumotlari {
          manzil
          viloyat
          telefon
          elektronPochta
          rasmiySayt
          telegramKanal
          universitetTuri
          yotoqxonaBormi
        }
        date
        modified
      }
    }
    # 1b. Fallback: WP da CPT slug boshqacha bo'lsa (masalan /universitetlar/slug/) — slug orqali topamiz
    oliygohBy(slug: $slug) {
      databaseId
      title
      content
      slug
      uri
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      oliygohMalumotlari {
        manzil
        viloyat
        telefon
        elektronPochta
        rasmiySayt
        telegramKanal
        universitetTuri
        yotoqxonaBormi
      }
      date
      modified
    }
    # 2. Layout (Header/Footer) uchun kerakli ma'lumotlar
    generalSettings {
      title
      description
    }
    primaryMenuItems: menuItems(where: { location: PRIMARY }, first: 50) {
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
    footerMenuItems: menuItems(where: { location: FOOTER }, first: 50) {
      nodes {
        id
        label
        uri
      }
    }
  }
`;

Universitet.variables = ({ uri, slug }, ctx) => {
  return {
    uri: uri || (slug ? `/oliygoh/${slug}/` : ''),
    slug: slug || null,
  };
};

export default Universitet;