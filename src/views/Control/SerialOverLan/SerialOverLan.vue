<template>
  <b-container fluid="xl">
    <page-title />
  </b-container>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
// import PageSection from '../../../components/Global/PageSection';
// import BVToastMixin from '../../../components/Mixins/BVToastMixin';
// import BootSettings from './BootSettings';
// import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'SerialOverLan',
  components: { PageTitle }
  //   mixins: [BVToastMixin, LoadingBarMixin],
  //   data() {
  //     return {
  //       form: {
  //         rebootOption: 'orderly',
  //         shutdownOption: 'orderly'
  //       }
  //     };
  //   },
  //   computed: {
  //     hostStatus() {
  //       return this.$store.getters['global/hostStatus'];
  //     },
  //     isOperationInProgress() {
  //       return this.$store.getters['controls/isOperationInProgress'];
  //     },
  //     oneTimeBootEnabled() {
  //       return this.$store.getters['hostBootSettings/overrideEnabled'];
  //     }
  //   },
  //   created() {
  //     this.startLoader();
  //   },
  //   beforeRouteLeave(to, from, next) {
  //     this.hideLoader();
  //     next();
  //   }
  //   methods: {
  //     powerOn() {
  //       this.$store.dispatch('controls/hostPowerOn');
  //     },
  //     rebootServer() {
  //       const modalMessage = this.$t(
  //         'pageServerPowerOperations.modal.confirmRebootMessage'
  //       );
  //       const modalOptions = {
  //         title: this.$t('pageServerPowerOperations.modal.confirmRebootTitle'),
  //         okTitle: this.$t('global.action.confirm')
  //       };

  //       if (this.form.rebootOption === 'orderly') {
  //         this.$bvModal
  //           .msgBoxConfirm(modalMessage, modalOptions)
  //           .then(confirmed => {
  //             if (confirmed) this.$store.dispatch('controls/hostSoftReboot');
  //           });
  //       } else if (this.form.rebootOption === 'immediate') {
  //         this.$bvModal
  //           .msgBoxConfirm(modalMessage, modalOptions)
  //           .then(confirmed => {
  //             if (confirmed) this.$store.dispatch('controls/hostHardReboot');
  //           });
  //       }
  //     },
  //     shutdownServer() {
  //       const modalMessage = this.$t(
  //         'pageServerPowerOperations.modal.confirmShutdownMessage'
  //       );
  //       const modalOptions = {
  //         title: this.$t('pageServerPowerOperations.modal.confirmShutdownTitle'),
  //         okTitle: this.$t('global.action.confirm')
  //       };

  //       if (this.form.shutdownOption === 'orderly') {
  //         this.$bvModal
  //           .msgBoxConfirm(modalMessage, modalOptions)
  //           .then(confirmed => {
  //             if (confirmed) this.$store.dispatch('controls/hostSoftPowerOff');
  //           });
  //       }
  //       if (this.form.shutdownOption === 'immediate') {
  //         this.$bvModal
  //           .msgBoxConfirm(modalMessage, modalOptions)
  //           .then(confirmed => {
  //             if (confirmed) this.$store.dispatch('controls/hostHardPowerOff');
  //           });
  //       }
  //     }
  //   }
};
</script>
