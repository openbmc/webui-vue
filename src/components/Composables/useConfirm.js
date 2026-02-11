/**
 * Composable for confirmation dialogs
 */

import { getCurrentInstance } from 'vue';

export function useConfirm() {
  const instance = getCurrentInstance();

  if (!instance) {
    console.error('useConfirm must be called during component setup');
    return { confirm: () => Promise.resolve(false) };
  }

  // Access $confirm via appContext.config.globalProperties so it works
  // correctly from both Options API components and <script setup>.
  // Accessing it through instance.proxy can silently return undefined in
  // <script setup> because the public proxy handles globalProperties via
  // a different lookup path.
  const $confirm = instance.appContext.config.globalProperties.$confirm;

  const confirm = (message, options) => {
    if (!$confirm) {
      console.error('$confirm is not available on globalProperties');
      return Promise.resolve(false);
    }
    return $confirm(message, options);
  };

  return { confirm };
}
