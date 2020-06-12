import api from '../../api';

const ServerLedStore = {
  namespaced: true,
  state: {
    indicatorValue: 'Off'
  },
  getters: {
    getIndicatorValue: state => state.indicatorValue
  },
  mutations: {
    setIndicatorValue(state, indicatorValue) {
      state.indicatorValue = indicatorValue;
    }
  },
  actions: {
    async getIndicatorValue({ commit }) {
      await api
        .get('/redfish/v1/Systems/system')
        .then(response => {
          commit('setIndicatorValue', response.data.IndicatorLED);
        })
        .catch(error => console.log(error));
    },
    async saveIndicatorLedValue({ commit }, payload) {
      await api
        .patch('/redfish/v1/Systems/system', { IndicatorLED: payload })
        .then(() => {
          commit('setIndicatorValue', payload);
        })
        .catch(error => console.log(error));
    }
  }
};

export default ServerLedStore;
