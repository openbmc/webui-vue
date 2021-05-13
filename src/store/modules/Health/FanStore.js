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
          LocationNumber,
          MemberId,
          Name,
          Reading,
          ReadingUnits,
          Status = {},
        } = fan;
        return {
          id: MemberId,
          health: Status.Health,
          healthRollup: Status.HealthRollup,
          identifyLed: IndicatorLED,
          locationNumber: LocationNumber,
          name: Name,
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
