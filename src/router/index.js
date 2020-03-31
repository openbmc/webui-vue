import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store/index';
import AppLayout from '../layouts/AppLayout.vue';

Vue.use(VueRouter);

// Meta title is translated using i18n in App.vue and PageTitle.Vue
// Example meta: {title: 'appPageTitle.overview'}
const routes = [
  {
    path: '/',
    name: '',
    meta: {
      requiresAuth: true
    },
    component: AppLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/Overview'),
        meta: {
          title: 'appPageTitle.overview'
        }
      },
      {
        path: '/health/sensors',
        component: () => import('@/views/Health/Sensors'),
        meta: {
          title: 'appPageTitle.sensors'
        }
      },
      {
        path: '/access-control/local-user-management',
        name: 'local-users',
        component: () => import('@/views/AccessControl/LocalUserManagement'),
        meta: {
          title: 'appPageTitle.localUserManagement'
        }
      },
      {
        path: '/access-control/ssl-certificates',
        name: 'ssl-certificates',
        component: () => import('@/views/AccessControl/SslCertificates'),
        meta: {
          title: 'appPageTitle.sslCertificates'
        }
      },
      {
        path: '/control/manage-power-usage',
        name: 'manage-power-usage',
        component: () => import('@/views/Control/ManagePowerUsage'),
        meta: {
          title: 'appPageTitle.managePowerUsage'
        }
      },
      {
        path: '/control/reboot-bmc',
        name: 'reboot-bmc',
        component: () => import('@/views/Control/RebootBmc'),
        meta: {
          title: 'appPageTitle.rebootBmc'
        }
      },
      {
        path: '/control/server-power-operations',
        name: 'server-power-operations',
        component: () => import('@/views/Control/ServerPowerOperations'),
        meta: {
          title: 'appPageTitle.serverPowerOperations'
        }
      },
      {
        path: '/unauthorized',
        name: 'unauthorized',
        component: () => import('@/views/Unauthorized'),
        meta: {
          title: 'appPageTitle.unauthorized'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login'),
    meta: {
      title: 'appPageTitle.login'
    }
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
    next('/login');
  } else {
    next();
  }
});

export default router;
