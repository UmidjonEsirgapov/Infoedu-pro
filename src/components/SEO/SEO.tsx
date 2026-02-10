import Head from "next/head";
import { useCanonicalUrl } from "@/utils/getCanonicalUrl";

interface Props {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  /** og:image uchun tavsiya etilgan o'lcham (Google Discover: min 1200px kenglik) */
  imageWidth?: number | null;
  imageHeight?: number | null;
  url?: string | null;
  canonicalUrl?: string | null;
  modifiedDate?: string | null;
  /** Maqola sahifalari uchun: article:published_time va og:type="article" (Google Discover) */
  publishedDate?: string | null;
  /** og:type - maqolalar uchun "article", boshqa sahifalar uchun "website" */
  type?: 'website' | 'article';
}

/**
 * Format date to ISO 8601 format for meta tags
 */
function formatDateForMeta(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    // ISO 8601 format: YYYY-MM-DDTHH:mm:ss+00:00
    return date.toISOString();
  } catch (error) {
    console.warn('Invalid date format for SEO:', dateString);
    return null;
  }
}

/**
 * Provide SEO related meta tags to a page.
 *
 * @param {Props} props The props object.
 * @param {string} props.title Used for the page title, og:title, twitter:title, etc.
 * @param {string} props.description Used for the meta description, og:description, twitter:description, etc.
 * @param {string} props.imageUrl Used for the og:image and twitter:image. NOTE: Must be an absolute url.
 * @param {string} props.url Used for the og:url and twitter:url.
 * @param {string} props.canonicalUrl Used for the canonical link tag. If not provided, will be auto-generated from router.
 * @param {string} props.modifiedDate Used for og:updated_time and article:modified_time. Should be ISO 8601 format or WordPress date string.
 *
 * @returns {React.ReactElement} The SEO component
 */
export default function SEO({
  title,
  description,
  imageUrl,
  imageWidth,
  imageHeight,
  url,
  canonicalUrl,
  modifiedDate,
  publishedDate,
  type = 'website',
}: Props) {
  // Auto-generate canonical URL if not provided
  const autoCanonicalUrl = useCanonicalUrl(canonicalUrl || undefined);
  const finalCanonicalUrl = canonicalUrl || autoCanonicalUrl;
  
  // Use canonical URL for og:url and twitter:url if url is not explicitly provided
  const finalUrl = url || finalCanonicalUrl;

  // Format dates to ISO 8601
  const formattedModifiedDate = formatDateForMeta(modifiedDate);
  const formattedPublishedDate = formatDateForMeta(publishedDate);

  if (!title && !description && !imageUrl && !finalUrl) {
    return null;
  }

  const descriptionNoHtmlTags = description?.replace(/<[^>]*>?/gm, "") || "";

  return (
    <>
      <Head>
        <meta property="og:type" content={type} />
        <meta property="twitter:card" content="summary_large_image" />

        {title && (
          <>
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta property="og:title" content={title} />
            <meta property="twitter:title" content={title} />
          </>
        )}

        {!!descriptionNoHtmlTags && (
          <>
            <meta name="description" content={descriptionNoHtmlTags} />
            <meta property="og:description" content={descriptionNoHtmlTags} />
            <meta
              property="twitter:description"
              content={descriptionNoHtmlTags}
            />
          </>
        )}

        {imageUrl && (
          <>
            <meta property="og:image" content={imageUrl} />
            <meta property="twitter:image" content={imageUrl} />
            {/* Google Discover: rasm min 1200px kenglik tavsiya; og:image o'lchamlari indexlashga yordam beradi */}
            {(imageWidth != null && imageWidth > 0) && (
              <meta property="og:image:width" content={String(imageWidth)} />
            )}
            {(imageHeight != null && imageHeight > 0) && (
              <meta property="og:image:height" content={String(imageHeight)} />
            )}
          </>
        )}

        {finalUrl && (
          <>
            <meta property="og:url" content={finalUrl} />
            <meta property="twitter:url" content={finalUrl} />
          </>
        )}

        {/* Maqola sanalari - Google Discover va indekslash uchun */}
        {formattedPublishedDate && (
          <meta property="article:published_time" content={formattedPublishedDate} />
        )}
        {formattedModifiedDate && (
          <>
            <meta property="og:updated_time" content={formattedModifiedDate} />
            <meta property="article:modified_time" content={formattedModifiedDate} />
          </>
        )}

        {/* Canonical URL - SEO uchun muhim */}
        {finalCanonicalUrl && (
          <link rel="canonical" href={finalCanonicalUrl} />
        )}
      </Head>
    </>
  );
}
