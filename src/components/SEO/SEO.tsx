import Head from "next/head";
import { useCanonicalUrl } from "@/utils/getCanonicalUrl";

interface Props {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  url?: string | null;
  canonicalUrl?: string | null;
  modifiedDate?: string | null;
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
export default function SEO({ title, description, imageUrl, url, canonicalUrl, modifiedDate }: Props) {
  // Auto-generate canonical URL if not provided
  const autoCanonicalUrl = useCanonicalUrl(canonicalUrl || undefined);
  const finalCanonicalUrl = canonicalUrl || autoCanonicalUrl;
  
  // Use canonical URL for og:url and twitter:url if url is not explicitly provided
  const finalUrl = url || finalCanonicalUrl;

  // Format modified date to ISO 8601
  const formattedModifiedDate = formatDateForMeta(modifiedDate);

  if (!title && !description && !imageUrl && !finalUrl) {
    return null;
  }

  const descriptionNoHtmlTags = description?.replace(/<[^>]*>?/gm, "") || "";

  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
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
          </>
        )}

        {finalUrl && (
          <>
            <meta property="og:url" content={finalUrl} />
            <meta property="twitter:url" content={finalUrl} />
          </>
        )}

        {/* Content Freshness - Modified Date */}
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
