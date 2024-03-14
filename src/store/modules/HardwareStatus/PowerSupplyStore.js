import api from '@/store/api';
import i18n from '@/i18n';

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
          uri: powerSupply['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          api.all(
            Members.map((member) =>
              api.get(member['@odata.id']).then((response) => response.data),
            ),
          ),
        )
        .catch((error) => console.log(error));
    },
    async getAllPowerSupplies({ dispatch, commit }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection || collection.length === 0) return;
      return await api
        .all(collection.map((chassis) => dispatch('getChassisPower', chassis)))
        .then((supplies) => {
          let suppliesList = [];
          supplies.forEach(
            (supply) => (suppliesList = [...suppliesList, ...supply]),
          );
          commit('setPowerSupply', suppliesList);
        })
        .catch((error) => console.log(error));
    },
    async getChassisPower(_, chassis) {
      return await api
        .get(chassis.PowerSubsystem['@odata.id'])
        .then((response) => {
          return api.get(`${response.data.PowerSupplies['@odata.id']}`);
        })
        .then(({ data: { Members } }) => {
          const promises = Members.map((member) =>
            api.get(member['@odata.id']),
          );
          return api.all(promises);
        })
        .then((response) => {
          const data = response.map(({ data }) => data);
          return data;
        })
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api
        .patch(uri, updatedIdentifyLedValue)
        .then(() => dispatch('getAllPowerSupplies'))
        .catch((error) => {
          dispatch('getAllPowerSupplies');
          console.log('error', error);
          if (led.identifyLed) {
            throw new Error(
              i18n.t('pageInventory.toast.errorEnableIdentifyLed'),
            );
          } else {
            throw new Error(
              i18n.t('pageInventory.toast.errorDisableIdentifyLed'),
            );
          }
        });
    },
  },
};

export default PowerSupplyStore;
