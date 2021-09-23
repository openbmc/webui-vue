<template>
  <b-container fluid="xl">
    <page-title />
    <overview-quick-links class="mb-4" />
    <page-section
      :section-title="$t('pageOverview.systemInformation')"
      class="mb-1"
    >
      <b-card-group deck>
        <overview-server />
        <overview-firmware />
      </b-card-group>
      <b-card-group deck>
        <overview-network />
        <overview-power />
      </b-card-group>
    </page-section>
    <page-section :section-title="$t('pageOverview.statusInformation')">
      <b-card-group deck>
        <overview-events />
        <overview-inventory />
        <overview-dumps v-if="showDumps" />
      </b-card-group>
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
import SystemStore from '@/store/modules/HardwareStatus/SystemStore';
import GlobalStore from '@/store/modules/GlobalStore';
import { isTruthly } from '../../utilities/IsTruthly';

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
      loaded: {
        dumps: false,
        events: false,
        firmware: false,
        inventory: false,
        network: false,
        power: false,
        server: false,
        system: false,
        bmcTime: false,
      },
    };
  },
  computed: {
    systemInfoLoaded() {
      return this.$store.getters[SystemStore.getters.loaded];
    },
    bmcTimeLoaded() {
      return this.$store.getters[GlobalStore.getters.loaded];
    },
  },

  watch: {
    systemInfoLoaded(loaded) {
      this.setLoaded('system', loaded);
    },
    loaded(loaded) {
      if (isTruthly(loaded)) {
        this.endLoader();
      }
    },
    bmcTimeLoaded(loaded) {
      this.setLoaded('bmcTime', loaded.bmcTime);
    },
  },
  created() {
    this.startLoader();
    ['events', 'firmware', 'inventory', 'network', 'power', 'server'].forEach(
      (property) => {
        this.$root.$on(`overview-${property}-complete`, () =>
          this.setLoaded(property, true)
        );
      }
    );

    this.$store
      .dispatch(`firmware/getFirmwareInformation`)
      .then(() => this.setLoaded('firmware', true));

    this.$store
      .dispatch('powerControl/getPowerControl')
      .then(() => this.setLoaded('firmware', true));

    if (!this.showDumps) {
      this.setLoaded('dumps', true);
      return;
    }

    this.$root.$on('overview-dumps-complete', () =>
      this.setLoaded('dupms', true)
    );
  },
  methods: {
    setLoaded(parameter, loaded) {
      this.loaded = {
        ...this.loaded,
        [parameter]: loaded,
      };
    },
  },
};
</script>
