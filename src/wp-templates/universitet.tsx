import React from 'react';
import { gql } from '@apollo/client';
import { FaustTemplate } from '@faustwp/core';
import PageLayout from '@/container/PageLayout';
import Hero from '@/components/oliygoh/Hero';
import ContactCard from '@/components/oliygoh/ContactCard';
import QuotaTable from '@/components/oliygoh/QuotaTable';
import SEO from '@/components/SEO/SEO';

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
  
  // Description - sarlavha ostidagi content'dan olinadi
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
  
  const seoDesc = getDescriptionFromContent(content) || `${title || 'Universitet'} bo'yicha ${currentYear}-${nextYear} o'quv yili uchun o'tish ballari, kvotalar va fakultetlar ro'yxati.`;
  const seoImage = bgImage ? (bgImage.startsWith('http') ? bgImage : `${BASE_URL}${bgImage}`) : '';
  const seoUrl = uri ? `${BASE_URL}${uri}` : (slug ? `${BASE_URL}/oliygoh/${slug}/` : BASE_URL);

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        imageUrl={seoImage}
        url={seoUrl}
      />

      {/* 1-Xato: HEADER VA FOOTER QAYTARILDI (PageLayout orqali) */}
      <PageLayout
        headerMenuItems={props.data?.primaryMenuItems?.nodes}
        footerMenuItems={props.data?.footerMenuItems?.nodes}
        generalSettings={props.data?.generalSettings}
      >
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            
            {/* HERO */}
            <Hero 
              title={title} 
              bgImage={bgImage} 
              viloyat={info.viloyat} 
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Asosiy Kontent */}
                <div className="lg:col-span-2">
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                      
                      <article className="prose prose-slate max-w-none mb-12">
                         {/* 6-Xato: "{Title} haqida ma'lumot" */}
                         <h2 className="text-2xl font-bold text-slate-900 mb-6">{title} haqida ma'lumot</h2>
                         <div dangerouslySetInnerHTML={{ __html: content }} />
                         
                         {/* 7-Xato: Ortiqcha statik bloklar olib tashlandi */}
                      </article>

                      <hr className="border-slate-200 my-10" />

                      {/* Kvotalar Jadvali - dinamik ma'lumotlar */}
                      <QuotaTable quotas={props.quotas || []} />
                   </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                   <ContactCard info={info} />
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