<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageNetwork.pageDescription')" />
    <!-- Global settings for all interfaces -->
    <network-global-settings />
    <!-- Interface tabs -->
    <page-section>
      <b-row>
        <b-col>
          <b-card no-body>
            <b-tabs
              active-nav-item-class="font-weight-bold"
              card
              content-class="mt-3"
            >
              <b-tab
                v-for="(data, index) in ethernetData"
                :key="data.Id"
                :title="data.Id"
                @click="getTabIndex(index)"
              >
                <!-- Interface settings -->
                <network-interface-settings :tab-index="tabIndex" />
                <!-- IPV4 table -->
                <table-ipv-4 :tab-index="tabIndex" />
                <!-- Static DNS table -->
                <table-dns :tab-index="tabIndex" />
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import NetworkGlobalSettings from './NetworkGlobalSettings.vue';
import NetworkInterfaceSettings from './NetworkInterfaceSettings.vue';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import TableIpv4 from './TableIpv4.vue';
import TableDns from './TableDns.vue';
import { mapState } from 'vuex';

export default {
  name: 'Network',
  components: {
    NetworkGlobalSettings,
    NetworkInterfaceSettings,
    PageSection,
    PageTitle,
    TableDns,
    TableIpv4,
  },
  mixins: [BVToastMixin, DataFormatterMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      loading,
      tabIndex: 0,
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  created() {
    this.startLoader();
    const globalSettings = new Promise((resolve) => {
      this.$root.$on('network-global-settings-complete', () => resolve());
    });
    const interfaceSettings = new Promise((resolve) => {
      this.$root.$on('network-interface-settings-complete', () => resolve());
    });
    const networkTableDns = new Promise((resolve) => {
      this.$root.$on('network-table-dns-complete', () => resolve());
    });
    const networkTableIpv4 = new Promise((resolve) => {
      this.$root.$on('network-table-ipv4-complete', () => resolve());
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      this.$store.dispatch('network/getEthernetData'),
      globalSettings,
      interfaceSettings,
      networkTableDns,
      networkTableIpv4,
    ]).finally(() => this.endLoader());
  },
  methods: {
    getTabIndex(selectedIndex) {
      this.tabIndex = selectedIndex;
      const selectedInterfaceId = this.ethernetData[this.tabIndex].Id;
      this.$store.commit('network/setSelectedInterfaceId', selectedInterfaceId);
      this.$store.commit('network/setSelectedInterfaceIndex', this.tabIndex);
    },
  },
};
</script>
