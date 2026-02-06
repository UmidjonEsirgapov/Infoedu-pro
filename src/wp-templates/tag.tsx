import { gql } from "@/__generated__";
import {
  NcgeneralSettingsFieldsFragmentFragment,
  PageTagGetTagQuery,
} from "@/__generated__/graphql";
import { TCategoryCardFull } from "@/components/CardCategory1/CardCategory1";
import SocialsShareDropdown from "@/components/SocialsShareDropdown/SocialsShareDropdown";
import PageLayout from "@/container/PageLayout";
import ArchiveLayout from "@/container/archives/ArchiveLayout";
import { GET_POSTS_FIRST_COMMON } from "@/contains/contants";
import { FOOTER_LOCATION, PRIMARY_LOCATION } from "@/contains/menu";
import { PostDataFragmentType } from "@/data/types";
import { getTagDataFromTagFragment } from "@/utils/getTagDataFromTagFragment";
import { FaustTemplate } from "@faustwp/core";
import { FireIcon, HashtagIcon } from "@heroicons/react/24/outline";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Link from "next/link";

const Tag: FaustTemplate<PageTagGetTagQuery> = (props) => {
  // LOADING ----------
  if (props.loading) {
    return <>Loading...</>;
  }

  if (!props?.data || !props.data.tag) {
    return null;
  }

  // START ----------
  const { databaseId, count, description, name, uri } =
    getTagDataFromTagFragment(props.data.tag);
  const initPostsPageInfo = props.data?.tag?.posts?.pageInfo;
  const posts = props.data?.tag?.posts;
  const _top10Categories =
    (props.data?.categories?.nodes as TCategoryCardFull[]) || [];
  const _topTags = props.data?.tags?.nodes || [];
  
  return (
    <>
      <PageLayout
        headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
        footerMenuItems={props.data?.footerMenuItems?.nodes || []}
        pageFeaturedImageUrl={null}
        pageTitle={"Tag " + name}
        pageDescription={description || ""}
        generalSettings={
          props.data?.generalSettings as NcgeneralSettingsFieldsFragmentFragment
        }
        >
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              {
                label: name || "Tag",
                href: uri || "/",
              },
            ]}
          />
          
          <ArchiveLayout
            name={name}
            initPosts={posts?.nodes as PostDataFragmentType[] | null}
            initPostsPageInfo={initPostsPageInfo}
            tagDatabaseId={databaseId}
            taxonomyType="tag"
            top10Categories={_top10Categories}
          >
            <div className="container mt-4 md:mt-10">
            <div className="relative border border-neutral-200/70 dark:border-neutral-700 p-5 lg:p-7 rounded-3xl md:rounded-[2rem] flex flex-col md:flex-row gap-4 md:gap-6 xl:gap-12">
              <div className="flex-shrink-0">
                <div className="wil-avatar relative flex-shrink-0 overflow-hidden rounded-3xl w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 ring-4 ring-white dark:ring-0 z-0">
                  <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <HashtagIcon className="w-8 h-8 lg:w-12 lg:h-12" />
                  </div>
                </div>
              </div>

              {/*  */}
              <div className="flex-grow">
                <div className="max-w-screen-md space-y-3.5 ">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold">
                    <span>{name}</span>
                  </h2>
                  <div className="flex items-center text-sm font-medium space-x-2 rtl:space-x-reverse cursor-pointer text-neutral-500 dark:text-neutral-400 ">
                    <FireIcon className="w-5 h-5" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {count || 0} Articles
                    </span>
                  </div>
                  <span className="block text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
                    {description}
                  </span>
                </div>
              </div>

              {/*  */}
              <div className="absolute top-5 end-5">
                <SocialsShareDropdown />
              </div>
            </div>
          </div>
          
          {/* Related Tags Section */}
          {_topTags && _topTags.length > 0 && (
            <div className="container mt-12 mb-8">
              <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
                <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
                  Teglar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {_topTags
                    .filter((tag: any) => tag.databaseId !== databaseId)
                    .slice(0, 12)
                    .map((tag: any) => (
                      <Link
                        key={tag.databaseId}
                        href={tag.uri || "/"}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white rounded-lg border border-neutral-200 hover:bg-neutral-50 hover:text-blue-600 transition-colors dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-blue-400"
                      >
                        #{tag.name}
                        {tag.count && (
                          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                            ({tag.count})
                          </span>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          )}
          {/* ====================== END HEADER ====================== */}
        </ArchiveLayout>
      </PageLayout>
    </>
  );
};

Tag.variables = ({ id }) => ({
  id,
  first: GET_POSTS_FIRST_COMMON,
  headerLocation: PRIMARY_LOCATION,
  footerLocation: FOOTER_LOCATION,
});

Tag.query = gql(`
 query PageTagGetTag($id: ID!, $first: Int, $headerLocation: MenuLocationEnum!, $footerLocation: MenuLocationEnum!) {
    tag(id: $id) {
       ...NcmazFcTagFullFieldsFragment
      
      posts(first: $first, where: {orderby: {field: DATE, order: DESC}}) {
        nodes {
          ...NcmazFcPostCardFields
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
    categories(first:10, where: { orderby: COUNT, order: DESC }) {
      nodes {
        ...NcmazFcCategoryFullFieldsFragment
      }
    }
    tags(first: 20, where: { orderby: COUNT, order: DESC }) {
      nodes {
        databaseId
        name
        uri
        count
      }
    }
     # common query for all page 
   generalSettings {
      ...NcgeneralSettingsFieldsFragment
    }
    primaryMenuItems: menuItems(where: { location:  $headerLocation  }, first: 80) {
      nodes {
        ...NcPrimaryMenuFieldsFragment
      }
    }
    footerMenuItems: menuItems(where: { location:  $footerLocation  }, first: 50) {
      nodes {
        ...NcFooterMenuFieldsFragment
      }
    }
    # end common query for all page
  }`);

export default Tag;
