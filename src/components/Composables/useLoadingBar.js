/**
 * Composable for loading bar utilities
 * Extracted from LoadingBarMixin for use in Composition API
 */

import eventBus from '@/eventBus';
import { ref } from 'vue';

export function useLoadingBar() {
  const loading = ref(true);
  const startLoader = () => {
    eventBus.$emit('loader-start');
    loading.value = true;
  };

  const endLoader = () => {
    eventBus.$emit('loader-end');
    loading.value = false;
  };

  const hideLoader = () => {
    eventBus.$emit('loader-hide');
  };

  return {
    loading,
    startLoader,
    endLoader,
    hideLoader,
  };
}
