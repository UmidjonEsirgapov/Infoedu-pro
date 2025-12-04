import clientPromise from '../../../lib/mongodb';
import Link from 'next/link';
import PageLayout from '@/container/PageLayout';
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu';

export async function getServerSideProps() {
  // 1. MONGODB MA'LUMOTLARINI OLISH (Bu qism ishlayapti)
  let universities = [];
  let error = null;

  try {
    const client = await clientPromise;
    const db = client.db("InfoEdu");
    universities = await db.collection("universitetlar")
      .find({})
      .project({ _id: 1, nomi: 1, slug: 1, rasm: 1, "kontakt.manzil": 1 })
      .limit(50)
      .toArray();
    
    universities = JSON.parse(JSON.stringify(universities));
  } catch (e) {
    console.error("MongoDB Xatosi:", e);
    error = "Bazaga ulanishda xatolik bo'ldi.";
  }

  // 2. WORDPRESS MA'LUMOTLARINI OLISH (Tuzatilgan qism)
  // getClient() o'rniga oddiy fetch ishlatamiz. Bu xatosiz ishlaydi.
  let layoutData = {};

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL; // .env dan olinadi
    const graphqlUrl = `${wordpressUrl}/graphql`; // GraphQL manzili

    // So'rov matni
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
    layoutData = json.data;

  } catch (wpError) {
    console.error("WordPress Menu Error:", wpError);
    // Agar WordPress ishlamasa ham, sayt buzilmasligi uchun bo'sh obyekt qaytaramiz
    layoutData = { generalSettings: {}, primaryMenuItems: { nodes: [] }, footerMenuItems: { nodes: [] } };
  }

  return {
    props: {
      universities,
      error,
      headerMenuItems: layoutData?.primaryMenuItems?.nodes || [],
      footerMenuItems: layoutData?.footerMenuItems?.nodes || [],
      generalSettings: layoutData?.generalSettings || {},
    },
  };
}

export default function OliygohlarPage({ 
  universities, 
  error, 
  headerMenuItems, 
  footerMenuItems, 
  generalSettings 
}) {
  return (
    <PageLayout
      headerMenuItems={headerMenuItems}
      footerMenuItems={footerMenuItems}
      pageTitle="Oliy Ta'lim Muassasalari"
      generalSettings={generalSettings}
    >
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">Oliy Ta'lim Muassasalari</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">O'zbekistondagi barcha oliygohlar, kirish ballari, kvotalar va yo'nalishlar haqida to'liq ma'lumotlar bazasi.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {universities.map((uni) => (
            <div key={uni._id} className="bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
              
              {/* Rasm */}
              <div className="h-52 bg-gray-50 flex items-center justify-center relative p-6">
                {uni.rasm ? (
                  <img 
                    src={uni.rasm} 
                    alt={uni.nomi} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" 
                  />
                ) : (
                  <span className="text-gray-300 text-6xl">🏛️</span>
                )}
              </div>
              
              {/* Matn */}
              <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-xl font-bold mb-3 line-clamp-2 text-neutral-900 group-hover:text-blue-600 transition-colors">
                  {uni.nomi}
                </h2>
                <div className="mt-auto pt-2 flex items-start text-sm text-neutral-500">
                  <span className="mr-2 mt-0.5">📍</span> 
                  <span className="line-clamp-2">{uni.kontakt?.manzil || "Manzil ko'rsatilmagan"}</span>
                </div>
              </div>

              {/* Tugma */}
              <div className="px-6 pb-6 pt-2">
                <Link 
                  href={`/oliygohlar/${uni.slug}`} 
                  className="block w-full py-3.5 px-4 bg-slate-50 text-slate-700 font-semibold text-center rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  Batafsil ma'lumot
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!error && universities.length === 0 && (
          <div className="text-center text-gray-400 mt-20 py-10">
             <span className="text-4xl block mb-2">📂</span>
            <p className="text-lg">Hozircha ma'lumotlar yuklanmagan.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}