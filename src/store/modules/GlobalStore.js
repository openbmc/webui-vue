import api from '../api';

const HOST_STATE = {
  on: 'xyz.openbmc_project.State.Host.HostState.Running',
  off: 'xyz.openbmc_project.State.Host.HostState.Off',
  error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
  diagnosticMode: 'xyz.openbmc_project.State.Host.HostState.DiagnosticMode'
};

const hostStateMapper = hostState => {
  switch (hostState) {
    case HOST_STATE.on:
      return 'on';
    case HOST_STATE.off:
      return 'off';
    case HOST_STATE.error:
      return 'error';
    // TODO: Add mapping for DiagnosticMode
    default:
      return 'unreachable';
  }
};

const GlobalStore = {
  namespaced: true,
  state: {
    hostName: '--',
    hostStatus: 'unreachable'
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
    },
    setHostStatus(state, hostState) {
      state.hostStatus = hostStateMapper(hostState);
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
    },
    getHostStatus({ commit }) {
      api
        .get('/xyz/openbmc_project/state/host0/attr/CurrentHostState')
        .then(response => {
          const hostState = response.data.data;
          commit('setHostStatus', hostState);
        })
        .catch(error => console.log(error));
    }
  }
};

export default GlobalStore;
