import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerRestoreCurrentPolicy: null,
    powerRestorePolicies: [],
  },
  getters: {
    powerRestoreCurrentPolicy: (state) => state.powerRestoreCurrentPolicy,
    powerRestorePolicies: (state) => state.powerRestorePolicies,
  },
  mutations: {
    setPowerRestoreCurrentPolicy: (state, powerRestoreCurrentPolicy) =>
      (state.powerRestoreCurrentPolicy = powerRestoreCurrentPolicy),
    setPowerRestorePolicies: (state, powerRestorePolicies) =>
      (state.powerRestorePolicies = powerRestorePolicies),
  },
  actions: {
    async getPowerRestorePolicies({ commit }) {
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
                let desc = `${i18n.t(
                  `pagePowerRestorePolicy.policies.${powerState}`
                )} - ${PowerRestorePolicyTypes.enumDescriptions[powerState]}`;
                return {
                  state: powerState,
                  desc,
                };
              }
            );
            commit('setPowerRestorePolicies', powerPoliciesData);
          }
        );
    },
    async getPowerRestoreCurrentPolicy({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(({ data: { PowerRestorePolicy } }) => {
          commit('setPowerRestoreCurrentPolicy', PowerRestorePolicy);
        })
        .catch((error) => console.log(error));
    },
    async setPowerRestorePolicy({ commit }, powerPolicy) {
      const data = { PowerRestorePolicy: powerPolicy };

      return await api
        .patch('/redfish/v1/Systems/system', data)
        .then(() =>
          commit('setPowerRestoreCurrentPolicy', data.PowerRestorePolicy)
        )
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
