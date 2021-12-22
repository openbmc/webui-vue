import api from '@/store/api';
import i18n from '@/i18n';

const PowerPolicyStore = {
  namespaced: true,
  state: {
    powerRestorePolicies: [],
  },
  getters: {
    powerRestorePolicies: (state) => state.powerRestorePolicies,
  },
  mutations: {
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
    async getPowerRestoreCurrentPolicy() {
      let PowerRestoreCurrentPolicy;

      await api
        .get('/redfish/v1/Systems/system')
        .then(({ data: { PowerRestorePolicy } }) => {
          PowerRestoreCurrentPolicy = PowerRestorePolicy;
        })
        .catch((error) => console.log(error));
      return PowerRestoreCurrentPolicy;
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

export default PowerPolicyStore;
