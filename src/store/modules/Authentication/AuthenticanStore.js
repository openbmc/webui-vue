import api, { isPasswordExpired } from '@/store/api';
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
        .then(({ headers, data }) => {
          commit('authSuccess', {
            session: headers['location'],
            token: headers['x-auth-token'],
          });
          setSessionPrivilege(commit, data);
          return isPasswordExpired(data);
        })
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    logout({ commit, state }) {
      api
        .delete(state.sessionURI)
        .catch(() =>
          console.log(
            "Couldn't DELETE Session, proceeding with the logout anyway to get in sync with the backend.",
          ),
        )
        .then(() => commit('logout'))
        .then(() => router.push('/login'))
        .catch((error) => console.log(error));
    },
    getSessionPrivilege({ commit, state }) {
      return api
        .get(state.sessionURI)
        .then(({ data }) => setSessionPrivilege(commit, data));
    },
    resetStoreState({ state }) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
      state.isAuthenticatedCookie = Cookies.get('IsAuthenticated');
    },
  },
};

const setSessionPrivilege = (commit, data) => {
  // If the backend didn't provide the role information in the Session object
  // our best bet is to assume the Administrator role to avoid hiding
  // potentially useful UI elements. Everything security-sensitive is validated
  // on the backend side anyway, so this is safe.
  commit('global/setPrivilege', data.Roles?.[0] ?? roles.administrator, {
    root: true,
  });
};

export default AuthenticationStore;
