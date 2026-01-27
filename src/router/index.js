import { createRouter, createWebHashHistory } from 'vue-router';

//Do not change store or routes import.
//Exact match alias set to support
//dotenv customizations.
import routes from './routes';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkExactActiveClass: 'nav-link--current',
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

function allowRouterToNavigate(to, next, authStore) {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (authStore.isLoggedIn) {
      if (to.meta.exclusiveToRoles) {
        // Check if any of the user's roles match the allowed roles
        const userRoles = authStore.Roles;
        const hasAllowedRole = userRoles.some((role) =>
          to.meta.exclusiveToRoles.includes(role),
        );
        if (hasAllowedRole) {
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
  const authStore = useAuthStore();

  // If logged in but no session data, fetch it (page refresh scenario)
  if (authStore.isLoggedIn && authStore.Roles.length === 0) {
    authStore
      .getSessionPrivilege()
      .then(() => {
        allowRouterToNavigate(to, next, authStore);
      })
      .catch(() => {
        console.log('Failed to obtain current Roles, logging out.');
        authStore.logout();
      });
  } else {
    allowRouterToNavigate(to, next, authStore);
  }
});

export default router;
