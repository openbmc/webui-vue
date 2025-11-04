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
      // The following parameters are accepted but not used by the window.confirm() shim.
      // They will be used when the proper Bootstrap 5 modal is implemented:
      // - title: Modal title text
      // - okTitle: OK/Confirm button text
      // - cancelTitle: Cancel button text
      // - okVariant: OK button Bootstrap variant (e.g., 'danger', 'primary')
      // - cancelVariant: Cancel button Bootstrap variant (e.g., 'secondary')
      // - autoFocusButton: Which button to focus ('ok' or 'cancel')
      // - processing: Show processing state with progress bar
      // - processingText: Processing state message
      // - processingMax: Processing progress bar maximum value
      //
      // Code can safely pass these parameters now and they will work when the
      // proper modal implementation is added.
      const result = window.confirm(message);

      // Resolve the promise with result
      if (options.resolve) {
        options.resolve(result);
      }
    },
  },
};
</script>
