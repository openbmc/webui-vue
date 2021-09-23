import Vue from 'vue';
import Vuex from 'vuex';
import api from '@/store/api';

import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticanStore';
import SessionsStore from './modules/SecurityAndAccess/SessionsStore';
import LdapStore from './modules/SecurityAndAccess/LdapStore';
import UserManagementStore from './modules/SecurityAndAccess/UserManagementStore';
import CertificatesStore from './modules/SecurityAndAccess/CertificatesStore';
import FirmwareStore from './modules/Operations/FirmwareStore';
import BootSettingsStore from './modules/Operations/BootSettingsStore';
import ControlStore from './modules/Operations/ControlStore';
import PowerControlStore from './modules/ResourceManagement/PowerControlStore';
import PowerPolicyStore from './modules/Settings/PowerPolicyStore';
import NetworkStore from './modules/Settings/NetworkStore';
import EventLogStore from './modules/Logs/EventLogStore';
import SensorsStore from './modules/HardwareStatus/SensorsStore';
import ServerLedStore from './modules/HardwareStatus/ServerLedStore';
import SystemStore from './modules/HardwareStatus/SystemStore';
import PowerSupplyStore from './modules/HardwareStatus/PowerSupplyStore';
import MemoryStore from './modules/HardwareStatus/MemoryStore';
import FanStore from './modules/HardwareStatus/FanStore';
import ChassisStore from './modules/HardwareStatus/ChassisStore';
import BmcStore from './modules/HardwareStatus/BmcStore';
import ProcessorStore from './modules/HardwareStatus/ProcessorStore';
import PostCodeLogsStore from './modules/Logs/PostCodeLogsStore';
import PoliciesStore from './modules/SecurityAndAccess/PoliciesStore';
import FactoryResetStore from './modules/Operations/FactoryResetStore';

import WebSocketPlugin from './plugins/WebSocketPlugin';
import DateTimeStore from './modules/Settings/DateTimeStore';
import VirtualMediaStore from './modules/Operations/VirtualMediaStore';

import getUri from '../utilities/GetUri';

/**
 * BMC
 * @typedef {Object} MainState
 * @property {string[]} managersUri - All managers URIs.
 * @property {string} managerUri - First manager URI (BMC).
 * @property {string[]} systemsUri - All systems URIs.
 * @property {string} systemUri - First system URI.
 */

/**
 * default state
 * @type {MainState}
 */
const state = {
  managersUri: undefined,
  managerUri: undefined,
  systemsUri: undefined,
  systemUri: undefined,
};

/**
 * Getters enum
 * @readonly
 * @enum
 */
export const gettersEnum = {
  managersUri: 'managersUri',
  managerUri: 'managerUri',
  systemsUri: 'systemsUri',
  systemUri: 'systemUri',
};

/**
 * Mutations enum
 * @readonly
 * @enum
 */
export const mutationsEnum = {
  setUris: 'setUris',
  setSytemApi: 'setSytemApi',
  setBmcApi: 'setBmcApi',
};

/**
 * Actions enum
 * @readonly
 * @enum
 */
export const actionsEnum = {
  getRoot: 'getRoot',
  getManagers: 'getManagers',
  getSystems: 'getSystems',
};

Vue.use(Vuex);
const store = new Vuex.Store({
  state,
  getters: {
    [gettersEnum.managersUri]: (state) => state.managersUri,
    [gettersEnum.systemsUri]: (state) => state.systemsUri,
    [gettersEnum.managerUri]: (state) => state.managerUri,
    [gettersEnum.systemUri]: (state) => state.systemUri,
  },
  mutations: {
    [mutationsEnum.setUris](state, p) {
      state.managersUri = getUri(p.Managers);
      state.systemsUri = getUri(p.Systems);
    },
    [mutationsEnum.setSytemApi](state, { Members }) {
      const uri = getUri(Members);
      if (!uri) {
        return;
      }

      state.systemUri = uri;
    },
    [mutationsEnum.setBmcApi](state, { Members }) {
      const uri = getUri(Members);
      if (!uri) {
        return;
      }

      state.managerUri = uri;
    },
  },
  actions: {
    async [actionsEnum.getRoot]({ commit }) {
      // TODO: move to configuration
      var result = await api.get('/redfish/v1');
      commit(mutationsEnum.setUris, result.data);
    },

    async [actionsEnum.getManagers]({ commit }, payload) {
      var result = await api.get(payload);
      commit(mutationsEnum.setBmcApi, result.data);
    },

    async [actionsEnum.getSystems]({ commit }, payload) {
      var result = await api.get(payload);
      commit(mutationsEnum.setSytemApi, result.data);
    },
  },
  modules: {
    [GlobalStore.namespace]: GlobalStore.store,
    authentication: AuthenticationStore,
    sessions: SessionsStore,
    dateTime: DateTimeStore,
    ldap: LdapStore,
    userManagement: UserManagementStore,
    firmware: FirmwareStore,
    serverBootSettings: BootSettingsStore,
    controls: ControlStore,
    powerControl: PowerControlStore,
    powerPolicy: PowerPolicyStore,
    powerSupply: PowerSupplyStore,
    network: NetworkStore,
    eventLog: EventLogStore,
    sensors: SensorsStore,
    serverLed: ServerLedStore,
    certificates: CertificatesStore,
    [SystemStore.namespace]: SystemStore.store,
    memory: MemoryStore,
    fan: FanStore,
    chassis: ChassisStore,
    [BmcStore.namespace]: BmcStore.store,
    processors: ProcessorStore,
    postCodeLogs: PostCodeLogsStore,
    virtualMedia: VirtualMediaStore,
    policies: PoliciesStore,
    factoryReset: FactoryResetStore,
  },
  plugins: [WebSocketPlugin],
});

store.watch(
  (getters) => getters[gettersEnum.managersUri],
  (r) => store.dispatch(actionsEnum.getManagers, r)
);

store.watch(
  (getters) => getters[gettersEnum.systemsUri],
  (r) => store.dispatch(actionsEnum.getSystems, r)
);

store.watch(
  (getters) => getters[gettersEnum.systemUri],
  (r) => store.dispatch(SystemStore.actions.getSystem, r)
);
store.watch(
  (getters) => getters[gettersEnum.managerUri],
  (r) => store.dispatch(BmcStore.actions.getBmcInfo, r)
);

export default store;
