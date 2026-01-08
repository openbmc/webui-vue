import type { AxiosRequestConfig } from "axios";
import Axios from "axios";
import {
  setupCache,
  buildWebStorage,
  buildMemoryStorage,
} from "axios-cache-interceptor";
import Cookies from "js-cookie";

/**
 * Axios instance for Orval-generated API clients.
 *
 * This is a standalone instance that mirrors the configuration from
 * src/store/api.js but without the Vue store dependencies (which can't
 * be resolved during Orval's bundling phase).
 *
 * Features:
 * - Cache setup via axios-cache-interceptor
 * - Same default headers as main app
 * - Cancel token support for query cancellation
 *
 * Note: Auth token and response interceptors are handled separately.
 * The X-Auth-Token header should be set after login via setAuthToken().
 */

const axiosInstance = Axios.create({
  withCredentials: true,
});

// Use localStorage in browser, memory storage in Node/SSR/tests
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";
const cacheStorage = isBrowser
  ? buildWebStorage(localStorage, "webui-vue-orval-cache:")
  : buildMemoryStorage();

// Setup caching (same config as src/store/api.js)
const api = setupCache(axiosInstance, {
  methods: ["get"],
  interpretHeader: false,
  etag: true,
  modifiedSince: false,
  staleIfError: false,
  ttl: 0,
  storage: cacheStorage,
});

api.defaults.headers.common["Accept"] = "application/json";
api.defaults.headers.common["Content-Type"] = "application/json";
api.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Enable persisting X-Auth-Token in a cookie when explicitly requested
// (same condition as src/store/api.js)
const shouldPersistAuthToken =
  import.meta.env.VITE_STORE_SESSION === "true" ||
  import.meta.env.STORE_SESSION === "true";

/**
 * Set the X-Auth-Token header for authenticated requests.
 * Call this after login to enable auth for Orval-generated API calls.
 * Only used when VITE_STORE_SESSION is enabled (non-bmcweb backends).
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common["X-Auth-Token"] = token;
  } else {
    delete api.defaults.headers.common["X-Auth-Token"];
  }
};

// Initialize auth token from cookie if available (same as src/store/api.js)
// Only for non-bmcweb backends that use X-Auth-Token instead of XSRF cookies
if (shouldPersistAuthToken) {
  const persistedToken = Cookies.get("X-Auth-Token");
  if (persistedToken) {
    api.defaults.headers.common["X-Auth-Token"] = persistedToken;
  }
}

export const apiInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = api({ ...config, cancelToken: source.token }).then(
    ({ data }) => data,
  );

  // @ts-expect-error - Adding cancel method for query cancellation support
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default apiInstance;
