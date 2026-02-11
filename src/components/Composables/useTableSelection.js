/**
 * Composable for table selection utilities
 * Extracted from BVTableSelectableMixin for use in Composition API
 */

import { ref, nextTick, watch } from 'vue';

export function useTableSelection(
  currentPage = ref(1),
  perPage = ref(0),
  tableRef = null,
) {
  const selectedRows = ref([]);
  const tableHeaderCheckboxModel = ref(false);
  const tableHeaderCheckboxIndeterminate = ref(false);

  const getTable = () =>
    tableRef && typeof tableRef === 'object' && 'value' in tableRef
      ? tableRef.value
      : tableRef;

  // Watch for page changes (currentPage only) and clear selections
  // This prevents confusion with checkboxes appearing checked on the new page
  watch(
    () => (typeof currentPage === 'object' ? currentPage.value : currentPage),
    () => {
      const table = getTable();
      if (table && typeof table.clearSelected === 'function') {
        table.clearSelected();
      }
      selectedRows.value = [];
      tableHeaderCheckboxModel.value = false;
      tableHeaderCheckboxIndeterminate.value = false;
    },
  );

  // When items-per-page changes, keep existing selections and recalculate header checkbox state
  watch(
    () => (typeof perPage === 'object' ? perPage.value : perPage),
    () => {
      const table = getTable();
      if (table) {
        onRowSelected(table);
      }
    },
  );

  const getPageBounds = (allItems) => {
    const currPage = (typeof currentPage === 'object' ? currentPage.value : currentPage) || 1;
    const itemsPerPage = (typeof perPage === 'object' ? perPage.value : perPage) || 0;
    // perPage === 0 means "View all", so the page spans every item.
    const effectivePerPage = itemsPerPage === 0 ? allItems.length : itemsPerPage;
    const startIndex = (currPage - 1) * effectivePerPage;
    const endIndex = Math.min(startIndex + effectivePerPage, allItems.length);
    return { startIndex, endIndex };
  };

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

    const { startIndex, endIndex } = getPageBounds(allItems);
    const pageItemsCount = endIndex - startIndex;

    const selectedOnPageCount = selectedItems.filter((item) =>
      allItems
        .slice(startIndex, endIndex)
        .some((pageItem) => pageItem === item),
    ).length;

    if (selectedOnPageCount === 0 || pageItemsCount === 0) {
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

  const onChangeHeaderCheckbox = (tableRef, event, isRowSelectable = null) => {
    /*
     * Bootstrap Vue Next Migration:
     * Handle header checkbox to select/deselect all rows on current page.
     */
    if (!tableRef) return;

    const isChecked =
      typeof event === 'boolean' ? event : event?.target?.checked;

    if (isChecked) {
      const allItems = tableRef.filteredItems || tableRef.items || [];
      const { startIndex, endIndex } = getPageBounds(allItems);

      for (let i = startIndex; i < endIndex; i++) {
        if (!isRowSelectable || isRowSelectable(allItems[i])) {
          tableRef.selectRow(i);
        }
      }
    } else {
      tableRef.clearSelected();
      selectedRows.value = [];
      tableHeaderCheckboxModel.value = false;
      tableHeaderCheckboxIndeterminate.value = false;
    }

    nextTick(() => {
      onRowSelected(tableRef);
    });
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
