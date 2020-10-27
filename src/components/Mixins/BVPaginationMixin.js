export const currentPage = 1;
export const perPage = 20;

const BVPaginationMixin = {
  data() {
    return {
      itemsPerPageOptions: [
        {
          value: 10,
          text: '10'
        },
        {
          value: 20,
          text: '20'
        },
        {
          value: 30,
          text: '30'
        },
        {
          value: 40,
          text: '40'
        },
        {
          value: 0,
          text: this.$t('global.table.viewAll')
        }
      ]
    };
  },
  methods: {
    getTotalRowCount(count) {
      return this.perPage === 0 ? 0 : count;
    }
  }
};

export default BVPaginationMixin;
