export const loading = true;

const LoadingBarMixin = {
  methods: {
    startLoader() {
      require('@/eventBus').default.$emit('loader-start');
      this.loading = true;
    },
    endLoader() {
      require('@/eventBus').default.$emit('loader-end');
      this.loading = false;
    },
    hideLoader() {
      require('@/eventBus').default.$emit('loader-hide');
    },
  },
};

export default LoadingBarMixin;
