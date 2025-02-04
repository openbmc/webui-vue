import api from '@/store/api';

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
        const { PCIeType, Status, Lanes, Location, SlotType } = slot;
        return {
          type: SlotType,
          pcieType: PCIeType,
          lanes: Lanes,
          statusState: Status?.State ? Status.State : '',
          locationNumber: Location?.PartLocation?.ServiceLabel,
        };
      });
    },
  },
  actions: {
    async getChassisInfo() {
      return await api.get(`/redfish/v1/Chassis`).then(({ data }) => {
        return data?.Members;
      });
    },
    async getPcieSlotsInfo({ dispatch, commit }) {
      commit('setPcieSlotsInfo', []);
      let tempPcieSlots = [];
      const chassisInfo = await dispatch('getChassisInfo');
      await api.all(
        chassisInfo.map(async (singleChassis) => {
          return await api
            .get(`${singleChassis['@odata.id']}/PCIeSlots`)
            .then(({ data }) => {
              tempPcieSlots.push(...data.Slots);
            })
            .catch((error) => console.log(error));
        }),
      );
      commit('setPcieSlotsInfo', tempPcieSlots);
    },
  },
};

export default PcieSlotsStore;
