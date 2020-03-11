import Vue from 'vue';
import Vuex from 'vuex';

import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticanStore';
import LocalUserManagementStore from './modules/AccessControl/LocalUserMangementStore';
import OverviewStore from './modules/Overview/OverviewStore';
import FirmwareStore from './modules/Configuration/FirmwareStore';
import BootSettingsStore from './modules/Control/BootSettingsStore';
import ControlStore from './modules/Control/ControlStore';
import PowerControlStore from './modules/Control/PowerControlStore';
import NetworkSettingStore from './modules/Configuration/NetworkSettingsStore';
import EventLogStore from './modules/Health/EventLogStore';
import SensorsStore from './modules/Health/SensorsStore';

import WebSocketPlugin from './plugins/WebSocketPlugin';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    global: GlobalStore,
    authentication: AuthenticationStore,
    localUsers: LocalUserManagementStore,
    overview: OverviewStore,
    firmware: FirmwareStore,
    hostBootSettings: BootSettingsStore,
    controls: ControlStore,
    powerControl: PowerControlStore,
    networkSettings: NetworkSettingStore,
    eventLog: EventLogStore,
    sensors: SensorsStore
  },
  plugins: [WebSocketPlugin]
});
