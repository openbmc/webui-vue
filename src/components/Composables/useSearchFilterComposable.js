var searchFilter = null;

const useSearchFilterComposable = () => {
  const onChangeSearchInput = (searchValue) => {
    searchFilter = searchValue;
  };
  const onClearSearchInput = () => {
    searchFilter = null;
  };

  return {
    onChangeSearchInput,
    onClearSearchInput,
    searchFilter,
  };
};

export default useSearchFilterComposable;
