import i18n from '@/i18n';
export const expandRowLabel = i18n.global.t('global.table.expandTableRow');

const TableRowExpandMixin = {
  methods: {
    toggleRowDetails(row) {
      row.toggleDetails();
      // When details are shown, label should instruct to collapse; otherwise, expand
      this.expandRowLabel = row.detailsShowing
        ? i18n.global.t('global.table.collapseTableRow')
        : i18n.global.t('global.table.expandTableRow');
    },
  },
};

export default TableRowExpandMixin;
