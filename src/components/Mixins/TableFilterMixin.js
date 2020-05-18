import { includes } from 'lodash';

const TableFilterMixin = {
  methods: {
    getFilteredTableData(tableData = [], filters = []) {
      if (filters.length === 0) return tableData;
      // will return all items that match
      // any of the filter tags (not all)
      return tableData.filter(row => {
        let returnRow = false;
        for (const filter of filters) {
          if (includes(row, filter)) {
            returnRow = true;
            break;
          }
        }
        return returnRow;
      });
    },
    getFilteredTableDataByDate(
      tableData = [],
      startDate,
      endDate,
      propertyKey = 'date'
    ) {
      if (!startDate && !endDate) return tableData;
      const startDateInMs = startDate ? startDate.getTime() : 0;
      const endDateInMs = endDate
        ? endDate.getTime()
        : Number.POSITIVE_INFINITY;
      return tableData.filter(row => {
        const date = row[propertyKey];
        if (!(date instanceof Date)) return;

        const dateInMs = date.getTime();
        if (dateInMs >= startDateInMs && dateInMs <= endDateInMs) return row;
      });
    }
  }
};

export default TableFilterMixin;
