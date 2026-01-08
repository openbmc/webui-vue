<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageNetwork.pageDescription')" />
    <!-- Global settings for all interfaces -->
    <network-global-settings />
    <!-- Interface tabs -->
    <page-section v-if="ethernetData && ethernetData.length">
      <b-row>
        <b-col>
          <b-card no-body>
            <b-tabs
              :key="tabsRenderKey"
              v-model:index="tabIndex"
              active-nav-item-class="fw-bold"
              card
              content-class="mt-3"
              :lazy="false"
            >
              <b-tab
                v-for="data in ethernetData"
                :key="data.Id"
                :title="data.Id"
              >
                <!-- Interface settings -->
                <network-interface-settings :tab-index="tabIndex" />
                <!-- IPV4 table -->
                <table-ipv-4 :tab-index="tabIndex" />
                <!-- IPV6 table -->
                <table-ipv-6 :tab-index="tabIndex" />
                <!-- Static DNS table -->
                <table-dns :tab-index="tabIndex" />
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </page-section>
    <!-- Modals -->
    <modal-ipv4 :default-gateway="defaultGateway" @ok="saveIpv4Address" />
    <modal-ipv6 @ok="saveIpv6Address" />
    <modal-dns @ok="saveDnsAddress" />
    <modal-hostname
      v-model="showHostnameModal"
      :hostname="currentHostname"
      @ok="saveSettings"
    />
    <modal-mac-address
      v-model="showMacAddressModal"
      :mac-address="currentMacAddress"
      @ok="saveSettings"
    />
    <modal-default-gateway
      v-model="showDefaultGatewayModal"
      :default-gateway="ipv6DefaultGateway"
      @ok="saveSettings"
    />
  </b-container>
</template>

<script>
import eventBus from '@/eventBus';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import ModalMacAddress from './ModalMacAddress.vue';
import ModalDefaultGateway from './ModalDefaultGateway.vue';
import ModalHostname from './ModalHostname.vue';
import ModalIpv4 from './ModalIpv4.vue';
import ModalIpv6 from './ModalIpv6.vue';
import ModalDns from './ModalDns.vue';
import NetworkGlobalSettings from './NetworkGlobalSettings.vue';
import NetworkInterfaceSettings from './NetworkInterfaceSettings.vue';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import TableIpv4 from './TableIpv4.vue';
import TableIpv6 from './TableIpv6.vue';
import TableDns from './TableDns.vue';
import { mapState } from 'vuex';

export default {
  name: 'Network',
  components: {
    ModalHostname,
    ModalMacAddress,
    ModalDefaultGateway,
    ModalIpv4,
    ModalIpv6,
    ModalDns,
    NetworkGlobalSettings,
    NetworkInterfaceSettings,
    PageSection,
    PageTitle,
    TableDns,
    TableIpv4,
    TableIpv6,
  },
  mixins: [BVToastMixin, DataFormatterMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      currentHostname: '',
      currentMacAddress: '',
      defaultGateway: '',
      ipv6DefaultGateway: '',
      loading,
      tabIndex: 0,
      tabsReady: false,
      tabsRenderKey: 0,
      showHostnameModal: false,
      showDefaultGatewayModal: false,
      showMacAddressModal: false,
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    ethernetData() {
      this.getModalInfo();
    },
    tabIndex(newIndex) {
      this.$store.dispatch('network/setSelectedTabIndex', newIndex);
      this.$store.dispatch(
        'network/setSelectedTabId',
        this.ethernetData?.[newIndex]?.Id,
      );
      this.getModalInfo();
    },
  },
  created() {
    this.startLoader();
    const globalSettings = new Promise((resolve) => {
      eventBus.$once('network-global-settings-complete', resolve);
    });
    const interfaceSettings = new Promise((resolve) => {
      eventBus.$once('network-interface-settings-complete', resolve);
    });
    const networkTableDns = new Promise((resolve) => {
      eventBus.$once('network-table-dns-complete', resolve);
    });
    const networkTableIpv4 = new Promise((resolve) => {
      eventBus.$once('network-table-ipv4-complete', resolve);
    });
    const networkTableIpv6 = new Promise((resolve) => {
      eventBus.$once('network-table-ipv6-complete', resolve);
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      this.$store.dispatch('network/getEthernetData'),
      globalSettings,
      interfaceSettings,
      networkTableDns,
      networkTableIpv4,
      networkTableIpv6,
    ])
      .then(() => {
        // ensure first tab is selected and expanded (index 0). Force a change
        // cycle to trigger BTabs to render the pane content immediately.
        const count = this.ethernetData?.length || 0;
        if (count > 0) {
          // set initial selection directly to index 0
          this.tabIndex = 0;
          this.$store.dispatch('network/setSelectedTabIndex', 0);
          const firstId = this.ethernetData?.[0]?.Id;
          if (firstId)
            this.$store.dispatch('network/setSelectedTabId', firstId);
          this.tabsRenderKey += 1;
        }
      })
      .finally(() => this.endLoader());

    // Listen for modal show events from child components
    eventBus.$on('show-hostname-modal', this.handleShowHostnameModal);
    eventBus.$on('show-mac-address-modal', this.handleShowMacAddressModal);
    eventBus.$on(
      'show-default-gateway-modal',
      this.handleShowDefaultGatewayModal,
    );
  },
  beforeUnmount() {
    eventBus.$off('show-hostname-modal', this.handleShowHostnameModal);
    eventBus.$off('show-mac-address-modal', this.handleShowMacAddressModal);
    eventBus.$off(
      'show-default-gateway-modal',
      this.handleShowDefaultGatewayModal,
    );
  },
  methods: {
    handleShowHostnameModal() {
      this.showHostnameModal = true;
    },
    handleShowMacAddressModal() {
      this.showMacAddressModal = true;
    },
    handleShowDefaultGatewayModal() {
      this.showDefaultGatewayModal = true;
    },
    getModalInfo() {
      const settingsArray =
        this.$store.getters['network/globalNetworkSettings'];
      const settings = Array.isArray(settingsArray)
        ? settingsArray[this.tabIndex]
        : undefined;

      if (!settings) return;
      this.defaultGateway = settings.defaultGateway;
      this.currentHostname = settings.hostname;
      this.currentMacAddress = settings.macAddress;
      this.ipv6DefaultGateway = settings.ipv6DefaultGateway;
    },
    getTabIndex(selectedIndex) {
      this.tabIndex = selectedIndex;
      this.$store.dispatch('network/setSelectedTabIndex', this.tabIndex);
      this.$store.dispatch(
        'network/setSelectedTabId',
        this.ethernetData[selectedIndex].Id,
      );
      this.getModalInfo();
    },
    saveIpv4Address(modalFormData) {
      this.startLoader();
      this.$store
        .dispatch('network/saveIpv4Address', modalFormData)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    saveIpv6Address(modalFormData) {
      this.startLoader();
      this.$store
        .dispatch('network/saveIpv6Address', modalFormData)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    saveDnsAddress(modalFormData) {
      this.startLoader();
      this.$store
        .dispatch('network/saveDnsAddress', modalFormData)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    saveSettings(modalFormData) {
      this.startLoader();
      this.$store
        .dispatch('network/saveSettings', modalFormData)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
