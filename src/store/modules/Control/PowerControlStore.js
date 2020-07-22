import api from '../../api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerCapValue: null,
    powerConsumptionValue: null
  },
  getters: {
    powerCapValue: state => state.powerCapValue,
    powerConsumptionValue: state => state.powerConsumptionValue
  },
  mutations: {
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue)
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    async getPowerControl({ commit }) {
      try {
        const { data } = await api.get('/redfish/v1/Chassis');
        const chassisId = data.Members[0]['@odata.id'].split('/').pop();

        const response = await api.get(
          `/redfish/v1/Chassis/${chassisId}/Power`
        );
        const powerControl = response.data.PowerControl;
        const powerCap = powerControl[0].PowerLimit.LimitInWatts;
        // If system is powered off, power consumption does not exist in the PowerControl
        const powerConsumption = powerControl[0].PowerConsumedWatts || null;

        commit('setPowerCapValue', powerCap);
        commit('setPowerConsumptionValue', powerConsumption);
      } catch (error) {
        console.log('Power control', error);
      }
    },
    async setPowerControl(_, powerCapValue) {
      const { data } = await api.get('/redfish/v1/Chassis');
      const chassisId = data.Members[0]['@odata.id'].split('/').pop();

      try {
        const data = {
          PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }]
        };
        await api.patch(`/redfish/v1/Chassis/${chassisId}/Power`, data);
        i18n.t('pageServerPowerOperations.toast.successSaveSettings');
      } catch (error) {
        console.log(error);
        throw new Error(
          i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
        );
      }
    }
  }
};

export default PowerControlStore;
