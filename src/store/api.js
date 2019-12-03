import Axios from "axios";

const api = Axios.create();

// TODO: this is a temporary workaround until
// authentication with login is working
const username = process.env.VUE_APP_USERNAME;
const password = process.env.VUE_APP_PASSWORD;
if (username && password) {
  api.defaults.auth = {};
  api.defaults.auth.username = username;
  api.defaults.auth.password = password;
}

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
