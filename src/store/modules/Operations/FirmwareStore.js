import api from '@/store/api';
import i18n from '@/i18n';

const FirmwareStore = {
  namespaced: true,
  state: {
    bmcFirmware: [],
    biosFirmware: [],
    bmcActiveFirmwareId: null,
    biosActiveFirmwareId: null,
    applyTime: null,
    multipartHttpPushUri: null,
    httpPushUri: null,
  },
  getters: {
    isSingleFileUploadEnabled: (state) => state.biosFirmware.length === 0,
    activeBmcFirmware: (state) => {
      return state.bmcFirmware.find(
        (firmware) => firmware.id === state.bmcActiveFirmwareId,
      );
    },
    activeBiosFirmware: (state) => {
      return state.biosFirmware.find(
        (firmware) => firmware.id === state.biosActiveFirmwareId,
      );
    },
    backupBmcFirmware: (state) => {
      return state.bmcFirmware.find(
        (firmware) => firmware.id !== state.bmcActiveFirmwareId,
      );
    },
    backupBiosFirmware: (state) => {
      return state.biosFirmware.find(
        (firmware) => firmware.id !== state.biosActiveFirmwareId,
      );
    },
  },
  mutations: {
    setActiveBmcFirmwareId: (state, id) => (state.bmcActiveFirmwareId = id),
    setActiveBiosFirmwareId: (state, id) => (state.biosActiveFirmwareId = id),
    setBmcFirmware: (state, firmware) => (state.bmcFirmware = firmware),
    setBiosFirmware: (state, firmware) => (state.biosFirmware = firmware),
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime),
    setHttpPushUri: (state, httpPushUri) => (state.httpPushUri = httpPushUri),
    setMultipartHttpPushUri: (state, multipartHttpPushUri) =>
      (state.multipartHttpPushUri = multipartHttpPushUri),
  },
  actions: {
    async getFirmwareInformation({ dispatch }) {
      dispatch('getActiveBiosFirmware');
      dispatch('getActiveBmcFirmware');
      return await dispatch('getFirmwareInventory');
    },
    async getActiveBmcFirmware({ commit }) {
      return api
        .get(`${await this.dispatch('global/getBmcPath')}`)
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit('setActiveBmcFirmwareId', id);
        })
        .catch((error) => console.log(error));
    },
    async getActiveBiosFirmware({ commit }) {
      return api
        .get(`${await this.dispatch('global/getSystemPath')}/Bios`)
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit('setActiveBiosFirmwareId', id);
        })
        .catch((error) => console.log(error));
    },
    async getFirmwareInventory({ commit }) {
      const inventoryList = await api
        .get('/redfish/v1/UpdateService/FirmwareInventory')
        .then(({ data: { Members = [] } = {} }) =>
          Members.map((item) => api.get(item['@odata.id'])),
        )
        .catch((error) => console.log(error));
      await api
        .all(inventoryList)
        .then((response) => {
          const bmcFirmware = [];
          const biosFirmware = [];
          response.forEach(({ data }) => {
            const firmwareType = data?.RelatedItem?.[0]?.['@odata.id']
              .split('/')
              .pop();
            const item = {
              version: data?.Version,
              id: data?.Id,
              location: data?.['@odata.id'],
              status: data?.Status?.Health,
            };
            if (firmwareType === 'bmc') {
              bmcFirmware.push(item);
            } else if (firmwareType === 'Bios') {
              biosFirmware.push(item);
            }
          });
          commit('setBmcFirmware', bmcFirmware);
          commit('setBiosFirmware', biosFirmware);
        })
        .catch((error) => {
          console.log(error);
        });
    },
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
    async uploadFirmwareMultipartHttpPush({ state }, { image, targets }) {
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
    async switchBmcFirmwareAndReboot({ getters }) {
      const backupLocation = getters.backupBmcFirmware.location;
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
