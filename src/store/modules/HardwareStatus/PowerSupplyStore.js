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
          EfficiencyPercent,
          FirmwareVersion,
          IndicatorLED,
          MemberId,
          Model,
          PartNumber,
          PowerInputWatts,
          SerialNumber,
          Status,
        } = powerSupply;
        return {
          id: MemberId,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          efficiencyPercent: EfficiencyPercent,
          firmwareVersion: FirmwareVersion,
          indicatorLed: IndicatorLED,
          model: Model,
          powerInputWatts: PowerInputWatts,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getAllPowerSupplies({ dispatch, commit }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      return await api
        .all(collection.map((chassis) => dispatch('getChassisPower', chassis)))
        .then((supplies) => {
          let suppliesList = [];
          supplies.forEach(
            (supply) => (suppliesList = [...suppliesList, ...supply])
          );
          commit('setPowerSupply', suppliesList);
        })
        .catch((error) => console.log(error));
    },
    async getChassisPower(_, id) {
      return await api
        .get(`${id}/Power`)
        .then(({ data: { PowerSupplies } }) => PowerSupplies || [])
        .catch((error) => console.log(error));
    },
  },
};

export default PowerSupplyStore;
