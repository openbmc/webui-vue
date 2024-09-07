import api, { matchMessageId } from '@/store/api';
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
    sessionURI: localStorage.getItem('sessionURI'),
    xAuthToken: null,
  },
  getters: {
    consoleWindow: (state) => state.consoleWindow,
    authError: (state) => state.authError,
    isLoggedIn: (state) => {
      // We might have gotten XSRF-TOKEN (and HttpOnly SESSION cookie) by Mutual TLS authentication,
      // without going through explicit Session creation
      return (
        state.xsrfCookie !== undefined ||
        state.isAuthenticatedCookie == 'true' ||
        state.xAuthToken !== null
      );
    },
    // Used to authenticate WebSocket connections via subprotocol value
    token: (state) => state.xsrfCookie,
  },
  mutations: {
    authSuccess(state, { session, token }) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
      // Preserve session data across page reloads and browser restarts
      localStorage.setItem('sessionURI', session);
      state.sessionURI = session;
      // If we didn't get the XSRF cookie it means we are talking to a
      // Redfish implementation that is not bmcweb. In this case get the token
      // from headers and send it with the future requests, do not permanently
      // save anywhere.
      if (state.xsrfCookie === undefined) {
        api.set_auth_token(token);
        state.xAuthToken = token;
      }
    },
    authError(state, authError = true) {
      state.authError = authError;
    },
    logout(state) {
      Cookies.remove('XSRF-TOKEN');
      Cookies.remove('IsAuthenticated');
      api.set_auth_token(undefined);
      localStorage.removeItem('storedUsername');
      state.xsrfCookie = undefined;
      state.isAuthenticatedCookie = undefined;
      localStorage.removeItem('sessionURI');
      state.sessionURI = null;
      state.xAuthToken = null;
      state.consoleWindow = false;
    },
  },
  actions: {
    login({ commit }, { username, password }) {
      commit('authError', false);
      return api
        .post('/redfish/v1/SessionService/Sessions', {
          UserName: username,
          Password: password,
        })
        .then((response) => {
          commit('authSuccess', {
            session: response.headers['location'],
            token: response.headers['x-auth-token'],
          });
          return !!matchMessageId(response, 'Base', 'PasswordChangeRequired');
        })
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    logout({ commit, state }) {
      api
        .delete(state.sessionURI)
        .then(() => commit('logout'))
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
