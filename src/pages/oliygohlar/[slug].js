import clientPromise from '../../../lib/mongodb';
import Link from 'next/link';
import Head from 'next/head';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';

export async function getServerSideProps({ params }) {
  const { slug } = params;

  // 1. MONGODB MA'LUMOTLARINI OLISH
  let universityData = null;
  let directionsData = [];
  
  try {
    const client = await clientPromise;
    const db = client.db("InfoEdu");

    // Universitetni topamiz
    const university = await db.collection("universitetlar").findOne({ slug: slug });

    if (!university) {
      return { notFound: true }; // Agar topilmasa 404
    }

    // Yo'nalishlarni olamiz
    const directions = await db.collection("yonalishlar")
      .find({ OTM: university.nomi })
      .sort({ dirnm: 1 })
      .toArray();

    universityData = JSON.parse(JSON.stringify(university));
    directionsData = JSON.parse(JSON.stringify(directions));

  } catch (e) {
    console.error("MongoDB Xatosi:", e);
    return { notFound: true };
  }

  // 2. WORDPRESS MA'LUMOTLARINI OLISH (MENU)
  let layoutData = {};
  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const graphqlUrl = `${wordpressUrl}/graphql`;

    const query = `
      query LayoutQuery($headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
        generalSettings {
          title
          description
        }
        primaryMenuItems: menuItems(where: {location: $headerLocation, parentId: "0"}) {
          nodes {
            id
            label
            uri
            target
            childItems {
              nodes {
                id
                label
                uri
                target
              }
            }
          }
        }
        footerMenuItems: menuItems(where: {location: $footerLocation, parentId: "0"}) {
          nodes {
            id
            label
            uri
            target
          }
        }
      }
    `;

    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        variables: {
          headerLocation: PRIMARY_LOCATION,
          footerLocation: FOOTER_LOCATION,
        },
      }),
    });

    const json = await res.json();
    layoutData = json.data || {};

  } catch (wpError) {
    console.error("WordPress Menu Error:", wpError);
    layoutData = { generalSettings: {}, primaryMenuItems: { nodes: [] }, footerMenuItems: { nodes: [] } };
  }

  return {
    props: {
      uni: universityData,
      directions: directionsData,
      headerMenuItems: layoutData?.primaryMenuItems?.nodes || [],
      footerMenuItems: layoutData?.footerMenuItems?.nodes || [],
      generalSettings: layoutData?.generalSettings || {},
    },
  };
}

export default function UniversityDetail({ 
  uni, 
  directions,
  headerMenuItems, 
  footerMenuItems, 
  generalSettings 
}) {
  return (
    <PageLayout
      headerMenuItems={headerMenuItems}
      footerMenuItems={footerMenuItems}
      pageTitle={uni.nomi}
      generalSettings={generalSettings}
    >
      <Head>
        <title>{uni.seo?.title || uni.nomi} - InfoEdu</title>
        <meta name="description" content={uni.seo?.description || `${uni.nomi} kirish ballari va yo'nalishlari`} />
      </Head>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        
        {/* Breadcrumb (Orqaga qaytish) */}
        <div className="mb-6">
          <Link 
            href="/oliygohlar" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Barcha oliygohlar ro'yxatiga qaytish
          </Link>
        </div>

        {/* Asosiy Info Kartochkasi */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden mb-10">
          <div className="md:flex">
            {/* Chap tomon: Rasm */}
            <div className="md:w-1/3 min-h-[250px] bg-gray-50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100 relative">
               <div className="absolute inset-0 bg-blue-50/30"></div>
              {uni.rasm ? (
                <img src={uni.rasm} alt={uni.nomi} className="relative z-10 w-full h-full object-contain max-h-[200px]" />
              ) : (
                <span className="relative z-10 text-7xl">🏛️</span>
              )}
            </div>
            
            {/* O'ng tomon: Ma'lumotlar */}
            <div className="p-8 md:w-2/3 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 leading-tight">
                {uni.nomi}
              </h1>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mt-1">
                    📍
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Manzil</p>
                    <p className="text-gray-900 font-medium">{uni.kontakt?.manzil || "Kiritilmagan"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mt-1">
                    📞
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Telefon</p>
                    <p className="text-gray-900 font-medium">{uni.kontakt?.telefon || "Kiritilmagan"}</p>
                  </div>
                </div>

                {uni.kontakt?.vebsayt && (
                  <div className="flex items-start">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mt-1">
                        🌐
                     </div>
                     <div className="ml-4">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Vebsayt</p>
                        <a href={uni.kontakt.vebsayt} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                          {uni.kontakt.vebsayt}
                        </a>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEO Matn (Agar bo'lsa) */}
          {uni.seo?.matn && (
            <div className="p-8 border-t border-gray-100 bg-gray-50/50">
               <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: uni.seo.matn }}></div>
            </div>
          )}
        </div>

        {/* Jadval Qismi */}
        <div className="mb-6 flex items-center justify-between">
           <h2 className="text-2xl font-bold text-gray-900">Kirish ballari va Kvotalar (2024-2025)</h2>
           <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Jami: {directions.length} yo'nalish</span>
        </div>
        
        {directions.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-600 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                    <th className="p-5 w-24">Kod</th>
                    <th className="p-5">Yo'nalish nomi</th>
                    <th className="p-5 w-32">Ta'lim tili</th>
                    <th className="p-5 text-center w-32 bg-green-50/30 text-green-700">Grant</th>
                    <th className="p-5 text-center w-32 bg-blue-50/30 text-blue-700">Kontrakt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {directions.map((dir, index) => (
                    <tr key={index} className="hover:bg-gray-50/80 transition-colors text-sm group">
                      <td className="p-5 font-mono text-gray-500 font-medium">{dir.dirid}</td>
                      <td className="p-5 font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {dir.dirnm}
                        <div className="text-xs font-normal text-gray-400 mt-0.5">{dir.emnm}</div>
                      </td>
                      <td className="p-5 text-gray-600">
                        <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs">{dir.langnm}</span>
                      </td>
                      <td className="p-5 text-center bg-green-50/10">
                        <div className="font-extrabold text-green-600 text-base">{dir.ballgr}</div>
                        <div className="text-[10px] text-gray-400 uppercase mt-0.5">{dir.grantnm} o'rin</div>
                      </td>
                      <td className="p-5 text-center bg-blue-50/10">
                        <div className="font-extrabold text-blue-600 text-base">{dir.ballk}</div>
                        <div className="text-[10px] text-gray-400 uppercase mt-0.5">{dir.contractnm} o'rin</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-10 bg-white border border-dashed border-gray-300 rounded-2xl text-center">
            <span className="text-4xl mb-3 block">📂</span>
            <h3 className="text-lg font-medium text-gray-900">Ma'lumot topilmadi</h3>
            <p className="text-gray-500 mt-1">Ushbu universitet uchun yo'nalishlar bazaga kiritilmagan.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}