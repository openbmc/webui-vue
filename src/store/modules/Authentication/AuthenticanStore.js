import api from "../../api";
import Cookies from "js-cookie";

const AuthenticationStore = {
  namespaced: true,
  state: {
    status: "",
    cookie: Cookies.get("XSRF-TOKEN")
  },
  getters: {
    authStatus: state => state.status,
    isLoggedIn: state => !!state.cookie
  },
  mutations: {
    authRequest(state) {
      state.status = "loading";
    },
    authSuccess(state) {
      state.status = "authenticated";
      state.cookie = Cookies.get("XSRF-TOKEN");
    },
    authError(state) {
      state.status = "error";
    },
    logout(state) {
      state.status = "";
      Cookies.remove("XSRF-TOKEN");
    }
  },
  actions: {
    login({ commit }, auth) {
      commit("authRequest");
      return api
        .post("/login", { data: auth })
        .then(() => commit("authSuccess"))
        .catch(error => {
          commit("authError");
          throw new Error(error);
        });
    },
    logout({ commit }) {
      api
        .post("/logout", { data: [] })
        .then(() => commit("logout"))
        .catch(error => console.log(error));
    }
  }
};

export default AuthenticationStore;
