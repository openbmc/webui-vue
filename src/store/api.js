import Axios from 'axios';

const api = Axios.create({
  withCredentials: true
});

// TODO: Permanent authentication solutoin
// Using defaults to set auth for sending
// auth object in header

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
  },
  defaults: api.defaults
};
