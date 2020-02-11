import api from '../../api';

const PowerCapStore = {
  namespaced: true,
  state: {
    powerCapData: '--'
  },
  getters: {
    powerCapData: state => state.powerCapData
  },
  mutations: {
    setPowerCapData: (state, powerCapData) =>
      (state.powerCapData = powerCapData)
  },
  actions: {
    getPowerCapData({ commit }) {
      api
        .get('/xyz/openbmc_project/control/host0/power_cap')
        .then(response => {
          const powerCapData = response.data.data;
          commit('setPowerCapData', powerCapData);
        })
        .catch(error => {
          console.log('Power cap error', error);
        });
    }
  }
};

export default PowerCapStore;
