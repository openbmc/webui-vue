const LoadingBarMixin = {
  data() {
    return {
      loading: true,
    };
  },
  methods: {
    startLoader() {
      this.$root.$emit('loader-start');
      this.loading = true;
    },
    endLoader() {
      this.$root.$emit('loader-end');
      this.loading = false;
    },
    hideLoader() {
      this.$root.$emit('loader-hide');
    },
  },
};

export default LoadingBarMixin;
