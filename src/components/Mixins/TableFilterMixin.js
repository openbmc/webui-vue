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
    }
  }
};

export default TableFilterMixin;
