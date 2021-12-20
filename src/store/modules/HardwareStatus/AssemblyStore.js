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
    async updateAssemblies(_, led) {
      let patchedAssembly = {
        Assemblies: [],
      };
      await api
        .get('/redfish/v1/Chassis/chassis/Assembly')
        .then(({ data }) => {
          data.Assemblies.forEach((assembly) => {
            if (assembly['@odata.id'] === led.uri) {
              patchedAssembly.Assemblies.push({
                LocationIndicatorActive: led.identifyLed,
                MemberId: assembly.MemberId,
              });
            }
          });
        })
        .catch((error) => {
          console.log('error', error);
          return;
        });
      return patchedAssembly;
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const patchedAssembly = await dispatch('updateAssemblies', led);

      return await api.patch(uri, patchedAssembly).catch((error) => {
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
