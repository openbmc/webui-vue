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
          Id,
          Name,
          PartNumber,
          SerialNumber,
          SpeedPercent = {},
          Status = {},
        } = fan;
        return {
          id: Id,
          health: Status.Health,
          name: Name,
          speed: SpeedPercent.Reading,
          statusState: Status.State,
          healthRollup: Status.HealthRollup,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
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
        .get(chassis.ThermalSubsystem['@odata.id'])
        .then((response) => {
          return api.get(`${response.data.Fans['@odata.id']}`);
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
  },
};

export default FanStore;
