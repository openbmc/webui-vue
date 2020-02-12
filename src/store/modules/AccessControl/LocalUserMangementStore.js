import api from '../../api';
import i18n from '../../../i18n';

const getResponseCount = responses => {
  let successCount = 0;
  let errorCount = 0;

  responses.forEach(response => {
    if (response instanceof Error) errorCount++;
    else successCount++;
  });

  return {
    successCount,
    errorCount
  };
};

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
    },
    async deleteUsers({ dispatch }, users) {
      const promises = users.map(({ username }) => {
        return api
          .delete(`/redfish/v1/AccountService/Accounts/${username}`)
          .catch(error => {
            console.log(error);
            return error;
          });
      });
      return await api
        .all(promises)
        .then(response => {
          dispatch('getUsers');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            let toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'localUserManagement.toastMessages.successDeleteUsers',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'localUserManagement.toastMessages.errorDeleteUsers',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          })
        );
    },
    async enableUsers({ dispatch }, users) {
      const data = {
        Enabled: true
      };
      const promises = users.map(({ username }) => {
        return api
          .patch(`/redfish/v1/AccountService/Accounts/${username}`, data)
          .catch(error => {
            console.log(error);
            return error;
          });
      });
      return await api
        .all(promises)
        .then(response => {
          dispatch('getUsers');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            let toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'localUserManagement.toastMessages.successEnableUsers',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'localUserManagement.toastMessages.errorEnableUsers',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          })
        );
    },
    async disableUsers({ dispatch }, users) {
      const data = {
        Enabled: false
      };
      const promises = users.map(({ username }) => {
        return api
          .patch(`/redfish/v1/AccountService/Accounts/${username}`, data)
          .catch(error => {
            console.log(error);
            return error;
          });
      });
      return await api
        .all(promises)
        .then(response => {
          dispatch('getUsers');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            let toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'localUserManagement.toastMessages.successDisableUsers',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'localUserManagement.toastMessages.errorDisableUsers',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          })
        );
    }
  }
};

export default LocalUserManagementStore;
