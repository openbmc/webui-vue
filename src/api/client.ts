/**
 * Redfish HTTP client for TanStack Vue Query composables and future openapi-ts
 * SDK wiring.
 *
 * Mirrors the typical layering in openapi-ts clients
 *   - a single shared HTTP instance (`apiInstance`) that generated SDK code can
 *     attach to via `client.setConfig({ ... })` / `client.instance`,
 *   - ETag-aware GET caching via axios-cache-interceptor,
 *   - and a thin method wrapper (`api`) used by composables today.
 *
 * Everything routes through `apiInstance` (not the bare axios instance) so the
 * implementation can be swapped for a generated openapi-ts client without
 * touching call sites. Vuex store modules continue to import from
 * `@/store/api`, which re-exports this module; auth interceptors are installed
 * once at bootstrap via `configureApiClient`.
 */

import Axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  setupCache,
  buildWebStorage,
  buildMemoryStorage,
} from 'axios-cache-interceptor';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
} from 'axios-cache-interceptor';
import { toRaw } from 'vue';
import Cookies from 'js-cookie';

Axios.defaults.headers.common['Accept'] = 'application/json';
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Persist the ETag cache in localStorage so it survives reloads, falling back
// to in-memory storage when localStorage is unavailable (SSR / Node test runs).
const isBrowser =
  typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const cacheStorage = isBrowser
  ? buildWebStorage(localStorage, 'webui-vue-cache:')
  : buildMemoryStorage();

/**
 * Shared, cache-aware HTTP instance used for all Redfish requests.
 *
 * This is the single exported transport: generated openapi-ts SDK code can
 * attach to it via `client.setConfig({ ... })` / `client.instance`, letting us
 * migrate away from the hand-written axios calls without changing the auth or
 * caching pipeline.
 */
export const apiInstance: AxiosCacheInstance = setupCache(
  Axios.create({
    withCredentials: true,
  }),
  {
    debug: import.meta.env.DEV ? console.log : undefined,
    methods: ['get'],
    interpretHeader: false,
    etag: true,
    modifiedSince: false,
    staleIfError: false,
    ttl: 0,
    storage: cacheStorage,
  },
);

export interface ApiClientHandlers {
  /** Called on 401 (except login POST). Typically logout + redirect. */
  onUnauthorized?: () => void;
  /** Called on 403 when password change is required. */
  onPasswordExpired?: () => void;
  /** Called on 403 for other authorization failures. */
  onForbidden?: () => void;
}

let configured = false;

/**
 * Install auth and payload interceptors once at app bootstrap.
 * Called from `src/main.js` via `configureApiClient()` after the Vuex
 * store and router are created.
 */
export function configureApiClient(
  handlers: ApiClientHandlers = {},
  options: { shouldPersistAuthToken?: boolean } = {},
): void {
  if (configured) return;
  configured = true;

  const shouldPersistAuthToken =
    options.shouldPersistAuthToken ??
    (import.meta.env.VITE_STORE_SESSION === 'true' ||
      import.meta.env.STORE_SESSION === 'true');

  if (shouldPersistAuthToken) {
    const persistedToken = Cookies.get('X-Auth-Token');
    if (persistedToken) {
      apiInstance.defaults.headers.common['X-Auth-Token'] = persistedToken;
    }
  }

  apiInstance.interceptors.request.use(
    (config) => {
      if (config.data) {
        config.data = stripVueReactivity(config.data);
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const response = error?.response as AxiosResponse | undefined;
      const status = response?.status;

      if (!status) return Promise.reject(error);

      if (status === 401) {
        const isLoginAttempt =
          response.config.method === 'post' &&
          response.config.url?.endsWith('/SessionService/Sessions');
        if (!isLoginAttempt) {
          handlers.onUnauthorized?.();
        }
      }

      if (status === 403) {
        if (isPasswordExpired(response.data)) {
          handlers.onPasswordExpired?.();
        } else {
          handlers.onForbidden?.();
        }
      }

      return Promise.reject(error);
    },
  );
}

function stripVueReactivity(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  const raw = toRaw(obj);

  if (typeof raw !== 'object') return raw;

  if (
    raw instanceof File ||
    raw instanceof Blob ||
    raw instanceof FormData ||
    ArrayBuffer.isView(raw) ||
    raw instanceof ArrayBuffer
  ) {
    return raw;
  }

  if (
    raw instanceof Event ||
    typeof (raw as { isTrusted?: unknown }).isTrusted === 'boolean'
  ) {
    console.warn(
      'API payload contains Event object - check component @change handlers:',
      raw,
    );
  }

  try {
    return JSON.parse(JSON.stringify(raw));
  } catch (e) {
    console.warn('Could not serialize API payload:', e);
    return raw;
  }
}

type ApiResponse<T = unknown> = CacheAxiosResponse<T>;

const apiClient = {
  get<T = unknown>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return apiInstance.get<T>(path, config);
  },
  delete<T = unknown>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return apiInstance.delete<T>(path, config);
  },
  post<T = unknown>(
    path: string,
    payload?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return apiInstance.post<T>(path, payload, config);
  },
  patch<T = unknown>(
    path: string,
    payload?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return apiInstance.patch<T>(path, payload, config);
  },
  put<T = unknown>(
    path: string,
    payload?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return apiInstance.put<T>(path, payload, config);
  },
  all<T>(promises: Array<Promise<T>>): Promise<T[]> {
    return Axios.all(promises);
  },
  spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R {
    return Axios.spread(callback);
  },
  /**
   * Sets or clears the X-Auth-Token header used by API requests.
   */
  set_auth_token(token: string | null | undefined): void {
    const shouldPersistAuthToken =
      import.meta.env.VITE_STORE_SESSION === 'true' ||
      import.meta.env.STORE_SESSION === 'true';

    if (token) {
      apiInstance.defaults.headers.common['X-Auth-Token'] = token;
      if (shouldPersistAuthToken) {
        Cookies.set('X-Auth-Token', token, {
          secure: window.location.protocol !== 'http:',
          sameSite: 'strict',
        });
      }
    } else {
      delete apiInstance.defaults.headers.common['X-Auth-Token'];
      if (shouldPersistAuthToken) {
        Cookies.remove('X-Auth-Token');
      }
    }
  },
};

export default apiClient;

export const getResponseCount = (
  responses: Array<unknown | Error>,
): { successCount: number; errorCount: number } => {
  let successCount = 0;
  let errorCount = 0;

  responses.forEach((response) => {
    if (response instanceof Error) errorCount++;
    else successCount++;
  });

  return { successCount, errorCount };
};

export const isPasswordExpired = (data: unknown): boolean => {
  return !!findMessageId(data, 'PasswordChangeRequired');
};

export const findMessageId = (
  data: unknown,
  key: string,
  registry = 'Base',
): { MessageId: string } | undefined => {
  const extInfoMsgs = (data as { '@Message.ExtendedInfo'?: Array<{ MessageId: string }> })?.[
    '@Message.ExtendedInfo'
  ];

  return (
    extInfoMsgs &&
    extInfoMsgs.find((i) => {
      const words = i.MessageId.split('.');
      return words[words.length - 1] === key && words[0] === registry;
    })
  );
};

export type { InternalAxiosRequestConfig, AxiosResponse };
