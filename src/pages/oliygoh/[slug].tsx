import { getApolloClient } from '@faustwp/core';
import Universitet from '../../wp-templates/universitet';
import { GetStaticProps, GetStaticPaths } from 'next';
import fs from 'fs';
import path from 'path';

export default function Page(props: any) {
  if (!props.data) {
     return <div className="p-10 text-center">Yuklanmoqda...</div>;
  }
  return <Universitet {...props} />;
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const client = getApolloClient();
  const { slug } = ctx.params || {};
  const requestUri = `/oliygoh/${slug}/`;

  try {
    // 1. WordPressdan universitet: avvalo URI bo'yicha, bo'lmasa slug orqali (WP CPT "universitetlar" bo'lsa URI boshqacha bo'ladi)
    const { data } = await client.query({
      query: Universitet.query!,
      variables: { uri: requestUri, slug: slug || null },
      fetchPolicy: 'network-only'
    });

    const nodeByUri = data?.nodeByUri;
    const oliygohBy = data?.oliygohBy;
    const hasData = nodeByUri || oliygohBy;

    if (!hasData) {
      return { notFound: true };
    }

    // Slug orqali topilgan bo'lsa, shablon nodeByUri kutyapti — bitta node qilib beramiz
    const dataForTemplate = nodeByUri
      ? data
      : { ...data, nodeByUri: oliygohBy };

    // WP dagi nomi: "Andijon davlat universiteti"
    const wpTitle = hasData.title;

    if (!wpTitle) {
      return { notFound: true };
    }

    // 2. Sizning 'scores.json' faylingizdan shu universitetni qidiramiz
    let matchedScores = [];
    try {
      const filePath = path.join(process.cwd(), 'src/data/scores.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const allScores = JSON.parse(fileContents);
      
      // Normalize funksiyasi: barcha belgilarni tozalash va kichik harfga o'tkazish
      const normalize = (str: string) => {
        return str
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ') // Ko'p bo'shliqlarni bittaga
          .replace(/[''`]/g, "'") // Barcha apostroflarni bittaga
          .replace(/ʻ/g, "'") // O'zbek apostrofi
          .replace(/ʼ/g, "'"); // Boshqa apostrof variantlari
      };
      
      const normalizedWpTitle = normalize(wpTitle);
      
      // JSON ichidagi "OTM" kaliti bo'yicha solishtiramiz
      matchedScores = allScores.filter((item: any) => {
        if (!item.OTM) return false;
        const normalizedOTM = normalize(item.OTM);
        return normalizedOTM === normalizedWpTitle;
      });
    } catch (err) {
      console.error('⚠️ scores.json o\'qishda xatolik:', err);
    }

    return {
      props: {
        data: dataForTemplate,
        quotas: matchedScores
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('💥 Xatolik:', error);
    return { notFound: true };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};