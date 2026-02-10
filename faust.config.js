import { setContext } from "@apollo/client/link/context";
import { setConfig } from "@faustwp/core";
import templates from "./src/wp-templates";
import possibleTypes from "./possibleTypes.json";

/**
 * Barcha GraphQL so'rovlariga x-build-secret header qo'shadigan plugin.
 * Cloudflare whitelist uchun build serverini identifikatsiya qilish.
 * GET va POST so'rovlariga birdek qo'llanadi.
 */
const buildSecretPlugin = {
  apply(hooksInstance) {
    hooksInstance.addFilter(
      "apolloClientOptions",
      "build-secret-header",
      (apolloClientOptions) => {
        const secret = process.env.BUILD_SECRET;
        if (!secret) return apolloClientOptions;

        const buildSecretLink = setContext((_, { headers = {} }) => ({
          headers: {
            ...headers,
            "x-build-secret": secret,
          },
        }));

        return {
          ...apolloClientOptions,
          link: buildSecretLink.concat(apolloClientOptions.link),
        };
      }
    );
  },
};

/**
 * @type {import('@faustwp/core').FaustConfig}
 **/
export default setConfig({
  templates,
  possibleTypes,
  plugins: [buildSecretPlugin],
  // Disable persisted queries to avoid PersistedQueryNotFound errors during build/SSG
  usePersistedQueries: false,
});
