export const selectedRows = [];
export const tableHeaderCheckboxModel = false;
export const tableHeaderCheckboxIndeterminate = false;

const BVTableSelectableMixin = {
  methods: {
    clearSelectedRows(tableRef) {
      if (tableRef) tableRef.clearSelected();
    },
    toggleSelectRow(tableRef, rowIndex) {
      if (tableRef && rowIndex !== undefined) {
        tableRef.isRowSelected(rowIndex)
          ? tableRef.unselectRow(rowIndex)
          : tableRef.selectRow(rowIndex);
      }
    },
    onRowSelected(selectedRows, totalRowsCount) {
      if (selectedRows && totalRowsCount !== undefined) {
        this.selectedRows = selectedRows;
        if (selectedRows.length === 0) {
          this.tableHeaderCheckboxIndeterminate = false;
          this.tableHeaderCheckboxModel = false;
        } else if (selectedRows.length === totalRowsCount) {
          this.tableHeaderCheckboxIndeterminate = false;
          this.tableHeaderCheckboxModel = true;
        } else {
          this.tableHeaderCheckboxIndeterminate = true;
          this.tableHeaderCheckboxModel = true;
        }
      }
    },
    onChangeHeaderCheckbox(tableRef) {
      if (tableRef) {
        if (this.tableHeaderCheckboxModel) tableRef.selectAllRows();
        else tableRef.clearSelected();
      }
    },
  },
};

export default BVTableSelectableMixin;
