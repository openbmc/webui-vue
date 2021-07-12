import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerCapValue: null,
    powerConsumptionValue: null,
  },
  getters: {
    powerCapValue: (state) => state.powerCapValue,
    powerConsumptionValue: (state) => state.powerConsumptionValue,
  },
  mutations: {
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue),
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getPowerControl({ dispatch, commit }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      return await api
        .get(`${collection[0]}/Power`)
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
    async setPowerControl({ dispatch }, powerCapValue) {
      const data = {
        PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
      };
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      return await api
        .patch(`${collection[0]}/Power`, data)
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
