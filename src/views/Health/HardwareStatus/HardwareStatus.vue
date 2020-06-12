<template>
  <b-container fluid="xl">
    <page-title />

    <!-- System table -->
    <table-system />

    <!-- BMC manager table -->
    <table-bmc-manager />

    <!-- Chassis table -->
    <table-chassis />

    <!-- Motherboard table -->
    <table-motherboard />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import TableSystem from './HardwareStatusTableStystem';
import TableBmcManager from './HardwareStatusTableBmcManager';
import TableChassis from './HardwareStatusTableChassis';
import TableMotherboard from './HardwareStatusTableMotherboard';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: {
    PageTitle,
    TableSystem,
    TableBmcManager,
    TableChassis,
    TableMotherboard
  },
  mixins: [LoadingBarMixin],
  created() {
    this.startLoader();
    const systemTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::system::complete', () => resolve());
    });
    const chassisTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::chassis::complete', () => resolve());
    });
    const motherboardTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::motherboard::complete', () => resolve());
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      systemTablePromise,
      chassisTablePromise,
      motherboardTablePromise
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
