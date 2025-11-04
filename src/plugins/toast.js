import { useToast } from 'bootstrap-vue-next';

// Global toast plugin for Options API components
// Bootstrap Vue Next's useToast is a composable that needs setup() context
// This plugin makes it accessible globally via app.config.globalProperties

let toastController = null;

export const ToastPlugin = {
  install(app) {
    // Initialize toast controller in the app context
    // This will be called once during app setup
    app.mixin({
      beforeCreate() {
        // Only initialize once at the root
        if (!toastController && this === this.$root) {
          try {
            toastController = useToast();
          } catch (e) {
            console.warn('Failed to initialize toast controller:', e);
          }
        }
      },
    });

    // Provide global toast methods
    app.config.globalProperties.$toast = {
      show(options) {
        if (toastController?.create) {
          toastController.create(options);
        } else {
          console.warn('Toast controller not available:', options);
        }
      },
      info(body, options = {}) {
        this.show({
          ...options,
          body,
          props: {
            variant: 'info',
            isStatus: true,
            ...options.props,
          },
        });
      },
      success(body, options = {}) {
        this.show({
          ...options,
          body,
          props: {
            variant: 'success',
            isStatus: true,
            modelValue: 10000,
            ...options.props,
          },
        });
      },
      warning(body, options = {}) {
        this.show({
          ...options,
          body,
          props: {
            variant: 'warning',
            isStatus: true,
            ...options.props,
          },
        });
      },
      danger(body, options = {}) {
        this.show({
          ...options,
          body,
          props: {
            variant: 'danger',
            isStatus: true,
            ...options.props,
          },
        });
      },
    };
  },
};
