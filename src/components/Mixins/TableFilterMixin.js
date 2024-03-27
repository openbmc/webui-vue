const TableFilterMixin = {
  methods: {
    getFilteredTableData(tableData = [], filters = []) {
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
    },
    getFilteredTableDataByDate(
      tableData = [],
      startDate,
      endDate,
      propertyKey = 'date',
    ) {
      if (!startDate && !endDate) return tableData;
      let startDateInMs = startDate ? startDate.getTime() : 0;
      let endDateInMs = endDate ? endDate.getTime() : Number.POSITIVE_INFINITY;

      const isUtcDisplay = this.$store.getters['global/isUtcDisplay'];

      //Offset preference selected
      if (!isUtcDisplay) {
        startDateInMs = startDate
          ? startDate.getTime() + startDate.getTimezoneOffset() * 60000
          : 0;
        endDateInMs = endDate
          ? endDate.getTime() + endDate.getTimezoneOffset() * 60000
          : Number.POSITIVE_INFINITY;
      }

      return tableData.filter((row) => {
        const date = row[propertyKey];
        if (!(date instanceof Date)) return;
        const dateInMs = date.getTime();
        if (dateInMs >= startDateInMs && dateInMs <= endDateInMs) return row;
      });
    },
  },
};

export default TableFilterMixin;
