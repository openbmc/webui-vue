import api from '@/store/api';
import StoreModule from '../StoreModule';

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
  loaded: {
    bmcTime: false,
    systemInfo: false,
  },
};

const mutationsEnum = {
  setAssetTag: 'setAssetTag',
  setModelType: 'setModelType',
  setSerialNumber: 'setSerialNumber',
  setBmcTime: 'setBmcTime',
  setServerStatus: 'setServerStatus',
  setLanguagePreference: 'setLanguagePreference',
  setUsername: 'setUsername',
  setUtcTime: 'setUtcTime',
  setUnauthorized: 'setUnauthorized',
  setLoaded: 'setLoaded',
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
  loaded: 'loaded',
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
    [gettersEnum.loaded]: (state) => state.loaded,
  },
  mutations: {
    [mutationsEnum.setAssetTag]: (state, assetTag) =>
      (state.assetTag = assetTag),
    [mutationsEnum.setModelType]: (state, modelType) =>
      (state.modelType = modelType),
    [mutationsEnum.setSerialNumber]: (state, serialNumber) =>
      (state.serialNumber = serialNumber),
    [mutationsEnum.setBmcTime]: (state, bmcTime) => (state.bmcTime = bmcTime),
    [mutationsEnum.setServerStatus]: (state, serverState) =>
      (state.serverStatus = serverStateMapper(serverState)),
    [mutationsEnum.setLanguagePreference]: (state, language) =>
      (state.languagePreference = language),
    [mutationsEnum.setUsername]: (state, username) =>
      (state.username = username),
    [mutationsEnum.setUtcTime]: (state, isUtcDisplay) =>
      (state.isUtcDisplay = isUtcDisplay),
    [mutationsEnum.setUnauthorized]: (state) => {
      state.isAuthorized = false;
      window.setTimeout(() => {
        state.isAuthorized = true;
      }, 100);
    },
    [mutationsEnum.setLoaded]: (state, loaded) => {
      state.loaded = {
        ...state.loaded,
        ...loaded,
      };
    },
  },
  actions: {
    async [actionsEnum.getBmcTime]({ commit }, uri) {
      commit(mutationsEnum.setLoaded, { bmcTime: false });
      const response = await api.get(uri);
      const bmcDateTime = response.data.DateTime;
      const date = new Date(bmcDateTime);
      commit(mutationsEnum.setBmcTime, date);
      commit(mutationsEnum.setLoaded, { bmcTime: true });
    },
    async [actionsEnum.getSystemInfo]({ commit, rootGetters }) {
      commit(mutationsEnum.setLoaded, { systemInfo: false });
      const uri = rootGetters.systemUri;
      const {
        data: {
          AssetTag,
          Model,
          PowerState,
          SerialNumber,
          Status: { State } = {},
        },
      } = await api.get(uri);

      commit(mutationsEnum.setAssetTag, AssetTag);
      commit(mutationsEnum.setSerialNumber, SerialNumber);
      commit(mutationsEnum.setModelType, Model);

      // OpenBMC's host state interface is mapped to 2 Redfish
      // properties "Status""State" and "PowerState". Look first
      // at State for certain cases.
      const serverStatus =
        State === 'Quiesced' || State === 'InTest' ? State : PowerState;
      commit(mutationsEnum.setServerStatus, serverStatus);
      commit(mutationsEnum.setLoaded, { systemInfo: true });
    },
  },
};

/**
 * @type {GlobalStoreModule}
 */
const GlobalStore = new StoreModule('global', store, gettersEnum, actionsEnum);

export default GlobalStore;
