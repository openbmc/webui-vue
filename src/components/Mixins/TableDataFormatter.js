const TableDataFormatter = {
  methods: {
    tableFormatter(value) {
      if (value === undefined || value === null || value === '') {
        return '--';
      } else {
        return value;
      }
    },
    statusIcon(status) {
      switch (status) {
        case 'OK':
          return 'success';
        case 'Warning':
          return 'warning';
        case 'Critical':
          return 'danger';
        default:
          return '';
      }
    },
    tableFormatterArray(value) {
      return value.join(', ');
    }
  }
};

export default TableDataFormatter;
