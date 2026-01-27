import api from '@/store/api';
import i18n from '@/i18n';

/**
 * Firmware Store
 *
 * Handles firmware upload operations and UpdateService settings.
 * Firmware inventory fetching is now handled by useFirmwareInventory() composable.
 */
const FirmwareStore = {
  namespaced: true,
  state: {
    applyTime: null,
    multipartHttpPushUri: null,
    httpPushUri: null,
  },
  mutations: {
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime),
    setHttpPushUri: (state, httpPushUri) => (state.httpPushUri = httpPushUri),
    setMultipartHttpPushUri: (state, multipartHttpPushUri) =>
      (state.multipartHttpPushUri = multipartHttpPushUri),
  },
  actions: {
    getUpdateServiceSettings({ commit }) {
      api
        .get('/redfish/v1/UpdateService')
        .then(({ data }) => {
          const applyTime =
            data.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
          commit('setApplyTime', applyTime);
          const httpPushUri = data.HttpPushUri;
          commit('setHttpPushUri', httpPushUri);
          const multipartHttpPushUri = data.MultipartHttpPushUri;
          commit('setMultipartHttpPushUri', multipartHttpPushUri);
        })
        .catch((error) => console.log(error));
    },
    async uploadFirmware({ state, dispatch }, params) {
      if (state.multipartHttpPushUri != null) {
        return dispatch('uploadFirmwareMultipartHttpPush', params);
      } else if (state.httpPushUri != null) {
        return dispatch('uploadFirmwareHttpPush', params);
      } else {
        console.log('Do not support firmware push update');
      }
    },
    async uploadFirmwareHttpPush({ state }, { image }) {
      return await api
        .post(state.httpPushUri, image, {
          headers: { 'Content-Type': 'application/octet-stream' },
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageFirmware.toast.errorUpdateFirmware'),
          );
        });
    },
    async uploadFirmwareMultipartHttpPush(
      { state },
      { image, targets, forceUpdate, applyTime = 'Immediate' },
    ) {
      const formData = new FormData();
      formData.append('UpdateFile', image);
      let params = {};
      if (targets != null && targets.length > 0) {
        params.Targets = targets;
      } else {
        // TODO: Should be OK to leave Targets out, remove this clause
        // when bmcweb is updated
        params.Targets = [`${await this.dispatch('global/getBmcPath')}`];
      }
      if (forceUpdate) params.ForceUpdate = true;
      params['@Redfish.OperationApplyTime'] = applyTime;
      formData.append('UpdateParameters', JSON.stringify(params));
      return await api
        .post(state.multipartHttpPushUri, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageFirmware.toast.errorUpdateFirmware'),
          );
        });
    },
    /**
     * Switch to backup BMC firmware and reboot.
     * @param {string} backupLocation - The @odata.id of the backup firmware
     */
    async switchBmcFirmwareAndReboot(_, { backupLocation }) {
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLocation,
          },
        },
      };
      return await api
        .patch(`${await this.dispatch('global/getBmcPath')}`, data)
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pageFirmware.toast.errorSwitchImages'),
          );
        });
    },
  },
};

export default FirmwareStore;
