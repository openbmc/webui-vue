import AppLayout from '@/layouts/AppLayout.vue';
import ChangePassword from '@/views/ChangePassword';
import ConsoleLayout from '@/layouts/ConsoleLayout.vue';
import DateTimeSettings from '@/views/Configuration/DateTimeSettings';
import EventLogs from '@/views/Health/EventLogs';
import HardwareStatus from '@/views/Health/HardwareStatus';
import Ldap from '@/views/AccessControl/Ldap';
import LocalUserManagement from '@/views/AccessControl/LocalUserManagement';
import Login from '@/views/Login';
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
import VirtualMedia from '@/views/Control/VirtualMedia';
import i18n from '@/i18n';

// Custom components
import FirmwareSingleImage from '../components/FirmwareSingleImage';

const routes = [
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: Login,
        meta: {
          title: i18n.t('appPageTitle.login')
        }
      },
      {
        path: '/change-password',
        name: 'change-password',
        component: ChangePassword,
        meta: {
          title: i18n.t('appPageTitle.changePassword'),
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/console',
    component: ConsoleLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'serial-over-lan-console',
        name: 'serial-over-lan-console',
        component: SerialOverLanConsole,
        meta: {
          title: i18n.t('appPageTitle.serialOverLan')
        }
      }
    ]
  },
  {
    path: '/',
    meta: {
      requiresAuth: true
    },
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'overview',
        component: Overview,
        meta: {
          title: i18n.t('appPageTitle.overview')
        }
      },
      {
        path: '/profile-settings',
        name: 'profile-settings',
        component: ProfileSettings,
        meta: {
          title: i18n.t('appPageTitle.profileSettings')
        }
      },
      {
        path: '/health/event-logs',
        name: 'event-logs',
        component: EventLogs,
        meta: {
          title: i18n.t('appPageTitle.eventLogs')
        }
      },
      {
        path: '/health/hardware-status',
        name: 'hardware-status',
        component: HardwareStatus,
        meta: {
          title: i18n.t('appPageTitle.hardwareStatus')
        }
      },
      {
        path: '/health/sensors',
        name: 'sensors',
        component: Sensors,
        meta: {
          title: i18n.t('appPageTitle.sensors')
        }
      },
      {
        path: '/access-control/ldap',
        name: 'ldap',
        component: Ldap,
        meta: {
          title: i18n.t('appPageTitle.ldap')
        }
      },
      {
        path: '/access-control/local-user-management',
        name: 'local-users',
        component: LocalUserManagement,
        meta: {
          title: i18n.t('appPageTitle.localUserManagement')
        }
      },
      {
        path: '/access-control/ssl-certificates',
        name: 'ssl-certificates',
        component: SslCertificates,
        meta: {
          title: i18n.t('appPageTitle.sslCertificates')
        }
      },
      {
        path: '/configuration/date-time-settings',
        name: 'date-time-settings',
        component: DateTimeSettings,
        meta: {
          title: i18n.t('appPageTitle.dateTimeSettings')
        }
      },
      {
        path: '/configuration/firmware',
        name: 'firmware',
        component: FirmwareSingleImage,
        meta: {
          title: i18n.t('appPageTitle.firmware')
        }
      },
      {
        path: '/control/manage-power-usage',
        name: 'manage-power-usage',
        component: ManagePowerUsage,
        meta: {
          title: i18n.t('appPageTitle.managePowerUsage')
        }
      },
      {
        path: '/configuration/network-settings',
        name: 'network-settings',
        component: NetworkSettings,
        meta: {
          title: i18n.t('appPageTitle.networkSettings')
        }
      },
      {
        path: '/control/reboot-bmc',
        name: 'reboot-bmc',
        component: RebootBmc,
        meta: {
          title: i18n.t('appPageTitle.rebootBmc')
        }
      },
      {
        path: '/control/server-led',
        name: 'server-led',
        component: ServerLed,
        meta: {
          title: i18n.t('appPageTitle.serverLed')
        }
      },
      {
        path: '/control/serial-over-lan',
        name: 'serial-over-lan',
        component: SerialOverLan,
        meta: {
          title: i18n.t('appPageTitle.serialOverLan')
        }
      },
      {
        path: '/control/server-power-operations',
        name: 'server-power-operations',
        component: ServerPowerOperations,
        meta: {
          title: i18n.t('appPageTitle.serverPowerOperations')
        }
      },
      {
        path: '/control/virtual-media',
        name: 'virtual-media',
        component: VirtualMedia,
        meta: {
          title: i18n.t('appPageTitle.virtualMedia')
        }
      },
      {
        path: '*',
        name: 'page-not-found',
        component: PageNotFound,
        meta: {
          title: i18n.t('appPageTitle.pageNotFound')
        }
      }
    ]
  }
];

export default routes;
