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
    async getPowerSupply({ commit }) {
      return await api
        // Todo: update hardcoded endpoint after https://gerrit.openbmc-project.xyz/c/openbmc/webui-vue/+/42988
        .get('/redfish/v1/Chassis/chassis/PowerSubsystem')
        .then(({ data: { PowerSupplies } }) =>
          commit('setPowerSupply', PowerSupplies)
        )
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api
        // TODO: Test when functionality is merged https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/42221
        .patch(uri, updatedIdentifyLedValue)
        .then(() => dispatch('getPowerSupply'))
        .then(() => {
          if (led.identifyLed) {
            return i18n.t('pageHardwareStatus.toast.successEnableIdentifyLed');
          } else {
            return i18n.t('pageHardwareStatus.toast.successDisableIdentifyLed');
          }
        })
        .catch((error) => {
          console.log(error);
          console.log('error', led.identifyLed);
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
