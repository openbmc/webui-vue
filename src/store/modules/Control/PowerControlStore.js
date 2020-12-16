import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerCapValue: null,
    powerConsumptionValue: null,
    powerPolicy: null,
    powerRestorePolicies: [],
  },
  getters: {
    powerCapValue: (state) => state.powerCapValue,
    powerConsumptionValue: (state) => state.powerConsumptionValue,
    powerRestorePolicies: (state) => state.powerRestorePolicies,
  },
  mutations: {
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue),
    setPowerRestorePolicies: (state, powerRestorePolicies) =>
      (state.powerRestorePolicies = powerRestorePolicies),
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    async getPowerControl({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Power')
        .then((response) => {
          const powerControl = response.data.PowerControl;
          const powerCap = powerControl[0].PowerLimit.LimitInWatts;
          // If system is powered off, power consumption does not exist in the PowerControl
          const powerConsumption = powerControl[0].PowerConsumedWatts || null;

          commit('setPowerCapValue', powerCap);
          commit('setPowerConsumptionValue', powerConsumption);
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerControl(_, powerCapValue) {
      const data = {
        PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
      };

      return await api
        .patch('/redfish/v1/Chassis/chassis/Power', data)
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
    async getPowerRestorePolicy({ commit }) {
      return await api
        .get('/redfish/v1/JsonSchemas/ComputerSystem/ComputerSystem.json')
        .then(
          ({
            data: {
              definitions: { PowerRestorePolicyTypes = {} },
            },
          }) => {
            let powerPoliciesData = PowerRestorePolicyTypes.enum.map(
              (powerState) => {
                return {
                  state: powerState,
                  desc: `${powerState} - ${PowerRestorePolicyTypes.enumDescriptions[powerState]}`,
                };
              }
            );
            commit('setPowerRestorePolicies', powerPoliciesData);
          }
        );
    },
    async setPowerRestorePolicy(_, powerPolicy) {
      const data = { PowerRestorePolicy: powerPolicy };

      return await api
        .patch('/redfish/v1/Systems/system', data)
        .then(() => i18n.t('pagePowerRestorePolicy.toast.successSaveSettings'))
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pagePowerRestorePolicy.toast.errorSaveSettings')
          );
        });
    },
  },
};

export default PowerControlStore;
