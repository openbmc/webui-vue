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
      state.powerSupplies = (data || []).map((powerSupply) => {
        const {
          EfficiencyRatings = [],
          FirmwareVersion,
          LocationIndicatorActive,
          Id,
          Manufacturer,
          Model,
          Name,
          PartNumber,
          PowerInputWatts,
          SerialNumber,
          SparePartNumber,
          Location,
          Status = {},
        } = powerSupply;
        return {
          id: Id,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          efficiencyPercent: EfficiencyRatings?.[0]?.EfficiencyPercent,
          firmwareVersion: FirmwareVersion,
          identifyLed: LocationIndicatorActive,
          manufacturer: Manufacturer,
          model: Model,
          powerInputWatts: PowerInputWatts,
          name: Name,
          sparePartNumber: SparePartNumber,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getChassisCollection() {
      try {
        const { data } = await api.get('/redfish/v1/Chassis');
        const members = data?.Members || [];
        return members.map((m) => m?.['@odata.id']).filter(Boolean);
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async getAllPowerSupplies({ dispatch, commit }) {
      const collection = await dispatch('getChassisCollection');
      if (!Array.isArray(collection) || collection.length === 0) {
        commit('setPowerSupply', []);
        return;
      }
      try {
        const supplies = await api.all(
          collection.map((chassis) => dispatch('getChassisPower', chassis)),
        );
        const suppliesList = (supplies || []).flat().filter(Boolean);
        commit('setPowerSupply', suppliesList);
      } catch (error) {
        console.log(error);
        commit('setPowerSupply', []);
      }
    },
    async getChassisPower(_, id) {
      try {
        const { data: powerSubsystem } = await api.get(`${id}/PowerSubsystem`);
        const suppliesPath = powerSubsystem?.PowerSupplies?.['@odata.id'];
        if (!suppliesPath) return [];
        const { data: suppliesCollection } = await api.get(suppliesPath);
        const members = suppliesCollection?.Members || [];
        if (!Array.isArray(members) || members.length === 0) return [];
        const supplies = await api.all(
          members
            .map((m) => m?.['@odata.id'])
            .filter(Boolean)
            .map((m) => api.get(m).then((r) => r.data)),
        );
        return supplies;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  },
};

export default PowerSupplyStore;
