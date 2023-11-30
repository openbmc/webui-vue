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
    login(username, password) {
      this.$state.authError = false
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
    async getBmcTime() {
      return await api
        .get('api/redfish/v1/Managers/bmc')
        .then(({ data }) => {
          this.$state.bmcTime = data.DateTime
        })
        .catch((error) => console.log(error))
    }
  }
})

export default AuthenticationStore
