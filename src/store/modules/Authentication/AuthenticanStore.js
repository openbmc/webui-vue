import api from '../../api';
import Cookies from 'js-cookie';
import router from '../../../router';
import i18n from '@/i18n';

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
      console.log('username in commit', userName);
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
    },
    async setPassword(state, password) {
      let { userName } = state.state;
      let data = { Password: password };
      return await api
        .patch(`/redfish/v1/AccountService/Accounts/${userName}`, data)
        .then(() => i18n.t('pageLocalUserManagement.toast.successSaveSettings'))
        .catch(error => {
          console.log(error);
          throw new Error(
            i18n.t('pageLocalUserManagement.toast.errorSaveSettings')
          );
        });
    }
  }
};

export default AuthenticationStore;
