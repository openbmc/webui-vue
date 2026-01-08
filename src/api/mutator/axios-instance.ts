import type { AxiosRequestConfig } from 'axios';
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

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

// Setup caching (same config as src/store/api.js)
const api = setupCache(axiosInstance, {
  methods: ['get'],
  interpretHeader: false,
  etag: true,
  modifiedSince: false,
  staleIfError: false,
  ttl: 0,
  storage: buildWebStorage(localStorage, 'webui-vue-orval-cache:'),
});

api.defaults.headers.common['Accept'] = 'application/json';
api.defaults.headers.common['Content-Type'] = 'application/json';
api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Set the X-Auth-Token header for authenticated requests.
 * Call this after login to enable auth for Orval-generated API calls.
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    axiosInstance.defaults.headers.common['X-Auth-Token'] = token;
  } else {
    delete axiosInstance.defaults.headers.common['X-Auth-Token'];
  }
};

export const apiInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = api({ ...config, cancelToken: source.token }).then(
    ({ data }) => data,
  );

  // @ts-expect-error - Adding cancel method for query cancellation support
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default apiInstance;
