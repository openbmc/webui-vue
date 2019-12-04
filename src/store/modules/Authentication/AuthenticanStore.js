import api from "../../api";

const AuthenticationStore = {
  namespaced: true,
  state: {
    auth: {},
    status: "",
    token: sessionStorage.getItem("token") || ""
  },
  getters: {
    authStatus: state => state.status,
    isLoggedIn: state => !!state.token
  },
  mutations: {
    authRequest(state) {
      state.status = "loading";
    },
    authSuccess(state, token, auth) {
      state.status = "authenicated";
      state.auth = auth;
      state.token = token;
    },
    authError(state) {
      state.status = "error";
    },
    logout(state) {
      state.status = "";
      state.token = "";
    }
  },
  actions: {
    login({ commit }, auth) {
      commit("authRequest");
      return api
        .post("/login", auth)
        .then(response => {
          const token = response.data.token;
          sessionStorage.setItem("token", token);
          api.defaults.auth = auth; // TODO Permantent Solution
          commit("authSuccess", token, auth);
        })
        .catch(error => {
          commit("authError");
          sessionStorage.removeItem("token");
          throw new Error(error);
        });
    },
    logout({ commit }) {
      commit("logout");
      sessionStorage.removeItem("token");
      api.defaults.auth = {}; // Permanent solution
    }
  }
};

export default AuthenticationStore;
