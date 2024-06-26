import api from '@/store/api';
import i18n from '@/i18n';

const BootSettingsStore = {
  namespaced: true,
  state: {
    bootSourceOptions: [],
    bootSource: null,
    overrideEnabled: null,
    tpmEnabled: null,
    bootOptions: [],
  },
  getters: {
    bootSourceOptions: (state) => state.bootSourceOptions,
    bootSource: (state) => state.bootSource,
    overrideEnabled: (state) => state.overrideEnabled,
    tpmEnabled: (state) => state.tpmEnabled,
    bootOptions: (state) => state.bootOptions,
  },
  mutations: {
    setBootSourceOptions: (state, bootSourceOptions) =>
      (state.bootSourceOptions = bootSourceOptions),
    setBootSource: (state, bootSource) => (state.bootSource = bootSource),
    setOverrideEnabled: (state, overrideEnabled) => {
      if (overrideEnabled === 'Once') {
        state.overrideEnabled = true;
      } else {
        // 'Continuous' or 'Disabled'
        state.overrideEnabled = false;
      }
    },
    setTpmPolicy: (state, tpmEnabled) => (state.tpmEnabled = tpmEnabled),
    setBootOptions: (state, bootOptions) => (state.bootOptions = bootOptions),
  },
  actions: {
    async getBootSettings({ commit }) {
      return await api
        .get(`${await this.dispatch('global/getSystemPath')}`)
        .then(({ data: { Boot } }) => {
          commit(
            'setBootSourceOptions',
            Boot['BootSourceOverrideTarget@Redfish.AllowableValues'],
          );
          commit('setOverrideEnabled', Boot.BootSourceOverrideEnabled);
          commit('setBootSource', Boot.BootSourceOverrideTarget);
          return api.get(Boot.BootOptions['@odata.id']);
        })
        .then(async (response) => {
          const promises = response.data.Members.map((bootOption) => {
            return api.get(bootOption['@odata.id']).catch((error) => {
              console.log(error);
              return error;
            });
          });
          await api.all(promises).then((responses) => {
            const bootOptions = [];
            responses.forEach((response) => {
              if (response.data) {
                bootOptions.push({
                  bootOptionEnabled: response.data.BootOptionEnabled,
                  bootOptionReference: response.data.BootOptionReference,
                  description: response.data.Description,
                  displayName: response.data.DisplayName,
                  id: response.data.Id,
                  name: response.data.Name,
                  uefiDevicePath: response.data.UefiDevicePath,
                });
              }
            });
            commit('setBootOptions', bootOptions);
          });
        })
        .catch((error) => console.log(error));
    },
    async saveBootSettings(
      { commit, dispatch, getters },
      { bootSource, overrideEnabled, bootOption },
    ) {
      const data = { Boot: {} };
      data.Boot.BootSourceOverrideTarget = bootSource;

      if (overrideEnabled) {
        data.Boot.BootSourceOverrideEnabled = 'Once';
      } else if (bootSource === 'None') {
        data.Boot.BootSourceOverrideEnabled = 'Disabled';
      } else {
        data.Boot.BootSourceOverrideEnabled = 'Continuous';
      }
      if (bootSource === 'UefiTarget') {
        data.Boot.UefiTargetBootSourceOverride = getters['bootOptions'].find(
          (obj) => obj.id === bootOption,
        ).uefiDevicePath;
      } else if (bootSource === 'UefiBootNext') {
        data.Boot.BootNext = bootOption;
      }

      return api
        .patch(`${await this.dispatch('global/getSystemPath')}`, data)
        .then((response) => {
          // If request success, commit the values
          commit('setBootSource', data.Boot.BootSourceOverrideTarget);
          commit('setOverrideEnabled', data.Boot.BootSourceOverrideEnabled);
          return response;
        })
        .catch((error) => {
          console.log(error);
          // If request error, GET saved options
          dispatch('getBootSettings');
          return error;
        });
    },
    async getTpmPolicy({ commit }) {
      // TODO: switch to Redfish when available
      return await api
        .get('/xyz/openbmc_project/control/host0/TPMEnable')
        .then(
          ({
            data: {
              data: { TPMEnable },
            },
          }) => commit('setTpmPolicy', TPMEnable),
        )
        .catch((error) => console.log(error));
    },
    saveTpmPolicy({ commit, dispatch }, tpmEnabled) {
      // TODO: switch to Redfish when available
      const data = { data: tpmEnabled };
      return api
        .put(
          '/xyz/openbmc_project/control/host0/TPMEnable/attr/TPMEnable',
          data,
        )
        .then((response) => {
          // If request success, commit the values
          commit('setTpmPolicy', tpmEnabled);
          return response;
        })
        .catch((error) => {
          console.log(error);
          // If request error, GET saved policy
          dispatch('getTpmPolicy');
          return error;
        });
    },
    async saveSettings(
      { dispatch },
      { bootSource, overrideEnabled, tpmEnabled, bootOption },
    ) {
      const promises = [];

      if (bootSource !== null || overrideEnabled !== null) {
        promises.push(
          dispatch('saveBootSettings', {
            bootSource,
            overrideEnabled,
            bootOption,
          }),
        );
      }
      if (tpmEnabled !== null) {
        promises.push(dispatch('saveTpmPolicy', tpmEnabled));
      }

      return await api.all(promises).then(
        api.spread((...responses) => {
          let message = i18n.t(
            'pageServerPowerOperations.toast.successSaveSettings',
          );
          responses.forEach((response) => {
            if (response instanceof Error) {
              throw new Error(
                i18n.t('pageServerPowerOperations.toast.errorSaveSettings'),
              );
            }
          });
          return message;
        }),
      );
    },
  },
};

export default BootSettingsStore;
