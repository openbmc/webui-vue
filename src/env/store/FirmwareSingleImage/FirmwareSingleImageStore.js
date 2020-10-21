import api from '@/store/api';
import i18n from '@/i18n';

const FirmwareSingleImageStore = {
  namespaced: true,
  state: {
    activeFirmware: {
      version: '--',
      id: null,
      location: null,
    },
    backupFirmware: {
      version: '--',
      id: null,
      location: null,
      status: '--',
    },
    applyTime: null,
  },
  getters: {
    systemFirmwareVersion: (state) => state.activeFirmware.version,
    backupFirmwareVersion: (state) => state.backupFirmware.version,
    backupFirmwareStatus: (state) => state.backupFirmware.status,
    isRebootFromBackupAvailable: (state) =>
      state.backupFirmware.id ? true : false,
    bmcFirmwareCurrentVersion: (state) => state.activeFirmware.version, //this getter is needed for the Overview page
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
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime),
  },
  actions: {
    async getFirmwareInformation({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data: { Links } }) => {
          const currentLocation = Links.ActiveSoftwareImage['@odata.id'];
          // Check SoftwareImages list for not ActiveSoftwareImage id
          const backupLocation = Links.SoftwareImages.map(
            (item) => item['@odata.id']
          ).find((location) => {
            const id = location.split('/').pop();
            const currentId = currentLocation.split('/').pop();
            return id !== currentId;
          });
          return { currentLocation, backupLocation };
        })
        .then(async ({ currentLocation, backupLocation }) => {
          const currentData = await api.get(currentLocation);
          let backupData = {};

          if (backupLocation) {
            backupData = await api.get(backupLocation);
          }

          commit('setActiveFirmware', {
            version: currentData?.data?.Version,
            id: currentData?.data?.Id,
            location: currentData?.data?.['@odata.id'],
          });
          commit('setBackupFirmware', {
            version: backupData.data?.Version,
            id: backupData.data?.Id,
            location: backupData.data?.['@odata.id'],
            status: backupData.data?.Status?.State,
          });
        })
        .catch((error) => console.log(error));
    },
    getUpdateServiceApplyTime({ commit }) {
      api
        .get('/redfish/v1/UpdateService')
        .then(({ data }) => {
          const applyTime =
            data.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
          commit('setApplyTime', applyTime);
        })
        .catch((error) => console.log(error));
    },
    setApplyTimeImmediate({ commit }) {
      const data = {
        HttpPushUriOptions: {
          HttpPushUriApplyTime: {
            ApplyTime: 'Immediate',
          },
        },
      };
      return api
        .patch('/redfish/v1/UpdateService', data)
        .then(() => commit('setApplyTime', 'Immediate'))
        .catch((error) => console.log(error));
    },
    async uploadFirmware({ state, dispatch }, image) {
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      return await api
        .post('/redfish/v1/UpdateService', image, {
          headers: { 'Content-Type': 'application/octet-stream' },
        })
        .then(() => dispatch('getSystemFirwareVersion'))
        .then(() => i18n.t('pageFirmware.toast.successUploadMessage'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorUploadAndReboot'));
        });
    },
    async uploadFirmwareTFTP({ state, dispatch }, { address, filename }) {
      const data = {
        TransferProtocol: 'TFTP',
        ImageURI: `${address}/${filename}`,
      };
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      return await api
        .post(
          '/redfish/v1/UpdateService/Actions/UpdateService.SimpleUpdate',
          data
        )
        .then(() => dispatch('getSystemFirwareVersion'))
        .then(() => i18n.t('pageFirmware.toast.successUploadMessage'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorUploadAndReboot'));
        });
    },
    async switchFirmwareAndReboot({ state }) {
      const backupLoaction = state.backupFirmware.location;
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLoaction,
          },
        },
      };
      return await api
        .patch('/redfish/v1/Managers/bmc', data)
        .then(() => i18n.t('pageFirmware.toast.successRebootFromBackup'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorRebootFromBackup'));
        });
    },
  },
};

export default FirmwareSingleImageStore;
