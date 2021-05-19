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
          EfficiencyRatings,
          FirmwareVersion,
          LocationIndicatorActive,
          Id,
          Manufacturer,
          Model,
          Name,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Status = {},
        } = powerSupply;
        return {
          id: Id,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          efficiencyPercent: EfficiencyRatings[0].EfficiencyPercent,
          firmwareVersion: FirmwareVersion,
          identifyLed: LocationIndicatorActive,
          manufacturer: Manufacturer,
          model: Model,
          name: Name,
          sparePartNumber: SparePartNumber,
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
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getAllPowerSupplies({ dispatch }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      return await api
        .all(collection.map((chassis) => dispatch('getChassisPower', chassis)))
        .catch((error) => console.log(error));
    },
    async getChassisPower({ commit }, id) {
      return await api
        .get(`${id}/PowerSubsystem/PowerSupplies`)
        .then((response) =>
          response.data.Members.map((powerSupply) => powerSupply['@odata.id'])
        )
        .then((powerSupplyIds) =>
          api.all(powerSupplyIds.map((powerSupply) => api.get(powerSupply)))
        )
        .then((powerSupplies) => {
          const powerSuppliesData = powerSupplies.map(
            (powerSupplies) => powerSupplies.data
          );
          commit('setPowerSupply', powerSuppliesData);
        })
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue(_, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
        console.log(error);
        if (led.identifyLed) {
          throw new Error(
            i18n.t('pageHardwareStatus.toast.errorEnableIdentifyLed')
          );
        } else {
          throw new Error(
            i18n.t('pageHardwareStatus.toast.errorDisableIdentifyLed')
          );
        }
      });
    },
  },
};

export default PowerSupplyStore;
