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
        .get(`${await this.dispatch('global/getSystemPath')}`)
        .then((response) => {
          commit(
            'setIndicatorLedActiveState',
            response.data.LocationIndicatorActive,
          );
        })
        .catch((error) => console.log(error));
    },
    async saveIndicatorLedActiveState({ commit }, payload) {
      commit('setIndicatorLedActiveState', payload);
      return await api
        .patch(`${await this.dispatch('global/getSystemPath')}`, {
          LocationIndicatorActive: payload,
        })
        .catch((error) => {
          console.log(error);
          commit('setIndicatorLedActiveState', !payload);
          if (payload) {
            throw new Error(
              i18n.t('pageInventory.toast.errorEnableIdentifyLed'),
            );
          } else {
            throw new Error(
              i18n.t('pageInventory.toast.errorDisableIdentifyLed'),
            );
          }
        });
    },
  },
};

export default ServerLedStore;
