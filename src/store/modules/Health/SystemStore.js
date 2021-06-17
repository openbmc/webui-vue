import api from '@/store/api';
import i18n from '@/i18n';

const SystemStore = {
  namespaced: true,
  state: {
    systems: [],
  },
  getters: {
    systems: (state) => state.systems,
  },
  mutations: {
    setSystemInfo: (state, data) => {
      const system = {};
      system.assetTag = data.AssetTag;
      system.description = data.Description;
      system.firmwareVersion = data.BiosVersion;
      system.health = data.Status.Health;
      system.id = data.Id;
      system.lampTest = data.Oem?.IBM?.LampTest;
      system.locationIndicatorActive = data.LocationIndicatorActive;
      system.manufacturer = data.Manufacturer;
      system.model = data.Model;
      system.partNumber = data.PartNumber;
      system.powerState = data.PowerState;
      system.serialNumber = data.SerialNumber;
      system.healthRollup = data.Status.HealthRollup;
      system.statusState = data.Status.State;
      system.systemType = data.SystemType;
      state.systems = [system];
    },
  },
  actions: {
    async getSystem({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then(({ data }) => commit('setSystemInfo', data))
        .catch((error) => console.log(error));
    },
    changeLampTestState({ dispatch }, lampTestState) {
      api
        .patch('/redfish/v1/Systems/system', {
          Oem: {
            IBM: {
              LampTest: lampTestState,
            },
          },
        })
        .then(() => dispatch('getSystem'))
        .catch((error) => {
          dispatch('getSystem');
          console.log('error', error);
          if (lampTestState) {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOnLampTest')
            );
          } else {
            throw new Error(
              i18n.t('pageHardwareStatus.toast.errorTurnOffLampTest')
            );
          }
        });
    },
  },
};

export default SystemStore;
