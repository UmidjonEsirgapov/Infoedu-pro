import { setConfig } from "@faustwp/core";
import templates from "./src/wp-templates";
import possibleTypes from "./possibleTypes.json";

/**
 * @type {import('@faustwp/core').FaustConfig}
 **/
export default setConfig({
  templates,
  possibleTypes,
  // Disable persisted queries to avoid PersistedQueryNotFound errors during build/SSG
  // Persisted queries require server-side setup and may not work during static generation
  usePersistedQueries: false,
});
