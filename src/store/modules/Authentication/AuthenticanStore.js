import api from '@/store/api';
import Cookies from 'js-cookie';
import router from '@/router';
import { roles } from '@/router/routes';

const AuthenticationStore = {
  namespaced: true,
  state: {
    consoleWindow: null,
    authError: false,
    xsrfCookie: Cookies.get('XSRF-TOKEN'),
    isAuthenticatedCookie: Cookies.get('IsAuthenticated'),
  },
  getters: {
    consoleWindow: (state) => state.consoleWindow,
    authError: (state) => state.authError,
    isLoggedIn: (state) => {
      return (
        state.xsrfCookie !== undefined || state.isAuthenticatedCookie == 'true'
      );
    },
    token: (state) => state.xsrfCookie,
  },
  mutations: {
    authSuccess(state) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
    },
    authError(state, authError = true) {
      state.authError = authError;
    },
    logout(state) {
      Cookies.remove('XSRF-TOKEN');
      Cookies.remove('IsAuthenticated');
      localStorage.removeItem('storedUsername');
      state.xsrfCookie = undefined;
      state.isAuthenticatedCookie = undefined;
    },
    setConsoleWindow: (state, window) => (state.consoleWindow = window),
  },
  actions: {
    login({ commit }, { username, password }) {
      commit('authError', false);
      return api
        .post('/login', {
          username: username,
          password: password,
        })
        .then(() => commit('authSuccess'))
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    logout({ commit }) {
      api
        .post('/logout', { data: [] })
        .then(() => {
          commit('setConsoleWindow', false);
          commit('logout');
        })
        .then(() => router.push('/login'))
        .catch((error) => console.log(error));
    },
    getUserInfo({ commit }, username) {
      return api
        .get(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(({ data }) => {
          commit('global/setPrivilege', data.RoleId, { root: true });
          return data;
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            // We have valid credentials but user isn't known, assume remote
            // authentication (e.g. LDAP) and do not restrict the routing
            commit('global/setPrivilege', roles.administrator, { root: true });
            return {};
          } else {
            console.log(error);
          }
        });
    },
    resetStoreState({ state }) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
      state.isAuthenticatedCookie = Cookies.get('IsAuthenticated');
    },
  },
};

export default AuthenticationStore;
