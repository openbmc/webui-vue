import api from '@/store/api';
import i18n from '@/i18n';

const FanStore = {
  namespaced: true,
  state: {
    fans: [],
  },
  getters: {
    fans: (state) => state.fans,
  },
  mutations: {
    setFanInfo: (state, data) => {
      state.fans = data.map((fan) => {
        const {
          LocationIndicatorActive,
          Location,
          Id,
          Name,
          SpeedPercent,
          Status = {},
          PartNumber,
          SerialNumber,
        } = fan;
        return {
          id: Id,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          healthRollup: Status.HealthRollup,
          identifyLed: LocationIndicatorActive,
          locationNumber: Location,
          name: Name,
          speedPercent: SpeedPercent.Reading,
          statusState: Status.State,
          uri: fan['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getFanInfo({ commit }) {
      return await api
        // TODO: update hardcoded endpoint
        .get('/redfish/v1/Chassis/chassis/ThermalSubsystem')
        .then(({ data: { Fans = [] } }) => commit('setFanInfo', Fans))
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api
        // TODO: Test when functionality is merged
        // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/42210
        .patch(uri, updatedIdentifyLedValue)
        .then(() => dispatch('getPowerSupply'))
        .then(() => {
          if (led.getFanInfo) {
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

export default FanStore;
