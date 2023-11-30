import { defineStore } from 'pinia'
import api from '@/store/api'
import Cookies from 'js-cookie'

export const AuthenticationStore = defineStore('authentication', {
  state: () => ({
    consoleWindow: null,
    authError: null,
    xsrfCookie: Cookies.get('XSRF-TOKEN'),
    isAuthenticatedCookie: Cookies.get('IsAuthenticated'),
    bmcTime: ''
  }),
  getters: {
    consoleWindow: (state) => state.consoleWindow,
    authError: (state) => state.authError,
    isLoggedIn: (state) => {
      return state.xsrfCookie !== undefined || state.isAuthenticatedCookie == 'true'
    },
    token: (state) => state.xsrfCookie,
    bmcTime: (state) => state.bmcTime
  },
  actions: {
    authSuccess(state) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
    },
    setauthError(state, authError = true) {
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
    login(username, password) {
      this.$state.authError = false
      console.log('login', username, password)
      return api
        .post('api/login', {
          data: [username, password]
        })
        .then(() => {
          this.$state.authError = false
          this.xsrfCookie = Cookies.get('XSRF-TOKEN')
        })
        .catch((error) => {
          this.$state.authError = true
          throw new Error(error)
        })
    },
    logout() {
      api
        .post('api/logout', { data: [] })
        .then(() => {
          this.setConsoleWindow(false)
          this.logout()
        })
        .then(() => router.push('/login'))
        .catch((error) => console.log(error));
    },
    getUserInfo(username) {
      return api
        .get(`api/redfish/v1/AccountService/Accounts/${username}`)
        .then(({ data }) => data)
        .catch((error) => console.log(error));
    },
    async getBmcTime() {
      return await api
        .get('api/redfish/v1/Managers/bmc')
        .then(({ data }) => {
          this.$state.bmcTime = data.DateTime
        })
        .catch((error) => console.log(error))
    },
    resetStoreState() {
      this.$state.authError = false;
      this.$state.xsrfCookie = Cookies.get('XSRF-TOKEN');
      this.$state.isAuthenticatedCookie = Cookies.get('IsAuthenticated');
    },
  }
})

export default AuthenticationStore
