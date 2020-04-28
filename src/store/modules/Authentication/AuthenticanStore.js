import api from '../../api';
import Cookies from 'js-cookie';
import router from '../../../router';
// import i18n from '@/i18n';

const AuthenticationStore = {
  namespaced: true,
  state: {
    authError: false,
    cookie: Cookies.get('XSRF-TOKEN')
  },
  getters: {
    authError: state => state.authError,
    isLoggedIn: state => !!state.cookie,
    getUsername: state => state.userName
  },
  mutations: {
    authSuccess(state) {
      state.authError = false;
      state.cookie = Cookies.get('XSRF-TOKEN');
    },
    authError(state, authError = true) {
      state.authError = authError;
    },
    logout() {
      Cookies.remove('XSRF-TOKEN');
      localStorage.removeItem('storedUsername');
    }
  },
  actions: {
    login({ commit }, auth) {
      commit('authError', false);
      return api
        .post('/login', { data: auth })
        .then(() => commit('authSuccess'))
        .catch(error => {
          commit('authError');
          throw new Error(error);
        });
    },
    logout({ commit }) {
      api
        .post('/logout', { data: [] })
        .then(() => commit('logout'))
        .then(() => router.go('/login'))
        .catch(error => console.log(error));
    }
  }
};

export default AuthenticationStore;
