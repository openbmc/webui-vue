import api from '../../api';

const PowerConsumptionStore = {
  namespaced: true,
  state: {
    powerConsumption: false
  },
  getters: {
    powerConsumption: state => state.powerConsumption
  },
  mutations: {
    setPowerConsumption: (state, powerConsumption) =>
      (state.powerConsumption = powerConsumption)
  },
  actions: {
    getPowerData({ commit }) {
      api
        .get('/xyz/openbmc_project/sensors/power/total_power')
        .then(response => {
          const powerData = response.data.data;
          let powerConsumption =
            powerData.Value * Math.pow(10, powerData.Scale);
          commit('setPowerConsumption', powerConsumption + ' W');
        })
        .catch(error => {
          console.log('Power Consumption', error);
        });
    }
  }
};

export default PowerConsumptionStore;
