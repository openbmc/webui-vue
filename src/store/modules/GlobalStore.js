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
    case 'On': // Redfish PowerState
      return 'on';
    case HOST_STATE.off:
    case 'Off': // Redfish PowerState
      return 'off';
    case HOST_STATE.error:
      // TODO: Map Redfish Quiesced when bmcweb supports
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
    bmcTime: null,
    hostStatus: 'unreachable'
  },
  getters: {
    hostName: state => state.hostName,
    hostStatus: state => state.hostStatus,
    bmcTime: state => state.bmcTime
  },
  mutations: {
    setHostName: (state, hostName) => (state.hostName = hostName),
    setBmcTime: (state, bmcTime) => (state.bmcTime = bmcTime),
    setHostStatus: (state, hostState) =>
      (state.hostStatus = hostStateMapper(hostState))
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
    getBmcTime({ commit }) {
      api
        .get('/redfish/v1/Managers/bmc')
        .then(response => {
          const bmcDateTime = response.data.DateTime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
        })
        .catch(error => console.log(error));
    },
    getHostStatus({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(({ data: { PowerState } } = {}) => {
          commit('setHostStatus', PowerState);
        })
        .catch(error => console.log(error));
    }
  }
};

export default GlobalStore;
