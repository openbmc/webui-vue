import api from '@/store/api';
import i18n from '@/i18n';
import StoreModule from '@/store/StoreModule';

const state = {
  bmcFirmware: [],
  hostFirmware: [],
  bmcActiveFirmwareId: null,
  hostActiveFirmwareId: null,
  applyTime: null,
  tftpAvailable: false,
};

const gettersEnum = {
  isTftpUploadAvailable: 'isTftpUploadAvailable',
  isSingleFileUploadEnabled: 'isSingleFileUploadEnabled',
  activeBmcFirmware: 'activeBmcFirmware',
  activeHostFirmware: 'activeHostFirmware',
  backupBmcFirmware: 'backupBmcFirmware',
  backupHostFirmware: 'backupHostFirmware',
};

const mutationsEnum = {
  setActiveBmcFirmwareId: 'setActiveBmcFirmwareId',
  setActiveHostFirmwareId: 'setActiveHostFirmwareId',
  setBmcFirmware: 'setBmcFirmware',
  setHostFirmware: 'setHostFirmware',
  setApplyTime: 'setApplyTime',
  setTftpUploadAvailable: 'setTftpUploadAvailable',
};

const actionsEnum = {
  getFirmwareInformation: 'getFirmwareInformation',
  getActiveBmcFirmware: 'getActiveBmcFirmware',
  getActiveHostFirmware: 'getActiveHostFirmware',
  getFirmwareInventory: 'getFirmwareInventory',
  getUpdateServiceSettings: 'getUpdateServiceSettings',
  setApplyTimeImmediate: 'setApplyTimeImmediate',
  uploadFirmware: 'uploadFirmware',
  uploadFirmwareTFTP: 'uploadFirmwareTFTP',
  switchBmcFirmwareAndReboot: 'switchBmcFirmwareAndReboot',
};

const store = {
  namespaced: true,
  state,
  getters: {
    [gettersEnum.isTftpUploadAvailable]: (state) => state.tftpAvailable,
    [gettersEnum.isSingleFileUploadEnabled]: (state) =>
      state.hostFirmware.length === 0,
    [gettersEnum.activeBmcFirmware]: (state) => {
      return state.bmcFirmware.find(
        (firmware) => firmware.id === state.bmcActiveFirmwareId
      );
    },
    [gettersEnum.activeHostFirmware]: (state) => {
      return state.hostFirmware.find(
        (firmware) => firmware.id === state.hostActiveFirmwareId
      );
    },
    [gettersEnum.backupBmcFirmware]: (state) => {
      return state.bmcFirmware.find(
        (firmware) => firmware.id !== state.bmcActiveFirmwareId
      );
    },
    [gettersEnum.backupHostFirmware]: (state) => {
      return state.hostFirmware.find(
        (firmware) => firmware.id !== state.hostActiveFirmwareId
      );
    },
  },
  mutations: {
    [mutationsEnum.setActiveBmcFirmwareId]: (state, id) =>
      (state.bmcActiveFirmwareId = id),
    [mutationsEnum.setActiveHostFirmwareId]: (state, id) =>
      (state.hostActiveFirmwareId = id),
    [mutationsEnum.setBmcFirmware]: (state, firmware) =>
      (state.bmcFirmware = firmware),
    [mutationsEnum.setHostFirmware]: (state, firmware) =>
      (state.hostFirmware = firmware),
    [mutationsEnum.setApplyTime]: (state, applyTime) =>
      (state.applyTime = applyTime),
    [mutationsEnum.setTftpUploadAvailable]: (state, tftpAvailable) =>
      (state.tftpAvailable = tftpAvailable),
  },
  actions: {
    async [actionsEnum.getFirmwareInformation]({ dispatch }) {
      dispatch(actionsEnum.getActiveHostFirmware);
      dispatch(actionsEnum.getActiveBmcFirmware);
      return await dispatch(actionsEnum.getFirmwareInventory);
    },
    [actionsEnum.getActiveBmcFirmware]({ commit }, { links }) {
      console.log(links);
      const id = links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
      commit(mutationsEnum.setActiveBmcFirmwareId, id);
    },
    [actionsEnum.getActiveHostFirmware]({ commit }) {
      return api
        .get('/redfish/v1/Systems/system/Bios')
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit(mutationsEnum.setActiveHostFirmwareId, id);
        })
        .catch((error) => console.log(error));
    },
    async [actionsEnum.getFirmwareInventory]({ commit }) {
      const inventoryList = await api
        .get('/redfish/v1/UpdateService/FirmwareInventory')
        .then(({ data: { Members = [] } = {} }) =>
          Members.map((item) => api.get(item['@odata.id']))
        )
        .catch((error) => console.log(error));
      await api
        .all(inventoryList)
        .then((response) => {
          const bmcFirmware = [];
          const hostFirmware = [];
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
              hostFirmware.push(item);
            }
          });
          commit(mutationsEnum.setBmcFirmware, bmcFirmware);
          commit(mutationsEnum.setHostFirmware, hostFirmware);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [actionsEnum.getUpdateServiceSettings]({ commit }) {
      api
        .get('/redfish/v1/UpdateService')
        .then(({ data }) => {
          const applyTime =
            data.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
          const allowableActions =
            data?.Actions?.['#UpdateService.SimpleUpdate']?.[
              'TransferProtocol@Redfish.AllowableValues'
            ];

          commit(mutationsEnum.setApplyTime, applyTime);
          if (allowableActions?.includes('TFTP')) {
            commit(mutationsEnum.setTftpUploadAvailable, true);
          }
        })
        .catch((error) => console.log(error));
    },
    [actionsEnum.setApplyTimeImmediate]({ commit }) {
      const data = {
        HttpPushUriOptions: {
          HttpPushUriApplyTime: {
            ApplyTime: 'Immediate',
          },
        },
      };
      return api
        .patch('/redfish/v1/UpdateService', data)
        .then(() => commit(mutationsEnum.setApplyTime, 'Immediate'))
        .catch((error) => console.log(error));
    },
    async [actionsEnum.uploadFirmware]({ state, dispatch }, image) {
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch(mutationsEnum.setApplyTimeImmediate);
      }
      return await api
        .post('/redfish/v1/UpdateService', image, {
          headers: { 'Content-Type': 'application/octet-stream' },
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorUpdateFirmware'));
        });
    },
    async [actionsEnum.uploadFirmwareTFTP]({ state, dispatch }, fileAddress) {
      const data = {
        TransferProtocol: 'TFTP',
        ImageURI: fileAddress,
      };
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch(actionsEnum.setApplyTimeImmediate);
      }
      return await api
        .post(
          '/redfish/v1/UpdateService/Actions/UpdateService.SimpleUpdate',
          data
        )
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorUpdateFirmware'));
        });
    },
    async [actionsEnum.switchBmcFirmwareAndReboot]({ getters }) {
      const backupLocation = getters.backupBmcFirmware.location;
      const data = {
        Links: {
          ActiveSoftwareImage: {
            '@odata.id': backupLocation,
          },
        },
      };
      return await api
        .patch('/redfish/v1/Managers/bmc', data)
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFirmware.toast.errorSwitchImages'));
        });
    },
  },
};

const FirmwareStore = new StoreModule(
  'firmware',
  store,
  gettersEnum,
  actionsEnum
);
export default FirmwareStore;
