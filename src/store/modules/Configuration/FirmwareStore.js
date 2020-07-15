import api from '@/store/api';
import i18n from '@/i18n';

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
      location: null,
      status: '--'
    },
    applyTime: null
  },
  getters: {
    systemFirmwareVersion: state => state.activeFirmware.version,
    backupFirmwareVersion: state => state.backupFirmware.version,
    backupFirmwareStatus: state => state.backupFirmware.status,
    isRebootFromBackupAvailable: state =>
      state.backupFirmware.id ? true : false
  },
  mutations: {
    setActiveFirmware: (state, { version, id, location }) => {
      state.activeFirmware.version = version;
      state.activeFirmware.id = id;
      state.activeFirmware.location = location;
    },
    setBackupFirmware: (state, { version, id, location, status }) => {
      state.backupFirmware.version = version;
      state.backupFirmware.id = id;
      state.backupFirmware.location = location;
      state.backupFirmware.status = status;
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
          const backupLocation = Members.map(item => item['@odata.id']).find(
            location => {
              const id = location.split('/').pop();
              return id !== state.activeFirmware.id;
            }
          );
          if (backupLocation) {
            return api.get(backupLocation);
          }
        })
        .then(({ data } = {}) => {
          if (!data) return;
          const version = data.Version;
          const id = data.Id;
          const location = data['@odata.id'];
          const status = data.Status ? data.Status.State : '--';
          commit('setBackupFirmware', { version, id, location, status });
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
      return await api
        .post('/redfish/v1/UpdateService', image, {
          headers: { 'Content-Type': 'application/octet-stream' }
        })
        .then(() => dispatch('getSystemFirwareVersion'))
        .then(() => i18n.t('pageFirmware.toast.successUploadMessage'))
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorUploadAndReboot'));
        });
    },
    async uploadFirmwareTFTP({ state, dispatch }, { address, filename }) {
      const data = {
        TransferProtocol: 'TFTP',
        ImageURI: `${address}/${filename}`
      };
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      return await api
        .post('/redfish/v1/UpdateService', data)
        .then(() => dispatch('getSystemFirwareVersion'))
        .then(() => i18n.t('pageFirmware.toast.successUploadMessage'))
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorUploadAndReboot'));
        });
    },
    async switchFirmwareAndReboot({ state }) {
      const backupLoaction = state.backupFirmware.location;
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLoaction
          }
        }
      };
      return await api
        .patch('/redfish/v1/Managers/bmc', data)
        .then(() => i18n.t('pageFirmware.toast.successRebootFromBackup'))
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorRebootFromBackup'));
        });
    }
  }
};

export default FirmwareStore;
