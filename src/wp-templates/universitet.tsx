import React, { useMemo } from 'react';
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

  const { title, content, featuredImage, oliygohMalumotlari, uri, slug } = data;
  const bgImage = featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000';
  const info = oliygohMalumotlari || {};

  // Dinamik yillar
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // SEO
  const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz';
  
  // Title - H1 bilan bir xil (faqat title o'zi)
  const seoTitle = title || 'Universitet';
  
  // Description - sarlavha ostidagi content'dan olinadi - memoized
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
      
      // Birinchi paragrafni olish (160 belgigacha)
      const firstParagraph = textContent.split('\n').find(p => p.trim().length > 0) || textContent;
      return firstParagraph.substring(0, 160).trim();
    };
    
    return getDescriptionFromContent(content) || `${title || 'Universitet'} bo'yicha ${currentYear}-${nextYear} o'quv yili uchun o'tish ballari, kvotalar va fakultetlar ro'yxati.`;
  }, [content, title, currentYear, nextYear]);
  
  const seoImage = useMemo(() => {
    return bgImage ? (bgImage.startsWith('http') ? bgImage : `${BASE_URL}${bgImage}`) : '';
  }, [bgImage, BASE_URL]);
  
  const seoUrl = useMemo(() => {
    return uri ? `${BASE_URL}${uri}` : (slug ? `${BASE_URL}/oliygoh/${slug}/` : BASE_URL);
  }, [uri, slug, BASE_URL]);

  // --- SCHEMA MARKUP (JSON-LD) ---
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "name": title,
    "url": seoUrl,
    "logo": seoImage,
    "image": seoImage,
    "description": seoDesc,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "UZ",
      "addressLocality": info.manzil ? info.manzil.split(',')[0] : "O'zbekiston",
      "streetAddress": info.manzil || ""
    },
    ...(info.telefon && {
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": info.telefon,
        "contactType": "admissions",
        "areaServed": "UZ",
        "availableLanguage": ["Uzbek", "Russian"]
      }
    }),
    "sameAs": [
      info.rasmiySayt,
      info.telegramKanal
    ].filter(Boolean)
  };

  return (
    <>
      {/* --- SCHEMA MARKUPNI QO'SHISH --- */}
      <Head>
        <title>{seoTitle}</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
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

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-8 relative z-10">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                
                <article className="prose prose-slate dark:prose-invert max-w-none mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{title} haqida ma'lumot</h2>
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </article>

                <hr className="border-slate-200 dark:border-slate-700 my-10" />

                {/* Qabul Komissiyasi - kirish ballaridan yuqorida */}
                <div className="mb-10">
                  <ContactCard info={info} />
                </div>

                <hr className="border-slate-200 dark:border-slate-700 my-10" />

                {/* Kvotalar Jadvali - dinamik ma'lumotlar */}
                <QuotaTable quotas={props.quotas || []} universityName={title} />
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
  query GetUniversitet($uri: String!) {
    # 1. Asosiy Content
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
      }
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
  };
};

export default Universitet;