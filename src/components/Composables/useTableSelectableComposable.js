export var selectedRows = [];
export var tableHeaderCheckboxModel = false;
export var tableHeaderCheckboxIndeterminate = false;

const useTableSelectableComposable = () => {
  const clearSelectedRows = (tableRef) => {
    if (tableRef) tableRef.clearSelected();
  };

  const toggleSelectRow = (tableRef, rowIndex) => {
    if (tableRef && rowIndex !== undefined) {
      tableRef.isRowSelected(rowIndex)
        ? tableRef.unselectRow(rowIndex)
        : tableRef.selectRow(rowIndex);
    }
  };
  const onRowSelected = (selectedRows, totalRowsCount) => {
    if (selectedRows && totalRowsCount !== undefined) {
      selectedRows = selectedRows;
      if (selectedRows.length === 0) {
        tableHeaderCheckboxIndeterminate = false;
        tableHeaderCheckboxModel = false;
      } else if (selectedRows.length === totalRowsCount) {
        tableHeaderCheckboxIndeterminate = false;
        tableHeaderCheckboxModel = true;
      } else {
        tableHeaderCheckboxIndeterminate = true;
        tableHeaderCheckboxModel = true;
      }
    }
  };
  const onChangeHeaderCheckbox = (tableRef, tableHeaderCheckbox) => {
    tableHeaderCheckboxModel = tableHeaderCheckbox;
    if (tableRef) {
      if (tableHeaderCheckboxModel) tableRef.selectAllRows();
      else tableRef.clearSelected();
    }
  };
  return {
    clearSelectedRows,
    toggleSelectRow,
    onRowSelected,
    onChangeHeaderCheckbox,
    selectedRows,
    tableHeaderCheckboxModel,
    tableHeaderCheckboxIndeterminate,
  };
};

export default useTableSelectableComposable;
