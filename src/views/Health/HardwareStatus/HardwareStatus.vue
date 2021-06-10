<template>
  <b-container fluid="xl">
    <page-title />

    <!-- Service indicators -->
    <service-indicator />

    <!-- System table -->
    <table-system ref="system" />

    <!-- BMC manager table -->
    <table-bmc-manager ref="bmc" />

    <!-- Chassis table -->
    <table-chassis ref="chassis" />

    <!-- DIMM slot table -->
    <table-dimm-slot ref="dimms" />

    <!-- Fans table -->
    <table-fans ref="fans" />

    <!-- Power supplies table -->
    <table-power-supplies ref="powerSupply" />

    <!-- Processors table -->
    <table-processors ref="processors" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import ServiceIndicator from './ServiceIndicator';
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
    ServiceIndicator,
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
  data() {
    return {
      links: [
        {
          id: 'bmc',
          dataRef: 'bmc',
          href: '#bmc',
          linkText: this.$t('pageHardwareStatus.bmcManager'),
        },
        {
          id: 'chassis',
          dataRef: 'chassis',
          href: '#chassis',
          linkText: this.$t('pageHardwareStatus.chassis'),
        },
        {
          id: 'dimms',
          dataRef: 'dimms',
          href: '#dimms',
          linkText: this.$t('pageHardwareStatus.dimmSlot'),
        },
        {
          id: 'fans',
          dataRef: 'fans',
          href: '#fans',
          linkText: this.$t('pageHardwareStatus.fans'),
        },
        {
          id: 'powerSupply',
          dataRef: 'powerSupply',
          href: '#powerSupply',
          linkText: this.$t('pageHardwareStatus.powerSupplies'),
        },
        {
          id: 'processors',
          dataRef: 'processors',
          href: '#processors',
          linkText: this.$t('pageHardwareStatus.processors'),
        },
        {
          id: 'system',
          dataRef: 'system',
          href: '#system',
          linkText: this.$t('pageHardwareStatus.system'),
        },
      ],
    };
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
