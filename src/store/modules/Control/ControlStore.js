import api from '@/store/api';
import i18n from '@/i18n';

/**
 * Watch for hostStatus changes in GlobalStore module
 * to set isOperationInProgress state
 * Stop watching status changes and resolve Promise when
 * hostStatus value matches passed argument or after 5 minutes
 * @param {string} hostStatus
 * @returns {Promise}
 */
const checkForHostStatus = function (hostStatus) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve();
      unwatch();
    }, 300000 /*5mins*/);
    const unwatch = this.watch(
      (state) => state.global.hostStatus,
      (value) => {
        if (value === hostStatus) {
          resolve();
          unwatch();
          clearTimeout(timer);
        }
      }
    );
  });
};

const ControlStore = {
  namespaced: true,
  state: {
    isOperationInProgress: false,
    lastPowerOperationTime: null,
    lastBmcRebootTime: null,
  },
  getters: {
    isOperationInProgress: (state) => state.isOperationInProgress,
    lastPowerOperationTime: (state) => state.lastPowerOperationTime,
    lastBmcRebootTime: (state) => state.lastBmcRebootTime,
  },
  mutations: {
    setOperationInProgress: (state, inProgress) =>
      (state.isOperationInProgress = inProgress),
    setLastPowerOperationTime: (state, lastPowerOperationTime) =>
      (state.lastPowerOperationTime = lastPowerOperationTime),
    setLastBmcRebootTime: (state, lastBmcRebootTime) =>
      (state.lastBmcRebootTime = lastBmcRebootTime),
  },
  actions: {
    async getLastPowerOperationTime({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then((response) => {
          const lastReset = response.data.LastResetTime;
          if (lastReset) {
            const lastPowerOperationTime = new Date(lastReset);
            commit('setLastPowerOperationTime', lastPowerOperationTime);
          }
        })
        .catch((error) => console.log(error));
    },
    getLastBmcRebootTime({ commit }) {
      return api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          const lastBmcReset = response.data.LastResetTime;
          const lastBmcRebootTime = new Date(lastBmcReset);
          commit('setLastBmcRebootTime', lastBmcRebootTime);
        })
        .catch((error) => console.log(error));
    },
    async rebootBmc({ dispatch }) {
      const data = { ResetType: 'GracefulRestart' };
      return await api
        .post('/redfish/v1/Managers/bmc/Actions/Manager.Reset', data)
        .then(() => dispatch('getLastBmcRebootTime'))
        .then(() => i18n.t('pageRebootBmc.toast.successRebootStart'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageRebootBmc.toast.errorRebootStart'));
        });
    },
    async hostPowerOn({ dispatch, commit }) {
      const data = { ResetType: 'On' };
      dispatch('hostPowerChange', data);
      await checkForHostStatus.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async hostSoftReboot({ dispatch, commit }) {
      const data = { ResetType: 'GracefulRestart' };
      dispatch('hostPowerChange', data);
      await checkForHostStatus.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async hostHardReboot({ dispatch, commit }) {
      const data = { ResetType: 'ForceRestart' };
      dispatch('hostPowerChange', data);
      await checkForHostStatus.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async hostSoftPowerOff({ dispatch, commit }) {
      const data = { ResetType: 'GracefulShutdown' };
      dispatch('hostPowerChange', data);
      await checkForHostStatus.bind(this, 'off')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    async hostHardPowerOff({ dispatch, commit }) {
      const data = { ResetType: 'ForceOff' };
      dispatch('hostPowerChange', data);
      await checkForHostStatus.bind(this, 'off')();
      commit('setOperationInProgress', false);
      dispatch('getLastPowerOperationTime');
    },
    hostPowerChange({ commit }, data) {
      commit('setOperationInProgress', true);
      api
        .post('/redfish/v1/Systems/system/Actions/ComputerSystem.Reset', data)
        .catch((error) => {
          console.log(error);
          commit('setOperationInProgress', false);
        });
    },
  },
};

export default ControlStore;
