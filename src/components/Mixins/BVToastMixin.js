import i18n from '@/i18n';
import Checkmark20 from '@carbon/icons-vue/es/checkmark/20';
import IconWarning from '@carbon/icons-vue/es/warning--filled/20';
import IconError from '@carbon/icons-vue/es/error--filled/20';
const BVToastMixin = {
  methods: {
    successToast(message, title) {
      title = this.$createElement('strong', { class: ['toastIcon'] }, [
        i18n.t('global.status.success'),
        this.$createElement('checkmark20')
      ]);
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'success',
        autoHideDelay: 10000, //auto hide in milliseconds
        isStatus: true,
        solid: true
      });
    },
    errorToast(message, title) {
      title = this.$createElement('strong', { class: ['toastIcon'] }, [
        i18n.t('global.status.error'),
        this.$createElement('IconError')
      ]);
      this.$root.$bvToast.toast([message], {
        title,
        variant: 'danger',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    warningToast(message, title) {
      title = this.$createElement('strong', { class: ['toastIcon'] }, [
        i18n.t('global.status.warning'),
        this.$createElement('IconWarning')
      ]);
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'warning',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    },
    infoToast(message, title = i18n.t('global.status.informational')) {
      this.$root.$bvToast.toast(message, {
        title,
        variant: 'info',
        noAutoHide: true,
        isStatus: true,
        solid: true
      });
    }
  },
  components: {
    Checkmark20,
    IconWarning,
    IconError
  }
};

export default BVToastMixin;
