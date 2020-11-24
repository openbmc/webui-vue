import api from '@/store/api';
import i18n from '@/i18n';

const ServerLedStore = {
  namespaced: true,
  state: {
    locationIndicatorActive: false,
  },
  getters: {
    getIndicatorValue: (state) => state.locationIndicatorActive,
  },
  mutations: {
    setIndicatorValue(state, locationIndicatorActive) {
      state.locationIndicatorActive = locationIndicatorActive;
    },
  },
  actions: {
    async getIndicatorValue({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then((response) => {
          commit('setIndicatorValue', response.data.LocationIndicatorActive);
        })
        .catch((error) => console.log(error));
    },
    async saveIndicatorLedValue({ commit }, payload) {
      return await api
        .patch('/redfish/v1/Systems/system', {
          LocationIndicatorActive: payload,
        })
        .then(() => {
          commit('setIndicatorValue', payload);
          if (payload) {
            return i18n.t('pageServerLed.toast.successServerLedOn');
          } else {
            return i18n.t('pageServerLed.toast.successServerLedOff');
          }
        })
        .catch((error) => {
          console.log(error);
          if (payload) {
            throw new Error(i18n.t('pageServerLed.toast.errorServerLedOn'));
          } else {
            throw new Error(i18n.t('pageServerLed.toast.errorServerLedOff'));
          }
        });
    },
  },
};

export default ServerLedStore;
