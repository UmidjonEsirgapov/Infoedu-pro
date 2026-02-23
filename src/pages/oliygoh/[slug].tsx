import { gql } from '@apollo/client';
import { getApolloClient } from '@faustwp/core';
import Universitet from '../../wp-templates/universitet';
import { GetStaticProps, GetStaticPaths } from 'next';
import fs from 'fs';
import path from 'path';

const GET_OLIYGOH_LIST = gql`
  query GetOliygohListForRelated($first: Int!) {
    contentNodes(first: $first, where: { contentTypes: [OLIYGOH] }) {
      nodes {
        ... on Oliygoh {
          databaseId
          title
          slug
          uri
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          oliygohMalumotlari {
            viloyat
            universitetTuri
            yotoqxonaBormi
          }
        }
      }
    }
  }
`;

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

  // 3. Tavsiya: joylashuv (viloyat), yotoqxona, davlat univer, nom kalit so'zlari; hech narsa mos kelmasa ham 3 ta chiqadi
  let recommendedOliygohs: { title: string; slug: string; uri: string; featuredImage?: any; oliygohMalumotlari?: any }[] = [];
  try {
    const listRes = await client.query({
      query: GET_OLIYGOH_LIST,
      variables: { first: 250 },
      fetchPolicy: 'network-only',
    });
    const nodes = (listRes?.data?.contentNodes?.nodes || []).filter((n: any) => n?.__typename === 'Oliygoh' && n?.slug && n.slug !== slug);
    const info = hasDataNode?.oliygohMalumotlari || {};
    const currentViloyat = info.viloyat;
    const currentTuri = info.universitetTuri;
    const currentYotoqxona = info.yotoqxonaBormi;
    const currentTitle = (hasDataNode?.title || '').toLowerCase();
    const viloyatNorm = (v: any) => (Array.isArray(v) ? v[0] : v)?.trim?.()?.toLowerCase?.() || '';
    const turiNorm = (t: any) => (Array.isArray(t) ? t[0] : t)?.trim?.()?.toLowerCase?.() || '';
    const yotoqxonaNorm = (y: any) => {
      if (y === true || (typeof y === 'string' && y.toLowerCase().trim() === 'ha')) return true;
      if (y === false || (typeof y === 'string' && (y.toLowerCase().trim() === 'yo\'q' || y.trim() === ''))) return false;
      return null;
    };
    const curV = viloyatNorm(currentViloyat);
    const curT = turiNorm(currentTuri);
    const curY = yotoqxonaNorm(currentYotoqxona);
    const isDavlat = (s: string) => s.includes('davlat');
    const curDavlat = isDavlat(currentTitle) || isDavlat(turiNorm(currentTuri));
    const keywords = ['tibbiyot', 'pedagogika', 'institut', 'universitet', 'chet tillar', 'agrar', 'texnika', 'politexnika', 'iqtisod', 'qishloq', 'xalqaro', 'milliy', 'tarix', 'filologiya', 'sport', 'transport', 'moliya', 'energetika'];
    const titleKeywords = (s: string) => keywords.filter((k) => s.includes(k));
    const curKeywords = titleKeywords(currentTitle);
    const scored = nodes.map((n: any) => {
      const v = viloyatNorm(n.oliygohMalumotlari?.viloyat);
      const t = turiNorm(n.oliygohMalumotlari?.universitetTuri);
      const nY = yotoqxonaNorm(n.oliygohMalumotlari?.yotoqxonaBormi);
      const nTitle = (n.title || '').toLowerCase();
      const nDavlat = isDavlat(nTitle) || isDavlat(t);
      const nKeywords = titleKeywords(nTitle);
      let score = 0;
      if (curV && v === curV) score += 25;
      if (curT && t === curT) score += 12;
      if (curY !== null && nY !== null && curY === nY) score += 10;
      if (curDavlat && nDavlat) score += 8;
      score += curKeywords.filter((k) => nKeywords.includes(k)).length * 6;
      return { node: n, score };
    });
    scored.sort((a, b) => b.score - a.score);
    recommendedOliygohs = scored.slice(0, 3).map(({ node }: { node: any }) => ({
      title: node.title || '',
      slug: node.slug || '',
      uri: node.uri || `/oliygoh/${node.slug}`,
      featuredImage: node.featuredImage,
      oliygohMalumotlari: node.oliygohMalumotlari,
    }));
  } catch (err) {
    console.error('⚠️ Tavsiya oliygohlar ro\'yxati olinmadi:', err);
  }

  return {
    props: {
      data: dataForTemplate,
      quotas: matchedScores,
      recommendedOliygohs,
    },
    revalidate: 300,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};