/**
 * Composable for confirmation dialogs
 * Replaces getCurrentInstance() / proxy.$confirm pattern
 */

import { getCurrentInstance } from 'vue';

export function useConfirm() {
  // Capture the instance during setup phase (when useConfirm is called)
  const instance = getCurrentInstance();
  
  if (!instance) {
    console.error('useConfirm must be called during component setup');
    return {
      confirm: () => Promise.resolve(false),
    };
  }
  
  const proxy = instance.proxy;

  const confirm = (message, options) => {
    if (!proxy?.$confirm) {
      console.error('$confirm is not available on component instance');
      return Promise.resolve(false);
    }
    return proxy.$confirm(message, options);
  };

  return {
    confirm,
  };
}
