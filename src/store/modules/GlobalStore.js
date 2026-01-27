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
    // Cached Redfish resource paths (don't change during session)
    bmcPath: null,
    systemPath: null,
    // Cached Manager resource (for multiple lookups)
    manager: null,
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
    bmcPath: (state) => state.bmcPath,
    systemPath: (state) => state.systemPath,
    manager: (state) => state.manager,
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
    setBmcPath: (state, path) => (state.bmcPath = path),
    setSystemPath: (state, path) => (state.systemPath = path),
    setManager: (state, manager) => (state.manager = manager),
  },
  actions: {
    /**
     * Get the Manager providing service (BMC) from ServiceRoot.
     * Caches the result in state for subsequent calls.
     */
    async getBmcPath({ state, commit }) {
      // Return cached path if available
      if (state.bmcPath) {
        return state.bmcPath;
      }

      const serviceRoot = await api
        .get('/redfish/v1')
        .catch((error) => console.log(error));

      let bmcPath =
        serviceRoot?.data?.Links?.ManagerProvidingService?.['@odata.id'] ||
        serviceRoot?.data?.ManagerProvidingService?.['@odata.id'];

      if (!bmcPath) {
        // Fallback: get first Manager from collection
        const managers = await api
          .get('/redfish/v1/Managers')
          .catch((error) => console.log(error));
        bmcPath = managers?.data?.Members?.[0]?.['@odata.id'];
      }

      commit('setBmcPath', bmcPath);
      return bmcPath;
    },

    async getManagerProvidingService({ state, commit, dispatch }) {
      // Return cached Manager if available
      if (state.manager) {
        return state.manager;
      }
      const manager = await api.get(`${await dispatch('getBmcPath')}`);
      commit('setManager', manager);
      return manager;
    },

    async getSystemPath({ state, commit, dispatch }) {
      // Return cached path if available
      if (state.systemPath) {
        return state.systemPath;
      }
      const Manager = await dispatch('getManagerProvidingService');
      let systemPath =
        Manager?.data?.Links?.ManagerForServers?.[0]?.['@odata.id'] ||
        Manager?.data?.ManagerForServers?.[0]?.['@odata.id'];

      // Fallback to get first System from collection only if not found in Manager
      if (!systemPath) {
        const systems = await api
          .get('/redfish/v1/Systems')
          .catch((error) => console.log(error));
        systemPath = systems?.data?.Members?.[0]?.['@odata.id'];
      }

      commit('setSystemPath', systemPath);
      return systemPath;
    },

    async getManagedSystem({ dispatch }) {
      return api.get(`${await dispatch('getSystemPath')}`);
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
    async getSystemInfo({ commit, dispatch }) {
      const { data: System } = await dispatch('getManagedSystem');
      const {
        AssetTag,
        Model,
        PowerState,
        SerialNumber,
        Status = {},
      } = System || {};
      const { State } = Status;
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
  },
};
export { GlobalStore, serverStateMapper };

export default GlobalStore;
