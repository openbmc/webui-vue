const TableDataFormatter = {
  methods: {
    tableFormatter(value) {
      if (value === undefined || value === '') {
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
    }
  }
};

export default TableDataFormatter;
