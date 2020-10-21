const SearchFilterMixin = {
  data() {
    return {
      searchFilter: null,
    };
  },
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
