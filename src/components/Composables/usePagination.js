/**
 * Composable for table pagination utilities
 * Extracted from BVPaginationMixin for use in Composition API
 */

import i18n from '@/i18n';

export const currentPage = 1;
export const perPage = 20;
export const itemsPerPageOptions = [
  { value: 10, text: '10' },
  { value: 20, text: '20' },
  { value: 30, text: '30' },
  { value: 40, text: '40' },
  { value: 0, text: i18n.global.t('global.table.viewAll') },
];

export function usePagination() {
  const getTotalRowCount = (count) => {
    return count;
  };

  return {
    currentPage,
    perPage,
    itemsPerPageOptions,
    getTotalRowCount,
  };
}
