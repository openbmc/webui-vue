import api from '../../api';
import router from '../../../router';

const AuthenticationStore = {
  namespaced: true,
  state: {
    isLoggedIn: !!localStorage.getItem('storedUsername'),
    authError: false
  },
  getters: {
    authError: state => state.authError,
    isLoggedIn: state => state.isLoggedIn
  },
  mutations: {
    authSuccess(state) {
      state.authError = false;
      state.isLoggedIn = true;
    },
    authError(state, authError = true) {
      state.authError = authError;
      state.isLoggedIn = false;
    },
    logout(state) {
      localStorage.removeItem('storedUsername');
      localStorage.removeItem('storedPassword');
      state.isLoggedIn = false;
    }
  },
  actions: {
    login({ commit }, auth) {
      commit('authError', false);
      return api
        .authorize(auth[0], auth[1])
        .then(() => {
          commit('authSuccess');
        })
        .catch(error => {
          commit('authError');
          throw new Error(error);
        });
    },
    logout({ commit }) {
      commit('logout');
      router.go('/login');
    }
  }
};

export default AuthenticationStore;
