import api from '../../api';

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
    async getPowerControl({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Power')
        .then(response => {
          const powerControl = response.data.PowerControl;
          const powerCap = powerControl[0].PowerLimit.LimitInWatts;
          // If system is powered off, power consumption does not exist in the PowerControl
          const powerConsumption = powerControl[0].PowerConsumedWatts || null;

          commit('setPowerCapValue', powerCap);
          commit('setPowerConsumptionValue', powerConsumption);
        })
        .catch(error => {
          console.log('Power control', error);
        });
    }
  }
};

export default PowerControlStore;
