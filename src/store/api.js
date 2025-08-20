import Axios from 'axios';
import router from '../router';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from '.';

Axios.defaults.headers.common['Accept'] = 'application/json';
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Enable persisting X-Auth-Token in sessionStorage only when explicitly requested
const shouldPersistAuthToken =
  process.env.VUE_APP_STORE_SESSION === 'true' ||
  process.env.STORE_SESSION === 'true';

const axiosInstance = Axios.create({
  withCredentials: true,
});

const api = setupCache(axiosInstance, {
  debug: console.log,
  methods: ['get'],
  interpretHeader: false,
  etag: true,
  modifiedSince: false,
  staleIfError: false,
  ttl: 0,
  storage: buildWebStorage(localStorage, 'webui-vue-cache:'),
});

// Initialize auth header from sessionStorage (opt-in for non-cookie backends)
if (shouldPersistAuthToken) {
  try {
    const persistedToken = sessionStorage.getItem('X_AUTH_TOKEN');
    if (persistedToken) {
      axiosInstance.defaults.headers.common['X-Auth-Token'] = persistedToken;
    }
  } catch (e) {
    // sessionStorage may be unavailable in some environments; fail closed
  }
}

api.interceptors.response.use(
  (response) => {
    // Any successful response resets timeout counter
    try {
      store.commit('global/resetSequentialTimeouts');
    } catch (e) {
      // ignore
    }
    return response;
  },
  (error) => {
    const response = error?.response;
    const status = response?.status;
    const isConnTimeout =
      error?.code === 'ECONNABORTED' ||
      error?.code === 'ERR_NETWORK' ||
      /timeout/i.test(error?.message || '');
    const isGatewayError = status === 0 || status === 502 || status === 503;

    // Connectivity watchdog: count timeouts/network errors even without response
    if (isConnTimeout || isGatewayError) {
      try {
        store.commit('global/incrementSequentialTimeouts');
        const count = store.state.global.sequentialTimeouts;
        if (count >= 3 && !store.state.global.unresponsiveModalVisible) {
          store.commit('global/showUnresponsiveModal');
          store.dispatch('global/startUnresponsiveCountdown');
        }
      } catch (e) {
        // ignore
      }
    }

    if (!status) return Promise.reject(error);

    // Auth handling
    if (status == 401) {
      if (response.config.url != '/login') {
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
   * - The token is persisted to sessionStorage only when the build-time env
   *   flag STORE_SESSION=true (or VUE_APP_STORE_SESSION=true) is set. If the
   *   flag is not enabled, no token is written to Web Storage.
   *
   * @param {string | null | undefined} token - The session token to apply. Pass
   *   a falsy value to clear the header, and to remove any persisted token when
   *   persistence is enabled.
   */
  set_auth_token(token) {
    if (token) {
      axiosInstance.defaults.headers.common['X-Auth-Token'] = token;
      if (shouldPersistAuthToken) {
        try {
          sessionStorage.setItem('X_AUTH_TOKEN', token);
        } catch (e) {
          void 0; // storage unavailable; ignore
        }
      }
    } else {
      delete axiosInstance.defaults.headers.common['X-Auth-Token'];
      if (shouldPersistAuthToken) {
        try {
          sessionStorage.removeItem('X_AUTH_TOKEN');
        } catch (e) {
          void 0; // storage unavailable; ignore
        }
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
