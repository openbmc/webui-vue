import Axios from 'axios';
import router from '../router';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';
import { toRaw } from 'vue';
import Cookies from 'js-cookie';

//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from '.';

Axios.defaults.headers.common['Accept'] = 'application/json';
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Enable persisting X-Auth-Token in a cookie when explicitly requested
// This allows direct browser navigation to Redfish endpoints to work
const shouldPersistAuthToken =
  import.meta.env.VITE_STORE_SESSION === 'true' ||
  import.meta.env.STORE_SESSION === 'true';

const axiosInstance = Axios.create({
  withCredentials: true,
});

const api = setupCache(axiosInstance, {
  debug: import.meta.env.DEV ? console.log : undefined,
  methods: ['get'],
  interpretHeader: false,
  etag: true,
  modifiedSince: false,
  staleIfError: false,
  ttl: 0,
  storage: buildWebStorage(localStorage, 'webui-vue-cache:'),
});

// Initialize auth header from cookie (opt-in for non-cookie backends)
if (shouldPersistAuthToken) {
  const persistedToken = Cookies.get('X-Auth-Token');
  if (persistedToken) {
    axiosInstance.defaults.headers.common['X-Auth-Token'] = persistedToken;
  }
}

/**
 * Strip Vue 3 reactivity properties and Event objects from request payloads.
 *
 * Vue 3 Migration Issue:
 * In Bootstrap-Vue-Next, @change events pass Event objects instead of values.
 * When reactive form data accidentally includes Event properties (isTrusted,
 * _vts, etc.), the API receives malformed payloads like:
 *   {"LocationIndicatorActive": {"isTrusted": true, "_vts": 1765562875420}}
 * instead of:
 *   {"LocationIndicatorActive": true}
 *
 * This function provides a safety net by:
 * 1. Unwrapping Vue Proxy objects using toRaw()
 * 2. Detecting Event-like objects and logging warnings
 * 3. Using JSON round-trip to strip non-serializable properties
 */
function stripVueReactivity(obj) {
  if (obj === null || obj === undefined) return obj;

  // Get raw value (unwrap Vue Proxy)
  const raw = toRaw(obj);

  // Return primitives as-is
  if (typeof raw !== 'object') return raw;

  // Skip binary/upload types - they must be passed through unchanged
  // These types lose their data when JSON serialized
  if (
    raw instanceof File ||
    raw instanceof Blob ||
    raw instanceof FormData ||
    ArrayBuffer.isView(raw) ||
    raw instanceof ArrayBuffer
  ) {
    return raw;
  }

  // Detect Event objects that were accidentally passed as values
  // This happens when @change handlers pass the event instead of the value
  if (raw instanceof Event || typeof raw.isTrusted === 'boolean') {
    console.warn(
      'API payload contains Event object - check component @change handlers:',
      raw,
    );
  }

  // For plain objects, use JSON round-trip to strip non-serializable properties
  // This removes Vue internal properties (_vts, __v_isRef, etc.) and Event metadata
  try {
    return JSON.parse(JSON.stringify(raw));
  } catch (e) {
    // If serialization fails (circular refs, etc.), log and return raw
    console.warn('Could not serialize API payload:', e);
    return raw;
  }
}

// Add request interceptor to strip Vue reactivity from payloads
api.interceptors.request.use(
  (config) => {
    if (config.data) {
      config.data = stripVueReactivity(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const response = error?.response;
    const status = response?.status;

    if (!status) return Promise.reject(error);

    // Auth handling
    if (status == 401) {
      // Don't trigger logout on login attempts (POST to SessionService/Sessions)
      const isLoginAttempt =
        response.config.method === 'post' &&
        response.config.url?.endsWith('/SessionService/Sessions');
      if (!isLoginAttempt) {
        store.commit('authentication/logout');
        router.push('/login');
      }
    }

    if (status == 403) {
      if (isPasswordExpired(response.data)) {
        router.push('/change-password');
      } else {
        store.commit('global/setUnauthorized');
      }
    }

    return Promise.reject(error);
  },
);

export default {
  get(path, config) {
    return api.get(path, config);
  },
  delete(path, config) {
    return api.delete(path, config);
  },
  post(path, payload, config) {
    return api.post(path, payload, config);
  },
  patch(path, payload, config) {
    return api.patch(path, payload, config);
  },
  put(path, payload, config) {
    return api.put(path, payload, config);
  },
  all(promises) {
    return Axios.all(promises);
  },
  spread(callback) {
    return Axios.spread(callback);
  },
  /**
   * Sets or clears the X-Auth-Token header used by API requests.
   *
   * Notes:
   * - This function is used by the auth flow when the standard XSRF cookie is
   *   not present (which is abnormal in cookie-backed deployments). In such
   *   cases, a header-based session may be used as a fallback.
   * - The token is persisted to a session cookie when the build-time env
   *   flag VITE_STORE_SESSION=true (or STORE_SESSION=true) is set. This
   *   allows direct browser navigation to Redfish endpoints to work.
   * - The cookie is session-only (no expiration) and will be cleared when
   *   the browser is closed or when logout is called.
   *
   * @param {string | null | undefined} token - The session token to apply. Pass
   *   a falsy value to clear the header, and to remove any persisted token when
   *   persistence is enabled.
   */
  set_auth_token(token) {
    if (token) {
      axiosInstance.defaults.headers.common['X-Auth-Token'] = token;
      if (shouldPersistAuthToken) {
        // Store as session cookie (no expiration = cleared on browser close)
        Cookies.set('X-Auth-Token', token, {
          secure: window.location.protocol !== 'http:',
          sameSite: 'strict',
        });
      }
    } else {
      delete axiosInstance.defaults.headers.common['X-Auth-Token'];
      if (shouldPersistAuthToken) {
        Cookies.remove('X-Auth-Token');
      }
    }
  },
};

export const getResponseCount = (responses) => {
  let successCount = 0;
  let errorCount = 0;

  responses.forEach((response) => {
    if (response instanceof Error) errorCount++;
    else successCount++;
  });

  return {
    successCount,
    errorCount,
  };
};

export const isPasswordExpired = (data) => {
  return !!findMessageId(data, 'PasswordChangeRequired');
};

/**
 * Returns the first ExtendedInfo.Message to start with the
 * Registry Name (Default: "Base") and end with the given key
 * Ignore versions (.<X>.<Y>) --or-- (.<X>.<Y>.<Z>.),
 *   but adhere to Registry namespace
 * @param {object} data - AxiosResponse.data
 * @param { {MessageKey: string}} key - key into the message registry
 * @param { {MessageRegistryPrefix: string}} [registry=Base] - the name of the
 *        message registry, undefined param defaults to "Base"
 * @returns {ExtendedInfo.Message} ExtendedInfo.Message | undefined
 */
export const findMessageId = (data, key, registry = 'Base') => {
  let extInfoMsgs = data?.['@Message.ExtendedInfo'];

  return (
    extInfoMsgs &&
    extInfoMsgs.find((i) => {
      const words = i.MessageId.split('.');
      return words[words.length - 1] === key && words[0] === registry;
    })
  );
};
