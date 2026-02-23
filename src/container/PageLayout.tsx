import SEO from "@/components/SEO/SEO";
import React, { FC } from "react";
import SiteHeader from "./SiteHeader";
import Footer from "@/components/Footer/Footer";
import { FragmentType } from "@/__generated__";
import {
  NC_FOOTER_MENU_QUERY_FRAGMENT,
  NC_PRIMARY_MENU_QUERY_FRAGMENT,
} from "@/fragments/menu";
import { NcgeneralSettingsFieldsFragmentFragment } from "@/__generated__/graphql";

interface Props {
  children: React.ReactNode;
  pageTitle?: string | null | undefined;
  headerMenuItems?: FragmentType<typeof NC_PRIMARY_MENU_QUERY_FRAGMENT>[];
  footerMenuItems?: FragmentType<typeof NC_FOOTER_MENU_QUERY_FRAGMENT>[] | null;
  pageFeaturedImageUrl?: string | null | undefined;
  /** og:image o'lchamlari (Google Discover: 1200x630 tavsiya) */
  pageImageWidth?: number | null | undefined;
  pageImageHeight?: number | null | undefined;
  generalSettings?: NcgeneralSettingsFieldsFragmentFragment | null | undefined;
  pageDescription?: string | null | undefined;
  pageModifiedDate?: string | null | undefined;
  /** Maqola sahifalari uchun - Google Discover: article:published_time */
  pagePublishedDate?: string | null | undefined;
  /** og:type - maqolalar uchun "article" */
  seoType?: 'website' | 'article';
  /** false bo'lsa meta title oxiriga sitename qo'shilmaydi */
  appendSiteName?: boolean;
}

const PageLayout: FC<Props> = ({
  children,
  footerMenuItems,
  headerMenuItems,
  pageFeaturedImageUrl,
  pageImageWidth,
  pageImageHeight,
  pageTitle,
  generalSettings,
  pageDescription,
  pageModifiedDate,
  pagePublishedDate,
  seoType = 'website',
  appendSiteName = true,
}) => {
  // Takroriy meta description xatosini bartaraf etish: bo'sh description da sahifa sarlavhasidan unique fallback
  const siteDesc = generalSettings?.description || "";
  const uniqueDescription =
    pageDescription?.trim() ||
    (pageTitle?.trim()
      ? `${pageTitle.trim()}. ${siteDesc}`.trim()
      : siteDesc);

  const documentTitle = appendSiteName
    ? (pageTitle || "") + " - " + (generalSettings?.title || "")
    : (pageTitle || "");

  return (
    <>
      <SEO
        title={documentTitle}
        description={uniqueDescription}
        imageUrl={pageFeaturedImageUrl}
        imageWidth={pageImageWidth}
        imageHeight={pageImageHeight}
        modifiedDate={pageModifiedDate}
        publishedDate={pagePublishedDate}
        type={seoType}
      />

      <SiteHeader
        siteTitle={generalSettings?.title}
        siteDescription={generalSettings?.description}
        menuItems={headerMenuItems || []}
      />

      {children}

      <Footer menuItems={footerMenuItems || []} />
    </>
  );
};

export default PageLayout;
