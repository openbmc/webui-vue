import Axios from 'axios';
import router from '../router';

const api = Axios.create({
  withCredentials: true
});

api.interceptors.response.use(undefined, error => {
  let response = error.response;

  // TODO: Provide user with a notification and way to keep system active
  if (response.status == 401) {
    if (response.config.url != '/login') {
      window.location = '/login';
    }
  }

  if (response.status == 403) {
    router.push({ name: 'unauthorized' });
  }

  return Promise.reject(error);
});

export default {
  get(path) {
    return api.get(path);
  },
  delete(path, payload) {
    return api.delete(path, payload);
  },
  post(path, payload) {
    return api.post(path, payload);
  },
  patch(path, payload) {
    return api.patch(path, payload);
  },
  put(path, payload) {
    return api.put(path, payload);
  },
  all(promises) {
    return Axios.all(promises);
  }
};
