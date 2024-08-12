export const loading = true;

const LoadingBarMixin = {
  methods: {
    progressLoader(percents) {
      this.$root.$emit('loader-start', percents);
      this.loading = true;
    },
    startLoader() {
      this.$root.$emit('loader-start', [0, 100]);
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
