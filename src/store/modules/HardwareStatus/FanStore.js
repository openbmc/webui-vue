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
          name: Name,
          speed: Reading + ' ' + ReadingUnits,
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
          api.all(
            Members.map((member) =>
              api.get(member['@odata.id']).then((response) => response.data)
            )
          )
        )
        .catch((error) => console.log(error));
    },
    async getFanInfo({ dispatch, commit }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection || collection.length === 0) return;
      return await api
        .all(collection.map((chassis) => dispatch('getChassisFans', chassis)))
        .then((fansFromChassis) => commit('setFanInfo', fansFromChassis.flat()))
        .catch((error) => console.log(error));
    },
    async getChassisFans(_, chassis) {
      return await api
        .get(chassis.Thermal['@odata.id'])
        .then(({ data: { Fans } }) => Fans || [])
        .catch((error) => console.log(error));
    },
  },
};

export default FanStore;
