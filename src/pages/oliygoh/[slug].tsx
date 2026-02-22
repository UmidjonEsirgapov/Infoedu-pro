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
  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }

  // URI formatlari: WP ba'zan trailing slash bilan yoki siz holda saqlaydi
  const uriVariants = [
    `/oliygoh/${slug}/`,
    `/oliygoh/${slug}`,
  ];

  const MAX_RETRIES = 2;
  let data: any = null;
  let nodeByUri: any = null;
  let oliygohBy: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      for (const requestUri of uriVariants) {
        const result = await client.query({
          query: Universitet.query!,
          variables: { uri: requestUri, slug },
          fetchPolicy: 'network-only',
        });
        data = result?.data;
        nodeByUri = data?.nodeByUri;
        oliygohBy = data?.oliygohBy;
        if (nodeByUri?.title || oliygohBy?.title) break;
      }
      if (nodeByUri?.title || oliygohBy?.title) break;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        console.error('💥 Oliygoh getStaticProps xatolik:', err);
        return { notFound: true };
      }
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }

  const hasDataNode = nodeByUri?.title ? nodeByUri : oliygohBy;
  if (!hasDataNode?.title) {
    return { notFound: true };
  }
  data = data || {};
  // Slug orqali topilgan bo'lsa, shablon nodeByUri kutyapti — bitta node qilib beramiz
  const dataForTemplate = nodeByUri?.title
    ? data
    : { ...data, nodeByUri: oliygohBy };

  const wpTitle = hasDataNode.title;

  // 2. scores.json dan shu universitet/fakultet uchun balllarni qidirish
  let matchedScores: any[] = [];
  try {
    const filePath = path.join(process.cwd(), 'src/data/scores.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const allScores = JSON.parse(fileContents);
    // Apostrof/tirnoq barcha turlari va -ning qisqartirish
    const normalizeForMatch = (str: string) =>
      str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[''`ʻʼ\u02BC\u201C\u201D\u201E\u201F"]/g, '')
        .replace(/institutining/g, 'instituti')
        .replace(/universiteting/g, 'universiteti');
    const normalizedWpTitle = normalizeForMatch(wpTitle);
    matchedScores = allScores.filter((item: any) => {
      if (!item.OTM) return false;
      return normalizeForMatch(item.OTM) === normalizedWpTitle;
    });
    // Aniq mos kelmasa: sarlavha qaysi OTM ni o'z ichiga oladi — shu guruhni ol (eng uzun OTM, ortiqcha yo'nalish chiqmasin)
    if (matchedScores.length === 0) {
      const contained = allScores.filter((item: any) => {
        if (!item.OTM) return false;
        const n = normalizeForMatch(item.OTM);
        return n.length >= 20 && normalizedWpTitle.includes(n);
      });
      if (contained.length > 0) {
        const byOtm = new Map<string, any[]>();
        contained.forEach((item: any) => {
          const key = normalizeForMatch(item.OTM);
          if (!byOtm.has(key)) byOtm.set(key, []);
          byOtm.get(key)!.push(item);
        });
        const longestKey = [...byOtm.keys()].sort((a, b) => b.length - a.length)[0];
        matchedScores = byOtm.get(longestKey) || [];
      }
    }
  } catch (err) {
    console.error('⚠️ scores.json o\'qishda xatolik:', err);
  }

  return {
    props: {
      data: dataForTemplate,
      quotas: matchedScores,
    },
    revalidate: 300, // 5 min — xato 404 cache qolmasin; Vercel ISR ni ham oshirmaydi
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};