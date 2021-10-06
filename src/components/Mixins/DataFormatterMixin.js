const DataFormatterMixin = {
  methods: {
    dataFormatter(value) {
      if (value === undefined || value === null || value === '') {
        return '--';
      } else if (typeof value === 'number') {
        return parseFloat(value.toFixed(3));
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
    dataFormatterArray(value) {
      return value.join(', ');
    },
  },
};

export default DataFormatterMixin;
