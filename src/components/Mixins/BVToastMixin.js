import i18n from '../../i18n';

const BVToastMixin = {
  methods: {
    successToast(message, title = i18n.t('global.response.success')) {
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'success',
        autoHideDelay: 10000, //auto hide in milliseconds
        isStatus: true,
        solid: true
      });
    },
    errorToast(message, title = i18n.t('global.response.error')) {
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'danger',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    warningToast(message, title = i18n.t('global.response.warning')) {
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'warning',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    }
  }
};

export default BVToastMixin;
