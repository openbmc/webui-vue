import Vue from "vue";
import Vuex from "vuex";

import LocalUserManagementStore from "./modules/AccessControl/LocalUserMangementStore";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    localUsers: LocalUserManagementStore
  }
});
