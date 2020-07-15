import api from '../../api';

const FirmwareStore = {
  namespaced: true,
  state: {
    activeFirmware: {
      version: '--',
      id: null,
      location: null
    },
    backupFirmware: {
      version: '--',
      id: null,
      location: null
    },
    applyTime: null
  },
  getters: {
    systemFirmwareVersion: state => state.activeFirmware.version,
    backupFirmwareVersion: state => state.backupFirmware.version
  },
  mutations: {
    setActiveFirmware: (state, { version, id, location }) => {
      state.activeFirmware.version = version;
      state.activeFirmware.id = id;
      state.activeFirmware.location = location;
    },
    setBackupFirmware: (state, { version, id, location }) => {
      state.backupFirmware.version = version;
      state.backupFirmware.id = id;
      state.backupFirmware.location = location;
    },
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime)
  },
  actions: {
    async getSystemFirwareVersion({ commit, state }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data: { Links: { ActiveSoftwareImage } } }) => {
          const location = ActiveSoftwareImage['@odata.id'];
          return api.get(location);
        })
        .then(({ data }) => {
          const version = data.Version;
          const id = data.Id;
          const location = data['@odata.id'];
          commit('setActiveFirmware', { version, id, location });
          // TODO: temporary workaround to get 'Backup' Firmware
          // information
          return api.get('/redfish/v1/UpdateService/FirmwareInventory');
        })
        .then(({ data: { Members } }) => {
          // TODO: temporary workaround to get 'Backup' Firmware
          // information
          // Check FirmwareInventory list for not ActiveSoftwareImage id
          const backupLocation = Members.map(item => item['@odata.id']).filter(
            location => {
              const id = location.split('/').pop();
              if (id !== state.activeFirmware.id) return true;
              return false;
            }
          )[0];
          return api.get(backupLocation);
        })
        .then(({ data }) => {
          const version = data.Version;
          const id = data.Id;
          const location = data['@odata.id'];
          commit('setBackupFirmware', { version, id, location });
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
    },
    switchFirmwareAndReboot({ state }) {
      const backupLoaction = state.backupFirmware.location;
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLoaction
          }
        }
      };
      api
        .patch('/redfish/v1/Managers/bmc', data)
        .catch(error => console.log(error));
    }
  }
};

export default FirmwareStore;
