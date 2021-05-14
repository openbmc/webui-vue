import api from '@/store/api';

const PowerSupplyStore = {
  namespaced: true,
  state: {
    powerSupplies: [],
  },
  getters: {
    powerSupplies: (state) => state.powerSupplies,
  },
  mutations: {
    setPowerSupply: (state, data) => {
      state.powerSupplies = data.map((powerSupply) => {
        const {
          // EfficiencyRatings = [],
          LocationIndicatorActive,
          MemberId,
          Manufacturer,
          Model,
          Name,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Status = {},
        } = powerSupply;
        return {
          id: MemberId,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          // efficiencyPercent: EfficiencyRatings[0].EfficiencyPercent,
          identifyLed: LocationIndicatorActive,
          manufacturer: Manufacturer,
          model: Model,
          hardwareType: Name,
          sparePartNumber: SparePartNumber,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getPowerSupply({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Power')
        .then(({ data: { PowerControl = [] } }) =>
          commit('setPowerSupply', PowerControl)
        )
        .catch((error) => console.log(error));
    },
  },
};

export default PowerSupplyStore;
