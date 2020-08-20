import AppLayout from '@/layouts/AppLayout.vue';
import ChangePassword from '@/views/ChangePassword';
import ConsoleLayout from '@/layouts/ConsoleLayout.vue';
import DateTimeSettings from '@/views/Configuration/DateTimeSettings';
import EventLogs from '@/views/Health/EventLogs';
import Firmware from '@/views/Configuration/Firmware';
import HardwareStatus from '@/views/Health/HardwareStatus';
import Kvm from '@/views/Control/Kvm';
import KvmConsole from '@/views/Control/Kvm/KvmConsole';
import Ldap from '@/views/AccessControl/Ldap';
import LocalUserManagement from '@/views/AccessControl/LocalUserManagement';
import LoginLayout from '@/layouts/LoginLayout';
import ManagePowerUsage from '@/views/Control/ManagePowerUsage';
import NetworkSettings from '@/views/Configuration/NetworkSettings';
import Overview from '@/views/Overview';
import PageNotFound from '@/views/PageNotFound';
import ProfileSettings from '@/views/ProfileSettings';
import RebootBmc from '@/views/Control/RebootBmc';
import Sensors from '@/views/Health/Sensors';
import SerialOverLan from '@/views/Control/SerialOverLan';
import SerialOverLanConsole from '@/views/Control/SerialOverLan/SerialOverLanConsole';
import ServerLed from '@/views/Control/ServerLed';
import ServerPowerOperations from '@/views/Control/ServerPowerOperations';
import SslCertificates from '@/views/AccessControl/SslCertificates';
import Unauthorized from '@/views/Unauthorized';
import VirtualMedia from '@/views/Control/VirtualMedia';

// Meta title is translated using i18n in App.vue and PageTitle.Vue
// Example meta: {title: 'appPageTitle.overview'}
const routes = [
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '/change-password',
        name: 'change-password',
        component: ChangePassword,
        meta: {
          title: 'appPageTitle.changePassword'
        }
      }
    ]
  },
  {
    path: '/console',
    component: ConsoleLayout,
    children: [
      {
        path: 'serial-over-lan-console',
        name: 'serial-over-lan-console',
        component: SerialOverLanConsole,
        meta: {
          title: 'appPageTitle.serialOverLan'
        }
      },
      {
        path: 'kvm',
        name: 'kvm-console',
        component: KvmConsole,
        meta: {
          title: 'appPageTitle.kvm'
        }
      }
    ]
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'overview',
        component: Overview,
        meta: {
          title: 'appPageTitle.overview'
        }
      },
      {
        path: '/profile-settings',
        name: 'profile-settings',
        component: ProfileSettings,
        meta: {
          title: 'appPageTitle.profileSettings'
        }
      },
      {
        path: '/health/event-logs',
        name: 'event-logs',
        component: EventLogs,
        meta: {
          title: 'appPageTitle.eventLogs'
        }
      },
      {
        path: '/health/hardware-status',
        name: 'hardware-status',
        component: HardwareStatus,
        meta: {
          title: 'appPageTitle.hardwareStatus'
        }
      },
      {
        path: '/health/sensors',
        name: 'sensors',
        component: Sensors,
        meta: {
          title: 'appPageTitle.sensors'
        }
      },
      {
        path: '/access-control/ldap',
        name: 'ldap',
        component: Ldap,
        meta: {
          title: 'appPageTitle.ldap'
        }
      },
      {
        path: '/access-control/local-user-management',
        name: 'local-users',
        component: LocalUserManagement,
        meta: {
          title: 'appPageTitle.localUserManagement'
        }
      },
      {
        path: '/access-control/ssl-certificates',
        name: 'ssl-certificates',
        component: SslCertificates,
        meta: {
          title: 'appPageTitle.sslCertificates'
        }
      },
      {
        path: '/configuration/date-time-settings',
        name: 'date-time-settings',
        component: DateTimeSettings,
        meta: {
          title: 'appPageTitle.dateTimeSettings'
        }
      },
      {
        path: '/configuration/firmware',
        name: 'firmware',
        component: Firmware,
        meta: {
          title: 'appPageTitle.firmware'
        }
      },
      {
        path: '/control/kvm',
        name: 'kvm',
        component: Kvm,
        meta: {
          title: 'appPageTitle.kvm'
        }
      },
      {
        path: '/control/manage-power-usage',
        name: 'manage-power-usage',
        component: ManagePowerUsage,
        meta: {
          title: 'appPageTitle.managePowerUsage'
        }
      },
      {
        path: '/configuration/network-settings',
        name: 'network-settings',
        component: NetworkSettings,
        meta: {
          title: 'appPageTitle.networkSettings'
        }
      },
      {
        path: '/control/reboot-bmc',
        name: 'reboot-bmc',
        component: RebootBmc,
        meta: {
          title: 'appPageTitle.rebootBmc'
        }
      },
      {
        path: '/control/server-led',
        name: 'server-led',
        component: ServerLed,
        meta: {
          title: 'appPageTitle.serverLed'
        }
      },
      {
        path: '/control/serial-over-lan',
        name: 'serial-over-lan',
        component: SerialOverLan,
        meta: {
          title: 'appPageTitle.serialOverLan'
        }
      },
      {
        path: '/control/server-power-operations',
        name: 'server-power-operations',
        component: ServerPowerOperations,
        meta: {
          title: 'appPageTitle.serverPowerOperations'
        }
      },
      {
        path: '/control/virtual-media',
        name: 'virtual-media',
        component: VirtualMedia,
        meta: {
          title: 'appPageTitle.virtualMedia'
        }
      },
      {
        path: '/unauthorized',
        name: 'unauthorized',
        component: Unauthorized,
        meta: {
          title: 'appPageTitle.unauthorized'
        }
      },
      {
        path: '*',
        name: 'page-not-found',
        component: PageNotFound,
        meta: {
          title: 'appPageTitle.pageNotFound'
        }
      }
    ]
  }
];

export default routes;
