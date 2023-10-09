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
        const PowerSubsystem =
          process.env.VUE_APP_POWERSUPPLY_DATA_FROM_POWER_SUBSYSTEM === 'true'
            ? true
            : false;
        if (PowerSubsystem) {
          const {
            Id,
            Manufacturer,
            Model,
            Name,
            PartNumber,
            SerialNumber,
            Status = {},
            EfficiencyRatings = [],
          } = powerSupply;
          return {
            id: Id,
            health: Status.Health,
            partNumber: PartNumber,
            serialNumber: SerialNumber,
            efficiencyPercent: EfficiencyRatings[0].EfficiencyPercent,
            manufacturer: Manufacturer,
            model: Model,
            name: Name,
            statusState: Status.State,
          };
        } else {
          const {
            EfficiencyPercent,
            FirmwareVersion,
            LocationIndicatorActive,
            MemberId,
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
            id: MemberId,
            health: Status.Health,
            partNumber: PartNumber,
            serialNumber: SerialNumber,
            efficiencyPercent: EfficiencyPercent,
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
        }
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
      const PowerSubsystem =
        process.env.VUE_APP_POWERSUPPLY_DATA_FROM_POWER_SUBSYSTEM === 'true'
          ? true
          : false;
      if (PowerSubsystem) {
        return await api
          .get(`${id}/PowerSubsystem`)
          .then((response) => {
            return api.get(`${response.data.PowerSupplies['@odata.id']}`);
          })
          .then(({ data: { Members } }) => {
            const promises = Members.map((member) =>
              api.get(member['@odata.id'])
            );
            return api.all(promises);
          })
          .then((response) => {
            const data = response.map(({ data }) => data);
            return data;
          })
          .catch((error) => console.log(error));
      } else {
        return await api
          .get(`${id}/Power`)
          .then(({ data: { PowerSupplies } }) => PowerSupplies || [])
          .catch((error) => console.log(error));
      }
    },
  },
};

export default PowerSupplyStore;
