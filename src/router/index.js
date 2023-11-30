import { createRouter, createWebHistory } from 'vue-router';
import i18n from '@/i18n';
import LoginLayout from '@/layouts/LoginLayout.vue';
import LoginPage from '@/views/Login/Login.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import Overview from '@/views/Overview/Overview.vue';
import VirtualMedia from '@/views/Operations/VirtualMedia/VirtualMedia.vue';
import Kvm from '@/views/Operations/Kvm';

const roles = {
  administrator: 'Administrator',
  operator: 'Operator',
  readonly: 'ReadOnly',
  noaccess: 'NoAccess',
};
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: LoginLayout,
      children: [
        {
          path: '',
          name: 'LoginPage',
          component: LoginPage,
        },
      ],
    },
    {
      path: '/',
      meta: {
        requiresAuth: true,
      },
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'overview',
          component: Overview,
          meta: {
            title: i18n.global.t('appPageTitle.overview'),
          },
        },
        {
          path: '/operations/virtual-media',
          name: 'virtual-media',
          component: VirtualMedia,
          meta: {
            title: i18n.global.t('appPageTitle.virtualMedia'),
            exclusiveToRoles: [roles.administrator],
          },
        },
        {
          path: '/operations/kvm',
          name: 'kvm',
          component: Kvm,
          meta: {
            title: i18n.global.t('appPageTitle.kvm'),
          },
        },
      ],
    },
  ],
  linkActiveClass: 'nav-link--current',
});

export default router;
