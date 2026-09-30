/**
 * Vuex-facing API entry point.
 *
 * Do not change this import path — exact match alias supports dotenv
 * customizations. Composables should import from `@/api/client` instead.
 *
 * The HTTP client's auth/interceptor pipeline is configured once at app
 * bootstrap in `main.js` via `configureApiClient`; this module is now a thin
 * re-export so legacy Vuex code can keep importing `@/store/api`.
 */
import api, {
  getResponseCount,
  isPasswordExpired,
  findMessageId,
} from '@/api/client';

export default api;
export { getResponseCount, isPasswordExpired, findMessageId };
