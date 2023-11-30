import { createRouter, createWebHistory } from 'vue-router';
import LoginLayout from '@/layouts/LoginLayout.vue';
import LoginPage from '@/views/Login/Login.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import Overview from '@/views/Overview/Overview.vue';
import i18n from '@/i18n';
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
      ],
    },
  ],
  linkActiveClass: 'nav-link--current',
});

export default router;
