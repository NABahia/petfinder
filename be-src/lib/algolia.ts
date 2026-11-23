import "dotenv/config";
import { algoliasearch } from "algoliasearch";

const rawAlgoliaAppId = process.env.ALGOLIA_APP_ID;
const rawAlgoliaApiKey = process.env.ALGOLIA_API_KEY;
const rawAlgoliaIndex = process.env.ALGOLIA_INDEX_NAME;

if (!rawAlgoliaAppId || !rawAlgoliaApiKey || !rawAlgoliaIndex) {
  throw new Error(
    "Falta configurar ALGOLIA_APP_ID, ALGOLIA_API_KEY o ALGOLIA_INDEX_NAME en las variables de entorno",
  );
}

const algoliaClient = algoliasearch(rawAlgoliaAppId, rawAlgoliaApiKey);
const algoliaIndex: string = rawAlgoliaIndex;

export { algoliaClient, algoliaIndex };
