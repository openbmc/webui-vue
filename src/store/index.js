import Vue from "vue";
import Vuex from "vuex";

import LocalUserManagementStore from "./modules/AccessControl/LocalUserMangementStore";
import GlobalStore from "./modules/GlobalStore";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    global: GlobalStore,
    localUsers: LocalUserManagementStore
  }
});
