import { defineStore } from 'pinia';
import api from '@/store/api';
import { useCookies } from 'vue3-cookies';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
const { cookies } = useCookies();
const router = useRouter();
export const AuthenticationStore = defineStore('authentication', {
  state: () => ({
    consoleWindow: null,
    authError: null,
    xsrfCookie: cookies.get('XSRF-TOKEN'),
    isAuthenticatedCookie: cookies.get('IsAuthenticated'),
    bmcTime: '',
  }),
  getters: {
    getConsoleWindow: (state) => state.consoleWindow,
    getAuthError: (state) => state.authError,
    isLoggedIn: (state) => {
      //Change null to undefined once the cookies value able to get
      return state.xsrfCookie !== null || state.isAuthenticatedCookie == 'true';
    },
    token: (state) => state.xsrfCookie,
  },
  actions: {
    authSuccess() {
      this.authError = false;
      this.xsrfCookie = Cookies.get('XSRF-TOKEN');
    },
    setauthError(authError = true) {
      this.authError = authError;
    },
    logoutRemove() {
      cookies.remove('XSRF-TOKEN');
      cookies.remove('IsAuthenticated');
      localStorage.removeItem('storedUsername');
      //Change null to undefined once the cookies value able to get
      this.xsrfCookie = null;
      this.isAuthenticatedCookie = undefined;
    },
    setConsoleWindow(window) {
      this.consoleWindow = window;
    },
    login(username, password) {
      this.$state.authError = false;
      return api
        .post('/login', {
          data: [username, password],
        })
        .then((response) => {
          this.authSuccess();
          this.$state.authError = false;
          this.xsrfCookie = response.data.token;
        })
        .catch((error) => {
          this.$state.authError = true;
          throw new Error(error);
        });
    },
    logout() {
      const headers = {
        'X-Xsrf-Token': cookies.get('X-XSRF-TOKEN'),
      };
      return api
        .post('/logout', { data: [] }, { headers: headers })
        .then(() => {
          this.setConsoleWindow(false);
          this.logoutRemove();
          // router.push('/login');
        })
        .catch((error) => {
          console.log(error);
          this.logoutRemove();
        });
    },
    getUserInfo(username) {
      return api
        .get(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(({ data }) => data)
        .catch((error) => console.log(error));
    },
    async getBmcTime() {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          this.$state.bmcTime = response.data.DateTime;
          const cookie = Cookies.get('XSRF-TOKEN');
          console.log('cookie', cookie);
        })
        .catch((error) => console.log(error));
    },
    resetStoreState() {
      this.$state.authError = false;
      this.$state.xsrfCookie = cookies.get('XSRF-TOKEN');
      this.$state.isAuthenticatedCookie = cookies.get('IsAuthenticated');
    },
  },
});

export default AuthenticationStore;
