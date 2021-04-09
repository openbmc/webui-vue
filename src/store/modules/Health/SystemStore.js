import api from '@/store/api';

const SystemStore = {
  namespaced: true,
  state: {
    systems: [],
  },
  getters: {
    systems: (state) => state.systems,
  },
  mutations: {
    setSystemInfo: (state, data) => {
      const system = {};
      system.assetTag = data.AssetTag;
      system.description = data.Description;
      system.firmwareVersion = data.BiosVersion;
      system.name = data.Name;
      system.health = data.Status.Health;
      system.id = data.Id;
      system.locationIndicatorActive = data.LocationIndicatorActive;
      system.locationNumber = data.LocationNumber;
      system.manufacturer = data.Manufacturer;
      system.memorySummaryHealth = data.MemorySummary.Status.Health;
      system.memorySummaryHealthRollup = data.MemorySummary.Status.HealthRollup;
      system.memorySummaryState = data.MemorySummary.Status.State;
      system.model = data.Model;
      system.partNumber = data.PartNumber;
      system.processorSummaryCount = data.ProcessorSummary.Count;
      system.processorSummaryHealth = data.ProcessorSummary.Status.Health;
      system.processorSummaryHealthRoll =
        data.ProcessorSummary.Status.HealthRollup;
      system.processorSummaryState = data.ProcessorSummary.Status.State;
      system.powerState = data.PowerState;
      system.serialNumber = data.SerialNumber;
      system.healthRollup = data.Status.HealthRollup;
      system.subModel = data.SubModel;
      system.statusState = data.Status.State;
      system.systemType = data.SystemType;
      state.systems = [system];
    },
  },
  actions: {
    async getSystem({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then(({ data }) => commit('setSystemInfo', data))
        .catch((error) => console.log(error));
    },
    saveIdentifyLedState(_, state) {
      api.patch('/redfish/v1/Systems/system', {
        LocationIndicatorActive: state,
      });
    },
  },
};

export default SystemStore;
