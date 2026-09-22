<template>
  <div>
    <page-section>
      <b-row>
        <b-col md="3">
          <dl>
            <dt>{{ $t('pageNetwork.linkStatus') }}</dt>
            <dd>
              {{ dataFormatter(linkStatus) }}
            </dd>
          </dl>
        </b-col>
        <b-col md="3">
          <dl>
            <dt>{{ $t('pageNetwork.speed') }}</dt>
            <dd>
              {{ dataFormatter(linkSpeed) }}
            </dd>
          </dl>
        </b-col>
        <b-col md="3">
          <dl>
            <dt>{{ $t('pageNetwork.duplexMode') }}</dt>
            <dd>
              {{ dataFormatter(duplexMode) }}
            </dd>
          </dl>
        </b-col>
      </b-row>
    </page-section>
    <page-section :section-title="$t('pageNetwork.interfaceSection')">
      <b-row>
        <b-col md="3">
          <dl>
            <dt>
              {{ $t('pageNetwork.fqdn') }}
            </dt>
            <dd>
              {{ dataFormatter(fqdn) }}
            </dd>
          </dl>
        </b-col>
        <b-col md="3">
          <dl class="text-nowrap">
            <dt>
              {{ $t('pageNetwork.macAddress') }}
              <b-button
                variant="link"
                class="p-1"
                @click="initMacAddressModal()"
              >
                <icon-edit
                  :title="$t('pageNetwork.modal.editMacAddressTitle')"
                />
              </b-button>
            </dt>
            <dd>
              {{ dataFormatter(macAddress) }}
            </dd>
          </dl>
        </b-col>
      </b-row>
    </page-section>
  </div>
</template>

<script>
import eventBus from '@/eventBus';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconEdit from '@carbon/icons-vue/es/edit/16';
import PageSection from '@/components/Global/PageSection';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';
import { useModal } from 'bootstrap-vue-next';

export default {
  name: 'Ipv4Table',
  components: {
    IconEdit,
    PageSection,
  },
  mixins: [BVToastMixin, DataFormatterMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  data() {
    return {
      selectedInterface: '',
      linkStatus: '',
      linkSpeed: '',
      fullDuplex: null,
      fqdn: '',
      macAddress: '',
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
    duplexMode() {
      if (this.fullDuplex === true) {
        return this.$t('pageNetwork.fullDuplex');
      } else if (this.fullDuplex === false) {
        return this.$t('pageNetwork.halfDuplex');
      }
      return null;
    },
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getSettings();
    },
  },
  created() {
    this.getSettings();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      eventBus.$emit('network-interface-settings-complete');
    });
  },
  methods: {
    getSettings() {
      this.selectedInterface = this.tabIndex;
      this.linkStatus = this.ethernetData[this.selectedInterface].LinkStatus;
      this.linkSpeed = this.ethernetData[this.selectedInterface].SpeedMbps;
      this.fullDuplex = this.ethernetData[this.selectedInterface].FullDuplex;
      this.fqdn = this.ethernetData[this.selectedInterface].FQDN;
      this.macAddress = this.ethernetData[this.selectedInterface].MACAddress;
    },
    initMacAddressModal() {
      eventBus.$emit('show-mac-address-modal');
    },
  },
};
</script>
