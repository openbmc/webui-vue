import api from '@/store/api';
import i18n from '@/i18n';

const ServerLedStore = {
  namespaced: true,
  state: {
    indicatorLedActiveState: false,
  },
  getters: {
    getIndicatorLedActiveState: (state) => state.indicatorLedActiveState,
  },
  mutations: {
    setIndicatorLedActiveState(state, indicatorLedActiveState) {
      state.indicatorLedActiveState = indicatorLedActiveState;
    },
  },
  actions: {
    async getIndicatorLedActiveState({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then((response) => {
          commit(
            'setIndicatorLedActiveState',
            response.data.LocationIndicatorActive
          );
        })
        .catch((error) => console.log(error));
    },
    async saveIndicatorLedActiveState({ commit }, payload) {
      commit('setIndicatorLedActiveState', payload);
      return await api
        .patch('/redfish/v1/Systems/system', {
          LocationIndicatorActive: payload,
        })
        .then(() => {
          if (payload) {
            return i18n.t('pageServerLed.toast.successServerLedOn');
          } else {
            return i18n.t('pageServerLed.toast.successServerLedOff');
          }
        })
        .catch((error) => {
          console.log(error);
          commit('setIndicatorLedActiveState', !payload);
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
