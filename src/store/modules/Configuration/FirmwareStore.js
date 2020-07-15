import api from '../../api';

const FirmwareStore = {
  namespaced: true,
  state: {
    systemFirmwareVersion: '--',
    applyTime: null
  },
  getters: {
    systemFirmwareVersion: state => state.systemFirmwareVersion
  },
  mutations: {
    setsystemFirmwareVersion: (state, systemFirmwareVersion) =>
      (state.systemFirmwareVersion = systemFirmwareVersion),
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime)
  },
  actions: {
    async getSystemFirwareVersion({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data: { Links: { ActiveSoftwareImage } } }) => {
          const location = ActiveSoftwareImage['@odata.id'];
          return api.get(location);
        })
        .then(({ data: { Version } }) => {
          commit('setsystemFirmwareVersion', Version);
        })
        .catch(error => console.log(error));
    },
    getUpdateServiceApplyTime({ commit }) {
      api
        .get('/redfish/v1/UpdateService')
        .then(({ data }) => {
          const applyTime =
            data.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
          commit('setApplyTime', applyTime);
        })
        .catch(error => console.log(error));
    },
    setApplyTimeImmediate({ commit }) {
      const data = {
        HttpPushUriOptions: {
          HttpPushUriApplyTime: {
            ApplyTime: 'Immediate'
          }
        }
      };
      return api
        .patch('/redfish/v1/UpdateService', data)
        .then(() => commit('setApplyTime', 'Immediate'))
        .catch(error => console.log(error));
    },
    async uploadFirmware({ state, dispatch }, image) {
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      api
        .post('/redfish/v1/UpdateService', image, {
          headers: { 'Content-Type': 'application/octet-stream' }
        })
        .then(response => {
          console.log('post image success:', response);
        })
        .catch(error => console.log('post image error:', error));
    },
    uploadFirmwareTFTP(_, { address, filename }) {
      console.log(address, filename);
    }
  }
};

export default FirmwareStore;
