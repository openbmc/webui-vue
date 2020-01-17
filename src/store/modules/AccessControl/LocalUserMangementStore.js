import Axios from "axios";

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
      let base;
      let username;
      let password;
      if (base && username && password) {
        Axios.defaults.baseURL = base;
        Axios.defaults.auth = {};
        Axios.defaults.auth.username = username;
        Axios.defaults.auth.password = password;
        Axios.get("redfish/v1/AccountService/Accounts")
          .then(response => {
            return response.data.Members.map(user => user["@odata.id"]);
          })
          .then(userIds => {
            return Axios.all(userIds.map(user => Axios.get(user)));
          })
          .then(users => {
            const userData = users.map(user => user.data);
            commit("setUsers", userData);
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        // Faking async call with timeout
        setTimeout(() => {
          const users = [
            { UserName: "root", RoleId: "Admin", Locked: false, Enabled: true },
            { UserName: "user1", RoleId: "user", Locked: false, Enabled: false }
          ];
          commit("setUsers", users);
        }, 3000);
      }
    }
  }
};

export default LocalUserManagementStore;
