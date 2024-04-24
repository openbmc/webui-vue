import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from '../store';

Axios.defaults.headers.common['Accept'] = 'application/json';
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

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

api.interceptors.response.use(undefined, (error) => {
  let response = error.response;

  // TODO: Provide user with a notification and way to keep system active
  if (response.status == 401) {
    if (response.config.url != '/login') {
      window.location = '/login';
      // Commit logout to remove XSRF-TOKEN cookie
      store.commit('authentication/logout');
    }
  }

  if (response.status == 403) {
    // Check if action is unauthorized.
    // Toast error message will appear on screen
    // when the action is unauthorized.
    store.commit('global/setUnauthorized');
  }

  return Promise.reject(error);
});

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
