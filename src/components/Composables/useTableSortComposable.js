const STATUS = ['OK', 'Warning', 'Critical'];

const useTableSortComposable = () =>{
  const sortStatus = (a, b, key) => {
      return STATUS.indexOf(a[key]) - STATUS.indexOf(b[key]);
    }
    return {
      sortStatus
    }
};

export default useTableSortComposable;
