/**
 * Authentication store seam.
 *
 * Exposes the auth surface as `useAuthStore()` at the import path
 * (`@/stores/auth`) and with the shape the project will use after migrating
 * to a standalone Pinia store alongside an openapi-ts client, where the store
 * is consumed both inside component setup and outside it (HTTP client
 * interceptors, router guards).
 *
 * Today it wraps the legacy Vuex `authentication` module via the store
 * singleton (not `useStore()`), so it is callable anywhere — just like the
 * eventual Pinia store. Consume it the Pinia way:
 *
 *   const authStore = useAuthStore();
 *   authStore.logout();
 *   const uri = authStore.sessionURI;            // reactive
 *   const sessionURI = computed(() => authStore.sessionURI);
 *
 * Avoid destructuring reactive state (`const { sessionURI } = useAuthStore()`)
 * so the swap to Pinia + `storeToRefs` stays a no-op for callers. When the
 * Vuex module is replaced by a real Pinia store, only this file changes.
 */

import { computed, reactive } from 'vue';
import store from '@/store';

/** Namespaced authentication getters. A typo here fails typecheck. */
interface AuthenticationGetters {
  'authentication/isLoggedIn': boolean;
  'authentication/token': string | undefined;
}

function authenticationGetter<K extends keyof AuthenticationGetters>(
  key: K,
): AuthenticationGetters[K] {
  return store.getters[key];
}

export function useAuthStore() {
  const authState = () => store.state.authentication;

  return reactive({
    /** `@odata.id` of the current Redfish session, or null when signed out. */
    sessionURI: computed<string | null>(() => authState().sessionURI),
    /** Whether a session is currently established. */
    isLoggedIn: computed<boolean>(() =>
      authenticationGetter('authentication/isLoggedIn'),
    ),
    /** Last login attempt error flag. */
    authError: computed<boolean>(() => authState().authError),
    /** XSRF token used to authenticate WebSocket subprotocol connections. */
    token: computed<string | undefined>(() =>
      authenticationGetter('authentication/token'),
    ),

    /**
     * Create a session on the BMC and populate auth state.
     * Resolves to `true` when the session requires a password change.
     */
    login: (username: string, password: string): Promise<boolean> =>
      store.dispatch('authentication/login', { username, password }),

    /**
     * Sign out. Resolves after the session DELETE has settled (a failed
     * DELETE is logged and does not reject), local auth state is cleared,
     * and the router has been asked to show /login.
     */
    logout: (): Promise<void> => store.dispatch('authentication/logout'),

    /** Refresh the current session's privilege/role from the BMC. */
    getSessionPrivilege: (): Promise<void> =>
      store.dispatch('authentication/getSessionPrivilege'),

    /** Re-sync auth flags from cookies (e.g. after an external login). */
    resetStoreState: (): Promise<void> =>
      store.dispatch('authentication/resetStoreState'),
  });
}
