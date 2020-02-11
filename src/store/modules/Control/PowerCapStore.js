import api from '../../api';
import i18n from '../../../i18n';

const PowerCapStore = {
  namespaced: true,
  state: {
    powerCapData: null,
    powerCapValue: '--'
  },
  getters: {
    powerCapData: state => state.powerCapData,
    powerCapValue: state => state.powerCapValue
  },
  mutations: {
    setPowerCapData: (state, powerCapData) =>
      (state.powerCapData = powerCapData),
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue)
  },
  actions: {
    getPowerCapData({ commit }) {
      api
        .get('/xyz/openbmc_project/control/host0/power_cap')
        .then(response => {
          const powerCapData = response.data.data;
          if (powerCapData.PowerCapEnable) {
            commit('setPowerCapValue', powerCapData.PowerCap + ' W');
          } else {
            commit('setPowerCapValue', i18n.t('overview.state.notEnabled'));
          }
        })
        .catch(error => {
          console.log('Power cap error', error);
        });
    }
  }
};

export default PowerCapStore;
