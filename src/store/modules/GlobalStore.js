import api from '@/store/api';

const HOST_STATE = {
  on: 'xyz.openbmc_project.State.Host.HostState.Running',
  off: 'xyz.openbmc_project.State.Host.HostState.Off',
  error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
  diagnosticMode: 'xyz.openbmc_project.State.Host.HostState.DiagnosticMode',
};

/**
 * Role names known to bmcweb. These correspond to Session.Roles entries and
 * AccountService/Roles role names — not Redfish AssignedPrivileges directly.
 * - Session.Roles: role names for this session (password, LDAP, or certificate)
 * - AccountService/Roles: maps each role name to its AssignedPrivileges
 * - User accounts carry a RoleId, but the Session is the UI source of truth
 */
const privilegesId = {
  admin: 'Administrator',
  operator: 'Operator',
  readOnly: 'ReadOnly',
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
    // First Session.Roles entry (a role name, e.g. 'Administrator').
    // Session may be LDAP/cert without a corresponding AccountService user.
    userPrivilege: null,
    sessionRoles: [],
    rolePrivileges: {},
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
    sessionRole: (state) => state.userPrivilege,
    sessionRoles: (state) => state.sessionRoles,
    rolePrivileges: (state) => state.rolePrivileges,
  },
  mutations: {
    setAssetTag: (state, assetTag) => (state.assetTag = assetTag),
    setModelType: (state, modelType) => (state.modelType = modelType),
    setSerialNumber: (state, serialNumber) =>
      (state.serialNumber = serialNumber),
    setBmcTime: (state, bmcTime) => (state.bmcTime = bmcTime),
    setServerStatus: (state, serverState) =>
      (state.serverStatus = serverStateMapper(serverState)),
    setLanguagePreference: (state, language) => {
      state.languagePreference = language;
      localStorage.setItem('storedLanguage', language);
    },
    setUsername: (state, username) => (state.username = username),
    setUtcTime: (state, isUtcDisplay) => (state.isUtcDisplay = isUtcDisplay),
    setUnauthorized: (state) => {
      state.isAuthorized = false;
      window.setTimeout(() => {
        state.isAuthorized = true;
      }, 100);
    },
    setSessionRole: (state, roleName) => {
      state.userPrivilege = roleName;
    },
    // Deprecated alias kept for backward compatibility
    setPrivilege: (state, privilege) => {
      state.userPrivilege = privilege;
    },
    setSessionRoles: (state, roles) => {
      state.sessionRoles = roles;
    },
    setRolePrivileges: (state, { roleName, assignedPrivileges, oemPrivileges }) => {
      state.rolePrivileges = {
        ...state.rolePrivileges,
        [roleName]: { assignedPrivileges, oemPrivileges },
      };
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
    async getRolePrivileges({ commit }, sessionRoles) {
      await Promise.all(
        sessionRoles.map((role) =>
          api
            .get(`/redfish/v1/AccountService/Roles/${role}`)
            .then(({ data }) => {
              commit('setRolePrivileges', {
                roleName: role,
                assignedPrivileges: data.AssignedPrivileges ?? [],
                oemPrivileges: data.OemPrivileges ?? [],
              });
            })
            .catch((error) => console.log(error)),
        ),
      );
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
  },
};
export { GlobalStore, serverStateMapper, privilegesId };

export default GlobalStore;
