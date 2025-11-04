const VuelidateMixin = {
  methods: {
    getValidationState(model) {
      if (!model) return null;
      const { $dirty, $error } = model;
      return $dirty ? !$error : null;
    },
  },
};

export default VuelidateMixin;
