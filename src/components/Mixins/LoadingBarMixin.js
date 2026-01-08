import eventBus from '@/eventBus';

export const loading = true;

const LoadingBarMixin = {
  methods: {
    startLoader() {
      eventBus.$emit('loader-start');
      this.loading = true;
    },
    endLoader() {
      eventBus.$emit('loader-end');
      this.loading = false;
    },
    hideLoader() {
      eventBus.$emit('loader-hide');
    },
  },
};

export default LoadingBarMixin;
