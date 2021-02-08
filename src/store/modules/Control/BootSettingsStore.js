import api from '@/store/api';
import i18n from '@/i18n';

const BootSettingsStore = {
  namespaced: true,
  state: {
    attributeKeys: {
      pvm_system_power_off_policy: '',
      pvm_default_os_type: '',
      pvm_stop_at_standby: '',
      pvm_rpa_boot_mode: '',
      pvm_system_operating_mode: '',
      pvm_os_ipl_type: '',
    },
    attributeValues: null,
    biosAttributes: null,
    bootSourceOptions: [],
    bootSource: null,
    overrideEnabled: null,
    tpmEnabled: null,
  },
  getters: {
    attributeValues: (state) => state.attributeValues,
    biosAttributes: (state) => state.biosAttributes,
    bootSourceOptions: (state) => state.bootSourceOptions,
    bootSource: (state) => state.bootSource,
    overrideEnabled: (state) => state.overrideEnabled,
    tpmEnabled: (state) => state.tpmEnabled,
  },
  mutations: {
    setAttributeValues: (state, attributeValues) =>
      (state.attributeValues = attributeValues),
    setBiosAttributes: (state, biosAttributes) =>
      (state.biosAttributes = biosAttributes),
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
  },
  actions: {
    async getBootSettings({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then(({ data: { Boot } }) => {
          commit(
            'setBootSourceOptions',
            Boot['BootSourceOverrideTarget@Redfish.AllowableValues']
          );
          commit('setOverrideEnabled', Boot.BootSourceOverrideEnabled);
          commit('setBootSource', Boot.BootSourceOverrideTarget);
        })
        .catch((error) => console.log(error));
    },
    saveBootSettings({ commit, dispatch }, { bootSource, overrideEnabled }) {
      const data = { Boot: {} };
      data.Boot.BootSourceOverrideTarget = bootSource;

      if (overrideEnabled) {
        data.Boot.BootSourceOverrideEnabled = 'Once';
      } else if (bootSource === 'None') {
        data.Boot.BootSourceOverrideEnabled = 'Disabled';
      } else {
        data.Boot.BootSourceOverrideEnabled = 'Continuous';
      }

      return api
        .patch('/redfish/v1/Systems/system', data)
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
        .then(({ data: { data: { TPMEnable } } }) =>
          commit('setTpmPolicy', TPMEnable)
        )
        .catch((error) => console.log(error));
    },
    saveTpmPolicy({ commit, dispatch }, tpmEnabled) {
      // TODO: switch to Redfish when available
      const data = { data: tpmEnabled };
      return api
        .put(
          '/xyz/openbmc_project/control/host0/TPMEnable/attr/TPMEnable',
          data
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
      { bootSource, overrideEnabled, tpmEnabled, biosSettings }
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

      if (biosSettings !== null) {
        promises.push(dispatch('saveBiosSettings', biosSettings));
      }

      return await api.all(promises).then(
        api.spread((...responses) => {
          let message = i18n.t(
            'pageServerPowerOperations.toast.successSaveSettings'
          );
          responses.forEach((response) => {
            if (response instanceof Error) {
              throw new Error(
                i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
              );
            }
          });
          return message;
        })
      );
    },
    async getBiosAttributes({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Bios')
        .then(({ data: { Attributes } }) => {
          const filteredAttribute = Object.keys(Attributes)
            .filter((key) =>
              Object.keys(this.state.hostBootSettings.attributeKeys).includes(
                key
              )
            )
            .reduce((obj, key) => {
              return {
                ...obj,
                [key]:
                  key === 'pvm_os_ipl_type'
                    ? i18n.t(
                        `pageServerPowerOperations.biosSettings.attributeValues.${Attributes[key]}`
                      )
                    : Attributes[key],
              };
            }, {});
          commit('setBiosAttributes', filteredAttribute);
        })
        .catch((error) => console.log(error));
    },
    async getAttributeValues({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(
          ({
            data: {
              RegistryEntries: { Attributes },
            },
          }) => {
            const filteredAttributeValues = Attributes.filter((value) =>
              Object.keys(this.state.hostBootSettings.attributeKeys).includes(
                value.AttributeName
              )
            ).reduce((obj, value) => {
              return {
                ...obj,
                [value.AttributeName]: value.Value.map((item) =>
                  value.AttributeName === 'pvm_os_ipl_type'
                    ? i18n.t(
                        `pageServerPowerOperations.biosSettings.attributeValues.${item.ValueName}`
                      )
                    : item.ValueName
                ),
              };
            }, {});
            commit('setAttributeValues', filteredAttributeValues);
          }
        )
        .catch((error) => console.log(error));
    },
    saveBiosSettings({ dispatch }, biosSettings) {
      return api
        .patch('/redfish/v1/Systems/system/Bios/Settings', {
          Attributes: biosSettings,
        })
        .then((response) => {
          dispatch('getBiosAttributes');
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    },
  },
};

export default BootSettingsStore;
