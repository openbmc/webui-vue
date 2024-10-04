import api from '@/store/api';
import i18n from '@/i18n';

const PowerPolicyStore = {
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
        .get('/redfish/v1/JsonSchemas/ComputerSystem')
        .then(async (response) => {
          if (
            response.data?.Location.length > 0 &&
            response.data?.Location[0].Uri
          ) {
            return await api.get(response.data?.Location[0].Uri).then(
              ({
                data: {
                  definitions: { PowerRestorePolicyTypes = {} },
                },
              }) => {
                let powerPoliciesData = PowerRestorePolicyTypes.enum.map(
                  (powerState) => {
                    let desc = `${i18n.global.t(
                      `pagePowerRestorePolicy.policies.${powerState}`,
                    )} - ${
                      PowerRestorePolicyTypes.enumDescriptions[powerState]
                    }`;
                    return {
                      state: powerState,
                      desc,
                    };
                  },
                );
                commit('setPowerRestorePolicies', powerPoliciesData);
              },
            );
          }
        });
    },
    async getPowerRestoreCurrentPolicy({ commit }) {
      return await api
        .get(`${await this.dispatch('global/getSystemPath')}`)
        .then(({ data: { PowerRestorePolicy } }) => {
          commit('setPowerRestoreCurrentPolicy', PowerRestorePolicy);
        })
        .catch((error) => console.log(error));
    },
    async setPowerRestorePolicy({ dispatch }, powerPolicy) {
      const data = { PowerRestorePolicy: powerPolicy };

      return await api
        .patch(`${await this.dispatch('global/getSystemPath')}`, data)
        .then(() => {
          dispatch('getPowerRestoreCurrentPolicy');
          return i18n.global.t(
            'pagePowerRestorePolicy.toast.successSaveSettings',
          );
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.global.t('pagePowerRestorePolicy.toast.errorSaveSettings'),
          );
        });
    },
  },
};

export default PowerPolicyStore;
