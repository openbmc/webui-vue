import api from '@/store/api';
import i18n from '@/i18n';

const PcieSlotsStore = {
  namespaced: true,
  state: {
    pcieSlots: [],
  },
  getters: {
    pcieSlots: (state) => state.pcieSlots,
  },
  mutations: {
    setPcieSlotsInfo: (state, data) => {
      state.pcieSlots = data.map((slot) => {
        const { LocationIndicatorActive, Location, SlotType } = slot;
        return {
          type: SlotType,
          identifyLed: LocationIndicatorActive,
          locationNumber: Location?.PartLocation?.ServiceLabel,
        };
      });
    },
  },
  actions: {
    async getPcieSlotsInfo({ commit }) {
      commit('setPcieSlotsInfo', []);
      return await api
        .get(`/redfish/v1/Chassis/chassis/PCIeSlots`)
        .then(({ data }) => {
          commit('setPcieSlotsInfo', data.Slots);
        })
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch, state }, led) {
      const tempPcieSlots = [];
      state.pcieSlots.map((slot) => {
        if (slot.locationNumber === led.locationNumber) {
          tempPcieSlots.push({ LocationIndicatorActive: led.identifyLed });
        } else {
          tempPcieSlots.push({});
        }
      });
      const updatedIdentifyLedValue = {
        Slots: tempPcieSlots,
      };
      return await api
        .patch(`/redfish/v1/Chassis/chassis/PCIeSlots`, updatedIdentifyLedValue)
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
          dispatch('getPcieSlotsInfo', { uri: led.uri });
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

export default PcieSlotsStore;
