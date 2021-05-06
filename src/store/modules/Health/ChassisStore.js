import api from '@/store/api';

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
          locationIndicatorActive: LocationIndicatorActive,
          statusState: Status.State,
          healthRollup: Status.HealthRollup,
          assetTag: AssetTag,
          maxPowerWatts: MaxPowerWatts,
          minPowerWatts: MinPowerWatts,
          name: Name,
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
    saveIdentifyLedState(_, state) {
      console.log('param is now', state);
      api.patch(`/redfish/v1/Chassis/${state[0]}`, {
        LocationIndicatorActive: state[1],
      });
    },
  },
};

export default ChassisStore;
