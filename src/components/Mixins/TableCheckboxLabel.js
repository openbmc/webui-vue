const TableCheckboxLabel = {
  data() {
    return {
      checkboxLabel: this.$t('global.table.selectItem'),
      indeterminateLabel: this.$t('global.table.selectAll'),
    };
  },
  methods: {
    toggleCheckbox(row) {
      row.rowSelected
        ? (this.checkboxLabel = this.$t('global.table.selectItem'))
        : (this.checkboxLabel = this.$t('global.table.unselectItem'));
    },
    toggleIndeterminateCheckbox() {
      let indeterminateSelections = this.$refs.table._data.selectedRows.length;

      if (indeterminateSelections) {
        this.indeterminateLabel = this.$t('global.table.unselectAll');
        this.checkboxLabel = this.$t('global.table.unselectItem');
      } else {
        this.indeterminateLabel = this.$t('global.table.selectAll');
        this.checkboxLabel = this.$t('global.table.selectItem');
      }
    },
  },
};

export default TableCheckboxLabel;
