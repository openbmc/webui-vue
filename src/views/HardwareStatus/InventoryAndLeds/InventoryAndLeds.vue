<template>
  <b-container fluid="xl">
    <page-title />

    <!-- Quicklinks section -->
    <page-section :section-title="$t('pageInventoryAndLeds.quicklinkTitle')">
      <b-row class="w-75">
        <b-col v-for="column in quicklinkColumns" :key="column.id" xl="4">
          <div v-for="item in column" :key="item.id">
            <b-link
              :href="item.href"
              :data-ref="item.dataRef"
              @click.prevent="scrollToOffset"
            >
              <jump-link /> {{ item.linkText }}
            </b-link>
          </div>
        </b-col>
      </b-row>
    </page-section>

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
import TableSystem from './InventoryAndLedsTableStystem';
import TablePowerSupplies from './InventoryAndLedsTablePowerSupplies';
import TableDimmSlot from './InventoryAndLedsTableDimmSlot';
import TableFans from './InventoryAndLedsTableFans';
import TableBmcManager from './InventoryAndLedsTableBmcManager';
import TableChassis from './InventoryAndLedsTableChassis';
import TableProcessors from './InventoryAndLedsTableProcessors';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import JumpLink16 from '@carbon/icons-vue/es/jump-link/16';

import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';

import { chunk } from 'lodash';

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
    PageSection,
    JumpLink: JumpLink16,
  },
  mixins: [LoadingBarMixin, JumpLinkMixin],
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
          linkText: this.$t('pageInventoryAndLeds.bmcManager'),
        },
        {
          id: 'chassis',
          dataRef: 'chassis',
          href: '#chassis',
          linkText: this.$t('pageInventoryAndLeds.chassis'),
        },
        {
          id: 'dimms',
          dataRef: 'dimms',
          href: '#dimms',
          linkText: this.$t('pageInventoryAndLeds.dimmSlot'),
        },
        {
          id: 'fans',
          dataRef: 'fans',
          href: '#fans',
          linkText: this.$t('pageInventoryAndLeds.fans'),
        },
        {
          id: 'powerSupply',
          dataRef: 'powerSupply',
          href: '#powerSupply',
          linkText: this.$t('pageInventoryAndLeds.powerSupplies'),
        },
        {
          id: 'processors',
          dataRef: 'processors',
          href: '#processors',
          linkText: this.$t('pageInventoryAndLeds.processors'),
        },
        {
          id: 'system',
          dataRef: 'system',
          href: '#system',
          linkText: this.$t('pageInventoryAndLeds.system'),
        },
      ],
    };
  },
  computed: {
    quicklinkColumns() {
      // Chunk links array to 3 array's to display 3 items per column
      return chunk(this.links, 3);
    },
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
