import api from '@/store/api';
import Cookies from 'js-cookie';
import router from '@/router';
import i18n from '@/i18n';

const getTimeoutMessageOptions = (messageDelay, dispatch) => {
  return {
    text: i18n.t('global.toast.sessionTimeoutMessage'),
    options: {
      id: `session-toast-${Date.now()}`,
      title: i18n.t('global.toast.sessionTimeoutTitle'),
      variant: 'warning',
      noCloseButton: true,
      autoHideDelay: messageDelay,
    },
    button: {
      title: i18n.t('global.toast.sessionTimeoutButton'),
      click: () => dispatch('keepSession'),
    },
  };
};

const AuthenticationStore = {
  namespaced: true,
  state: {
    authError: false,
    xsrfCookie: Cookies.get('XSRF-TOKEN'),
    isAuthenticatedCookie: Cookies.get('IsAuthenticated'),
    authMessageTimeout: undefined,
    authLogoutTimeout: undefined,
  },
  getters: {
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
    setLogoutMessageTimeout(state, payload) {
      clearTimeout(state.authMessageTimeout);
      clearTimeout(state.authLogoutTimeout);
      state.authLogoutTimeout = payload.authLogoutTimeout;
      state.authMessageTimeout = payload.authMessageTimeout;
    },
  },
  actions: {
    login({ commit }, { username, password }) {
      commit('authError', false);
      return api
        .post('/login', { data: [username, password] })
        .then(() => commit('authSuccess'))
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    logout({ commit }) {
      api
        .post('/logout', { data: [] })
        .then(() => commit('setLogoutMessageTimeout', {}))
        .then(() => commit('logout'))
        .then(() => router.go('/login'))
        .catch((error) => console.log(error));
    },
    async checkPasswordChangeRequired(_, username) {
      return await api
        .get(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(({ data: { PasswordChangeRequired } }) => PasswordChangeRequired)
        .catch((error) => console.log(error));
    },
    resetStoreState({ state, commit }) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
      state.isAuthenticatedCookie = Cookies.get('IsAuthenticated');
      commit('setLogoutMessageTimeout', {});
    },
    /**
     * uses setTimeout function to create toast message,
     * uses setTimeout function to ensure system logout
     * @param context action context
     */
    setLogoutMessageTimeout({ commit, dispatch }) {
      // we want to display message after 28min
      const messageTimeout = 28 * 60 * 1000;
      // we want to show message for 2 minutes
      const messageDelay = 2 * 60 * 1000;
      // then after sum of the above, logout user
      const authTimeout = messageTimeout + messageDelay;

      const authMessageTimeout = setTimeout(() => {
        const message = getTimeoutMessageOptions(messageDelay, dispatch);
        dispatch('displayToast', message, { root: true });
      }, messageTimeout);

      const authLogoutTimeout = setTimeout(
        () => dispatch('logout'),
        authTimeout
      );

      commit('setLogoutMessageTimeout', {
        authMessageTimeout,
        authLogoutTimeout,
      });
    },
    /**
     * calls endpoint to keep session alive
     * @see http://redfish.dmtf.org/schemas/DSP0266_1.11.0.html#session-lifetime
     * @param context action context
     * @returns Promise
     */
    async keepSession({ commit }) {
      commit('setLogoutMessageTimeout', {});
      const username = localStorage.getItem('storedUsername');
      return await api
        .get(`/redfish/v1/AccountService/Accounts/${username}`)
        .then();
    },
  },
};

export default AuthenticationStore;
