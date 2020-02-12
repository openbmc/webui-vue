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
    responseCount: responses.length,
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
            const {
              responseCount,
              successCount,
              errorCount
            } = getResponseCount(responses);

            if (responseCount === errorCount) {
              // If all requests failed then throw error and show
              // error message
              const key = 'localUserManagement.toastMessages.errorDeleteUsers';
              const message = i18n.t(key, { count: responseCount });
              throw new Error(message);
            } else if (responseCount !== successCount) {
              // If some requests failed show partial success message
              const key =
                'localUserManagement.toastMessages.warningDeleteUsers';
              const message = i18n.t(key, {
                errorCount: errorCount,
                successCount: successCount
              });
              return { type: 'warning', message };
            } else {
              // If all requests successful, show success message
              const key =
                'localUserManagement.toastMessages.succcessDeleteUsers';
              const message = i18n.t(key, { count: responseCount });
              return { type: 'success', message };
            }
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
            const {
              responseCount,
              successCount,
              errorCount
            } = getResponseCount(responses);

            if (responseCount === errorCount) {
              // If all requests failed then throw error and show
              // error message
              const key = 'localUserManagement.toastMessages.errorEnableUsers';
              const message = i18n.t(key, { count: responseCount });
              throw new Error(message);
            } else if (responseCount !== successCount) {
              // If some requests failed show partial success message
              const key =
                'localUserManagement.toastMessages.warningEnableUsers';
              const message = i18n.t(key, {
                errorCount: errorCount,
                successCount: successCount
              });
              return { type: 'warning', message };
            } else {
              // If all requests successful, show success message
              const key =
                'localUserManagement.toastMessages.succcessEnableUsers';
              const message = i18n.t(key, { count: responseCount });
              return { type: 'success', message };
            }
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
            const {
              responseCount,
              successCount,
              errorCount
            } = getResponseCount(responses);

            if (responseCount === errorCount) {
              // If all requests failed then throw error and show
              // error message
              const key = 'localUserManagement.toastMessages.errorDisableUsers';
              const message = i18n.t(key, { count: responseCount });
              throw new Error(message);
            } else if (responseCount !== successCount) {
              // If some requests failed show partial success message
              const key =
                'localUserManagement.toastMessages.warningDisableUsers';
              const message = i18n.t(key, {
                errorCount: errorCount,
                successCount: successCount
              });
              return { type: 'warning', message };
            } else {
              // If all requests successful, show success message
              const key =
                'localUserManagement.toastMessages.succcessDisableUsers';
              const message = i18n.t(key, { count: responseCount });
              return { type: 'success', message };
            }
          })
        );
    }
  }
};

export default LocalUserManagementStore;
