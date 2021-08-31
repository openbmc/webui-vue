import api from '@/store/api';
import i18n from '@/i18n';

const ChassisStore = {
  namespaced: true,
  state: {
    chassis: [],
  },
  getters: {
    chassis: (state) => state.chassis,
  },
  mutations: {
    setChassisInfo: (state, data) => {
      console.log(data[0]['Location']['PartLocation']['ServiceLabel']);
      state.chassis = data.map((chassis) => {
        const {
          Id,
          Status = {},
          PartNumber,
          SerialNumber,
          ChassisType,
          Manufacturer,
          PowerState,
          LocationIndicatorActive,
          AssetTag,
          MaxPowerWatts,
          MinPowerWatts,
          Name,
        } = chassis;

        return {
          id: Id,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          chassisType: ChassisType,
          manufacturer: Manufacturer,
          powerState: PowerState,
          statusState: Status.State,
          healthRollup: Status.HealthRollup,
          assetTag: AssetTag,
          maxPowerWatts: MaxPowerWatts,
          minPowerWatts: MinPowerWatts,
          name: Name,
          identifyLed: LocationIndicatorActive,
          uri: chassis['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getChassisInfo({ commit }) {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => api.get(member['@odata.id']))
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setChassisInfo', data);
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
        .then(() => dispatch('getChassisInfo'))
        .catch((error) => {
          dispatch('getChassisInfo');
          console.log('error', error);
          if (led.identifyLed) {
            throw new Error(
              i18n.t('pageInventory.toast.errorEnableIdentifyLed')
            );
          } else {
            throw new Error(
              i18n.t('pageInventory.toast.errorDisableIdentifyLed')
            );
          }
        });
    },
  },
};

export default ChassisStore;
