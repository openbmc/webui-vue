import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { GlobalStore } from '../store/modules/GlobalStore';
import { AuthenticationStore } from '../store/modules/Authentication/AuthenticationStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'nav-link--current',
});

function allowRouterToNavigate(to, next, currentUserRole) {
  const authenticationStore = AuthenticationStore();
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (authenticationStore.isLoggedIn) {
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
  const globalStore = GlobalStore();
  const authenticationStore = AuthenticationStore();
  let currentUserRole = globalStore.userPrivilege;
  // condition will get satisfied if user refreshed after login
  if (!currentUserRole && authenticationStore.isLoggedIn) {
    // invoke API call to get the role ID
    let username = localStorage.getItem('storedUsername');
    authenticationStore.getUserInfo(username).then((response) => {
      if (response?.RoleId) {
        // set role ID
        authenticationStore.setPrivilege = response.RoleId;
        // store.commit('global/setPrivilege', response.RoleId);
        // allow the route to continue
        allowRouterToNavigate(to, next, response.RoleId);
      }
    });
  } else {
    allowRouterToNavigate(to, next, currentUserRole);
  }
});
export default router;
