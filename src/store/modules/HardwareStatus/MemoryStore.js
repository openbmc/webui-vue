import api from '@/store/api';
import i18n from '@/i18n';

const MemoryStore = {
  namespaced: true,
  state: {
    dimms: [],
  },
  getters: {
    dimms: (state) => state.dimms,
  },
  mutations: {
    setMemoryInfo: (state, data) => {
      state.dimms = data.map(({ data }) => {
        const {
          Id,
          Status = {},
          BaseModuleType,
          BusWidthBits,
          CapacityMiB,
          DataWidthBits,
          Enabled,
          OperatingSpeedMhz,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Description,
          MemoryType,
          MemorySize,
          LocationIndicatorActive,
          Location,
        } = data;
        return {
          id: Id,
          health: Status.Health,
          baseModuleType: BaseModuleType,
          busWidthBits: BusWidthBits,
          capacityMiB: CapacityMiB,
          dataWidthBits: DataWidthBits,
          operatingSpeedMhz: OperatingSpeedMhz,
          enabled: Enabled,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          statusState: Status.State,
          sparePartNumber: SparePartNumber,
          description: Description,
          memoryType: MemoryType,
          memorySize: MemorySize,
          identifyLed: LocationIndicatorActive,
          uri: data['@odata.id'],
          locationNumber: Location?.PartLocation?.ServiceLabel,
        };
      });
    },
  },
  actions: {
    async getDimms({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Memory')
        .then(({ data: { Members } }) => {
          const promises = Members.map((item) => api.get(item['@odata.id']));
          return api.all(promises);
        })
        .then((response) => commit('setMemoryInfo', response))
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
        dispatch('getDimms');
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

export default MemoryStore;
