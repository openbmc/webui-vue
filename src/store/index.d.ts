import type { Store } from 'vuex';

/**
 * Root Vuex state visible to TypeScript.
 *
 * Incomplete on purpose. Only modules a TS caller actually reads are
 * declared; the index signature leaves the remaining JS modules
 * accessible as `unknown`. Add a slice when another caller needs it.
 * This declaration goes away with the Pinia migration — it is not the
 * final typing for `@/store`.
 */
export interface RootState {
  authentication: {
    sessionURI: string | null;
    authError: boolean;
  };
  [module: string]: unknown;
}

declare const store: Store<RootState>;
export default store;
