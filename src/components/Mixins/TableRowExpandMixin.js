const TableRowExpandMixin = {
  data() {
    return {
      expandRowLabel: this.$t('global.table.expandTableRow'),
    };
  },
  methods: {
    toggleRowDetails(row) {
      row.toggleDetails();
      row.detailsShowing
        ? (this.expandRowLabel = this.$t('global.table.expandTableRow'))
        : (this.expandRowLabel = this.$t('global.table.collapseTableRow'));
    },
  },
};

export default TableRowExpandMixin;
