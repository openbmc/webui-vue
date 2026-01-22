/**
 * Composable for table filtering utilities
 * Extracted from TableFilterMixin for use in Composition API
 */

export function useTableFilter() {
  const getFilteredTableData = (tableData = [], filters = []) => {
    const filterItems = filters.reduce((arr, filter) => {
      return [...arr, ...filter.values];
    }, []);
    // If no filters are active, then return all table data
    if (filterItems.length === 0) return tableData;

    const selectedValues = {};
    for (const { key, values } of filters) {
      if (values.length > 0) {
        selectedValues[key] = values;
      }
    }

    // Check if row property value is included in list of
    // active filters
    return tableData.filter((row) => {
      for (const [key, values] of Object.entries(selectedValues)) {
        const rowProperty = row[key];
        if (rowProperty && !values.includes(rowProperty)) {
          return false;
        }
      }
      return true;
    });
  };

  return {
    getFilteredTableData,
  };
}
