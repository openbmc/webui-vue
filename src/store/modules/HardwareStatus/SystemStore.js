import api from '@/store/api';
import i18n from '@/i18n';

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
      system.hardwareType = data.Name;
      system.health = data.Status?.Health;
      system.totalSystemMemoryGiB = data.MemorySummary?.TotalSystemMemoryGiB;
      system.id = data.Id;
      system.locationIndicatorActive = data.LocationIndicatorActive;
      system.locationNumber = data.Location?.PartLocation?.ServiceLabel;
      system.manufacturer = data.Manufacturer;
      system.model = data.Model;
      system.processorSummaryCount = data.ProcessorSummary?.Count;
      system.processorSummaryCoreCount = data.ProcessorSummary?.CoreCount;
      system.powerState = data.PowerState;
      system.serialNumber = data.SerialNumber;
      system.healthRollup = data.Status?.HealthRollup;
      system.subModel = data.SubModel;
      system.statusState = data.Status?.State;
      system.systemType = data.SystemType;
      state.systems = [system];
    },
  },
  actions: {
    async getSystem({ commit }) {
      return await api
        .get('/redfish/v1')
        .then((response) =>
          api.get(`${response.data.Systems['@odata.id']}/system`)
        )
        .then(({ data }) => commit('setSystemInfo', data))
        .catch((error) => console.log(error));
    },
    async changeIdentifyLedState({ commit }, ledState) {
      return await api
        .patch('/redfish/v1/Systems/system', {
          LocationIndicatorActive: ledState,
        })
        .catch((error) => {
          commit('setSystemInfo', this.state.system.systems[0]);
          console.log('error', error);
          if (ledState) {
            throw new Error(
              i18n.t('pageInventory.toast.errorEnableIdentifyLed')
            );
          } else {
            throw new Error(
              i18n.t('pageInventory.toast.errorDisableIdentifyLed')
            );
          }
        });
    },
  },
};

export default SystemStore;
