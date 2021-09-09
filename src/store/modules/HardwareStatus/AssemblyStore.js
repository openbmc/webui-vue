import api from '@/store/api';
import i18n from '@/i18n';

const AssemblyStore = {
  namespaced: true,
  state: {
    assemblies: null,
  },
  getters: {
    assemblies: (state) => state.assemblies,
  },
  mutations: {
    setAssemblyInfo: (state, data) => {
      state.assemblies = data.map((assembly) => {
        const {
          MemberId,
          Status,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Model,
          Name,
          Location,
          LocationIndicatorActive,
        } = assembly;
        return {
          id: MemberId,
          health: Status?.Health,
          statusState: Status?.State,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          sparePartNumber: SparePartNumber,
          model: Model,
          name: Name,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          identifyLed: LocationIndicatorActive,
          uri: assembly['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getAssemblyInfo({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Assembly')
        .then(({ data }) => commit('setAssemblyInfo', data?.Assemblies))
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
        dispatch('getAssemblyInfo');
        console.log('error', error);
        if (led.identifyLed) {
          throw new Error(i18n.t('pageInventory.toast.errorEnableIdentifyLed'));
        } else {
          throw new Error(
            i18n.t('pageInventory.toast.errorDisableIdentifyLed')
          );
        }
      });
    },
  },
};

export default AssemblyStore;
