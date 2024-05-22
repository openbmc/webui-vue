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
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

function allowRouterToNavigate(to, next, currentUserRole) {
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
}

router.beforeEach((to, from, next) => {
  let currentUserRole = store.getters['global/userPrivilege'];
  // condition will get satisfied if user refreshed after login
  if (!currentUserRole && store.getters['authentication/isLoggedIn']) {
    // invoke API call to get the role ID
    let username = localStorage.getItem('storedUsername');
    store.dispatch('authentication/getUserInfo', username).then(() => {
      let currentUserRole = store.getters['global/userPrivilege'];
      allowRouterToNavigate(to, next, currentUserRole);
    });
  } else {
    allowRouterToNavigate(to, next, currentUserRole);
  }
});

export default router;
