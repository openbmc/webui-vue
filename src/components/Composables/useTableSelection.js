/**
 * Composable for table selection utilities
 * Extracted from BVTableSelectableMixin for use in Composition API
 */

import { ref, nextTick, watch } from 'vue';

export function useTableSelection(currentPage = ref(1)) {
  const selectedRows = ref([]);
  const tableHeaderCheckboxModel = ref(false);
  const tableHeaderCheckboxIndeterminate = ref(false);

  // Watch for page changes and clear selections
  // This prevents confusion with checkboxes appearing checked on the new page
  watch(currentPage, (newPage, oldPage) => {
    if (newPage !== oldPage) {
      selectedRows.value = [];
      tableHeaderCheckboxModel.value = false;
      tableHeaderCheckboxIndeterminate.value = false;
    }
  });

  const clearSelectedRows = (tableRef) => {
    if (tableRef) {
      tableRef.clearSelected();
      selectedRows.value = [];
      tableHeaderCheckboxModel.value = false;
      tableHeaderCheckboxIndeterminate.value = false;
    }
  };

  const toggleSelectRow = (tableRef, rowIndex) => {
    if (tableRef && rowIndex !== undefined) {
      const wasSelected = tableRef.isRowSelected(rowIndex);

      if (wasSelected) {
        tableRef.unselectRow(rowIndex);
      } else {
        tableRef.selectRow(rowIndex);
      }

      nextTick(() => {
        onRowSelected(tableRef);
      });
    }
  };

  const onRowSelected = (tableRef) => {
    if (!tableRef) return;

    const allItems = tableRef.filteredItems || tableRef.items || [];
    const selectedItems = allItems.filter((item, index) => {
      return tableRef.isRowSelected(index);
    });

    selectedRows.value = selectedItems;

    const currentPage = 1;
    const perPage = allItems.length;
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, allItems.length);
    const pageItemsCount = endIndex - startIndex;

    const selectedOnPageCount = selectedItems.filter((item) =>
      allItems
        .slice(startIndex, endIndex)
        .some((pageItem) => pageItem === item),
    ).length;

    if (selectedOnPageCount === 0) {
      tableHeaderCheckboxIndeterminate.value = false;
      tableHeaderCheckboxModel.value = false;
    } else if (selectedOnPageCount === pageItemsCount) {
      tableHeaderCheckboxIndeterminate.value = false;
      tableHeaderCheckboxModel.value = true;
    } else {
      tableHeaderCheckboxIndeterminate.value = true;
      tableHeaderCheckboxModel.value = true;
    }
  };

  const onChangeHeaderCheckbox = (tableRef, event) => {
    /*
     * Bootstrap Vue Next Migration:
     * Handle header checkbox to select/deselect all rows on current page.
     */
    if (!tableRef) return;

    // Extract checked state from event (could be boolean or Event object)
    const isChecked =
      typeof event === 'boolean' ? event : event?.target?.checked;

    if (isChecked) {
      // Select all rows on the current page
      const allItems = tableRef.filteredItems || tableRef.items || [];
      const endIndex = allItems.length;

      for (let i = 0; i < endIndex; i++) {
        tableRef.selectRow(i);
      }
    } else {
      tableRef.clearSelected();
      selectedRows.value = [];
      tableHeaderCheckboxModel.value = false;
      tableHeaderCheckboxIndeterminate.value = false;
    }
  };

  return {
    selectedRows,
    tableHeaderCheckboxModel,
    tableHeaderCheckboxIndeterminate,
    clearSelectedRows,
    toggleSelectRow,
    onRowSelected,
    onChangeHeaderCheckbox,
  };
}
