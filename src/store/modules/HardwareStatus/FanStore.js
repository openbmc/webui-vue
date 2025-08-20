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
      try {
        const thermalPath = chassis?.ThermalSubsystem?.['@odata.id'];
        if (!thermalPath) return [];

        const thermal = await api.get(thermalPath).then((r) => r.data);
        const fansPath = thermal?.Fans?.['@odata.id'];
        if (!fansPath) return [];

        const { data: fansCollection } = await api.get(fansPath);
        const members = fansCollection?.Members || [];
        if (!Array.isArray(members) || members.length === 0) return [];

        const fanDetails = await api.all(
          members
            .map((m) => m?.['@odata.id'])
            .filter(Boolean)
            .map((id) => api.get(id).then((r) => r.data)),
        );
        return fanDetails;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  },
};

export default FanStore;
