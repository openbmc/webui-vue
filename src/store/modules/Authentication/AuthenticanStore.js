import api from '@/store/api';
import Cookies from 'js-cookie';

const AuthenticationStore = {
  namespaced: true,
  state: {
    cookie: Cookies.get('XSRF-TOKEN')
  },
  getters: {
    token: state => state.cookie
  },
  mutations: {
    logout() {
      Cookies.remove('XSRF-TOKEN');
      localStorage.removeItem('storedUsername');
      window.location = '/login.html';
    }
  },
  actions: {
    logout({ commit }) {
      api
        .post('/logout', { data: [] })
        .then(() => commit('logout'))
        .catch(error => console.log(error));
    }
  }
};

export default AuthenticationStore;
