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
      state.assemblies = (data || []).map((assembly) => {
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
      try {
        const { data } = await api.get('/redfish/v1/Chassis');
        const chassisMembers = data?.Members || [];
        if (!Array.isArray(chassisMembers) || chassisMembers.length === 0) {
          commit('setAssemblyInfo', []);
          return;
        }
        const chassisDetails = await api.all(
          chassisMembers
            .map((m) => m?.['@odata.id'])
            .filter(Boolean)
            .map((id) => api.get(id).then((r) => r.data)),
        );
        const assemblyCollections = await api.all(
          chassisDetails
            .map((c) => c?.Assembly?.['@odata.id'])
            .filter(Boolean)
            .map((path) => api.get(path).then((r) => r.data)),
        );
        const assemblies = await api.all(
          assemblyCollections
            .flatMap((col) => col?.Assemblies || [])
            .map((m) => m?.['@odata.id'])
            .filter(Boolean)
            .map((id) => api.get(id).then((r) => r.data)),
        );
        commit('setAssemblyInfo', assemblies);
      } catch (error) {
        console.log(error);
        commit('setAssemblyInfo', []);
      }
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        Assemblies: [
          {
            MemberId: led.memberId,
            LocationIndicatorActive: led.identifyLed,
          },
        ],
      };

      return await api
        .patch(uri, updatedIdentifyLedValue)
        .then(() => {
          if (led.identifyLed) {
            return i18n.global.t(
              'pageInventory.toast.successEnableIdentifyLed',
            );
          } else {
            return i18n.global.t(
              'pageInventory.toast.successDisableIdentifyLed',
            );
          }
        })
        .catch((error) => {
          dispatch('getAssemblyInfo');
          console.log('error', error);
          if (led.identifyLed) {
            throw new Error(
              i18n.global.t('pageInventory.toast.errorEnableIdentifyLed'),
            );
          } else {
            throw new Error(
              i18n.global.t('pageInventory.toast.errorDisableIdentifyLed'),
            );
          }
        });
    },
  },
};

export default AssemblyStore;
