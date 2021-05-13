import api from '@/store/api';

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
          IndicatorLED,
          Location,
          MemberId,
          Name,
          Reading,
          ReadingUnits,
          Status = {},
          PartNumber,
          SerialNumber,
        } = fan;
        return {
          id: MemberId,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          healthRollup: Status.HealthRollup,
          identifyLed: IndicatorLED,
          locationNumber: Location,
          hardwareType: Name,
          speed: Reading + ' ' + ReadingUnits,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getFanInfo({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Thermal')
        .then(({ data: { Fans = [] } }) => commit('setFanInfo', Fans))
        .catch((error) => console.log(error));
    },
  },
};

export default FanStore;
