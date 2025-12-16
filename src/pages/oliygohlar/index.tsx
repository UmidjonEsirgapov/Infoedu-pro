import React from 'react';
import { GetStaticProps } from 'next';
import { getApolloClient } from '@faustwp/core';
import { gql } from '@apollo/client';
import PageLayout from '@/container/PageLayout';
import OliygohCard from '@/components/oliygoh/OliygohCard';
import { NcgeneralSettingsFieldsFragmentFragment } from '@/__generated__/graphql';

interface OliygohItem {
  title: string;
  slug: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
    };
  } | null;
  oliygohMalumotlari?: {
    viloyat?: string | string[] | null;
    universitetTuri?: string[] | null;
  } | null;
  excerpt?: string | null;
}

interface OliygohlarPageProps {
  oliygohlar: OliygohItem[];
  generalSettings?: NcgeneralSettingsFieldsFragmentFragment | null;
  primaryMenuItems?: any[];
  footerMenuItems?: any[];
}

const OLIYGOHLAR_QUERY = gql`
  query GetAllOliygohlar($first: Int!) {
    oliygohlar(first: $first) {
      nodes {
        title
        slug
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        oliygohMalumotlari {
          viloyat
          universitetTuri
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
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

const OliygohlarPage: React.FC<OliygohlarPageProps> = ({
  oliygohlar = [],
  generalSettings,
  primaryMenuItems,
  footerMenuItems,
}) => {
  return (
    <PageLayout
      headerMenuItems={primaryMenuItems}
      footerMenuItems={footerMenuItems}
      pageTitle="Oliygohlar"
      pageDescription="O'zbekistondagi barcha oliy ta'lim muassasalari ro'yxati"
      generalSettings={generalSettings}
    >
      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Oliygohlar
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl">
              O'zbekistondagi barcha oliy ta'lim muassasalari ro'yxati. Kirish ballari, qabul kvotalari va batafsil ma'lumotlar.
            </p>
          </div>
        </div>

        {/* Oliygohlar Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {oliygohlar && oliygohlar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oliygohlar.map((oliygoh, index) => (
                <OliygohCard
                  key={oliygoh.slug || index}
                  title={oliygoh.title}
                  slug={oliygoh.slug}
                  featuredImage={oliygoh.featuredImage?.node?.sourceUrl}
                  viloyat={oliygoh.oliygohMalumotlari?.viloyat}
                  excerpt={oliygoh.excerpt}
                  universitetTuri={oliygoh.oliygohMalumotlari?.universitetTuri}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">Oliygohlar topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const client = getApolloClient();

  try {
    const { data, errors } = await client.query({
      query: OLIYGOHLAR_QUERY,
      variables: {
        first: 100,
      },
      fetchPolicy: 'network-only',
    });

    // GraphQL schema'da oliygohlar (ikki 'y') ko'rsatilgan
    const oliygohlarNodes = data?.oliyygohlar?.nodes || [];

    return {
      props: {
        oliygohlar: oliygohlarNodes,
        generalSettings: data?.generalSettings || null,
        primaryMenuItems: data?.primaryMenuItems?.nodes || [],
        footerMenuItems: data?.footerMenuItems?.nodes || [],
      },
      revalidate: 60,
    };
  } catch (error: any) {
    console.error('[Server] Oliygohlar olishda xatolik:', error);
    if (error?.graphQLErrors) {
      console.error('[Server] GraphQL Errors:', error.graphQLErrors);
    }
    if (error?.networkError) {
      console.error('[Server] Network Error:', error.networkError);
    }
    return {
      props: {
        oliygohlar: [],
        generalSettings: null,
        primaryMenuItems: [],
        footerMenuItems: [],
      },
      revalidate: 60,
    };
  }
};

export default OliygohlarPage;
