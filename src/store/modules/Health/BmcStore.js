import api from '@/store/api';

const ChassisStore = {
  namespaced: true,
  state: {
    bmc: null,
  },
  getters: {
    bmc: (state) => state.bmc,
  },
  mutations: {
    setBmcInfo: (state, data) => {
      const bmc = {};
      bmc.dateTime = new Date(data.DateTime);
      bmc.description = data.Description;
      bmc.firmwareVersion = data.FirmwareVersion;
      bmc.graphicalConsoleConnectTypes =
        data.GraphicalConsole.ConnectTypesSupported;
      bmc.graphicalConsoleEnabled = data.GraphicalConsole.ServiceEnabled;
      bmc.graphicalConsoleMaxSessions =
        data.GraphicalConsole.MaxConcurrentSessions;
      bmc.hardwareType = data.Name;
      bmc.health = data.Status.Health;
      bmc.healthRollup = data.Status.HealthRollup;
      bmc.id = data.Id;
      bmc.lastResetTime = new Date(data.LastResetTime);
      bmc.locationIndicatorActive = data.LocationIndicatorActive;
      bmc.locationNumber = data.LocationNumber;
      bmc.manufacturer = data.manufacturer;
      bmc.managerType = data.ManagerType;
      bmc.model = data.Model;
      bmc.partNumber = data.PartNumber;
      bmc.powerState = data.PowerState;
      bmc.serialConsoleConnectTypes = data.SerialConsole.ConnectTypesSupported;
      bmc.serialConsoleEnabled = data.SerialConsole.ServiceEnabled;
      bmc.serialConsoleMaxSessions = data.SerialConsole.MaxConcurrentSessions;
      bmc.serialNumber = data.SerialNumber;
      bmc.serviceEntryPointUuid = data.ServiceEntryPointUUID;
      bmc.sparePartNumber = data.SparePartNumber;
      bmc.statusState = data.Status.State;
      bmc.uuid = data.UUID;
      state.bmc = bmc;
    },
  },
  actions: {
    async getBmcInfo({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then(({ data }) => commit('setBmcInfo', data))
        .catch((error) => console.log(error));
    },
  },
};

export default ChassisStore;
