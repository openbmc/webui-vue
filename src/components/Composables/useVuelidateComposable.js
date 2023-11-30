const useVuelidateComposable = () =>{
  const  getValidationState = (model) => {
    const { $dirty, $error } = model;
    return $dirty ? !$error : null;
  }
    return {
        getValidationState
    }
};

export default useVuelidateComposable;
