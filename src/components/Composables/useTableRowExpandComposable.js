import i18n from '@/i18n';
export const expandRowLabel = i18n.global.t('global.table.expandTableRow');

const useTableRowExpandComposable = () => {
    const toggleRowDetails = (row) => {
      row.toggleDetails();
      row.detailsShowing
        ? (expandRowLabel = t('global.table.expandTableRow'))
        : (expandRowLabel = t('global.table.collapseTableRow'));
    }
    return {
        toggleRowDetails
    }
};

export default useTableRowExpandComposable;