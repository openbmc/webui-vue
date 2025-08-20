import api from '@/store/api';
import router from '@/router';

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

const GlobalStore = {
  namespaced: true,
  state: {
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
    userPrivilege: null,
    // Connectivity watchdog
    sequentialTimeouts: 0,
    unresponsiveModalVisible: false,
    unresponsiveCountdownSeconds: 60,
    _unresponsiveCountdownTimer: null,
  },
  getters: {
    assetTag: (state) => state.assetTag,
    modelType: (state) => state.modelType,
    serialNumber: (state) => state.serialNumber,
    serverStatus: (state) => state.serverStatus,
    bmcTime: (state) => state.bmcTime,
    languagePreference: (state) => state.languagePreference,
    isUtcDisplay: (state) => state.isUtcDisplay,
    username: (state) => state.username,
    isAuthorized: (state) => state.isAuthorized,
    userPrivilege: (state) => state.userPrivilege,
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
    setPrivilege: (state, privilege) => {
      state.userPrivilege = privilege;
    },
    incrementSequentialTimeouts: (state) => {
      state.sequentialTimeouts += 1;
    },
    resetSequentialTimeouts: (state) => {
      state.sequentialTimeouts = 0;
    },
    showUnresponsiveModal: (state) => {
      state.unresponsiveModalVisible = true;
    },
    hideUnresponsiveModal: (state) => {
      state.unresponsiveModalVisible = false;
    },
    setUnresponsiveCountdownSeconds: (state, seconds) => {
      state.unresponsiveCountdownSeconds = seconds;
    },
    setUnresponsiveCountdownTimerRef: (state, timerRef) => {
      state._unresponsiveCountdownTimer = timerRef;
    },
  },
  actions: {
    async getBmcPath() {
      const serviceRoot = await api
        .get('/redfish/v1')
        .catch((error) => console.log(error));
      let bmcPath = serviceRoot?.data?.ManagerProvidingService?.['@odata.id'];
      if (!bmcPath) {
        const managers = await api
          .get('/redfish/v1/Managers')
          .catch((error) => console.log(error));
        bmcPath = managers?.data?.Members?.[0]?.['@odata.id'];
      }
      return bmcPath;
    },
    async getSystemPath() {
      const systems = await api
        .get('/redfish/v1/Systems')
        .catch((error) => console.log(error));
      let systemPath = systems?.data?.Members?.[0]?.['@odata.id'];
      return systemPath;
    },
    async getBmcTime({ commit }) {
      return await api
        .get(`${await this.dispatch('global/getBmcPath')}`)
        .then((response) => {
          const bmcDateTime = response.data.DateTime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
        })
        .catch((error) => console.log(error));
    },
    async getSystemInfo({ commit }) {
      api
        .get(`${await this.dispatch('global/getSystemPath')}`)
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
          },
        )
        .catch((error) => console.log(error));
    },
    startUnresponsiveCountdown({ state, commit }) {
      // clear existing timer
      if (state._unresponsiveCountdownTimer) {
        clearInterval(state._unresponsiveCountdownTimer);
        commit('setUnresponsiveCountdownTimerRef', null);
      }
      commit('setUnresponsiveCountdownSeconds', 60);
      const timer = setInterval(() => {
        const next = state.unresponsiveCountdownSeconds - 1;
        commit('setUnresponsiveCountdownSeconds', next);
        if (next <= 0) {
          clearInterval(timer);
          commit('setUnresponsiveCountdownTimerRef', null);
          // Navigate to login without full reload to avoid fetching new assets
          commit('hideUnresponsiveModal');
          commit('resetSequentialTimeouts');
          router.push('/login');
        }
      }, 1000);
      commit('setUnresponsiveCountdownTimerRef', timer);
    },
    cancelUnresponsiveCountdown({ state, commit }) {
      if (state._unresponsiveCountdownTimer) {
        clearInterval(state._unresponsiveCountdownTimer);
        commit('setUnresponsiveCountdownTimerRef', null);
      }
    },
    async tryReconnect({ commit, dispatch }) {
      try {
        const ok = await dispatch('pingBackend');
        if (ok) {
          commit('hideUnresponsiveModal');
          commit('resetSequentialTimeouts');
          dispatch('cancelUnresponsiveCountdown');
          return true;
        }
      } catch (e) {
        // swallow, modal remains visible
      }
      return false;
    },
    async pingBackend() {
      try {
        const response = await api.get('/redfish/v1', {
          timeout: 5000,
        });
        return !!response;
      } catch (e) {
        return false;
      }
    },
  },
};

export default GlobalStore;
