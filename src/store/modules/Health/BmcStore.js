import api from '@/store/api';

const BmcStore = {
  namespaced: true,
  state: {
    bmc: null,
    healthInfo: null,
  },
  getters: {
    bmc: (state) => state.bmc,
    healthInfo: (state) => state.healthInfo,
  },
  mutations: {
    setBmcInfo: (state, data) => {
      const bmc = {};
      bmc.description = data.Description;
      bmc.firmwareVersion = data.FirmwareVersion;
      bmc.graphicalConsoleConnectTypes =
        data.GraphicalConsole.ConnectTypesSupported;
      bmc.graphicalConsoleEnabled = data.GraphicalConsole.ServiceEnabled;
      bmc.graphicalConsoleMaxSessions =
        data.GraphicalConsole.MaxConcurrentSessions;
      bmc.health = data.Status.Health;
      bmc.healthRollup = data.Status.HealthRollup;
      bmc.id = data.Id;
      bmc.model = data.Model;
      bmc.partNumber = data.PartNumber;
      bmc.powerState = data.PowerState;
      bmc.serialConsoleConnectTypes = data.SerialConsole.ConnectTypesSupported;
      bmc.serialConsoleEnabled = data.SerialConsole.ServiceEnabled;
      bmc.serialConsoleMaxSessions = data.SerialConsole.MaxConcurrentSessions;
      bmc.serialNumber = data.SerialNumber;
      bmc.serviceEntryPointUuid = data.ServiceEntryPointUUID;
      bmc.statusState = data.Status.State;
      bmc.uuid = data.UUID;
      state.bmc = bmc;
    },
    setBmcHealthInfo: (state, data) => {
      const healthInfo = {};
      healthInfo.CPU = data['CPU'];
      healthInfo.Memory = data['Memory'];
      healthInfo.Storage_RW = data['Storage_RW'];
      state.healthInfo = healthInfo;
    },
  },
  actions: {
    async getBmcInfo({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data }) => commit('setBmcInfo', data))
        .catch((error) => console.log(error));
    },
    async getBmcHealthInfo({ commit }) {
      console.log('Hey!');
      return await api
        .get('/bmchealth/')
        .then(({ data }) => commit('setBmcHealthInfo', data))
        .catch((error) => console.err(error));
    },
  },
};

export default BmcStore;
