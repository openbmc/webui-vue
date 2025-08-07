export const loading = true;

const LoadingBarMixin = {
  methods: {
    startLoader() {
      this.$eventBus.emit('loader-start');
      this.loading = true;
    },
    endLoader() {
      this.$eventBus.emit('loader-end');
      this.loading = false;
    },
    hideLoader() {
      this.$eventBus.emit('loader-hide');
    },
  },
};

export default LoadingBarMixin;
