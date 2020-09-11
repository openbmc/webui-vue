import i18n from '@/i18n';
import StatusIcon from '../Global/StatusIcon';
const BVToastMixin = {
  components: {
    StatusIcon
  },
  methods: {
    successToast(message, title = i18n.t('global.status.success')) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toast-icon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'success' } }),
          title
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
    errorToast(message, title = i18n.t('global.status.error')) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toast-icon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'danger' } }),
          title
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
    warningToast(message, title = i18n.t('global.status.warning')) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toast-icon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'warning' } }),
          title
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
    infoToast(message, title = i18n.t('global.status.informational')) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toast-icon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'info' } }),
          title
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
