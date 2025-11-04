export const selectedRows = [];
export const tableHeaderCheckboxModel = false;
export const tableHeaderCheckboxIndeterminate = false;

const BVTableSelectableMixin = {
  data() {
    return {
      selectedRows: [],
      tableHeaderCheckboxModel: false,
      tableHeaderCheckboxIndeterminate: false,
    };
  },
  watch: {
    currentPage() {
      // Bootstrap Vue 2 behavior: Clear selections when page changes
      // This prevents confusion with checkboxes appearing checked on the new page
      const table = this.$refs.table;
      if (table) {
        table.clearSelected();
        this.selectedRows = [];
        this.tableHeaderCheckboxModel = false;
        this.tableHeaderCheckboxIndeterminate = false;
      }
    },
  },
  methods: {
    clearSelectedRows(tableRef) {
      if (tableRef) {
        tableRef.clearSelected();
        this.selectedRows = [];
        this.tableHeaderCheckboxModel = false;
        this.tableHeaderCheckboxIndeterminate = false;
      }
    },
    toggleSelectRow(tableRef, rowIndex) {
      if (tableRef && rowIndex !== undefined) {
        const wasSelected = tableRef.isRowSelected(rowIndex);

        if (wasSelected) {
          tableRef.unselectRow(rowIndex);
        } else {
          tableRef.selectRow(rowIndex);
        }

        // Manually trigger onRowSelected after toggle since unselectRow might not fire event
        this.$nextTick(() => {
          this.onRowSelected();
        });
      }
    },
    onRowSelected() {
      /*
       * Bootstrap Vue Next fires @row-selected for each individual row change.
       * Query the table's internal state to get ALL currently selected rows.
       */
      const table = this.$refs.table;
      if (!table) return;

      const allItems = table.filteredItems || table.items || [];
      const selectedItems = allItems.filter((item, index) => {
        return table.isRowSelected(index);
      });

      this.selectedRows = selectedItems;

      // Update header checkbox state
      const currentPage = this.currentPage || 1;
      const perPage = this.perPage || 10;
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = Math.min(startIndex + perPage, allItems.length);
      const pageItemsCount = endIndex - startIndex;

      const selectedOnPageCount = selectedItems.filter((item) =>
        allItems
          .slice(startIndex, endIndex)
          .some((pageItem) => pageItem === item),
      ).length;

      if (selectedOnPageCount === 0) {
        this.tableHeaderCheckboxIndeterminate = false;
        this.tableHeaderCheckboxModel = false;
      } else if (selectedOnPageCount === pageItemsCount) {
        this.tableHeaderCheckboxIndeterminate = false;
        this.tableHeaderCheckboxModel = true;
      } else {
        this.tableHeaderCheckboxIndeterminate = true;
        this.tableHeaderCheckboxModel = true;
      }
    },
    onChangeHeaderCheckbox(tableRef, event) {
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
        const currentPage = this.currentPage || 1;
        const perPage = this.perPage || 10;
        const startIndex = (currentPage - 1) * perPage;
        const allItems = tableRef.filteredItems || tableRef.items || [];
        const endIndex = Math.min(startIndex + perPage, allItems.length);

        for (let i = startIndex; i < endIndex; i++) {
          tableRef.selectRow(i);
        }
      } else {
        // Deselect all rows
        tableRef.clearSelected();
        // Manually trigger update since clearSelected might not fire @row-selected
        this.selectedRows = [];
        this.tableHeaderCheckboxModel = false;
        this.tableHeaderCheckboxIndeterminate = false;
      }

      // onRowSelected will be triggered automatically for selections
    },
  },
};

export default BVTableSelectableMixin;
