const BVToastMixin = {
  methods: {
    successToast(message) {
      this.$root.$bvToast.toast(message, {
        title: 'Success',
        variant: 'success',
        autoHideDelay: 10000, //auto hide in milliseconds
        isStatus: true,
        solid: true
      });
    },
    errorToast(message) {
      this.$root.$bvToast.toast(message, {
        title: 'Error',
        variant: 'danger',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    }
  }
};

export default BVToastMixin;
