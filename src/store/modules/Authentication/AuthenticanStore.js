import api from '../../api';
import Cookies from 'js-cookie';
import router from '../../../router';

const AuthenticationStore = {
  namespaced: true,
  state: {
    authError: false,
    cookie: Cookies.get('XSRF-TOKEN'),
    userName: ''
  },
  getters: {
    authError: state => state.authError,
    isLoggedIn: state => !!state.cookie,
    getUsername: state => state.userName
  },
  mutations: {
    authSuccess(state) {
      console.log('state authsuccess', state);
      state.authError = false;
      state.cookie = Cookies.get('XSRF-TOKEN');
    },
    authError(state, authError = true) {
      state.authError = authError;
    },
    logout() {
      Cookies.remove('XSRF-TOKEN');
    },
    updateUserName(state, userName) {
      state.userName = userName;
    }
  },
  actions: {
    login({ commit }, auth) {
      console.log('login', auth);
      commit('authError', false);
      return api
        .post('/login', { data: auth })
        .then(() => commit('authSuccess'), commit('updateUserName', auth[0]))
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
