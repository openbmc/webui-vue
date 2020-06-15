<template>
  <b-container fluid="xl">
    <page-title />

    <!-- System table -->
    <table-system />

    <!-- DIMM slot table -->
    <table-dimm-slot />

    <!-- Thermal table -->
    <table-thermal />

    <!-- Power supplies table -->
    <table-power-supplies />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import TableSystem from './HardwareStatusTableStystem';
import TablePowerSupplies from './HardwareStatusTablePowerSupplies';
import TableDimmSlot from './HardwareStatusTableDimmSlot';
import TableThermal from './HardwareStatusTableThermal';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: {
    PageTitle,
    TableDimmSlot,
    TablePowerSupplies,
    TableSystem,
    TableThermal
  },
  mixins: [LoadingBarMixin],
  created() {
    this.startLoader();
    const systemTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::system::complete', () => resolve());
    });
    const dimmSlotTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::dimmSlot::complete', () => resolve());
    });
    const thermalTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::thermal::complete', () => resolve());
    });
    const powerSuppliesTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::powerSupplies::complete', () =>
        resolve()
      );
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      systemTablePromise,
      dimmSlotTablePromise,
      thermalTablePromise,
      powerSuppliesTablePromise
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
