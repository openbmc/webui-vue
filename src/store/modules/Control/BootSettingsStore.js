import api from '../../api';
import i18n from '../../../i18n';

const BootSettingsStore = {
  namespaced: true,
  state: {
    bootOptions: [],
    bootSource: null,
    overrideEnabled: null,
    tpmEnabled: null
  },
  getters: {
    bootOptions: state => state.bootOptions,
    bootSource: state => state.bootSource,
    overrideEnabled: state => state.overrideEnabled,
    tpmEnabled: state => state.tpmEnabled
  },
  mutations: {
    setBootOptions: (state, bootOptions) => (state.bootOptions = bootOptions),
    setBootSource: (state, bootSource) => (state.bootSource = bootSource),
    setOverrideEnabled: (state, overrideEnabled) => {
      if (overrideEnabled === 'Once') {
        state.overrideEnabled = true;
      } else {
        // 'Continuous' or 'Disabled'
        state.overrideEnabled = false;
      }
    },
    setTpmPolicy: (state, tpmEnabled) => (state.tpmEnabled = tpmEnabled)
  },
  actions: {
    getBootSettings({ commit }) {
      api
        .get('/redfish/v1/Systems/system/')
        .then(({ data: { Boot } }) => {
          commit(
            'setBootOptions',
            Boot['BootSourceOverrideTarget@Redfish.AllowableValues']
          );
          commit('setOverrideEnabled', Boot.BootSourceOverrideEnabled);
          commit('setBootSource', Boot.BootSourceOverrideTarget);
        })
        .catch(error => console.log(error));
    },
    saveBootSettings({ commit, dispatch }, { bootSource, overrideEnabled }) {
      const data = { Boot: {} };
      data.Boot.BootSourceOverrideTarget = bootSource;
      // If overrideEnabled is true, set value to 'Once'
      // If overrideEnabled is false, set value to 'Continuous'
      data.Boot.BootSourceOverrideEnabled = overrideEnabled
        ? 'Once'
        : 'Continuous';

      return api
        .patch('/redfish/v1/Systems/system', data)
        .then(response => {
          // If request success, commit the values
          commit('setBootSource', data.Boot.BootSourceOverrideTarget);
          commit('setOverrideEnabled', data.Boot.BootSourceOverrideEnabled);
          return response;
        })
        .catch(error => {
          console.log(error);
          // If request error, GET saved options
          dispatch('getBootOptions');
          return error;
        });
    },
    getTpmPolicy({ commit }) {
      // TODO: switch to Redfish when available
      api
        .get('/xyz/openbmc_project/control/host0/TPMEnable')
        .then(({ data: { data: { TPMEnable } } }) =>
          commit('setTpmPolicy', TPMEnable)
        )
        .catch(error => console.log(error));
    },
    saveTpmPolicy({ commit, dispatch }, tpmEnabled) {
      // TODO: switch to Redfish when available
      const data = { data: tpmEnabled };
      return api
        .put(
          '/xyz/openbmc_project/control/host0/TPMEnable/attr/TPMEnable',
          data
        )
        .then(response => {
          // If request success, commit the values
          commit('setTpmPolicy', tpmEnabled);
          return response;
        })
        .catch(error => {
          console.log(error);
          // If request error, GET saved policy
          dispatch('getTpmPolicy');
          return error;
        });
    },
    async saveSettings(
      { dispatch },
      { bootSource, overrideEnabled, tpmEnabled }
    ) {
      const promises = [];

      if (bootSource !== null || overrideEnabled !== null) {
        promises.push(
          dispatch('saveBootSettings', { bootSource, overrideEnabled })
        );
      }
      if (tpmEnabled !== null) {
        promises.push(dispatch('saveTpmPolicy', tpmEnabled));
      }

      return await api.all(promises).then(
        api.spread((...responses) => {
          let message = i18n.t(
            'pageServerPowerOperations.toast.successSaveSettings'
          );
          responses.forEach(response => {
            if (response instanceof Error) {
              throw new Error(
                i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
              );
            }
          });
          return message;
        })
      );
    }
  }
};

export default BootSettingsStore;
