import { debounce } from 'lodash';
import api from '@/store/api';

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

// 2.5 sec debounce to avoid making multiple consecutive
// GET requests since log related server messages seem to
// come in clusters
const DEBOUNCE_INTERVAL = 2500;
const WebsocketCallbacks = {
  'xyz.openbmc_project.State.Host': debounce(function (eventData) {
    const { properties: { CurrentHostState } = {} } = eventData;
    this.commit('setServerStatus', CurrentHostState);
  }, DEBOUNCE_INTERVAL),
  'xyz.openbmc_project.Logging.Entry': debounce(function () {
    this.dispatch('eventLog/getEventLogData');
  }, DEBOUNCE_INTERVAL),
};

const GlobalStore = {
  namespaced: true,
  state: {
    assetTag: null,
    bmcTime: null,
    serverStatus: 'unreachable',
    languagePreference: localStorage.getItem('storedLanguage') || 'en-US',
    isUtcDisplay: localStorage.getItem('storedUtcDisplay')
      ? JSON.parse(localStorage.getItem('storedUtcDisplay'))
      : true,
    username: localStorage.getItem('storedUsername'),
    isAuthorized: true,
  },
  getters: {
    assetTag: (state) => state.assetTag,
    serverStatus: (state) => state.serverStatus,
    bmcTime: (state) => state.bmcTime,
    languagePreference: (state) => state.languagePreference,
    isUtcDisplay: (state) => state.isUtcDisplay,
    username: (state) => state.username,
    isAuthorized: (state) => state.isAuthorized,
  },
  mutations: {
    setAssetTag: (state, assetTag) => (state.assetTag = assetTag),
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
    async getBmcTime({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          const bmcDateTime = response.data.DateTime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
        })
        .catch((error) => console.log(error));
    },
    getServerStatus({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(
          ({ data: { AssetTag, PowerState, Status: { State } = {} } } = {}) => {
            commit('setAssetTag', AssetTag);
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
    dispatchWebSocketData(context, data) {
      if (data.interface && WebsocketCallbacks[data.interface]) {
        WebsocketCallbacks[data.interface].call(context, data);
      }
    },
  },
};

export default GlobalStore;
