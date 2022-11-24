import Vue from 'vue';
import VueRouter from 'vue-router';

//Do not change store or routes import.
//Exact match alias set to support
//dotenv customizations.
import store from '../store';
import routes from './routes';

Vue.use(VueRouter);

const currentUserRole = store.getters['global/userPrivilege'];

const filteredRoutes = routes.map((route) => {
  return {
    ...route,
    children: route.children.filter((child) => {
      const exclusiveToRoles = child.meta.exclusiveToRoles;
      if (!exclusiveToRoles?.length) return true;
      return exclusiveToRoles.includes(currentUserRole);
    }),
  };
});

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes: filteredRoutes,
  linkExactActiveClass: 'nav-link--current',
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
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
