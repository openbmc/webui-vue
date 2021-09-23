import api from '@/store/api';
import StoreModule from '@/store/StoreModule';

const HOST_STATE = {
  on: 'xyz.openbmc_project.State.Host.HostState.Running',
  off: 'xyz.openbmc_project.State.Host.HostState.Off',
  error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
  diagnosticMode: 'xyz.openbmc_project.State.Host.HostState.DiagnosticMode',
};

const serverStateMapper = (hostState) => {
  switch (hostState) {
    case HOST_STATE.on:
    case 'On': // Redfish PowerState
      return 'on';
    case HOST_STATE.off:
    case 'Off': // Redfish PowerState
      return 'off';
    case HOST_STATE.error:
    case 'Quiesced': // Redfish Status
      return 'error';
    case HOST_STATE.diagnosticMode:
    case 'InTest': // Redfish Status
      return 'diagnosticMode';
    default:
      return 'unreachable';
  }
};

/**
 * @type {GlobalState}
 */
const state = {
  assetTag: null,
  bmcTime: null,
  modelType: null,
  serialNumber: null,
  serverStatus: 'unreachable',
  languagePreference: localStorage.getItem('storedLanguage') || 'en-US',
  isUtcDisplay: localStorage.getItem('storedUtcDisplay')
    ? JSON.parse(localStorage.getItem('storedUtcDisplay'))
    : true,
  username: localStorage.getItem('storedUsername'),
  isAuthorized: true,
};

/**
 * @type {GlobalGetters}
 */
const gettersEnum = {
  assetTag: 'assetTag',
  modelType: 'modelType',
  serialNumber: 'serialNumber',
  serverStatus: 'serverStatus',
  bmcTime: 'bmcTime',
  languagePreference: 'languagePreference',
  isUtcDisplay: 'isUtcDisplay',
  username: 'username',
  isAuthorized: 'isAuthorized',
};

/**
 * @type {GlobalActions}
 */
const actionsEnum = {
  getBmcTime: 'getBmcTime',
  getSystemInfo: 'getSystemInfo',
};

const store = {
  namespaced: true,
  state,
  getters: {
    [gettersEnum.assetTag]: (state) => state.assetTag,
    [gettersEnum.modelType]: (state) => state.modelType,
    [gettersEnum.serialNumber]: (state) => state.serialNumber,
    [gettersEnum.serverStatus]: (state) => state.serverStatus,
    [gettersEnum.bmcTime]: (state) => state.bmcTime,
    [gettersEnum.languagePreference]: (state) => state.languagePreference,
    [gettersEnum.isUtcDisplay]: (state) => state.isUtcDisplay,
    [gettersEnum.username]: (state) => state.username,
    [gettersEnum.isAuthorized]: (state) => state.isAuthorized,
  },
  mutations: {
    setAssetTag: (state, assetTag) => (state.assetTag = assetTag),
    setModelType: (state, modelType) => (state.modelType = modelType),
    setSerialNumber: (state, serialNumber) =>
      (state.serialNumber = serialNumber),
    setBmcTime: (state, bmcTime) => (state.bmcTime = bmcTime),
    setServerStatus: (state, serverState) =>
      (state.serverStatus = serverStateMapper(serverState)),
    setLanguagePreference: (state, language) =>
      (state.languagePreference = language),
    setUsername: (state, username) => (state.username = username),
    setUtcTime: (state, isUtcDisplay) => (state.isUtcDisplay = isUtcDisplay),
    setUnauthorized: (state) => {
      state.isAuthorized = false;
      window.setTimeout(() => {
        state.isAuthorized = true;
      }, 100);
    },
  },
  actions: {
    async [actionsEnum.getBmcTime]({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          const bmcDateTime = response.data.DateTime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
        })
        .catch((error) => console.log(error));
    },
    [actionsEnum.getSystemInfo]({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(
          ({
            data: {
              AssetTag,
              Model,
              PowerState,
              SerialNumber,
              Status: { State } = {},
            },
          } = {}) => {
            commit('setAssetTag', AssetTag);
            commit('setSerialNumber', SerialNumber);
            commit('setModelType', Model);
            if (State === 'Quiesced' || State === 'InTest') {
              // OpenBMC's host state interface is mapped to 2 Redfish
              // properties "Status""State" and "PowerState". Look first
              // at State for certain cases.
              commit('setServerStatus', State);
            } else {
              commit('setServerStatus', PowerState);
            }
          }
        )
        .catch((error) => console.log(error));
    },
  },
};

/**
 * @type {GlobalStoreModule}
 */
const GlobalStore = new StoreModule('global', store, gettersEnum, actionsEnum);

export default GlobalStore;
