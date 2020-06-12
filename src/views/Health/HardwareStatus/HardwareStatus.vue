<template>
  <b-container fluid="xl">
    <page-title />

    <!-- System table -->
    <table-system />

    <!-- BMC manager table -->
    <table-bmc-manager />

    <!-- Chassis table -->
    <table-chassis />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import TableSystem from './HardwareStatusTableStystem';
import TableBmcManager from './HardwareStatusTableBmcManager';
import TableChassis from './HardwareStatusTableChassis';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: {
    PageTitle,
    TableSystem,
    TableBmcManager,
    TableChassis
  },
  mixins: [LoadingBarMixin],
  created() {
    this.startLoader();
    const systemTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::system::complete', () => resolve());
    });
    const bmcManagerTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::bmcManager::complete', () => resolve());
    });
    const chassisTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::chassis::complete', () => resolve());
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      systemTablePromise,
      bmcManagerTablePromise,
      chassisTablePromise
    ]).finally(() => this.endLoader());
  },
  beforeRouteLeave(to, from, next) {
    // Hide loader if user navigates away from page
    // before requests complete
    this.hideLoader();
    next();
  }
};
</script>
