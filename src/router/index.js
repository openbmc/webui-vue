import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store/index';
import AppLayout from '../layouts/AppLayout.vue';

Vue.use(VueRouter);

// Meta title is translated using i18n in App.vue and PageTitle.Vue
// Example meta: {title: 'pageTitle.overview'}
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
          title: 'pageTitle.overview'
        }
      },
      {
        path: '/access-control/local-user-management',
        name: 'local-users',
        component: () => import('@/views/AccessControl/LocalUserManagement'),
        meta: {
          title: 'pageTitle.localUserMgmt'
        }
      },
      {
        path: '/control/reboot-bmc',
        name: 'reboot-bmc',
        component: () => import('@/views/Control/RebootBmc'),
        meta: {
          title: 'pageTitle.rebootBmc'
        }
      },
      {
        path: '/unauthorized',
        name: 'unauthorized',
        component: () => import('@/views/Unauthorized'),
        meta: {
          title: 'pageTitle.unauthorized'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login'),
    meta: {
      title: 'pageTitle.login'
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
