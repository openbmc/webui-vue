import Axios from 'axios';
//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import { AuthenticationStore } from './modules/Authentication/AuthenticationStore';
import { GlobalStore } from './modules/GlobalStore';

Axios.defaults.headers.common['Accept'] = 'application/json';
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const api = Axios.create({
  withCredentials: true,
});

api.interceptors.response.use(undefined, (error) => {
  const globalStore = GlobalStore();
  const authenticationStore = AuthenticationStore();
  let response = error.response;
  // TODO: Provide user with a notification and way to keep system active
  if (response.status == 401) {
    if (response.config.url != 'api/login') {
      window.location = '/login';
      // Commit logout to remove XSRF-TOKEN cookie
      authenticationStore.logoutRemove();
    }
  }

  if (response.status == 403) {
    // Check if action is unauthorized.
    // Toast error message will appear on screen
    // when the action is unauthorized.
    globalStore.setUnauthorized();
  }

  return Promise.reject(error);
});

export default {
  get(path, config) {
    return api.get('api' + path, config);
  },
  delete(path, config) {
    return api.delete('api' + path, config);
  },
  post(path, payload, config) {
    return api.post('api' + path, payload, config);
  },
  patch(path, payload, config) {
    return api.patch('api' + path, payload, config);
  },
  put(path, payload, config) {
    return api.put('api' + path, payload, config);
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
