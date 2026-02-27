import React, { useMemo, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { FaustTemplate } from '@faustwp/core';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PageLayout from '@/container/PageLayout';
import Hero from '@/components/oliygoh/Hero';
import Breadcrumb from '@/components/oliygoh/Breadcrumb';
import OliygohFAQ from '@/components/oliygoh/OliygohFAQ';

// Lazy load komponentlar
const ContactCard = dynamic(() => import('@/components/oliygoh/ContactCard'), {
  loading: () => <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"><div className="h-64 bg-slate-100 rounded"></div></div>
});

const QuotaTable = dynamic(() => import('@/components/oliygoh/QuotaTable'), {
  loading: () => <div className="mt-10 animate-pulse"><div className="h-8 bg-slate-200 rounded w-64 mb-6"></div><div className="h-96 bg-slate-100 rounded"></div></div>
});

const RelatedOliygohCard = dynamic(() => import('@/components/oliygoh/RelatedOliygohCard'), {
  loading: () => <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
});

const YandexAdOliygohSidebar = dynamic(
  () => import('@/components/Ads/YandexAd').then((m) => {
    const Y = m.default;
    const { YAN_BLOCK_IDS } = m;
    return function Ad() {
      return <Y blockId={YAN_BLOCK_IDS.banner} renderTo="yandex_rtb_oliygoh_sidebar" minHeight={250} className="w-full rounded-xl overflow-hidden" />;
    };
  }),
  { ssr: false }
);

// --- 3. MAIN COMPONENT ---

const Universitet: FaustTemplate<any> = (props) => {
  const data = props.data?.nodeByUri || props.data?.oliygoh;

  if (!data) return <div className="p-10 text-center">Yuklanmoqda...</div>;

  const { title, content, featuredImage, oliygohMalumotlari, uri, slug, date, modified } = data;
  const bgImage = featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000';
  const info = oliygohMalumotlari || {};

  const quotasList: any[] = Array.isArray((props as any).quotas) ? (props as any).quotas : [];
  const recommendedOliygohs: { title: string; slug: string; featuredImage?: any }[] = Array.isArray((props as any).recommendedOliygohs) ? (props as any).recommendedOliygohs : [];

  // O'quv yili — avtomatik: sentyabrdan yangi yil (2025/2026 → 2026/2027)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1–12
  const currentYear = month >= 9 ? year : year - 1;
  const nextYear = currentYear + 1;

  const [stickyTop, setStickyTop] = useState(120);
  useEffect(() => {
    const calc = () => {
      if (typeof window === 'undefined') return;
      const header = document.querySelector('div[class*="sticky"][class*="top-0"]');
      const banner = document.querySelector('.Ncmaz_Banner');
      let h = 0, b = 0;
      if (header) h = header.getBoundingClientRect().height;
      if (banner) b = banner.getBoundingClientRect().height;
      setStickyTop(Math.max(h + b + 16, 80));
    };
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('scroll', calc);
    const obs = new MutationObserver(calc);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('scroll', calc);
      obs.disconnect();
    };
  }, []);

  // SEO
  const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://infoedu.uz';
  
  // Meta Title: "{name} kirish ballari 2025/2026"
  const seoTitle = useMemo(() => {
    const name = title || 'Oliygoh';
    return `${name} kirish ballari ${currentYear}/${nextYear}`;
  }, [title, currentYear, nextYear]);

  // Meta Description: "{name} bo'yicha 2025-2026 o'quv yili uchun eng so'nggi o'tish ballari, qabul kvotalari va barcha yo'nalishlar haqida ma'lumot oling."
  const seoDesc = useMemo(() => {
    const name = title || 'Oliygoh';
    return `${name} bo'yicha ${currentYear}-${nextYear} o'quv yili uchun eng so'nggi o'tish ballari, qabul kvotalari va barcha yo'nalishlar haqida ma'lumot oling.`;
  }, [title, currentYear, nextYear]);
  
  // SEO Keywords — asosiy, yo'nalish va LSI (savol ko'rinishida)
  const seoKeywords = useMemo(() => {
    const name = title || 'Oliygoh';
    const viloyat = Array.isArray(info.viloyat) ? info.viloyat[0] : info.viloyat;
    const keywords = [
      `${name} kirish ballari ${currentYear}-${nextYear}`,
      `${name} qabul kvotalari`,
      `${name} kontrakt narxi ${currentYear}`,
      `${name} o'tish ballari`,
      `${name} sirtqi bo'lim yo'nalishlari`,
      `${name} magistratura qabul`,
      `${name} kechki ta'lim ballari`,
      `${name} fakultetlari va kafedralari`,
      `${name}ga kirish uchun qaysi fanlardan imtihon topshiriladi`,
      `${name} manzili qayerda`,
      `${name} yotoqxonasi bormi`,
      `${name} grant kvotasi`,
      `${name} kontrakt kvotasi`,
      `${name} ta'lim yo'nalishlari`,
    ];
    if (viloyat) keywords.push(`${name} ${viloyat}`);
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
      }
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

    // EducationalOrganization ham qo'shiladi — bitta schema, 2 ta "Organization" chiqmasin
    const extraType = Array.isArray(info.universitetTuri) ? info.universitetTuri[0] : info.universitetTuri;
    schema.additionalType = extraType
      ? ["https://schema.org/EducationalOrganization", extraType]
      : "https://schema.org/EducationalOrganization";

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

  // 4. FAQPage Schema (sahifadagi barcha savol-javoblar, LSI ham)
  const faqSchema = useMemo(() => {
    const name = title || '';
    const manzil = info.manzil;
    const yotoqxona = info.yotoqxonaBormi;
    const yotoqxonaJavob = yotoqxona === true || (typeof yotoqxona === 'string' && yotoqxona.toLowerCase() !== "yo'q" && yotoqxona !== '')
      ? "Ha, oliygohda talabalar uchun yotoqxona mavjud."
      : "Yotoqxona haqida ma'lumotni oliygoh qabul komissiyasi yoki rasmiy sayt orqali tekshirishingiz mumkin.";
    const mainEntity = [
      {
        "@type": "Question",
        "name": `${name} kontrakt narxi qancha?`,
        "acceptedAnswer": { "@type": "Answer", "text": "Gumanitar va pedagogika: 6 400 000 – 7 500 000 so'm. Texnika, qishloq xo'jaligi: 7 000 000 – 8 000 000 so'm. Iqtisod, huquq va tibbiyot: 9 000 000 – 14 000 000 so'm. Masofaviy va sirtqi ta'lim: Kunduzgi shaklga nisbatan 10-20% arzonroq." }
      },
      {
        "@type": "Question",
        "name": "Oliygohlarga hujjat topshirish qachon boshlanadi?",
        "acceptedAnswer": { "@type": "Answer", "text": "Odatda qabul jarayonlari har yili iyun oyining ikkinchi yarmidan boshlanib, iyul oyining o'rtalariga qadar davom etadi. Hujjatlar my.uzbmb.uz portali orqali onlayn qabul qilinadi." }
      },
      {
        "@type": "Question",
        "name": "Kontrakt pulini bo'lib to'lash imkoniyati bormi?",
        "acceptedAnswer": { "@type": "Answer", "text": "Ha, O'zbekistonda talabalar shartnoma summasini yil davomida kamida 4 qismga bo'lib to'lashlari mumkin. Birinchi chorak to'lovi odatda 1-oktabrgacha amalga oshiriladi." }
      },
      {
        "@type": "Question",
        "name": `${name}ga kirish uchun qaysi fanlardan imtihon topshiriladi?`,
        "acceptedAnswer": { "@type": "Answer", "text": "O'zbekiston oliy ta'lim muassasalariga kirish uchun odatda O'zbek tili (yoki ona tili), Matematika va yo'nalishga qarab uchinchi fan (Tarix, Biologiya, Kimyo, Fizika, Adabiyot va boshqalar) bo'yicha davlat test sinovlaridan o'tish talab qilinadi. Aniq fanlar har bir yo'nalish uchun Oliy ta'lim, fan va innovatsiyalar vazirligi qoidalariga muvofiq belgilanadi." }
      },
      {
        "@type": "Question",
        "name": `${name} manzili qayerda?`,
        "acceptedAnswer": { "@type": "Answer", "text": manzil || "Oliygoh manzili sahifaning Qabul Komissiyasi blokida ko'rsatiladi." }
      },
      {
        "@type": "Question",
        "name": `${name} yotoqxonasi bormi?`,
        "acceptedAnswer": { "@type": "Answer", "text": yotoqxonaJavob }
      }
    ];
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    };
  }, [title, info.manzil, info.yotoqxonaBormi]);

  // 5. Table / Dataset Schema — kirish ballari jadvali (Rich Snippet)
  const tableSchema = useMemo(() => {
    const quotas = quotasList;
    const tableName = `${title || 'Oliygoh'} kirish ballari va qabul kvotalari ${currentYear}-${nextYear}`;
    const tableDesc = "Mutaxassislik bo'yicha grant va shartnoma o'tish ballari va kvotalar jadvali.";
    const rows = quotas.map((item: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.dirnm || item.name || "—",
      "description": `Kod: ${item.dirid || item.code || "—"}. Grant: ${item.ballgr ?? item.grantScore ?? "—"} ball, ${item.grantnm ?? item.grantQuota ?? "—"} kvota. Shartnoma: ${item.ballk ?? item.contractScore ?? "—"} ball, ${item.contractnm ?? item.contractQuota ?? "—"} kvota.`
    }));
    return {
      "@context": "https://schema.org",
      "@type": "Table",
      "@id": `${seoUrl}#entrance-scores-table`,
      "name": tableName,
      "description": tableDesc,
      "about": { "@id": `${seoUrl}#organization` },
      ...(rows.length > 0 && {
        "hasPart": {
          "@type": "ItemList",
          "numberOfItems": rows.length,
          "itemListElement": rows
        }
      })
    };
  }, [title, seoUrl, currentYear, nextYear, quotasList]);

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
        
        {/* Schema markup: mavjud (CollegeOrUniversity, BreadcrumbList, WebPage) — xato yo'q, tegilmaydi */}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(tableSchema) }}
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
        appendSiteName={false}
      >
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
            <Breadcrumb title={title} />
            <Hero title={title} bgImage={bgImage} viloyat={info.viloyat} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                    <article className="prose prose-slate dark:prose-invert max-w-none mb-12">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{title} haqida ma&apos;lumot</h2>
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    </article>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-10 leading-relaxed">
                      Bu sahifada <strong className="text-slate-700 dark:text-slate-300">{title} kirish ballari {currentYear}-{nextYear}</strong>, qabul kvotalari, kontrakt narxi, o&apos;tish ballari, sirtqi va kechki ta&apos;lim yo&apos;nalishlari haqida ma&apos;lumot topasiz.
                    </p>

                    <div className="lg:hidden mb-10">
                      <ContactCard info={info} />
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700 my-10" />

                    <QuotaTable quotas={quotasList} universityName={title} />

                    <OliygohFAQ universityName={title} info={info} />

                    {recommendedOliygohs.length > 0 && (
                      <div className="mt-10 sm:mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">Shu oliygohga o&apos;xshash oliygohlar</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                          {recommendedOliygohs.map((ol) => (
                            <RelatedOliygohCard
                              key={ol.slug}
                              title={ol.title}
                              slug={ol.slug}
                              featuredImage={ol.featuredImage}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block lg:col-span-1">
                  <div className="lg:sticky" style={{ top: `${stickyTop}px` }}>
                    <ContactCard info={info} />
                    <div className="mt-6 w-full">
                      <YandexAdOliygohSidebar />
                    </div>
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