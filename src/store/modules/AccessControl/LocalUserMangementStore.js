import api from '../../api';

const LocalUserManagementStore = {
  namespaced: true,
  state: {
    allUsers: [],
    accountLockoutDuration: null,
    accountLockoutThreshold: null,
    accountMinPasswordLength: null,
    accountMaxPasswordLength: null
  },
  getters: {
    allUsers(state) {
      return state.allUsers;
    },
    accountSettings(state) {
      return {
        lockoutDuration: state.accountLockoutDuration,
        lockoutThreshold: state.accountLockoutThreshold
      };
    },
    accountPasswordRequirements(state) {
      return {
        minLength: state.accountMinPasswordLength,
        maxLength: state.accountMaxPasswordLength
      };
    }
  },
  mutations: {
    setUsers(state, allUsers) {
      state.allUsers = allUsers;
    },
    setLockoutDuration(state, lockoutDuration) {
      state.accountLockoutDuration = lockoutDuration;
    },
    setLockoutThreshold(state, lockoutThreshold) {
      state.accountLockoutThreshold = lockoutThreshold;
    },
    setAccountMinPasswordLength(state, minPasswordLength) {
      state.accountMinPasswordLength = minPasswordLength;
    },
    setAccountMaxPasswordLength(state, maxPasswordLength) {
      state.accountMaxPasswordLength = maxPasswordLength;
    }
  },
  actions: {
    getUsers({ commit }) {
      api
        .get('/redfish/v1/AccountService/Accounts')
        .then(response => response.data.Members.map(user => user['@odata.id']))
        .then(userIds => api.all(userIds.map(user => api.get(user))))
        .then(users => {
          const userData = users.map(user => user.data);
          commit('setUsers', userData);
        })
        .catch(error => {
          console.log(error);
          throw new Error('Error loading local users.');
        });
    },
    getAccountSettings({ commit }) {
      api
        .get('/redfish/v1/AccountService')
        .then(({ data }) => {
          commit('setLockoutDuration', data.AccountLockoutDuration);
          commit('setLockoutThreshold', data.AccountLockoutThreshold);
          commit('setAccountMinPasswordLength', data.MinPasswordLength);
          commit('setAccountMaxPasswordLength', data.MaxPasswordLength);
        })
        .catch(error => {
          console.log(error);
          throw new Error('Error loading account settings.');
        });
    },
    async createUser({ dispatch }, { username, password, privilege, status }) {
      const data = {
        UserName: username,
        Password: password,
        RoleId: privilege,
        Enabled: status
      };
      return await api
        .post('/redfish/v1/AccountService/Accounts', data)
        .then(() => dispatch('getUsers'))
        .then(() => `Created user '${username}'.`)
        .catch(error => {
          console.log(error);
          throw new Error(`Error creating user '${username}'.`);
        });
    },
    async updateUser(
      { dispatch },
      { originalUsername, username, password, privilege, status }
    ) {
      const data = {};
      if (username) data.UserName = username;
      if (password) data.Password = password;
      if (privilege) data.RoleId = privilege;
      if (status !== undefined) data.Enabled = status;
      return await api
        .patch(`/redfish/v1/AccountService/Accounts/${originalUsername}`, data)
        .then(() => dispatch('getUsers'))
        .then(() => `Updated user '${originalUsername}'.`)
        .catch(error => {
          console.log(error);
          throw new Error(`Error updating user '${originalUsername}'.`);
        });
    },
    async deleteUser({ dispatch }, username) {
      return await api
        .delete(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(() => dispatch('getUsers'))
        .then(() => `Deleted user '${username}'.`)
        .catch(error => {
          console.log(error);
          throw new Error(`Error deleting user '${username}'.`);
        });
    }
  }
};

export default LocalUserManagementStore;
