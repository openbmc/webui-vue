import Vue from 'vue';
import Vuex from 'vuex';

import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticanStore';
import SessionsStore from './modules/SecurityAndAccess/SessionsStore';
import LdapStore from './modules/SecurityAndAccess/LdapStore';
import UserManagementStore from './modules/SecurityAndAccess/UserMangementStore';
import SslCertificatesStore from './modules/SecurityAndAccess/SslCertificatesStore';
import FirmwareStore from './modules/Operations/FirmwareStore';
import BootSettingsStore from './modules/Operations/BootSettingsStore';
import ControlStore from './modules/Operations/ControlStore';
import PowerControlStore from './modules/Operations/PowerControlStore';
import PowerPolicyStore from './modules/Settings/PowerPolicyStore';
import NetworkStore from './modules/Settings/NetworkStore';
import EventLogStore from './modules/Logs/EventLogStore';
import SensorsStore from './modules/HardwareStatus/SensorsStore';
import SystemStore from './modules/HardwareStatus/SystemStore';
import PowerSupplyStore from './modules/HardwareStatus/PowerSupplyStore';
import MemoryStore from './modules/HardwareStatus/MemoryStore';
import FanStore from './modules/HardwareStatus/FanStore';
import ChassisStore from './modules/HardwareStatus/ChassisStore';
import BmcStore from './modules/HardwareStatus/BmcStore';
import ProcessorStore from './modules/HardwareStatus/ProcessorStore';
import PostCodeLogsStore from './modules/HardwareStatus/PostCodeLogsStore';
import PoliciesStore from './modules/SecurityAndAccess/PoliciesStore';
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
    sslCertificates: SslCertificatesStore,
    system: SystemStore,
    memory: MemoryStore,
    fan: FanStore,
    chassis: ChassisStore,
    bmc: BmcStore,
    processors: ProcessorStore,
    postCodeLogs: PostCodeLogsStore,
    virtualMedia: VirtualMediaStore,
    policies: PoliciesStore,
    factoryReset: FactoryResetStore,
  },
  plugins: [WebSocketPlugin],
});
