import api from '../../api';
import i18n from '@/i18n';

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
      return await api
        .get('/redfish/v1/Systems/system')
        .then(response => {
          commit('setIndicatorValue', response.data.IndicatorLED);
        })
        .catch(error => console.log(error));
    },
    async saveIndicatorLedValue({ commit }, payload) {
      return await api
        .patch('/redfish/v1/Systems/system', { IndicatorLED: payload })
        .then(() => {
          commit('setIndicatorValue', payload);
        })
        .then(() => {
          i18n.t('pageServerLed.toast.successServerLed', { state: payload });
        })
        .catch(error => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerLed.toast.errorServerLed', { state: 'test' })
          );
        });
    }
  }
};

export default ServerLedStore;
