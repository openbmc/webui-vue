import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store/index';
import AppLayout from '../layouts/AppLayout.vue';
import LoginLayout from '@/layouts/LoginLayout';
import ConsoleLayout from '@/layouts/ConsoleLayout.vue';
import Overview from '@/views/Overview';
import ProfileSettings from '@/views/ProfileSettings';
import EventLogs from '@/views/Health/EventLogs';
import HardwareStatus from '@/views/Health/HardwareStatus';
import Sensors from '@/views/Health/Sensors';
import Ldap from '@/views/AccessControl/Ldap';
import LocalUserManagement from '@/views/AccessControl/LocalUserManagement';
import SslCertificates from '@/views/AccessControl/SslCertificates';
import DateTimeSettings from '@/views/Configuration/DateTimeSettings';
import Firmware from '@/views/Configuration/Firmware';
import Kvm from '@/views/Control/Kvm';
import ManagePowerUsage from '@/views/Control/ManagePowerUsage';
import NetworkSettings from '@/views/Configuration/NetworkSettings';
import PageNotFound from '@/views/PageNotFound';
import RebootBmc from '@/views/Control/RebootBmc';
import ServerLed from '@/views/Control/ServerLed';
import SerialOverLan from '@/views/Control/SerialOverLan';
import ServerPowerOperations from '@/views/Control/ServerPowerOperations';
import Unauthorized from '@/views/Unauthorized';
import Login from '@/views/Login';
import ChangePassword from '@/views/ChangePassword';
import SerialOverLanConsole from '@/views/Control/SerialOverLan/SerialOverLanConsole';
import KvmConsole from '@/views/Control/Kvm/KvmConsole';
import VirtualMedia from '@/views/Control/VirtualMedia';

Vue.use(VueRouter);

// Meta title is translated using i18n in App.vue and PageTitle.Vue
// Example meta: {title: 'appPageTitle.overview'}
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
          title: 'appPageTitle.login'
        }
      },
      {
        path: '/change-password',
        name: 'change-password',
        component: ChangePassword,
        meta: {
          title: 'appPageTitle.changePassword',
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

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
  linkExactActiveClass: 'nav-link--current'
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters['authentication/isLoggedIn']) {
      next();
      return;
    }
    if (to.path === '/') {
      next('/login');
      return;
    }
    next(`/login?next=${to.path}`);
  } else {
    next();
  }
});

export default router;
