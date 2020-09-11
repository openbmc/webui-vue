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
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'success' } }),
          i18n.t('global.status.success')
        ]
      );
      title = titleWithIcon;
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'success',
        autoHideDelay: 10000, //auto hide in milliseconds
        isStatus: true,
        solid: true
      });
    },
    errorToast(message, title = i18n.t('global.status.error')) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'danger' } }),
          i18n.t('global.status.error')
        ]
      );
      title = titleWithIcon;
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'danger',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    warningToast(message, title = i18n.t('global.status.warning')) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'warning' } }),
          i18n.t('global.status.warning')
        ]
      );
      title = titleWithIcon;
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'warning',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    infoToast(message, title = i18n.t('global.status.informational')) {
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toastIcon' },
        [
          this.$createElement('StatusIcon', { props: { status: 'info' } }),
          i18n.t('global.status.informational')
        ]
      );
      title = titleWithIcon;
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'info',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    }
  }
};

export default BVToastMixin;
