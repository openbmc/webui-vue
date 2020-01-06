import api from '../../api';
import Cookies from 'js-cookie';

const AuthenticationStore = {
  namespaced: true,
  state: {
    authError: false,
    cookie: Cookies.get('XSRF-TOKEN')
  },
  getters: {
    authError: state => state.authError,
    isLoggedIn: state => !!state.cookie
  },
  mutations: {
    authSuccess(state) {
      state.authError = false;
      state.cookie = Cookies.get('XSRF-TOKEN');
    },
    authError(state) {
      state.authError = true;
    },
    logout(state) {
      state.authError = false;
      Cookies.remove('XSRF-TOKEN');
    }
  },
  actions: {
    login({ commit }, auth) {
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
        .catch(error => console.log(error));
    }
  }
};

export default AuthenticationStore;
