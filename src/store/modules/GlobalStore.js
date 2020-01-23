import api from '../api';

const HOST_STATE = {
  on: 'xyz.openbmc_project.State.Host.HostState.Running',
  off: 'xyz.openbmc_project.State.Host.HostState.Off',
  error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
  transition: {
    on: 'xyz.openbmc_project.State.Host.Transition.On',
    off: 'xyz.openbmc_project.State.Host.Transition.Off',
    reboot: 'xyz.openbmc_project.State.Host.Transition.Reboot'
  }
};

const hostStateMapper = hostState => {
  switch (hostState) {
    case HOST_STATE.on:
      return 'on';
    case HOST_STATE.off:
      return 'off';
    case HOST_STATE.error:
      return 'error';
    case HOST_STATE.transition.reboot:
      return 'rebooting';
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
      (state.hostState = hostStateMapper(hostState))
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
        .get('/xyz/openbmc_project/time/bmc')
        .then(response => {
          // bmcTime is stored in microseconds, convert to millseconds
          const bmcTime = response.data.data.Elapsed / 1000;
          commit('setBmcTime', bmcTime);
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
