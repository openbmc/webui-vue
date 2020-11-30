import api from '@/store/api';
import i18n from '@/i18n';

/**
 * Get backup firmware image from SoftwareImages
 * The backup is whichever image is not the current
 * or "ActiveSoftwareImage"
 * @param {Array} list
 * @param {String} currentLocation
 */
function getBackupFirmwareLocation(list, currentLocation) {
  return list
    .map((item) => item['@odata.id'])
    .find((location) => {
      const id = location.split('/').pop();
      const currentId = currentLocation.split('/').pop();
      return id !== currentId;
    });
}

const FirmwareStore = {
  namespaced: true,
  state: {
    bmcFirmware: {
      currentVersion: null,
      currentState: null,
      currentLocation: null,
      backupVersion: null,
      backupState: null,
      backupLocation: null,
    },
    hostFirmware: {
      currentVersion: null,
      currentState: null,
      currentLocation: null,
      backupVersion: null,
      backupState: null,
      backupLocation: null,
    },
    applyTime: null,
  },
  getters: {
    bmcFirmwareCurrentVersion: (state) => state.bmcFirmware.currentVersion,
    bmcFirmwareCurrentState: (state) => state.bmcFirmware.currentState,
    bmcFirmwareBackupVersion: (state) => state.bmcFirmware.backupVersion,
    bmcFirmwareBackupState: (state) => state.bmcFirmware.backupState,
    hostFirmwareCurrentVersion: (state) => state.hostFirmware.currentVersion,
    hostFirmwareCurrentState: (state) => state.hostFirmware.currentState,
    hostFirmwareBackupVersion: (state) => state.hostFirmware.backupVersion,
    hostFirmwareBackupState: (state) => state.hostFirmware.backupState,
  },
  mutations: {
    setBmcFirmwareCurrent: (state, { version, location, status }) => {
      state.bmcFirmware.currentVersion = version;
      state.bmcFirmware.currentState = status;
      state.bmcFirmware.currentLocation = location;
    },
    setBmcFirmwareBackup: (state, { version, location, status }) => {
      state.bmcFirmware.backupVersion = version;
      state.bmcFirmware.backupState = status;
      state.bmcFirmware.backupLocation = location;
    },
    setHostFirmwareCurrent: (state, { version, location, status }) => {
      state.hostFirmware.currentVersion = version;
      state.hostFirmware.currentState = status;
      state.hostFirmware.currentLocation = location;
    },
    setHostFirmwareBackup: (state, { version, location, status }) => {
      state.hostFirmware.backupVersion = version;
      state.hostFirmware.backupState = status;
      state.hostFirmware.backupLocation = location;
    },
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime),
  },
  actions: {
    async getFirmwareInformation({ dispatch }) {
      return await api.all([
        dispatch('getBmcFirmware'),
        dispatch('getHostFirmware'),
      ]);
    },
    async getBmcFirmware({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data: { Links } }) => {
          const currentLocation = Links.ActiveSoftwareImage['@odata.id'];
          // Check SoftwareImages list for not ActiveSoftwareImage id
          const backupLocation = getBackupFirmwareLocation(
            Links.SoftwareImages,
            currentLocation
          );
          return { currentLocation, backupLocation };
        })
        .then(async ({ currentLocation, backupLocation }) => {
          const currentData = await api.get(currentLocation);
          let backupData = {};

          if (backupLocation) {
            backupData = await api.get(backupLocation);
          }

          commit('setBmcFirmwareCurrent', {
            version: currentData?.data?.Version,
            location: currentData?.data?.['@odata.id'],
            status: currentData?.data?.Status?.State,
          });
          commit('setBmcFirmwareBackup', {
            version: backupData.data?.Version,
            location: backupData.data?.['@odata.id'],
            status: backupData.data?.Status?.State,
          });
        })
        .catch((error) => console.log(error));
    },
    async getHostFirmware({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Bios')
        .then(({ data: { Links } }) => {
          const currentLocation = Links.ActiveSoftwareImage['@odata.id'];
          const backupLocation = getBackupFirmwareLocation(
            Links.SoftwareImages,
            currentLocation
          );
          return { currentLocation, backupLocation };
        })
        .then(async ({ currentLocation, backupLocation }) => {
          const currentData = await api.get(currentLocation);
          let backupData = {};

          if (backupLocation) {
            backupData = await api.get(backupLocation);
          }

          commit('setHostFirmwareCurrent', {
            version: currentData?.data?.Version,
            location: currentData?.data?.['@odata.id'],
            status: currentData?.data?.Status?.State,
          });
          commit('setHostFirmwareBackup', {
            version: backupData.data?.Version,
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
    async switchBmcFirmware({ state }) {
      const backupLocation = state.bmcFirmware.backupLocation;
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLocation,
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

export default FirmwareStore;
