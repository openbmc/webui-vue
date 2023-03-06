import api from '@/store/api';

/**
 * Watch for powerState changes in GlobalStore module
 * to set isOperationInProgress state
 * Stop watching powerState changes and resolve Promise when
 * powerState value matches passed argument or after 10 seconds
 * @param {string} powerState
 * @returns {Promise}
 */
const checkForPowerState = function (powerState) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve();
      unwatch();
    }, 10000 /*10 seconds*/);
    const unwatch = this.watch(
      (state) => state.powerState,
      (value) => {
        if (value === powerState) {
          resolve();
          unwatch();
          clearTimeout(timer);
        }
      }
    );
  });
};

const KvmStore = {
  namespaced: true,
  state: {
    powerState: 'unknown',
    isOperationInProgress: false,
    lastPowerOperationTime: null,
    lastBmcRebootTime: null,
  },
  getters: {
    powerState: (state) => state.powerState,
    isOperationInProgress: (state) => state.isOperationInProgress,
    lastPowerOperationTime: (state) => state.lastPowerOperationTime,
    lastBmcRebootTime: (state) => state.lastBmcRebootTime,
  },
  mutations: {
    setHostPowerState: (state, powerState) => (state.powerState = powerState),
    setOperationInProgress: (state, inProgress) =>
      (state.isOperationInProgress = inProgress),
    setLastPowerOperationTime: (state, lastPowerOperationTime) =>
      (state.lastPowerOperationTime = lastPowerOperationTime),
    setLastBmcRebootTime: (state, lastBmcRebootTime) =>
      (state.lastBmcRebootTime = lastBmcRebootTime),
  },
  actions: {
    async getPowerState({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then((response) => {
          const powerState = response.data.PowerState;
          commit('setHostPowerState', powerState);
        })
        .catch((error) => console.log(error));
    },
    async hostPowerOn({ dispatch, commit }) {
      const data = { ResetType: 'On' };
      dispatch('hostPowerChange', data);
      await checkForPowerState.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getPowerState');
    },
    async hostHardReboot({ dispatch, commit }) {
      const data = { ResetType: 'ForceRestart' };
      dispatch('hostPowerChange', data);
      await checkForPowerState.bind(this, 'on')();
      commit('setOperationInProgress', false);
      dispatch('getPowerState');
    },
    async hostHardPowerOff({ dispatch, commit }) {
      const data = { ResetType: 'ForceOff' };
      dispatch('hostPowerChange', data);
      await checkForPowerState.bind(this, 'off')();
      commit('setOperationInProgress', false);
      dispatch('getPowerState');
    },
    async hostPowerChange({ commit }, data) {
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

export default KvmStore;
