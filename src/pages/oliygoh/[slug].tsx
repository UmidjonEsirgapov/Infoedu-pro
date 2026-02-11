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
    // 1. WordPressdan universitet nomini olamiz
    const { data } = await client.query({
      query: Universitet.query!,
      variables: { uri: requestUri },
      fetchPolicy: 'network-only'
    });

    const hasData = data?.nodeByUri || data?.oliygoh;

    if (!hasData) {
      return { notFound: true };
    }

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
        data: data,
        quotas: matchedScores // Topilgan ma'lumotni shablonga yuboramiz
      },
      revalidate: 3600, // 1 soat — ISR Writes limitini tejash
    };
  } catch (error) {
    console.error('💥 Xatolik:', error);
    return { notFound: true };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};