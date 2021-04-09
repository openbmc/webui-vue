<template>
  <b-container fluid="xl">
    <page-title />

    <!-- System table -->
    <table-system />

    <!-- BMC manager table -->
    <table-bmc-manager />

    <!-- Chassis table -->
    <table-chassis />

    <!-- DIMM slot table -->
    <table-dimm-slot />

    <!-- Fans table -->
    <table-fans />

    <!-- Power supplies table -->
    <table-power-supplies />

    <!-- Processors table -->
    <table-processors />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import TableSystem from './HardwareStatusTableSystem';
import TablePowerSupplies from './HardwareStatusTablePowerSupplies';
import TableDimmSlot from './HardwareStatusTableDimmSlot';
import TableFans from './HardwareStatusTableFans';
import TableBmcManager from './HardwareStatusTableBmcManager';
import TableChassis from './HardwareStatusTableChassis';
import TableProcessors from './HardwareStatusTableProcessors';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: {
    PageTitle,
    TableDimmSlot,
    TablePowerSupplies,
    TableSystem,
    TableFans,
    TableBmcManager,
    TableChassis,
    TableProcessors,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    // Hide loader if user navigates away from page
    // before requests complete
    this.hideLoader();
    next();
  },
  created() {
    this.startLoader();
    const systemTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-system-complete', () => resolve());
    });
    const bmcManagerTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-bmc-manager-complete', () => resolve());
    });
    const chassisTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-chassis-complete', () => resolve());
    });
    const dimmSlotTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-dimm-slot-complete', () => resolve());
    });
    const fansTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-fans-complete', () => resolve());
    });
    const powerSuppliesTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-power-supplies-complete', () =>
        resolve()
      );
    });
    const processorsTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-processors-complete', () => resolve());
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      systemTablePromise,
      bmcManagerTablePromise,
      chassisTablePromise,
      dimmSlotTablePromise,
      fansTablePromise,
      powerSuppliesTablePromise,
      processorsTablePromise,
    ]).finally(() => this.endLoader());
  },
};
</script>
