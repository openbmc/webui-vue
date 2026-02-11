/**
 * Composable for table pagination utilities
 * Extracted from BVPaginationMixin for use in Composition API
 */

import { ref, watch } from 'vue';
import i18n from '@/i18n';

export function usePagination() {
  const currentPage = ref(1);
  const perPage = ref(20);
  const itemsPerPageOptions = [
    { value: 10, text: '10' },
    { value: 20, text: '20' },
    { value: 30, text: '30' },
    { value: 40, text: '40' },
    { value: 0, text: i18n.global.t('global.table.viewAll') },
  ];

  const getTotalRowCount = (count) => {
    return perPage.value === 0 ? 0 : count;
  };

  watch(perPage, (newPerPage) => {
    if (newPerPage === 0) {
      currentPage.value = 1;
    }
  });

  return {
    currentPage,
    perPage,
    itemsPerPageOptions,
    getTotalRowCount,
  };
}
