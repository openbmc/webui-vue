import api from '@/store/api';
import i18n from '@/i18n';

const BootSettingsStore = {
  namespaced: true,
  state: {
    attributeKeys: {
      pvm_system_power_off_policy: '',
      pvm_default_os_type: '',
      pvm_power_on_st: '',
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
        .get('/redfish/v1/Systems/system/')
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
        .then(() => {
          let attri = {
            pvm_system_power_off_policy: 'Automatic',
            pvm_default_os_type: 'AIX',
            pvm_power_on_st: 'AutoStart',
            pvm_rpa_boot_mode: 'SavedList',
            pvm_system_operating_mode: 'Normal',
            pvm_fw_boot_side: 'A (Boot from disk using copy A)',
          };
          const filteredAttribute = Object.keys(attri)
            .filter((key) =>
              Object.keys(this.state.hostBootSettings.attributeKeys).includes(
                key
              )
            )
            .reduce((obj, key) => {
              return {
                ...obj,
                [key]: attri[key],
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
        .then(() => {
          let attri = [
            {
              AttributeName: 'pvm_default_os_type',
              Value: [
                {
                  OneOf: 'AIX',
                },
                {
                  OneOf: 'Linux',
                },
                {
                  OneOf: 'IBM I',
                },
              ],
            },
            {
              AttributeName: 'pvm_power_on_st',
              Value: [
                {
                  OneOf: 'AutoStart',
                },
                {
                  OneOf: 'User-Initiated',
                },
                {
                  OneOf: 'Auto-Recovery',
                },
              ],
            },
            {
              AttributeName: 'pvm_rpa_boot_mode',
              Value: [
                {
                  OneOf: 'Normal',
                },
                {
                  OneOf: 'SavedList',
                },
                {
                  OneOf: 'SmsMenu',
                },
                {
                  OneOf: 'OkPrompt',
                },
                {
                  OneOf: 'DefaultList',
                },
              ],
            },
            {
              AttributeName: 'pvm_system_operating_mode',
              Value: [
                {
                  OneOf: 'OsDefault',
                },
                {
                  OneOf: 'Normal',
                },
                {
                  OneOf: 'Manual',
                },
              ],
            },
            {
              AttributeName: 'pvm_os_ipl_type',
              Value: [
                {
                  OneOf: 'A (Boot from disk using copy A)',
                },
                {
                  OneOf: 'B (Boot from disk using copy B)',
                },
                {
                  OneOf: 'C (Boot from disk using copy C)',
                },
                {
                  OneOf: 'D (Boot from disk using copy D)',
                },
              ],
            },
            {
              AttributeName: 'pvm_system_power_off_policy',
              Value: [
                {
                  OneOf: 'Power Off',
                },
                {
                  OneOf: 'Stay On',
                },
                {
                  OneOf: 'Automatic',
                },
              ],
            },
          ];
          const filteredAttributeValues = attri
            .filter((value) =>
              Object.keys(this.state.hostBootSettings.attributeKeys).includes(
                value.AttributeName
              )
            )
            .reduce((obj, value) => {
              return {
                ...obj,
                [value.AttributeName]: [
                  ...new Set(value.Value.map((item) => item.OneOf)),
                ],
              };
            }, {});
          commit('setAttributeValues', filteredAttributeValues);
        })
        .catch((error) => console.log(error));
    },
    saveBiosSettings(_, biosSettings) {
      return api
        .patch('/redfish/v1/Systems/system/Bios/Settings', {
          Attributes: biosSettings,
        })
        .then((response) => {
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
