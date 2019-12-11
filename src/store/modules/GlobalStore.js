import api from '../api';

const GlobalStore = {
  namespaced: true,
  state: {
    hostName: '--',
    hostStatus: null
  },
  getters: {
    hostName(state) {
      return state.hostName;
    },
    hostStatus(state) {
      return state.hostStatus;
    }
  },
  mutations: {
    setHostName(state, hostName) {
      state.hostName = hostName;
    }
  },
  actions: {
    getHostName({ commit }) {
      api
        .get('/xyz/openbmc_project/network/config/attr/HostName')
        .then(response => {
          const hostName = response.data.data;
          commit('setHostName', hostName);
        })
        .catch(error => console.log(error));
    }
  }
};

export default GlobalStore;
