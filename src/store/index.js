import Vue from "vue";
import Vuex from "vuex";

import GlobalStore from "./modules/GlobalStore";
import AuthenticationStore from "./modules/Authentication/AuthenticanStore";
import LocalUserManagementStore from "./modules/AccessControl/LocalUserMangementStore";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    global: GlobalStore,
    authentication: AuthenticationStore,
    localUsers: LocalUserManagementStore
  }
});
