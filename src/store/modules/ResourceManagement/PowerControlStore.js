import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerCapValue: null,
    powerConsumptionValue: null,
    powerControlModeValue: null,
  },
  getters: {
    powerCapValue: (state) => state.powerCapValue,
    powerConsumptionValue: (state) => state.powerConsumptionValue,
    powerControlModeValue: (state) => state.powerControlModeValue,
  },
  mutations: {
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue),
    setPowerControlModeValue: (state, powerControlModeValue) =>
      (state.powerControlModeValue = powerControlModeValue),
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    setPowerControlModeUpdatedValue({ commit }, value) {
      commit('setPowerControlModeValue', value);
    },
    async getPowerControl({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/EnvironmentMetrics')
        .then((response) => {
          const PowerWatts = response.data.PowerWatts;
          const PowerLimitWatts = response.data.PowerLimitWatts;

          const powerCap = PowerLimitWatts.SetPoint;
          // If system is powered off, power consumption does not exist in the PowerControl
          const powerConsumption = PowerWatts.Reading || null;
          const powerControlMode = PowerLimitWatts.ControlMode;

          commit('setPowerControlModeValue', powerControlMode);
          commit('setPowerCapValue', powerCap);
          commit('setPowerConsumptionValue', powerConsumption);
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerCap(_, powerCapValue) {
      const data = {
        PowerLimitWatts: { SetPoint: powerCapValue },
      };

      return await api
        .patch('/redfish/v1/Chassis/chassis/EnvironmentMetrics', data)
        .then(() =>
          i18n.t('pageServerPowerOperations.toast.successSaveSettings')
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
          );
        });
    },
    async setPowerControlMode(_, powerControlModeValue) {
      const data = {
        PowerLimitWatts: { ControlMode: powerControlModeValue },
      };

      return await api
        .patch('/redfish/v1/Chassis/chassis/EnvironmentMetrics', data)
        .then(() =>
          i18n.t('pageServerPowerOperations.toast.successSaveSettings')
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
          );
        });
    },
  },
};

export default PowerControlStore;
