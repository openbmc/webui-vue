import api from '@/store/api';

const ClientSessionsStore = {
  namespaced: true,
  state: {
    allConnections: [],
  },
  getters: {
    allConnections: (state) => state.allConnections,
  },
  mutations: {
    setAllConnections: (state, allConnections) => (
      (state.allConnections = allConnections), (state.loadedEvents = true)
    ),
  },
  actions: {
    async getClinetSessionsData() {
      return await api
        .get('/redfish/v1/SessionService/Sessions')
        .then((response) => console.log('response', response));
    },
  },
};

export default ClientSessionsStore;
