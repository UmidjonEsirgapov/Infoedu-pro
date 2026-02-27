import { setContext } from "@apollo/client/link/context";
import { setConfig } from "@faustwp/core";
import templates from "./src/wp-templates";
import possibleTypes from "./possibleTypes.json";

/**
 * Barcha GraphQL so'rovlariga x-build-secret header qo'shadigan plugin.
 * Cloudflare whitelist uchun build serverini identifikatsiya qilish.
 * GET va POST so'rovlariga birdek qo'llanadi.
 */
/** NextAuth orqali kirilganda WordPress JWT ni Apollo so'rovlariga qo'shadigan link (client'da window.__NEXT_AUTH_WP_TOKEN) */
const nextAuthWpTokenLink = setContext((_, { headers = {} }) => {
  const token =
    typeof globalThis !== "undefined" && globalThis.__NEXT_AUTH_WP_TOKEN;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const buildSecretPlugin = {
  apply(hooksInstance) {
    hooksInstance.addFilter(
      "apolloClientOptions",
      "build-secret-header",
      (apolloClientOptions) => {
        const secret = process.env.BUILD_SECRET;
        // Avval NextAuth wpToken (client'da globalThis.__NEXT_AUTH_WP_TOKEN), keyin build-secret, keyin Faust link
        const withWpToken = nextAuthWpTokenLink.concat(apolloClientOptions.link);
        const newLink = secret
          ? setContext((_, { headers = {} }) => ({
              headers: { ...headers, "x-build-secret": secret },
            })).concat(withWpToken)
          : withWpToken;
        return {
          ...apolloClientOptions,
          link: newLink,
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
