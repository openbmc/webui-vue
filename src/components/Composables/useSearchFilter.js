/**
 * Composable for search filter utilities
 * Extracted from SearchFilterMixin for use in Composition API
 */

import { ref } from 'vue';

export function useSearchFilter() {
  const searchFilter = ref('');
  const searchTotalFilteredRows = ref(0);

  function onChangeSearchInput(searchValue) {
    searchFilter.value = searchValue;
  }

  function onClearSearchInput() {
    searchFilter.value = '';
  }

  function onFiltered(filteredItems) {
    searchTotalFilteredRows.value = filteredItems.length;
  }

  return {
    searchFilter,
    searchTotalFilteredRows,
    onChangeSearchInput,
    onClearSearchInput,
    onFiltered,
  };
}
