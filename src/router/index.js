import { createRouter, createWebHashHistory } from 'vue-router';

//Do not change store or routes import.
//Exact match alias set to support
//dotenv customizations.
import store from '../store';
import routes from './routes';
import { roleListAllows } from '@/api/privilege/rolePrivileges';

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkExactActiveClass: 'nav-link--current',
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

function sessionRolesFromStore() {
  const roles = store.getters['global/sessionRoles'];
  if (Array.isArray(roles) && roles.length > 0) return roles;
  const role = store.getters['global/userPrivilege'];
  return role ? [role] : [];
}

function allowRouterToNavigate(to, next, currentUserRoles) {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (store.getters['authentication/isLoggedIn']) {
      if (to.meta.exclusiveToRoles) {
        // Any Session.Roles entry may satisfy exclusiveToRoles.
        if (roleListAllows(currentUserRoles, to.meta.exclusiveToRoles)) {
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
  const currentUserRoles = sessionRolesFromStore();
  // condition will get satisfied if user refreshed after login
  if (
    currentUserRoles.length === 0 &&
    store.getters['authentication/isLoggedIn']
  ) {
    // invoke API call to get the role ID
    store
      .dispatch('authentication/getSessionPrivilege')
      .then(() => {
        allowRouterToNavigate(to, next, sessionRolesFromStore());
      })
      // our store got out of sync, start afresh
      .catch(() => {
        console.log('Failed to obtain current Roles, logging out.');
        store.dispatch('authentication/logout');
      });
  } else {
    allowRouterToNavigate(to, next, currentUserRoles);
  }
});

export default router;
