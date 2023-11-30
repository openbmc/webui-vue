export function VuelidateMixin() {
  function getValidationState(model) {
    const { $dirty, $error } = model;
    return $dirty ? !$error : null;
  }
  return {
    getValidationState,
  };
}
