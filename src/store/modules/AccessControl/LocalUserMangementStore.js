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
        .then(response => response.data.Members.map(user => user["@odata.id"]))
        .then(userIds => api.all(userIds.map(user => api.get(user))))
        .then(users => {
          const userData = users.map(user => user.data);
          commit("setUsers", userData);
        })
        .catch(error => console.log(error));
    },
    createUser({ dispatch }, { username, password, privilege, status }) {
      const data = {
        UserName: username,
        Password: password,
        RoleId: privilege,
        Enabled: status
      };
      api
        .post("/redfish/v1/AccountService/Accounts", data)
        .then(() => dispatch("getUsers"))
        .catch(error => console.log(error));
    },
    updateUser(
      { dispatch },
      { originalUsername, username, password, privilege, status }
    ) {
      const data = {};
      if (username) data.UserName = username;
      if (password) data.Password = password;
      if (privilege) data.RoleId = privilege;
      if (status !== undefined) data.Enabled = status;
      api
        .patch(`/redfish/v1/AccountService/Accounts/${originalUsername}`, data)
        .then(() => dispatch("getUsers"))
        .catch(error => console.log(error));
    },
    deleteUser({ dispatch }, username) {
      api
        .delete(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(() => dispatch("getUsers"))
        .catch(error => console.log(error));
    }
  }
};

export default LocalUserManagementStore;
