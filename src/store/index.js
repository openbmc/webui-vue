import Vue from 'vue';
import Vuex from 'vuex';

import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticanStore';
import ClientSessions from './modules/AccessControl/ClientSessionsStore';
import LdapStore from './modules/AccessControl/LdapStore';
import LocalUserManagementStore from './modules/AccessControl/LocalUserMangementStore';
import SslCertificatesStore from './modules/AccessControl/SslCertificatesStore';
import FirmwareStore from './modules/Settings/FirmwareStore';
import BootSettingsStore from './modules/Operations/BootSettingsStore';
import ControlStore from './modules/Operations/ControlStore';
import PowerControlStore from './modules/Operations/PowerControlStore';
import PowerPolicyStore from './modules/Operations/PowerPolicyStore';
import NetworkSettingStore from './modules/Settings/NetworkSettingsStore';
import EventLogStore from './modules/Logs/EventLogStore';
import SensorsStore from './modules/HardwareStatus/SensorsStore';
import SystemStore from './modules/HardwareStatus/SystemStore';
import PowerSupplyStore from './modules/HardwareStatus/PowerSupplyStore';
import MemoryStore from './modules/HardwareStatus/MemoryStore';
import FanStore from './modules/HardwareStatus/FanStore';
import ChassisStore from './modules/HardwareStatus/ChassisStore';
import BmcStore from './modules/HardwareStatus/BmcStore';
import ProcessorStore from './modules/HardwareStatus/ProcessorStore';
import SecuritySettingsStore from './modules/Settings/SecuritySettingsStore';
import FactoryResetStore from './modules/Operations/FactoryResetStore';

import WebSocketPlugin from './plugins/WebSocketPlugin';
import DateTimeStore from './modules/Settings/DateTimeStore';
import VirtualMediaStore from './modules/Operations/VirtualMediaStore';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    global: GlobalStore,
    authentication: AuthenticationStore,
    clientSessions: ClientSessions,
    dateTime: DateTimeStore,
    ldap: LdapStore,
    localUsers: LocalUserManagementStore,
    firmware: FirmwareStore,
    serverBootSettings: BootSettingsStore,
    controls: ControlStore,
    powerControl: PowerControlStore,
    powerPolicy: PowerPolicyStore,
    powerSupply: PowerSupplyStore,
    networkSettings: NetworkSettingStore,
    eventLog: EventLogStore,
    sensors: SensorsStore,
    sslCertificates: SslCertificatesStore,
    system: SystemStore,
    memory: MemoryStore,
    fan: FanStore,
    chassis: ChassisStore,
    bmc: BmcStore,
    processors: ProcessorStore,
    virtualMedia: VirtualMediaStore,
    securitySettings: SecuritySettingsStore,
    factoryReset: FactoryResetStore,
  },
  plugins: [WebSocketPlugin],
});
