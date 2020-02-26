import api from '../../api';

const FirmwareStore = {
  namespaced: true,
  state: {
    bmcFirmwareVersion: '--',
    hostFirmwareVersion: '--'
  },
  getters: {
    bmcFirmwareVersion: state => state.bmcFirmwareVersion,
    hostFirmwareVersion: state => state.hostFirmwareVersion
  },
  mutations: {
    setBmcFirmwareVersion: (state, bmcFirmwareVersion) =>
      (state.bmcFirmwareVersion = bmcFirmwareVersion),
    setHostFirmwareVersion: (state, hostFirmwareVersion) =>
      (state.hostFirmwareVersion = hostFirmwareVersion)
  },
  actions: {
    getBmcFirmware({ commit }) {
      api
        .get('/redfish/v1/Managers/bmc')
        .then(response => {
          const bmcFirmwareVersion = response.data.FirmwareVersion;
          commit('setBmcFirmwareVersion', bmcFirmwareVersion);
        })
        .catch(error => {
          console.log(error);
        });
    },
    getHostFirmware({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(response => {
          const hostFirmwareVersion = response.data.BiosVersion;
          commit('setHostFirmwareVersion', hostFirmwareVersion);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};

export default FirmwareStore;
