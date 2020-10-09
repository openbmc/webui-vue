import StatusIcon from './StatusIcon';
const BVToastMixin = {
  components: {
    StatusIcon
  },
  methods: {
    toastTitle(title, status) {
      // Create title with icon
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toast-icon' },
        [
          this.$createElement('StatusIcon', { props: { status: status } }),
          title
        ]
      );
      return titleWithIcon;
    },
    successToast(message, title = 'Success') {
      this.$root.$bvToast.toast(message, {
        title: this.toastTitle(title, 'success'),
        variant: 'success',
        autoHideDelay: 10000, //auto hide in milliseconds
        isStatus: true,
        solid: true
      });
    },
    errorToast(message, title = 'Error') {
      this.$root.$bvToast.toast(message, {
        title: this.toastTitle(title, 'danger'),
        variant: 'danger',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    warningToast(message, title = 'Warning') {
      this.$root.$bvToast.toast(message, {
        title: this.toastTitle(title, 'warning'),
        variant: 'warning',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    infoToast(message, title = 'Informational') {
      this.$root.$bvToast.toast(message, {
        title: this.toastTitle(title, 'info'),
        variant: 'info',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    }
  }
};

export default BVToastMixin;
