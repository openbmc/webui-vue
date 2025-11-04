<template>
  <!-- Simplified ConfirmModal using native Window.confirm() -->
  <!-- This component preserves the API for future proper modal implementation -->
  <div style="display: none"></div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  data() {
    return {
      resolve: null,
    };
  },
  created() {
    const bus = require('@/eventBus').default;
    bus.$on('confirm:open', this.handleConfirm);
  },
  beforeUnmount() {
    require('@/eventBus').default.$off('confirm:open', this.handleConfirm);
  },
  methods: {
    handleConfirm(options) {
      // Extract message from options (could be string or object)
      const message =
        typeof options === 'string'
          ? options
          : options.message || 'Are you sure?';

      // Use native browser confirm for now
      // Future implementation will use proper Bootstrap modal with all option parameters:
      // - title, okTitle, cancelTitle
      // - okVariant, cancelVariant
      // - processing, processingText, processingMax
      const result = window.confirm(message);

      // Resolve the promise with result
      if (options.resolve) {
        options.resolve(result);
      }
    },
  },
};
</script>
