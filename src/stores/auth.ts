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

export interface LoginCredentials {
  username: string;
  password: string;
}

/** Slice of Vuex root state this seam reads. Drop when auth becomes Pinia. */
interface AuthRootState {
  authentication: {
    sessionURI: string | null;
    authError: boolean;
  };
}

export function useAuthStore() {
  const authState = () => (store.state as AuthRootState).authentication;

  return reactive({
    /** `@odata.id` of the current Redfish session, or null when signed out. */
    sessionURI: computed<string | null>(() => authState().sessionURI),
    /** Whether a session is currently established. */
    isLoggedIn: computed<boolean>(
      () => store.getters['authentication/isLoggedIn'],
    ),
    /** Last login attempt error flag. */
    authError: computed<boolean>(() => authState().authError),
    /** XSRF token used to authenticate WebSocket subprotocol connections. */
    token: computed<string | undefined>(
      () => store.getters['authentication/token'],
    ),

    /** Create a session on the BMC and populate auth state. */
    login: (username: string, password: string): Promise<unknown> =>
      store.dispatch('authentication/login', { username, password }),

    /** Sign out: DELETE the session on the BMC, clear state, redirect to login. */
    logout: (): Promise<unknown> => store.dispatch('authentication/logout'),

    /** Refresh the current session's privilege/role from the BMC. */
    getSessionPrivilege: (): Promise<unknown> =>
      store.dispatch('authentication/getSessionPrivilege'),

    /** Re-sync auth flags from cookies (e.g. after an external login). */
    resetStoreState: (): Promise<unknown> =>
      store.dispatch('authentication/resetStoreState'),
  });
}
