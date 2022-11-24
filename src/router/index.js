import Vue from 'vue';
import VueRouter from 'vue-router';

//Do not change store or routes import.
//Exact match alias set to support
//dotenv customizations.
import store from '../store';
import routes from './routes';

Vue.use(VueRouter);
const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
  linkExactActiveClass: 'nav-link--current',
});

router.beforeEach((to, from, next) => {
  let currentUserRole = store.getters['global/userPrivilege'];
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (store.getters['authentication/isLoggedIn']) {
      if (to.meta.exclusiveToRoles) {
        // The privilege for the specific router was verified using the
        // exclusiveToRoles roles in the router.
        if (to.meta.exclusiveToRoles.includes(currentUserRole)) {
          next();
        } else {
          next('*');
        }
        return;
      }
      next();
      return;
    }
    next('/login');
  } else {
    next();
  }
});

export default router;
