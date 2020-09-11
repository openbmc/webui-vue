import i18n from '@/i18n';
import StatusIcon from '../Global/StatusIcon';
const BVToastMixin = {
  components: {
    StatusIcon
  },
  methods: {
    successToast(message) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'success' } }),
          i18n.t('global.status.success')
        ]
      );
      this.$root.$bvToast.toast(message, {
        title: titleWithIcon,
        variant: 'success',
        autoHideDelay: 10000, //auto hide in milliseconds
        isStatus: true,
        solid: true
      });
    },
    errorToast(message) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'danger' } }),
          i18n.t('global.status.error')
        ]
      );
      this.$root.$bvToast.toast(message, {
        title: titleWithIcon,
        variant: 'danger',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    warningToast(message) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'warning' } }),
          i18n.t('global.status.warning')
        ]
      );
      this.$root.$bvToast.toast(message, {
        title: titleWithIcon,
        variant: 'warning',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    infoToast(message) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'info' } }),
          i18n.t('global.status.informational')
        ]
      );
      this.$root.$bvToast.toast(message, {
        title: titleWithIcon,
        variant: 'info',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    }
  }
};

export default BVToastMixin;
