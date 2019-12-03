import api from "../../api";

const LocalUserManagementStore = {
  namespaced: true,
  state: {
    allUsers: []
  },
  getters: {
    allUsers(state) {
      return state.allUsers;
    }
  },
  mutations: {
    setUsers(state, allUsers) {
      state.allUsers = allUsers;
    }
  },
  actions: {
    getUsers({ commit }) {
      api
        .get("/redfish/v1/AccountService/Accounts")
        .then(response => {
          return response.data.Members.map(user => user["@odata.id"]);
        })
        .then(userIds => {
          return api.all(userIds.map(user => api.get(user)));
        })
        .then(users => {
          const userData = users.map(user => user.data);
          commit("setUsers", userData);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};

export default LocalUserManagementStore;
