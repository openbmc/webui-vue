import api from '@/store/api';
import UpdateLedStatusError from '../../../utilities/UpdateLedStatusError';

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
        .catch((error) => {
          console.log(error);
          commit('setIndicatorLedActiveState', !payload);
          throw new UpdateLedStatusError(payload);
        });
    },
  },
};

export default ServerLedStore;
