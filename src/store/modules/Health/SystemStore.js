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
    changeAttentionLedState({ dispatch }, ledState) {
      api
        .patch('/redfish/v1/Systems/system', {
          PowerState: ledState,
        })
        .then(() => dispatch('getSystem'))
        .catch((error) => {
          dispatch('getSystem');
          console.log('error', error);
          if (ledState) {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOnAttentionLed')
            );
          } else {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOffAttentionLed')
            );
          }
        });
    },
    changeIdentifyLedState({ dispatch }, ledState) {
      api
        .patch('/redfish/v1/Systems/system', {
          LocationIndicatorActive: ledState,
        })
        .then(() => dispatch('getSystem'))
        .catch((error) => {
          dispatch('getSystem');
          console.log('error', error);
          if (ledState) {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOnIdentifyLed')
            );
          } else {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOffIdentifyLed')
            );
          }
        });
    },
  },
};

export default SystemStore;
