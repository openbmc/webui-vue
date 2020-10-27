export const searchFilter = null;

const SearchFilterMixin = {
  methods: {
    onChangeSearchInput(searchValue) {
      this.searchFilter = searchValue;
    },
    onClearSearchInput() {
      this.searchFilter = null;
    },
  },
};

export default SearchFilterMixin;
