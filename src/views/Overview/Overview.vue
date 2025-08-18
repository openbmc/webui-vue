<template>
  <b-container fluid="xl">
    <page-title />
    <overview-quick-links class="mb-4" />
    <page-section
      :section-title="$t('pageOverview.systemInformation')"
      class="mb-1"
    >
      <b-row class="row-cols-1 row-cols-md-2">
        <b-col class="mb-3">
          <overview-server class="h-100" />
        </b-col>
        <b-col class="mb-3">
          <overview-firmware class="h-100" />
        </b-col>
      </b-row>
      <b-row class="row-cols-1 row-cols-md-2">
        <b-col class="mb-3">
          <overview-network class="h-100" />
        </b-col>
        <b-col class="mb-3">
          <overview-power class="h-100" />
        </b-col>
      </b-row>
    </page-section>
    <page-section :section-title="$t('pageOverview.statusInformation')">
      <b-row class="row-cols-1 row-cols-md-2">
        <b-col class="mb-3">
          <overview-events class="h-100" />
        </b-col>
        <b-col class="mb-3">
          <overview-inventory class="h-100" />
        </b-col>
        <b-col v-if="showDumps" class="mb-3">
          <overview-dumps class="h-100" />
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import OverviewDumps from './OverviewDumps.vue';
import OverviewEvents from './OverviewEvents.vue';
import OverviewFirmware from './OverviewFirmware.vue';
import OverviewInventory from './OverviewInventory.vue';
import OverviewNetwork from './OverviewNetwork';
import OverviewPower from './OverviewPower';
import OverviewQuickLinks from './OverviewQuickLinks';
import OverviewServer from './OverviewServer';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';

export default {
  name: 'Overview',
  components: {
    OverviewDumps,
    OverviewEvents,
    OverviewFirmware,
    OverviewInventory,
    OverviewNetwork,
    OverviewPower,
    OverviewQuickLinks,
    OverviewServer,
    PageSection,
    PageTitle,
  },
  mixins: [LoadingBarMixin],
  data() {
    return {
      showDumps: process.env.VUE_APP_ENV_NAME === 'ibm',
      // Promise resolvers
      dumpsResolver: null,
      eventsResolver: null,
      selResolver: null,
      firmwareResolver: null,
      inventoryResolver: null,
      networkResolver: null,
      powerResolver: null,
      quicklinksResolver: null,
      serverResolver: null,
    };
  },
  created() {
    this.startLoader();

    const dumpsPromise = new Promise((resolve) => {
      this.dumpsResolver = resolve;
      this.$eventBus.on('overview-dumps-complete', () => resolve());
    });

    const eventsPromise = new Promise((resolve) => {
      this.eventsResolver = resolve;
      this.$eventBus.on('overview-events-complete', () => resolve());
    });

    const firmwarePromise = new Promise((resolve) => {
      this.firmwareResolver = resolve;
      this.$eventBus.on('overview-firmware-complete', () => resolve());
    });

    const inventoryPromise = new Promise((resolve) => {
      this.inventoryResolver = resolve;
      this.$eventBus.on('overview-inventory-complete', () => resolve());
    });

    const networkPromise = new Promise((resolve) => {
      this.networkResolver = resolve;
      this.$eventBus.on('overview-network-complete', () => resolve());
    });

    const powerPromise = new Promise((resolve) => {
      this.powerResolver = resolve;
      this.$eventBus.on('overview-power-complete', () => resolve());
    });

    const quicklinksPromise = new Promise((resolve) => {
      this.quicklinksResolver = resolve;
      this.$eventBus.on('overview-quicklinks-complete', () => resolve());
    });

    const serverPromise = new Promise((resolve) => {
      this.serverResolver = resolve;
      this.$eventBus.on('overview-server-complete', () => resolve());
    });

    const promises = [
      eventsPromise,
      firmwarePromise,
      inventoryPromise,
      networkPromise,
      powerPromise,
      quicklinksPromise,
      serverPromise,
    ];
    if (this.showDumps) promises.push(dumpsPromise);
    Promise.all(promises).finally(() => {
      this.endLoader();
    });
  },
  beforeUnmount() {
    // Clean up event listeners
    this.$eventBus.off('overview-dumps-complete', this.handleDumpsComplete);
    this.$eventBus.off('overview-events-complete', this.handleEventsComplete);
    this.$eventBus.off('overview-sel-complete', this.handleSelComplete);
    this.$eventBus.off(
      'overview-firmware-complete',
      this.handleFirmwareComplete,
    );
    this.$eventBus.off(
      'overview-inventory-complete',
      this.handleInventoryComplete,
    );
    this.$eventBus.off('overview-network-complete', this.handleNetworkComplete);
    this.$eventBus.off('overview-power-complete', this.handlePowerComplete);
    this.$eventBus.off(
      'overview-quicklinks-complete',
      this.handleQuicklinksComplete,
    );
    this.$eventBus.off('overview-server-complete', this.handleServerComplete);
  },
  methods: {
    handleDumpsComplete() {
      if (this.dumpsResolver) this.dumpsResolver();
    },
    handleEventsComplete() {
      if (this.eventsResolver) this.eventsResolver();
    },
    handleSelComplete() {
      if (this.selResolver) this.selResolver();
    },
    handleFirmwareComplete() {
      if (this.firmwareResolver) this.firmwareResolver();
    },
    handleInventoryComplete() {
      if (this.inventoryResolver) this.inventoryResolver();
    },
    handleNetworkComplete() {
      if (this.networkResolver) this.networkResolver();
    },
    handlePowerComplete() {
      if (this.powerResolver) this.powerResolver();
    },
    handleQuicklinksComplete() {
      if (this.quicklinksResolver) this.quicklinksResolver();
    },
    handleServerComplete() {
      if (this.serverResolver) this.serverResolver();
    },
  },
};
</script>
