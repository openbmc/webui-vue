//import api from '../../api';
import Axios from 'axios';

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
      Axios.get('/redfish/v1/Systems/system')
        .then(response => {
          console.log(response.data.IndicatorLED);
          commit('setIndicatorValue', response.data.IndicatorLED);
        })
        .catch(error => console.log(error));
    }
  }
};

export default ServerLedStore;
