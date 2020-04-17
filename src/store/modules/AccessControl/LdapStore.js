import api from '@/store/api';
import i18n from '@/i18n';

const LdapStore = {
  namespaced: true,
  state: {
    isServiceEnabled: null,
    ldap: {
      serviceEnabled: null,
      serviceAddress: null,
      bindDn: null,
      baseDn: null,
      userAttribute: null,
      groupsAttribute: null,
      roleGroups: []
    },
    activeDirectory: {
      serviceEnabled: null,
      serviceAddress: null,
      bindDn: null,
      baseDn: null,
      userAttribute: null,
      groupsAttribute: null,
      roleGroups: []
    }
  },
  getters: {
    isServiceEnabled: state => state.isServiceEnabled,
    ldap: state => state.ldap,
    activeDirectory: state => state.activeDirectory
  },
  mutations: {
    setServiceEnabled: (state, serviceEnabled) =>
      (state.isServiceEnabled = serviceEnabled),
    setLdapProperties: (
      state,
      {
        ServiceEnabled,
        ServiceAddresses,
        Authentication = {},
        LDAPService: { SearchSettings = {} } = {},
        RemoteRoleMapping = []
      }
    ) => {
      state.ldap.serviceAddress = ServiceAddresses[0];
      state.ldap.serviceEnabled = ServiceEnabled;
      state.ldap.baseDn = SearchSettings.BaseDistinguishedNames[0];
      state.ldap.bindDn = Authentication.Username;
      state.ldap.userAttribute = SearchSettings.UsernameAttribute;
      state.ldap.groupsAttribute = SearchSettings.GroupsAttribute;
      state.ldap.roleGroups = RemoteRoleMapping;
    },
    setActiveDirectoryProperties: (
      state,
      {
        ServiceEnabled,
        ServiceAddresses,
        Authentication = {},
        LDAPService: { SearchSettings = {} } = {},
        RemoteRoleMapping = []
      }
    ) => {
      state.activeDirectory.serviceEnabled = ServiceEnabled;
      state.activeDirectory.serviceAddress = ServiceAddresses[0];
      state.activeDirectory.bindDn = Authentication.Username;
      state.activeDirectory.baseDn = SearchSettings.BaseDistinguishedNames[0];
      state.activeDirectory.userAttribute = SearchSettings.UsernameAttribute;
      state.activeDirectory.groupsAttribute = SearchSettings.GroupsAttribute;
      state.activeDirectory.roleGroups = RemoteRoleMapping;
    }
  },
  actions: {
    getAccountSettings({ commit }) {
      api
        .get('/redfish/v1/AccountService')
        .then(({ data: { LDAP = {}, ActiveDirectory = {} } }) => {
          const ldapEnabled = LDAP.ServiceEnabled;
          const activeDirectoryEnabled = ActiveDirectory.ServiceEnabled;

          commit('setServiceEnabled', ldapEnabled || activeDirectoryEnabled);
          commit('setLdapProperties', LDAP);
          commit('setActiveDirectoryProperties', ActiveDirectory);
        })
        .catch(error => console.log(error));
    },
    async saveLdapSettings({ state, dispatch }, properties) {
      const data = { LDAP: properties };
      if (state.activeDirectory.serviceEnabled) {
        // Disable Active Directory service if enabled
        await api.patch('/redfish/v1/AccountService', {
          ActiveDirectory: { ServiceEnabled: false }
        });
      }
      return await api
        .patch('/redfish/v1/AccountService', data)
        .then(() => dispatch('getAccountSettings'))
        .then(() => i18n.t('pageLdap.toast.successSaveLdapSettings'))
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageLdap.toast.errorSaveLdapSettings'));
        });
    },
    async saveActiveDirectorySettings({ state, dispatch }, properties) {
      const data = { ActiveDirectory: properties };
      if (state.ldap.serviceEnabled) {
        // Disable LDAP service if enabled
        await api.patch('/redfish/v1/AccountService', {
          LDAP: { ServiceEnabled: false }
        });
      }
      return await api
        .patch('/redfish/v1/AccountService', data)
        .then(() => dispatch('getAccountSettings'))
        .then(() => i18n.t('pageLdap.toast.successSaveActiveDirectorySettings'))
        .catch(error => {
          console.log(error);
          throw new Error(
            i18n.t('pageLdap.toast.errorSaveActiveDirectorySettings')
          );
        });
    },
    async saveAccountSettings(
      { dispatch },
      {
        serviceEnabled,
        serviceAddress,
        activeDirectoryEnabled,
        bindDn,
        bindPassword,
        baseDn,
        userIdAttribute,
        groupIdAttribute
      }
    ) {
      const data = {
        ServiceEnabled: serviceEnabled,
        ServiceAddresses: [serviceAddress],
        Authentication: {
          Username: bindDn,
          Password: bindPassword
        },
        LDAPService: {
          SearchSettings: {
            BaseDistinguishedNames: [baseDn]
          }
        }
      };
      if (groupIdAttribute)
        data.LDAPService.SearchSettings.GroupsAttribute = groupIdAttribute;
      if (userIdAttribute)
        data.LDAPService.SearchSettings.UsernameAttribute = userIdAttribute;

      if (activeDirectoryEnabled) {
        return await dispatch('saveActiveDirectorySettings', data);
      } else {
        return await dispatch('saveLdapSettings', data);
      }
    },
    async addNewRoleGroup(
      { state, dispatch },
      { isActiveDirectoryEnabled, groupName, groupPrivilege }
    ) {
      const data = {};
      const roleGroups = isActiveDirectoryEnabled
        ? state.activeDirectory.roleGroups
        : state.ldap.roleGroups;
      const RemoteRoleMapping = [
        ...roleGroups,
        {
          LocalRole: groupPrivilege,
          RemoteGroup: groupName
        }
      ];
      if (isActiveDirectoryEnabled) {
        data.ActiveDirectory = { RemoteRoleMapping };
      } else {
        data.LDAP = { RemoteRoleMapping };
      }
      return await api
        .patch('/redfish/v1/AccountService', data)
        .then(() => dispatch('getAccountSettings'))
        .then(() => i18n.t('pageLdap.toast.successAddRoleGroup'))
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageLdap.toast.errorAddRoleGroup'));
        });
    },
    async saveRoleGroup(
      { state, dispatch },
      { isActiveDirectoryEnabled, groupName, groupPrivilege }
    ) {
      const data = {};
      const roleGroups = isActiveDirectoryEnabled
        ? state.activeDirectory.roleGroups
        : state.ldap.roleGroups;
      const RemoteRoleMapping = roleGroups.map(group => {
        if (group.RemoteGroup === groupName) {
          return {
            RemoteGroup: groupName,
            LocalRole: groupPrivilege
          };
        } else {
          return {};
        }
      });
      if (isActiveDirectoryEnabled) {
        data.ActiveDirectory = { RemoteRoleMapping };
      } else {
        data.LDAP = { RemoteRoleMapping };
      }
      return await api
        .patch('/redfish/v1/AccountService', data)
        .then(() => dispatch('getAccountSettings'))
        .then(() =>
          i18n.t('pageLdap.toast.successSaveRoleGroup', { groupName })
        )
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageLdap.toast.errorSaveRoleGroup'));
        });
    },
    async deleteRoleGroup(
      { state, dispatch },
      { isActiveDirectoryEnabled, groupName }
    ) {
      const data = {};
      const roleGroups = isActiveDirectoryEnabled
        ? state.activeDirectory.roleGroups
        : state.ldap.roleGroups;
      const RemoteRoleMapping = roleGroups.map(group => {
        if (group.RemoteGroup === groupName) {
          return null;
        } else {
          return {};
        }
      });
      if (isActiveDirectoryEnabled) {
        data.ActiveDirectory = { RemoteRoleMapping };
      } else {
        data.LDAP = { RemoteRoleMapping };
      }
      return await api
        .patch('/redfish/v1/AccountService', data)
        .then(() => dispatch('getAccountSettings'))
        .then(() =>
          i18n.t('pageLdap.toast.successDeleteRoleGroup', { groupName })
        )
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageLdap.toast.errorDeleteRoleGroup'));
        });
    },
    async batchDeleteRoleGroups(
      { state, dispatch },
      { isActiveDirectoryEnabled }
    ) {
      const data = {};
      const roleGroups = isActiveDirectoryEnabled
        ? state.activeDirectory.roleGroups
        : state.ldap.roleGroups;
      const RemoteRoleMapping = roleGroups.map(() => null);
      if (isActiveDirectoryEnabled) {
        data.ActiveDirectory = { RemoteRoleMapping };
      } else {
        data.LDAP = { RemoteRoleMapping };
      }
      return await api
        .patch('/redfish/v1/AccountService', data)
        .then(() => dispatch('getAccountSettings'))
        .then(() => i18n.t('pageLdap.toast.successDeleteRoleGroups'))
        .catch(error => {
          console.log(error);
          throw new Error(i18n.t('pageLdap.toast.errorDeleteRoleGroups'));
        });
    }
  }
};

export default LdapStore;
