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
    getIndicatorValue: ({ commit }) => {
      api
        .get('/redfish/v1/Systems/system')
        .then(response => {
          commit('setIndicatorValue', response.data.IndicatorLED);
        })
        .catch(error => console.log(error));
    },
    saveIndicatorLedValue: ({ commit }, payload) => {
      api
        .patch('/redfish/v1/Systems/system', { IndicatorLED: payload })
        .then(() => {
          commit('setIndicatorValue', payload);
        })
        .catch(error => console.log(error));
    }
  }
};

export default ServerLedStore;
